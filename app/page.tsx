"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Sparkles,
  AlertTriangle,
  Clock,
  RotateCcw,
  ExternalLink,
  Save,
  Check,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";
import { ClaimCard } from "@/components/ClaimCard";
import { SYNTHETIC_DEMO_CLAIMS } from "@/lib/demoData";
import { VerificationResponse, ReviewerReport } from "@/types";

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<VerificationResponse | null>(null);
  const [savedToReviewer, setSavedToReviewer] = useState(false);

  const charCount = inputText.length;
  const isOverLimit = charCount > 2000;

  // Auto-save verified claims to localStorage for reviewer workflow
  const saveToLocalStorage = (result: VerificationResponse, rawText: string) => {
    try {
      const stored = localStorage.getItem("truthlens_reports");
      const reports: ReviewerReport[] = stored ? JSON.parse(stored) : [];

      const newReport: ReviewerReport = {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        input_text: rawText,
        timestamp: result.timestamp || new Date().toISOString(),
        status: "AI-generated",
        response: result,
      };

      // Keep up to 50 reports locally
      const updated = [newReport, ...reports.filter((r) => r.input_text !== rawText)].slice(0, 50);
      localStorage.setItem("truthlens_reports", JSON.stringify(updated));
      setSavedToReviewer(true);
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  };

  const handleVerify = async (textToVerify?: string) => {
    const text = (textToVerify !== undefined ? textToVerify : inputText).trim();
    if (!text) {
      setError("Please paste or type an election-related claim to verify.");
      return;
    }
    if (text.length > 2000) {
      setError("Claim exceeds the 2,000 character limit. Please shorten your input.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setSavedToReviewer(false);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to verify claim. Please try again.");
      }

      setResponse(data);
      saveToLocalStorage(data, text);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectDemoClaim = (claimText: string) => {
    setInputText(claimText);
    setError(null);
    handleVerify(claimText);
  };

  const resetForm = () => {
    setInputText("");
    setError(null);
    setResponse(null);
    setSavedToReviewer(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI & Trustworthy Electoral Information MVP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Truth<span className="text-emerald-600">Lens</span>
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-700 mb-4">
            See the claim. Check the evidence. Know what to trust.
          </p>

          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Combat election disinformation with source-grounded AI. TruthLens evaluates viral claims
            strictly against verified regulatory guidelines, legal provisions, and official manuals,
            with zero tolerance for ungrounded assertions.
          </p>
        </div>

        {/* Claim Input Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-8">
          <label
            htmlFor="claim-input"
            className="block text-sm font-semibold text-slate-800 mb-2"
          >
            Paste an election-related claim or message
          </label>

          <div className="relative">
            <textarea
              id="claim-input"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Paste a WhatsApp forward, social media post, or statement about voter registration, PVC collection, polling unit rules, or election day procedures..."
              className={`w-full rounded-xl border p-4 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition resize-y ${
                isOverLimit
                  ? "border-rose-400 focus:ring-rose-200"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
              disabled={loading}
            />
          </div>

          {/* Char counter and action bar */}
          <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span
                className={`font-mono font-medium ${
                  isOverLimit ? "text-rose-600 font-bold" : ""
                }`}
              >
                {charCount} / 2,000 characters
              </span>
              <span>• Strictly grounded against verified corpus</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {inputText && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={loading || !inputText.trim() || isOverLimit}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Cross-Checking Sources...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Evidence</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
        </div>

        {/* 3 Clickable Synthetic Demo Claims */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Click to Test: Synthetic Demo Claims</span>
            </h2>
            <span className="text-[11px] text-slate-400">Pre-indexed test benchmark</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SYNTHETIC_DEMO_CLAIMS.map((item) => {
              const categoryBadge =
                item.category === "Supported"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : item.category === "Not Supported"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectDemoClaim(item.claim)}
                  disabled={loading}
                  className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Synthetic Demo Claim
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${categoryBadge}`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-3 group-hover:text-emerald-800 transition">
                      &ldquo;{item.claim}&rdquo;
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-emerald-600 font-medium">
                    <span>Click to evaluate</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Section */}
        {response && (
          <div className="mt-8 animate-fadeIn">
            {/* Permanent Advisory Banner */}
            <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl p-4 mb-6 text-xs sm:text-sm text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-semibold">
                  AI-generated assessment. Not an official INEC finding. Not reviewed by a human unless marked.
                </span>
              </div>

              {response.isDemoMode && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  {response.demoNotice || "Demo mode: cached result"}
                </span>
              )}
            </div>

            {/* Results Header Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 text-xs text-slate-500 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Verified: {new Date(response.timestamp).toLocaleTimeString()} ({new Date(response.timestamp).toLocaleDateString()})
                </span>
                {response.processing_ms && (
                  <span>• {response.processing_ms}ms</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {savedToReviewer ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to Reviewer Workspace</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Auto-saved to local browser storage</span>
                )}
              </div>
            </div>

            {/* Assessed Claim Cards */}
            <div>
              {response.claims.map((claim, idx) => (
                <ClaimCard key={idx} claim={claim} index={idx} />
              ))}
            </div>

            {/* Reviewer Action Callout */}
            <div className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Human-in-the-loop oversight:</span> This verification report is queued in your browser. Human fact-checkers can review, approve, flag, or correct this finding.
              </div>
              <a
                href="/reviewer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shrink-0 transition"
              >
                Open Reviewer Portal →
              </a>
            </div>
          </div>
        )}

        {/* Responsible AI Principles Box */}
        <div className="mt-12 bg-white rounded-xl border border-slate-200 p-5 text-xs text-slate-600">
          <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Responsible AI Principles for Electoral Information</span>
          </h3>
          <p className="mb-2 leading-relaxed">
            TruthLens is designed exclusively to provide objective source cross-referencing. It does not predict or declare election outcomes, make determinations of electoral fraud, or assess candidate viability.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div>
              <strong>Privacy Protection:</strong> Zero personal data collection; no user accounts; submitted queries are processed in memory and never stored on the server.
            </div>
            <div>
              <strong>Strict Source Grounding:</strong> AI responses cannot invent facts; backend citation validation strips ungrounded claims and downgrades them to &ldquo;Insufficient evidence&rdquo;.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
