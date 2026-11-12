import { ClaimAssessment, VerificationResponse } from "@/types";

export interface DemoClaimItem {
  id: string;
  claim: string;
  category: "Supported" | "Not Supported" | "Insufficient Evidence";
  description: string;
}

export const SYNTHETIC_DEMO_CLAIMS: DemoClaimItem[] = [
  {
    id: "claim-supported",
    claim: "Permanent Voter Cards (PVCs) must be collected in person at designated INEC collection centres by the registered voter.",
    category: "Supported",
    description: "Synthetic demo claim: Official PVC collection rule",
  },
  {
    id: "claim-not-supported",
    claim: "INEC has announced that registered voters can cast their ballot online via WhatsApp or the official portal on election day.",
    category: "Not Supported",
    description: "Synthetic demo claim: False remote voting claim",
  },
  {
    id: "claim-insufficient",
    claim: "Polling Unit 014 in Ward 3 recorded an unexpected shortage of ballot papers at 11:30 AM.",
    category: "Insufficient Evidence",
    description: "Synthetic demo claim: Hyper-local incident claim",
  },
];

export const DEMO_PRECOMPUTED_RESPONSES: Record<string, ClaimAssessment> = {
  [SYNTHETIC_DEMO_CLAIMS[0].claim.toLowerCase().trim()]: {
    original_claim: SYNTHETIC_DEMO_CLAIMS[0].claim,
    label: "Supported by sources",
    explanation:
      "According to official INEC regulations on Permanent Voter Card collection (INEC-DOC-002), PVCs must be collected in person by the registered voter at designated Local Government Area offices or designated Ward collection centers. Collection by proxy is strictly prohibited.",
    evidence: [
      {
        passage_id: "INEC-DOC-002",
        quote_or_summary:
          "Permanent Voter Cards (PVCs) must be collected in person by the registered voter at designated INEC Local Government Area offices or designated Ward collection centers... Collection by proxy is strictly prohibited under official electoral regulations.",
        source_title: "INEC Regulations on Permanent Voter Card (PVC) Collection",
        source_url: "https://inecnigeria.org",
        published_date: "2023-01-15",
      },
    ],
    limitations:
      "Assessment is based on standard INEC regulatory manuals. Operational collection deadlines and specific physical collection points are announced periodically per election cycle.",
  },

  [SYNTHETIC_DEMO_CLAIMS[1].claim.toLowerCase().trim()]: {
    original_claim: SYNTHETIC_DEMO_CLAIMS[1].claim,
    label: "Not supported by sources",
    explanation:
      "The corpus contains no record or statutory authorization for online voting, remote voting, or ballot casting via messaging platforms like WhatsApp. Verified INEC operational guidelines (INEC-DOC-004, INEC-DOC-005, INEC-DOC-006) mandate physical in-person accreditation with BVAS devices and in-person secret paper balloting at assigned polling units.",
    evidence: [
      {
        passage_id: "INEC-DOC-004",
        quote_or_summary:
          "On election day, Polling Units follow a standardized schedule where accreditation and voting take place simultaneously. Voters in the queue before the official closing time are allowed to cast their votes. Polling officials verify the voter's Permanent Voter Card and verify their identity using official accreditation devices before issuing ballot papers.",
        source_title: "INEC Polling Unit Operations Manual: Accreditation and Voting",
        source_url: "https://inecnigeria.org",
        published_date: "2023-02-01",
      },
      {
        passage_id: "INEC-DOC-005",
        quote_or_summary:
          "The Bimodal Voter Accreditation System (BVAS) is the mandatory electronic device used at every polling unit to accredit voters... A person whose name is not on the register of voters for that specific polling unit cannot be accredited or allowed to vote.",
        source_title: "INEC Manual on Electronic Accreditation and BVAS Device",
        source_url: "https://inecnigeria.org",
        published_date: "2023-02-05",
      },
      {
        passage_id: "INEC-DOC-006",
        quote_or_summary:
          "Voting is strictly by secret ballot. The voter marks their preferred political party or candidate in the privacy of the voting cubicle, folds the ballot paper vertically, and deposits it into the transparent ballot box.",
        source_title: "INEC Regulations on Ballot Secrecy and Voting Booth Conduct",
        source_url: "https://inecnigeria.org",
        published_date: "2023-02-08",
      },
    ],
    limitations:
      "Nigeria's current electoral legal framework requires physical in-person attendance at designated polling units. Online or messaging-based voting channels are completely unapproved.",
  },

  [SYNTHETIC_DEMO_CLAIMS[2].claim.toLowerCase().trim()]: {
    original_claim: SYNTHETIC_DEMO_CLAIMS[2].claim,
    label: "Insufficient evidence",
    explanation:
      "The available corpus contains statutory regulations, official procedural manuals, and voter guidelines. It contains no live polling-unit incident feeds, real-time material logistics logs, or specific incident verification for Polling Unit 014 in Ward 3.",
    evidence: [],
    limitations:
      "TruthLens verifies claims strictly against verified published regulatory documents and official statements. Hyper-local election-day operational incidents require on-the-ground verification by accredited observers and INEC field monitoring officers.",
  },
};

export function getDemoResponseForClaim(claimText: string): VerificationResponse | null {
  const normalized = claimText.toLowerCase().trim();

  // Exact or high similarity match
  for (const [key, assessment] of Object.entries(DEMO_PRECOMPUTED_RESPONSES)) {
    if (normalized === key || normalized.includes(key) || key.includes(normalized)) {
      return {
        claims: [assessment],
        timestamp: new Date().toISOString(),
        isDemoMode: true,
        demoNotice: "Demo mode: cached result for synthetic demonstration claim",
        processing_ms: 120,
      };
    }
  }

  // Partial keyword matches for the 3 demo concepts
  if (normalized.includes("pvc") && (normalized.includes("person") || normalized.includes("collect"))) {
    return {
      claims: [DEMO_PRECOMPUTED_RESPONSES[SYNTHETIC_DEMO_CLAIMS[0].claim.toLowerCase().trim()]],
      timestamp: new Date().toISOString(),
      isDemoMode: true,
      demoNotice: "Demo mode: cached result for synthetic demonstration claim",
      processing_ms: 150,
    };
  }

  if (normalized.includes("online") || normalized.includes("whatsapp") || normalized.includes("portal")) {
    return {
      claims: [DEMO_PRECOMPUTED_RESPONSES[SYNTHETIC_DEMO_CLAIMS[1].claim.toLowerCase().trim()]],
      timestamp: new Date().toISOString(),
      isDemoMode: true,
      demoNotice: "Demo mode: cached result for synthetic demonstration claim",
      processing_ms: 150,
    };
  }

  if (normalized.includes("shortage") || normalized.includes("ward 3") || normalized.includes("polling unit 014")) {
    return {
      claims: [DEMO_PRECOMPUTED_RESPONSES[SYNTHETIC_DEMO_CLAIMS[2].claim.toLowerCase().trim()]],
      timestamp: new Date().toISOString(),
      isDemoMode: true,
      demoNotice: "Demo mode: cached result for synthetic demonstration claim",
      processing_ms: 150,
    };
  }

  return null;
}
