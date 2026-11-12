import { NextRequest, NextResponse } from "next/server";
import corpusData from "@/data/corpus.json";
import { BM25Retriever } from "@/lib/bm25";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  extractFactualClaims,
  assessClaimAgainstPassages,
  RawClaimAssessment,
} from "@/lib/llm";
import { getDemoResponseForClaim } from "@/lib/demoData";
import {
  ClaimAssessment,
  CorpusPassage,
  VerificationResponse,
  VerificationLabel,
} from "@/types";

const corpus = corpusData as CorpusPassage[];
const bm25 = new BM25Retriever(corpus);

const VALID_LABELS: VerificationLabel[] = [
  "Supported by sources",
  "Not supported by sources",
  "Insufficient evidence",
];

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Rate Limiting Check
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before checking more claims.",
          resetInSeconds: rateLimit.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.resetInSeconds.toString(),
          },
        }
      );
    }

    // 2. Body Parsing & Input Validation
    let body: { text?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const rawText = body.text?.trim() || "";
    if (!rawText) {
      return NextResponse.json(
        { error: "Please paste an election-related claim or message to verify." },
        { status: 400 }
      );
    }

    // Cap input at 2000 characters
    if (rawText.length > 2000) {
      return NextResponse.json(
        {
          error: `Input is too long (${rawText.length} characters). Maximum allowed is 2000 characters.`,
        },
        { status: 400 }
      );
    }

    const forceDemoMode = process.env.DEMO_MODE === "true";
    const apiKey = process.env.LLM_API_KEY?.trim();

    // Check if demo response can be served immediately
    if (forceDemoMode || !apiKey) {
      const demoResult = getDemoResponseForClaim(rawText);
      if (demoResult) {
        return NextResponse.json(demoResult);
      }
    }

    // Attempt Live Verification via LLM
    try {
      if (forceDemoMode || !apiKey) {
        throw new Error("DEMO_FALLBACK_TRIGGERED");
      }

      // Step a: Extract factual claims
      const extractedClaims = await extractFactualClaims(rawText);
      const claimsToVerify =
        extractedClaims.length > 0 ? extractedClaims : [rawText];

      const assessedClaims: ClaimAssessment[] = [];

      for (const claim of claimsToVerify) {
        // Step b: Retrieve top 3 to 5 passages
        const retrieved = bm25.search(claim, 4);
        const retrievedMap = new Map(retrieved.map((p) => [p.id, p]));

        // Step c: Assess claim against passages
        let rawAssessment: RawClaimAssessment;
        if (retrieved.length === 0 || (retrieved[0].score || 0) < 0.2) {
          rawAssessment = {
            label: "Insufficient evidence",
            explanation:
              "The verified electoral corpus does not contain documentation or regulations addressing this specific claim.",
            evidence: [],
            limitations:
              "Verification is strictly constrained to the official administrative corpus. Unindexed local incidents cannot be verified.",
          };
        } else {
          rawAssessment = await assessClaimAgainstPassages(claim, retrieved);
        }

        // Step d: Validate label
        let finalLabel: VerificationLabel = "Insufficient evidence";
        if (VALID_LABELS.includes(rawAssessment.label)) {
          finalLabel = rawAssessment.label;
        }

        // Step e: CITATION VALIDATION
        // Backend rejects/strips any cited passage_id that was NOT in the retrieved set
        const validatedEvidence = (rawAssessment.evidence || [])
          .filter((item) => retrievedMap.has(item.passage_id))
          .map((item) => {
            const passage = retrievedMap.get(item.passage_id)!;
            return {
              passage_id: item.passage_id,
              quote_or_summary: item.quote_or_summary || passage.text.slice(0, 200),
              source_title: passage.source_title,
              source_url: passage.source_url,
              published_date: passage.published_date,
            };
          });

        // If claim ends up with no valid citations and a non-"Insufficient evidence" label,
        // downgrade it to "Insufficient evidence"
        if (
          validatedEvidence.length === 0 &&
          finalLabel !== "Insufficient evidence"
        ) {
          finalLabel = "Insufficient evidence";
          rawAssessment.explanation +=
            " (Downgraded to 'Insufficient evidence': citation validation failed to confirm relevant source passages.)";
        }

        assessedClaims.push({
          original_claim: claim,
          label: finalLabel,
          explanation: rawAssessment.explanation,
          evidence: validatedEvidence,
          limitations:
            rawAssessment.limitations ||
            "Evaluated strictly against published electoral corpus.",
          retrieved_passages: retrieved,
        });
      }

      const responsePayload: VerificationResponse = {
        claims: assessedClaims,
        timestamp: new Date().toISOString(),
        isDemoMode: false,
        processing_ms: Date.now() - startTime,
      };

      return NextResponse.json(responsePayload);
    } catch (llmError) {
      console.warn("LLM Verification failed or timed out. Falling back to Demo Mode:", llmError);

      // Check if this input matches one of the synthetic demo claims
      const demoResult = getDemoResponseForClaim(rawText);
      if (demoResult) {
        return NextResponse.json({
          ...demoResult,
          demoNotice: "Demo mode: cached result (LLM fallback)",
          processing_ms: Date.now() - startTime,
        });
      }

      // Offline rule-based fallback for arbitrary claims
      const retrieved = bm25.search(rawText, 4);
      let label: VerificationLabel = "Insufficient evidence";
      let explanation =
        "The claim could not be confirmed or refuted based on the available administrative corpus.";
      const evidence = [];

      if (retrieved.length > 0 && (retrieved[0].score || 0) > 1.2) {
        const top = retrieved[0];
        evidence.push({
          passage_id: top.id,
          quote_or_summary: top.text,
          source_title: top.source_title,
          source_url: top.source_url,
          published_date: top.published_date,
        });
        explanation = `Relevant administrative provisions were found in ${top.source_title}, but full generative LLM verification is currently in offline fallback mode.`;
      }

      const fallbackResponse: VerificationResponse = {
        claims: [
          {
            original_claim: rawText,
            label,
            explanation,
            evidence,
            limitations:
              "Processed via offline fallback engine. LLM service was unavailable or unconfigured.",
            retrieved_passages: retrieved,
          },
        ],
        timestamp: new Date().toISOString(),
        isDemoMode: true,
        demoNotice: "Demo mode: offline retrieval fallback",
        processing_ms: Date.now() - startTime,
      };

      return NextResponse.json(fallbackResponse);
    }
  } catch (err: unknown) {
    console.error("Internal verification error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification. Please try again." },
      { status: 500 }
    );
  }
}
