import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, UserCheck, AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer id="responsible-ai" className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>TruthLens — #AI4Elections Hackathon</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Track 1: AI and Trustworthy Electoral Information. TruthLens is an experimental,
              source-grounded verification tool designed to mitigate electoral disinformation
              by validating claims strictly against authoritative electoral regulations and published INEC manuals.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                <Lock className="w-3 h-3" /> No PII Stored
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                <EyeOff className="w-3 h-3" /> In-Memory Processing
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                <UserCheck className="w-3 h-3" /> NDPA 2023 Aligned
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Safety & Safeguards</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>• Strictly non-partisan architecture</li>
              <li>• Does not declare winners or ballot counts</li>
              <li>• Strict citation validation (no hallucinations)</li>
              <li>• Prompt-injection resistant delimiters</li>
              <li>• Mandatory human reviewer escalation workflow</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Official Resources</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <a
                  href="https://inecnigeria.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 underline transition"
                >
                  INEC Official Portal (inecnigeria.org)
                </a>
              </li>
              <li>
                <a
                  href="https://inecnigeria.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 underline transition"
                >
                  Nigeria Electoral Act Framework
                </a>
              </li>
              <li>
                <Link href="/reviewer" className="hover:text-emerald-400 underline transition">
                  Local Reviewer Workspace
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} TruthLens. Built for #AI4Elections Hackathon. Non-commercial civic research MVP.
          </p>
          <div className="flex items-center gap-2 text-amber-300/90 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/40">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>AI-generated outputs are advisory and not official INEC findings.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
