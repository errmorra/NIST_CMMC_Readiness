"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Link2, CheckCircle2, Clock, Circle } from "lucide-react";

const STATUS_CONFIG = {
  "Compliant": {
    bg: "bg-emerald-950/60",
    border: "border-emerald-700/50",
    badge: "bg-emerald-900/80 text-emerald-300 border border-emerald-700/60",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    activeBtn: "bg-emerald-700 text-white shadow-lg shadow-emerald-900/40",
  },
  "In Progress": {
    bg: "bg-amber-950/40",
    border: "border-amber-700/40",
    badge: "bg-amber-900/70 text-amber-300 border border-amber-700/60",
    dot: "bg-amber-400",
    icon: Clock,
    iconColor: "text-amber-400",
    activeBtn: "bg-amber-700 text-white shadow-lg shadow-amber-900/40",
  },
  "Not Started": {
    bg: "bg-slate-800/50",
    border: "border-slate-700/40",
    badge: "bg-slate-800 text-slate-400 border border-slate-700",
    dot: "bg-slate-500",
    icon: Circle,
    iconColor: "text-slate-500",
    activeBtn: "bg-slate-600 text-white",
  },
};

const STATUS_OPTIONS = ["Not Started", "In Progress", "Compliant"];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
      <Icon size={11} className={cfg.iconColor} />
      {status}
    </span>
  );
}

export default function ControlCard({ control, status, onSetStatus, wizardMode, searchQuery }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[status];

  // Highlight search matches
  function highlight(text) {
    if (!searchQuery) return text;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-sky-500/30 text-sky-200 rounded px-0.5">{part}</mark>
      ) : part
    );
  }

  return (
    <div
      className={`
        rounded-xl border transition-all duration-200
        ${cfg.bg} ${cfg.border}
        hover:border-opacity-80
      `}
    >
      {/* Card header */}
      <div
        className="flex items-start gap-4 p-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Status indicator strip */}
        <div className={`mt-1 w-1 h-12 rounded-full shrink-0 ${cfg.dot}`} />

        <div className="flex-1 min-w-0">
          {/* ID badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-sky-300 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">
              NIST {highlight(control.nistId)}
            </span>
            <Link2 size={11} className="text-slate-600" />
            <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
              {highlight(control.cmmcId)}
            </span>
            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {control.familyName}
            </span>
            <span className="ml-auto">
              <StatusBadge status={status} />
            </span>
          </div>

          {/* Main content — wizard vs technical */}
          {wizardMode ? (
            <p className="text-sm text-white font-medium leading-snug">
              {highlight(control.plainEnglish)}
            </p>
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
              {highlight(control.nistText)}
            </p>
          )}
        </div>

        {/* Expand chevron */}
        <button className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-700/40 pt-4">
          {/* Crosswalk panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* NIST side */}
            <div className="bg-slate-900/60 rounded-lg p-3 border border-sky-900/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">NIST SP 800-171</span>
                <span className="font-mono text-[10px] text-sky-500">{control.nistId}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {highlight(control.nistText)}
              </p>
            </div>

            {/* CMMC side */}
            <div className="bg-slate-900/60 rounded-lg p-3 border border-indigo-900/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">CMMC L2 Practice</span>
                <span className="font-mono text-[10px] text-indigo-500">{control.cmmcId}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {highlight(control.cmmcText)}
              </p>
            </div>
          </div>

          {/* Plain English */}
          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/40">
            <p className="text-[10px] font-bold tracking-widest text-amber-400 uppercase mb-1.5">Plain English Question</p>
            <p className="text-sm text-amber-100 leading-snug font-medium">
              {highlight(control.plainEnglish)}
            </p>
          </div>

          {/* Guidance */}
          <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">Implementation Guidance</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {highlight(control.guidance)}
            </p>
          </div>

          {/* Status toggle buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mr-1">
              Set Status:
            </span>
            {STATUS_OPTIONS.map((s) => {
              const isActive = s === status;
              const optCfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={(e) => { e.stopPropagation(); onSetStatus(control.id, s); }}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                    ${isActive
                      ? optCfg.activeBtn
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
                    }
                  `}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick status bar (collapsed only) */}
      {!expanded && (
        <div className="px-4 pb-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {STATUS_OPTIONS.map((s) => {
            const isActive = s === status;
            const optCfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => onSetStatus(control.id, s)}
                className={`
                  px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-150
                  ${isActive
                    ? optCfg.activeBtn
                    : "bg-slate-800/80 text-slate-500 hover:text-white hover:bg-slate-700 border border-slate-700/50"
                  }
                `}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
