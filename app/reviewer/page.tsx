"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  ArrowLeft,
  CheckCircle2,
  AlertOctagon,
  Edit3,
  Trash2,
  Download,
  Filter,
  UserCheck,
  Bot,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { ReviewerReport } from "@/types";
import { SYNTHETIC_DEMO_CLAIMS, DEMO_PRECOMPUTED_RESPONSES } from "@/lib/demoData";

export default function ReviewerPage() {
  const [reports, setReports] = useState<ReviewerReport[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reviewerNote, setReviewerNote] = useState<string>("");
  const [reviewerStatus, setReviewerStatus] = useState<
    "Approved" | "Flagged" | "Corrected"
  >("Approved");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    try {
      const stored = localStorage.getItem("truthlens_reports");
      if (stored) {
        setReports(JSON.parse(stored));
      } else {
        setReports([]);
      }
    } catch (e) {
      console.warn("Failed to read reports from localStorage:", e);
    }
  };

  const populateDemoBatch = () => {
    const demoBatch: ReviewerReport[] = SYNTHETIC_DEMO_CLAIMS.map((demo, idx) => ({
      id: `report-demo-${idx + 1}`,
      input_text: demo.claim,
      timestamp: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
      status: idx === 0 ? "Approved" : "AI-generated",
      reviewer_notes:
        idx === 0
          ? "Verified against official INEC Electoral Regulations Section 16."
          : undefined,
      reviewed_at: idx === 0 ? new Date().toISOString() : undefined,
      response: {
        claims: [DEMO_PRECOMPUTED_RESPONSES[demo.claim.toLowerCase().trim()]],
        timestamp: new Date().toISOString(),
        isDemoMode: true,
        demoNotice: "Demo batch item",
      },
    }));

    localStorage.setItem("truthlens_reports", JSON.stringify(demoBatch));
    setReports(demoBatch);
  };

  const updateReview = (id: string) => {
    const updated = reports.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: reviewerStatus,
          reviewer_notes: reviewerNote.trim() || undefined,
          reviewed_at: new Date().toISOString(),
        };
      }
      return r;
    });

    setReports(updated);
    localStorage.setItem("truthlens_reports", JSON.stringify(updated));
    setEditingId(null);
    setReviewerNote("");
  };

  const deleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem("truthlens_reports", JSON.stringify(updated));
  };

  const clearAllReports = () => {
    if (confirm("Are you sure you want to clear all locally cached reviewer reports?")) {
      localStorage.removeItem("truthlens_reports");
      setReports([]);
    }
  };

  const exportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `truthlens-reviews-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredReports = reports.filter((r) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "AI-generated") return r.status === "AI-generated";
    return r.status === selectedFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navigation & Title */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mb-4 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Claim Verifier</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-emerald-600" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Reviewer Workspace
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Human-in-the-loop oversight portal for fact-checkers, monitors, and electoral researchers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {reports.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={exportJson}
                    className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearAllReports}
                    className="px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-medium rounded-lg transition"
                  >
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
            {["All", "AI-generated", "Approved", "Flagged", "Corrected"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  selectedFilter === f
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong>{filteredReports.length}</strong> of {reports.length} reports
          </div>
        </div>

        {/* Reports Listing */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No reports found in this view
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              Verified claims are held in your browser&apos;s localStorage for human review and annotation.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Verify a Claim Now
              </Link>
              <button
                type="button"
                onClick={populateDemoBatch}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
              >
                Load Synthetic Demo Batch
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const isEditing = editingId === report.id;

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 transition hover:border-slate-300"
                >
                  {/* Status Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      {report.status === "AI-generated" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Bot className="w-3.5 h-3.5 text-slate-500" />
                          <span>AI-generated</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            report.status === "Approved"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : report.status === "Flagged"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : "bg-blue-50 text-blue-800 border-blue-300"
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Human-reviewed: {report.status}</span>
                        </span>
                      )}

                      <span className="text-xs text-slate-400">
                        {new Date(report.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(report.id);
                            setReviewerStatus(
                              report.status === "AI-generated" ? "Approved" : report.status
                            );
                            setReviewerNote(report.reviewer_notes || "");
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>{report.status === "AI-generated" ? "Review" : "Edit Review"}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteReport(report.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Input Text / Claim */}
                  <div className="mb-4">
                    <div className="text-xs font-medium text-slate-500 mb-1">
                      Submitted Claim / Input Text:
                    </div>
                    <p className="text-slate-900 font-medium text-sm leading-snug">
                      &ldquo;{report.input_text}&rdquo;
                    </p>
                  </div>

                  {/* Assessments Summary */}
                  {report.response?.claims && (
                    <div className="space-y-3 mb-4">
                      {report.response.claims.map((claim, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-200/80"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-800">
                              Claim #{idx + 1}: {claim.original_claim}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                claim.label === "Supported by sources"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : claim.label === "Not supported by sources"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {claim.label}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {claim.explanation}
                          </p>
                          {claim.evidence?.length > 0 && (
                            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3 text-emerald-600" />
                              <span>Cited Sources: {claim.evidence.map((e) => e.passage_id).join(", ")}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing Reviewer Note if any */}
                  {report.reviewer_notes && !isEditing && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-900">
                      <div className="font-semibold mb-0.5 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Human Reviewer Note ({report.status}):</span>
                      </div>
                      <p className="text-slate-700">{report.reviewer_notes}</p>
                      {report.reviewed_at && (
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Reviewed on {new Date(report.reviewed_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Inline Review Edit Form */}
                  {isEditing && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                      <h4 className="font-bold text-slate-800 mb-2">
                        Perform Human Review & Verification
                      </h4>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setReviewerStatus("Approved")}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-xs border flex items-center gap-1 transition ${
                            reviewerStatus === "Approved"
                              ? "bg-emerald-600 text-white border-emerald-700"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved (Accurate)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReviewerStatus("Flagged")}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-xs border flex items-center gap-1 transition ${
                            reviewerStatus === "Flagged"
                              ? "bg-rose-600 text-white border-rose-700"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Flagged (Disputed / Inaccurate)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReviewerStatus("Corrected")}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-xs border flex items-center gap-1 transition ${
                            reviewerStatus === "Corrected"
                              ? "bg-blue-600 text-white border-blue-700"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Corrected (With Human Notes)</span>
                        </button>
                      </div>

                      <div className="mb-3">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Reviewer Assessment Notes:
                        </label>
                        <textarea
                          rows={2}
                          value={reviewerNote}
                          onChange={(e) => setReviewerNote(e.target.value)}
                          placeholder="Provide rationale, verified legal section, or correction guidance..."
                          className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => updateReview(report.id)}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          Save Review Decision
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
