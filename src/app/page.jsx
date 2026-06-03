"use client";

import { useState, useMemo } from "react";
import { CONTROLS, FAMILIES } from "../data/controls";
import { useAssessment } from "../hooks/useAssessment";
import { exportReport } from "../lib/exportReport";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ControlCard from "../components/ControlCard";
import FamilyHeader from "../components/FamilyHeader";
import { Download, Search } from "lucide-react";

export default function Dashboard() {
  const [selectedFamily, setSelectedFamily] = useState("AC");
  const [wizardMode, setWizardMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { getStatus, setStatus, resetAll, stats, pct, familyStats, hydrated } = useAssessment();

  const displayedControls = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return CONTROLS.filter(
        (c) =>
          c.nistId.toLowerCase().includes(q) ||
          c.cmmcId.toLowerCase().includes(q) ||
          c.nistText.toLowerCase().includes(q) ||
          c.cmmcText.toLowerCase().includes(q) ||
          c.plainEnglish.toLowerCase().includes(q) ||
          c.guidance.toLowerCase().includes(q) ||
          c.familyName.toLowerCase().includes(q)
      );
    }
    return CONTROLS.filter((c) => c.family === selectedFamily);
  }, [searchQuery, selectedFamily]);

  const currentFamily = FAMILIES.find((f) => f.code === selectedFamily);
  const isSearchMode = searchQuery.trim().length > 0;

  function handleReset() {
    if (window.confirm("Reset all assessment statuses to Not Started? This cannot be undone.")) {
      resetAll();
    }
  }

  function handleExport() {
    const allStatuses = Object.fromEntries(CONTROLS.map((c) => [c.id, getStatus(c.id)]));
    exportReport(allStatuses, pct, stats);
  }

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-slate-400 text-sm animate-pulse">Loading assessment…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar
        families={FAMILIES}
        selectedFamily={selectedFamily}
        onSelectFamily={(code) => { setSelectedFamily(code); setSearchQuery(""); }}
        familyStats={familyStats}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          wizardMode={wizardMode}
          onToggleMode={() => setWizardMode((v) => !v)}
          stats={stats}
          pct={pct}
          onReset={handleReset}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            {isSearchMode ? (
              <p className="text-slate-400 text-sm">
                <span className="text-white font-semibold">{displayedControls.length}</span>
                {" "}controls matching{" "}
                <span className="text-sky-400 font-mono text-xs bg-sky-950/40 px-1.5 py-0.5 rounded">{searchQuery}</span>
              </p>
            ) : (
              <p className="text-slate-500 text-xs">
                {wizardMode
                  ? "Wizard Mode — plain-language questions"
                  : "Technical Mode — official control text"}
              </p>
            )}

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
            >
              <Download size={12} />
              Export JSON Report
            </button>
          </div>

          {!isSearchMode && currentFamily && (
            <FamilyHeader
              familyName={currentFamily.name}
              familyCode={currentFamily.code}
              stats={familyStats[currentFamily.code]}
              controlCount={displayedControls.length}
            />
          )}

          {displayedControls.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search size={40} className="text-slate-700 mb-4" />
              <p className="text-slate-400 font-medium">No controls found</p>
              <p className="text-slate-600 text-sm mt-1">Try a different search term</p>
            </div>
          )}

          <div className="space-y-3">
            {displayedControls.map((control) => (
              <ControlCard
                key={control.id}
                control={control}
                status={getStatus(control.id)}
                onSetStatus={setStatus}
                wizardMode={wizardMode}
                searchQuery={searchQuery}
              />
            ))}
          </div>

          <p className="text-center text-slate-700 text-xs mt-8 pb-4">
            NIST SP 800-171 Rev 2 · CMMC Level 2 · 110 Practices
          </p>
        </main>
      </div>
    </div>
  );
}
