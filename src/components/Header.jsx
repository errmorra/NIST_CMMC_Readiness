"use client";

import { Search, Zap, FileText, RotateCcw } from "lucide-react";

export default function Header({
  searchQuery,
  onSearchChange,
  wizardMode,
  onToggleMode,
  stats,
  pct,
  onReset,
}) {
  const { compliant, inProgress, notStarted, total } = stats;

  // Color ramp for progress
  const progressColor =
    pct >= 80 ? "from-emerald-500 to-emerald-400"
    : pct >= 50 ? "from-sky-500 to-emerald-400"
    : pct >= 25 ? "from-amber-500 to-sky-400"
    : "from-red-500 to-amber-400";

  return (
    <header className="bg-slate-900 border-b border-slate-700/60 px-4 sm:px-6 py-4 space-y-4">
      {/* Top row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-white font-bold text-base sm:text-lg tracking-tight">
            NIST SP 800-171 · CMMC Level 2
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Interactive Crosswalk & Readiness Assessment — {total} Controls
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wizard / Compliance toggle */}
          <button
            type="button"
            onClick={onToggleMode}
            aria-pressed={wizardMode}
            title="Switch between official control text and plain-language questions"
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200
              ${wizardMode
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }
            `}
          >
            {wizardMode ? <Zap size={13} /> : <FileText size={13} />}
            {wizardMode ? "Wizard Mode" : "Technical Mode"}
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
          <div className="flex items-center gap-x-5 gap-y-1 text-xs flex-wrap">
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
          <div className="text-right">
            <span className={`text-xl font-black tabular-nums ${
              pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-sky-400" : pct >= 25 ? "text-amber-400" : "text-slate-400"
            }`}>
              {pct}%
            </span>
            <span className="text-slate-500 text-xs ml-1">overall</span>
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
          id="control-search"
          type="search"
          aria-label="Search controls"
          placeholder="Search controls by keyword, ID, or topic (e.g. 'MFA', 'encryption', 'audit logs')…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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
          <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded border border-slate-600 bg-slate-900 text-slate-500 text-[11px] font-mono pointer-events-none">
            /
          </kbd>
        )}
      </div>
    </header>
  );
}
