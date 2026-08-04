"use client";

import { useEffect, useRef } from "react";
import { Search, Zap, FileText, RotateCcw, Menu, Gauge } from "lucide-react";
import { SPRS_MAX, SPRS_MIN } from "../data/sprsWeights";

export default function Header({
  searchQuery,
  onSearchChange,
  wizardMode,
  onToggleMode,
  stats,
  pct,
  sprs,
  onReset,
  onOpenSidebar,
}) {
  const { compliant, inProgress, notStarted, total } = stats;
  const searchRef = useRef(null);

  // "/" focuses search, Escape clears it
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Color ramp for progress
  const progressColor =
    pct >= 80 ? "from-emerald-500 to-emerald-400"
    : pct >= 50 ? "from-sky-500 to-emerald-400"
    : pct >= 25 ? "from-amber-500 to-sky-400"
    : "from-red-500 to-amber-400";

  const sprsColor =
    sprs.score >= 88 ? "text-emerald-400"
    : sprs.score >= 0 ? "text-amber-400"
    : "text-red-400";

  const sprsTitle = [
    `SPRS score per DoD Assessment Methodology v1.2.1 (range ${SPRS_MIN} to ${SPRS_MAX}).`,
    "88+ may qualify for Conditional CMMC L2 status; 110 is required for final status.",
    sprs.sspMissing ? "Note: without a System Security Plan (3.12.4) an official assessment cannot be conducted." : "",
  ].filter(Boolean).join(" ");

  return (
    <header className="bg-slate-900 border-b border-slate-700/60 px-4 sm:px-6 py-4 space-y-4">
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open control family navigation"
            className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <Menu size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-base sm:text-lg tracking-tight truncate">
              NIST SP 800-171 · CMMC Level 2
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 hidden sm:block">
              Interactive Crosswalk & Readiness Assessment — {total} Controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Wizard / Compliance toggle */}
          <button
            type="button"
            onClick={onToggleMode}
            aria-pressed={wizardMode}
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200
              ${wizardMode
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }
            `}
          >
            {wizardMode ? <Zap size={13} /> : <FileText size={13} />}
            <span className="hidden sm:inline">{wizardMode ? "Wizard Mode" : "Technical Mode"}</span>
            <span className="sm:hidden">{wizardMode ? "Wizard" : "Technical"}</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            title="Reset all statuses"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-700 hover:border-red-800/60 transition-all"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Progress section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-6 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Compliant</span>
              <span className="text-emerald-400 font-bold ml-1">{compliant}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-400">In Progress</span>
              <span className="text-amber-400 font-bold ml-1">{inProgress}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="text-slate-400">Not Started</span>
              <span className="text-slate-400 font-bold ml-1">{notStarted}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            {/* SPRS score */}
            <div
              className="flex items-center gap-1.5 cursor-help"
              title={sprsTitle}
            >
              <Gauge size={13} className="text-slate-500" aria-hidden="true" />
              <span className="text-slate-500 text-xs">SPRS</span>
              <span className={`text-xl font-black tabular-nums ${sprsColor}`}>
                {sprs.score}
              </span>
              <span className="text-slate-600 text-xs">/ {SPRS_MAX}</span>
              {sprs.sspMissing && (
                <span
                  className="text-[9px] font-bold text-red-400 bg-red-950/50 border border-red-900/50 px-1.5 py-0.5 rounded uppercase tracking-wider"
                  title="Without a System Security Plan (3.12.4) an official DoD assessment cannot be conducted."
                >
                  No SSP
                </span>
              )}
            </div>

            <div className="text-right">
              <span className={`text-xl font-black tabular-nums ${
                pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-sky-400" : pct >= 25 ? "text-amber-400" : "text-slate-400"
              }`}>
                {pct}%
              </span>
              <span className="text-slate-500 text-xs ml-1">overall</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="relative h-2 bg-slate-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall compliance progress"
        >
          {/* Not started background */}
          <div className="absolute inset-0 bg-slate-700/40 rounded-full" />
          {/* In progress segment */}
          <div
            className="absolute left-0 top-0 h-full bg-amber-500/70 rounded-full transition-all duration-700"
            style={{ width: `${total > 0 ? ((compliant + inProgress) / total) * 100 : 0}%` }}
          />
          {/* Compliant segment */}
          <div
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-700`}
            style={{ width: `${total > 0 ? (compliant / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input
          ref={searchRef}
          type="search"
          aria-label="Search controls"
          placeholder="Search controls by keyword, ID, or topic (e.g. 'MFA', 'encryption', 'audit logs')…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onSearchChange("");
          }}
          className="
            w-full bg-slate-800 border border-slate-700 rounded-lg
            pl-9 pr-16 py-2.5 text-sm text-white placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50
            transition-all
          "
        />
        {searchQuery ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
          >
            ✕
          </button>
        ) : (
          <kbd
            aria-hidden="true"
            className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block text-[10px] text-slate-500 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 font-mono"
          >
            /
          </kbd>
        )}
      </div>
    </header>
  );
}
