"use client";

import {
  Shield, BookOpen, ClipboardList, Settings, KeyRound,
  AlertTriangle, Wrench, HardDrive, Building2, Users,
  Activity, CheckSquare, Network, Bug, ChevronRight, X,
} from "lucide-react";

const ICON_MAP = {
  Shield, BookOpen, ClipboardList, Settings, KeyRound,
  AlertTriangle, Wrench, HardDrive, Building2, Users,
  Activity, CheckSquare, Network, Bug,
};

export default function Sidebar({ families, selectedFamily, onSelectFamily, familyStats, open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-slate-900 border-r border-slate-700/60
          flex flex-col overflow-hidden transition-transform duration-200
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Shield size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight tracking-wide">CMMC / NIST</p>
              <p className="text-slate-400 text-[10px] tracking-widest uppercase">Readiness Navigator</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Family list */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
          <p className="px-5 py-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
            Control Families
          </p>
          {families.map((f) => {
            const Icon = ICON_MAP[f.icon] ?? Shield;
            const fs = familyStats[f.code] ?? { total: 0, compliant: 0, inProgress: 0, notStarted: 0 };
            const pct = fs.total > 0 ? Math.round((fs.compliant / fs.total) * 100) : 0;
            const isActive = selectedFamily === f.code;

            return (
              <button
                key={f.code}
                onClick={() => onSelectFamily(f.code)}
                aria-current={isActive ? "page" : undefined}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150
                  ${isActive
                    ? "bg-sky-900/40 border-r-2 border-sky-400 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60 border-r-2 border-transparent"
                  }
                `}
              >
                <Icon size={15} className={isActive ? "text-sky-400" : "text-slate-500"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-mono text-[10px] font-bold ${isActive ? "text-sky-400" : "text-slate-600"}`}>
                      {f.code}
                    </span>
                    <p className={`text-xs font-medium truncate ${isActive ? "text-white" : ""}`}>
                      {f.name}
                    </p>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-1 h-0.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-mono ${isActive ? "text-sky-300" : "text-slate-600"}`}>
                    {pct}%
                  </span>
                  {isActive && <ChevronRight size={12} className="text-sky-400" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer legend */}
        <div className="px-5 py-4 border-t border-slate-700/60">
          <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Legend</p>
          <div className="space-y-1">
            {[
              { label: "Compliant",   color: "bg-emerald-500" },
              { label: "In Progress", color: "bg-amber-400" },
              { label: "Not Started", color: "bg-slate-600" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-slate-400 text-[11px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
