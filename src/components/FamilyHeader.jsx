"use client";

export default function FamilyHeader({ familyName, familyCode, stats, controlCount }) {
  const { compliant, inProgress, notStarted, total } = stats ?? { compliant: 0, inProgress: 0, notStarted: 0, total: controlCount };
  const pct = total > 0 ? Math.round((compliant / total) * 100) : 0;

  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 mb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Control Family</span>
            <span className="font-mono text-[10px] text-sky-500 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-900/40">{familyCode}</span>
          </div>
          <h2 className="text-white font-bold text-base">{familyName}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{total} controls in this family</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center">
            <p className="text-emerald-400 font-bold text-lg tabular-nums">{compliant}</p>
            <p className="text-[10px] text-slate-500">Compliant</p>
          </div>
          <div className="text-center">
            <p className="text-amber-400 font-bold text-lg tabular-nums">{inProgress}</p>
            <p className="text-[10px] text-slate-500">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 font-bold text-lg tabular-nums">{notStarted}</p>
            <p className="text-[10px] text-slate-500">Not Started</p>
          </div>
          <div className="text-center">
            <p className={`font-black text-xl tabular-nums ${pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-sky-400" : pct >= 25 ? "text-amber-400" : "text-slate-500"}`}>
              {pct}%
            </p>
            <p className="text-[10px] text-slate-500">Complete</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="relative mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${familyName} compliance progress`}
      >
        <div
          className="absolute left-0 top-0 h-full bg-amber-500/70 rounded-full transition-all duration-500"
          style={{ width: `${((compliant + inProgress) / (total || 1)) * 100}%` }}
        />
        <div
          className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${(compliant / (total || 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
