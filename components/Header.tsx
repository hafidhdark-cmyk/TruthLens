"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ClipboardCheck, Info, Sparkles } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Truth<span className="text-emerald-600">Lens</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                #AI4Elections MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Trustworthy Electoral Information
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              pathname === "/"
                ? "bg-slate-100 text-slate-900 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Verify Claim
          </Link>

          <Link
            href="/reviewer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              pathname === "/reviewer"
                ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <span>Reviewer Portal</span>
          </Link>

          <a
            href="#responsible-ai"
            className="hidden md:flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Safety & Ethics</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
