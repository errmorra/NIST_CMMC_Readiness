"use client";

import { useState, useMemo, useEffect } from "react";
import { CONTROLS, FAMILIES } from "../data/controls";
import { useAssessment } from "../hooks/useAssessment";
import { exportReport } from "../lib/exportReport";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ControlCard from "../components/ControlCard";
import FamilyHeader from "../components/FamilyHeader";
import { Download, Search, Menu, CheckCircle2, Clock, Circle, LayoutList } from "lucide-react";

const STATUS_FILTERS = [
  { value: "All", label: "All", icon: LayoutList, active: "bg-sky-600 text-white border-sky-500" },
  { value: "Not Started", label: "Not Started", icon: Circle, active: "bg-slate-600 text-white border-slate-500" },
  { value: "In Progress", label: "In Progress", icon: Clock, active: "bg-amber-600 text-white border-amber-500" },
  { value: "Compliant", label: "Compliant", icon: CheckCircle2, active: "bg-emerald-600 text-white border-emerald-500" },
];

export default function Dashboard() {
  const [selectedFamily, setSelectedFamily] = useState("AC");
  const [wizardMode, setWizardMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { getStatus, setStatus, resetAll, stats, pct, familyStats, hydrated } = useAssessment();

  // Base list: either search results or the selected family.
  const baseControls = useMemo(() => {
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

  // Live counts per status for the filter chips.
  const filterCounts = useMemo(() => {
    const counts = { All: baseControls.length, "Not Started": 0, "In Progress": 0, Compliant: 0 };
    baseControls.forEach((c) => {
      counts[getStatus(c.id)] += 1;
    });
    return counts;
  }, [baseControls, getStatus]);

  // Apply the active status filter.
  const displayedControls = useMemo(() => {
    if (statusFilter === "All") return baseControls;
    return baseControls.filter((c) => getStatus(c.id) === statusFilter);
  }, [baseControls, statusFilter, getStatus]);

  const currentFamily = FAMILIES.find((f) => f.code === selectedFamily);
  const isSearchMode = searchQuery.trim().length > 0;

  // Press "/" anywhere to jump to the search box.
  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById("control-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleReset() {
    if (window.confirm("Reset all assessment statuses to Not Started? This cannot be undone.")) {
      resetAll();
    }
  }

  function handleExport() {
    const allStatuses = Object.fromEntries(CONTROLS.map((c) => [c.id, getStatus(c.id)]));
    exportReport(allStatuses, pct, stats);
  }

  function handleSelectFamily(code) {
    setSelectedFamily(code);
    setSearchQuery("");
    setSidebarOpen(false);
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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        families={FAMILIES}
        selectedFamily={selectedFamily}
        onSelectFamily={handleSelectFamily}
        familyStats={familyStats}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 bg-slate-900 border-b border-slate-700/60 px-4 py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <Menu size={18} />
          </button>
          <span className="font-bold text-sm tracking-wide">CMMC / NIST Readiness</span>
          <span
            className={`ml-auto text-sm font-black tabular-nums ${
              pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-sky-400" : pct >= 25 ? "text-amber-400" : "text-slate-400"
            }`}
          >
            {pct}%
          </span>
        </div>

        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          wizardMode={wizardMode}
          onToggleMode={() => setWizardMode((v) => !v)}
          stats={stats}
          pct={pct}
          onReset={handleReset}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Controls bar */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {isSearchMode ? (
                <p className="text-slate-400 text-sm">
                  <span className="text-white font-semibold">{displayedControls.length}</span>
                  {" "}of{" "}
                  <span className="text-slate-300">{baseControls.length}</span>
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
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <Download size={12} />
                Export JSON Report
              </button>
            </div>

            {/* Status filter chips */}
            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter controls by status">
              {STATUS_FILTERS.map((f) => {
                const Icon = f.icon;
                const isActive = statusFilter === f.value;
                const count = filterCounts[f.value] ?? 0;
                return (
                  <button
                    key={f.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(f.value)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${isActive
                        ? f.active
                        : "bg-slate-800/70 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700"
                      }
                    `}
                  >
                    <Icon size={12} />
                    {f.label}
                    <span className={`ml-0.5 tabular-nums ${isActive ? "text-white/80" : "text-slate-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {!isSearchMode && currentFamily && (
            <FamilyHeader
              familyName={currentFamily.name}
              familyCode={currentFamily.code}
              stats={familyStats[currentFamily.code]}
              controlCount={baseControls.length}
            />
          )}

          {displayedControls.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search size={40} className="text-slate-700 mb-4" />
              <p className="text-slate-400 font-medium">No controls found</p>
              <p className="text-slate-600 text-sm mt-1">
                {statusFilter !== "All"
                  ? `No “${statusFilter}” controls here — try another filter`
                  : "Try a different search term"}
              </p>
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
