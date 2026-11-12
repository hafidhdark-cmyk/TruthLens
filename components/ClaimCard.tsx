"use client";

import { useState } from "react";
import { ClaimAssessment } from "@/types";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  BookOpen,
} from "lucide-react";

interface ClaimCardProps {
  claim: ClaimAssessment;
  index: number;
}

export function ClaimCard({ claim, index }: ClaimCardProps) {
  const [showAllRetrieved, setShowAllRetrieved] = useState(false);

  const getBadgeConfig = (label: string) => {
    switch (label) {
      case "Supported by sources":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          accent: "border-l-emerald-500",
          labelClass: "text-emerald-900 font-bold",
        };
      case "Not supported by sources":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          accent: "border-l-rose-500",
          labelClass: "text-rose-900 font-bold",
        };
      case "Insufficient evidence":
      default:
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />,
          accent: "border-l-amber-500",
          labelClass: "text-amber-900 font-bold",
        };
    }
  };

  const badge = getBadgeConfig(claim.label);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 border-l-4 ${badge.accent} transition-all`}
    >
      {/* Header with Claim Index and Verification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Claim #{index + 1}
        </span>
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${badge.bg}`}
        >
          {badge.icon}
          <span>{claim.label}</span>
        </div>
      </div>

      {/* Original Claim Display */}
      <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200/80">
        <div className="text-xs font-medium text-slate-500 mb-1">Claim Analysed:</div>
        <p className="text-slate-900 font-medium text-base leading-snug">
          &ldquo;{claim.original_claim}&rdquo;
        </p>
      </div>

      {/* Explanation */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Factual Explanation
        </h4>
        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
          {claim.explanation}
        </p>
      </div>

      {/* Verified Cited Evidence */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Source Evidence ({claim.evidence.length})</span>
          </h4>
        </div>

        {claim.evidence && claim.evidence.length > 0 ? (
          <div className="space-y-3">
            {claim.evidence.map((ev, i) => (
              <div
                key={`${ev.passage_id}-${i}`}
                className="bg-slate-50/70 rounded-lg border border-slate-200 p-3.5 text-xs text-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                      {ev.passage_id}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {ev.source_title || "Official Electoral Source"}
                    </span>
                  </div>
                  {ev.published_date && (
                    <span className="text-[11px] text-slate-500">
                      Published: {ev.published_date}
                    </span>
                  )}
                </div>

                <div className="pl-3 border-l-2 border-emerald-500 italic text-slate-700 mb-2 py-0.5">
                  &ldquo;{ev.quote_or_summary}&rdquo;
                </div>

                {ev.source_url && (
                  <div className="flex items-center justify-end">
                    <a
                      href={ev.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <span>Verify at official source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">No direct source passages cited.</span> Under TruthLens safety rules, claims with zero validated citations are strictly categorized as <em>Insufficient evidence</em>.
            </div>
          </div>
        )}
      </div>

      {/* Limitations */}
      {claim.limitations && (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-600 flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700">Scope & Limitations: </span>
            {claim.limitations}
          </div>
        </div>
      )}

      {/* Retrieved Passages Accordion (Transparency / Audit trail) */}
      {claim.retrieved_passages && claim.retrieved_passages.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowAllRetrieved(!showAllRetrieved)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              {showAllRetrieved ? "Hide" : "Inspect"} BM25 Retrieved Corpus Passages ({claim.retrieved_passages.length})
            </span>
            {showAllRetrieved ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showAllRetrieved && (
            <div className="mt-3 space-y-2 text-xs">
              {claim.retrieved_passages.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-mono font-medium text-slate-700">{p.id} — {p.source_title}</span>
                    <span>BM25 Score: {p.score ?? "N/A"}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
