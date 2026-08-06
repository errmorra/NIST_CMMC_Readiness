"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Link2, CheckCircle2, Clock, Circle, StickyNote } from "lucide-react";
import { getWeight, PARTIAL_CREDIT_IDS, SSP_GATE_ID } from "../data/sprsWeights";

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

const WEIGHT_STYLES = {
  5: "text-red-300 bg-red-950/50 border-red-900/50",
  3: "text-amber-300 bg-amber-950/50 border-amber-900/50",
  1: "text-slate-400 bg-slate-800 border-slate-700",
};

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

function SprsWeightBadge({ control }) {
  const isSsp = control.id === SSP_GATE_ID;
  const weight = getWeight(control.id);
  const partial = PARTIAL_CREDIT_IDS.has(control.id);
  const title = isSsp
    ? "System Security Plan — required to conduct a DoD assessment; not itself point-scored."
    : `SPRS deduction if not implemented: ${weight} point${weight > 1 ? "s" : ""}${partial ? " (3 points if partially implemented)" : ""}. DoD Assessment Methodology v1.2.1.`;
  return (
    <span
      title={title}
      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border cursor-help ${
        isSsp ? "text-sky-300 bg-sky-950/50 border-sky-900/50" : WEIGHT_STYLES[weight]
      }`}
    >
      {isSsp ? "SSP" : `−${weight}${partial ? "*" : ""} pts`}
    </span>
  );
}

export default function ControlCard({ control, status, onSetStatus, wizardMode, searchQuery, note, onSetNote }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[status];
  const detailsId = `control-details-${control.id}`;
  const hasNote = Boolean(note && note.trim());

  // Highlight search matches
  function highlight(text) {
    const q = searchQuery?.trim();
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
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
      {/* Card header (entire row toggles the details panel) */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="flex items-start gap-4 p-4 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 rounded-xl"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        {/* Status indicator strip */}
        <div className={`mt-1 w-1 h-12 rounded-full shrink-0 ${cfg.dot}`} />

        <div className="flex-1 min-w-0">
          {/* ID badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-sky-300 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">
              NIST {highlight(control.nistId)}
            </span>
            <Link2 size={11} className="text-slate-600" aria-hidden="true" />
            <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
              {highlight(control.cmmcId)}
            </span>
            <SprsWeightBadge control={control} />
            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 hidden sm:inline">
              {control.familyName}
            </span>
            {hasNote && (
              <StickyNote size={12} className="text-amber-400/80" aria-label="Has notes" />
            )}
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

        {/* Expand chevron (decorative — whole header toggles) */}
        <span aria-hidden="true" className="shrink-0 text-slate-500 transition-colors mt-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div id={detailsId} className="px-4 pb-4 space-y-4 border-t border-slate-700/40 pt-4">
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

          {/* Notes / evidence */}
          <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
            <label
              htmlFor={`note-${control.id}`}
              className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5"
            >
              Notes & Evidence
            </label>
            <textarea
              id={`note-${control.id}`}
              value={note ?? ""}
              onChange={(e) => onSetNote(control.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Record implementation details, evidence locations, policy references, POA&M items…"
              rows={2}
              className="
                w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2
                text-xs text-slate-200 placeholder-slate-600 leading-relaxed resize-y
                focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40
                transition-all
              "
            />
          </div>

          {/* Status toggle buttons */}
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label={`Set status for ${control.nistId}`}>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mr-1">
              Set Status:
            </span>
            {STATUS_OPTIONS.map((s) => {
              const isActive = s === status;
              const optCfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={isActive}
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
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap" role="group" aria-label={`Set status for ${control.nistId}`} onClick={(e) => e.stopPropagation()}>
          {STATUS_OPTIONS.map((s) => {
            const isActive = s === status;
            const optCfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                type="button"
                aria-pressed={isActive}
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
