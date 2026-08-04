"use client";

import { useState, useMemo, useRef } from "react";
import { CONTROLS, FAMILIES } from "../data/controls";
import { useAssessment } from "../hooks/useAssessment";
import { exportReport, exportReportCsv, parseImportedReport } from "../lib/exportReport";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ControlCard from "../components/ControlCard";
import FamilyHeader from "../components/FamilyHeader";
import { Download, Search, Upload, FileSpreadsheet } from "lucide-react";

const STATUS_FILTERS = [
  { key: "All", label: "All" },
  { key: "Not Started", label: "Not Started", activeCls: "bg-slate-600 text-white border-slate-500" },
  { key: "In Progress", label: "In Progress", activeCls: "bg-amber-700 text-white border-amber-600" },
  { key: "Compliant", label: "Compliant", activeCls: "bg-emerald-700 text-white border-emerald-600" },
];

export default function Dashboard() {
  const [selectedFamily, setSelectedFamily] = useState("AC");
  const [wizardMode, setWizardMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  const {
    getStatus, setStatus,
    getNote, setNote,
    resetAll, importState,
    stats, pct, familyStats, sprs, hydrated,
  } = useAssessment();

  const isSearchMode = searchQuery.trim().length > 0;

  const scopedControls = useMemo(() => {
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

  const filterCounts = useMemo(() => {
    const counts = { "All": scopedControls.length, "Not Started": 0, "In Progress": 0, "Compliant": 0 };
    scopedControls.forEach((c) => { counts[getStatus(c.id)] += 1; });
    return counts;
  }, [scopedControls, getStatus]);

  const displayedControls = useMemo(() => {
    if (statusFilter === "All") return scopedControls;
    return scopedControls.filter((c) => getStatus(c.id) === statusFilter);
  }, [scopedControls, statusFilter, getStatus]);

  const currentFamily = FAMILIES.find((f) => f.code === selectedFamily);

  function handleReset() {
    if (window.confirm("Reset all assessment statuses and notes? This cannot be undone.")) {
      resetAll();
    }
  }

  function collectState() {
    const allStatuses = Object.fromEntries(CONTROLS.map((c) => [c.id, getStatus(c.id)]));
    const allNotes = Object.fromEntries(
      CONTROLS.map((c) => [c.id, getNote(c.id)]).filter(([, n]) => n)
    );
    return { allStatuses, allNotes };
  }

  function handleExportJson() {
    const { allStatuses, allNotes } = collectState();
    exportReport(allStatuses, pct, stats, allNotes, sprs);
  }

  function handleExportCsv() {
    const { allStatuses, allNotes } = collectState();
    exportReportCsv(allStatuses, allNotes);
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { statuses, notes } = parseImportedReport(reader.result);
        const count = Object.keys(statuses).length;
        if (!window.confirm(`Import ${count} control statuses from "${file.name}"? This replaces your current assessment.`)) {
          return;
        }
        importState(statuses, notes);
      } catch (err) {
        window.alert(err.message || "Could not import the selected file.");
      }
    };
    reader.readAsText(file);
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
        onSelectFamily={(code) => {
          setSelectedFamily(code);
          setSearchQuery("");
          setSidebarOpen(false);
        }}
        familyStats={familyStats}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          wizardMode={wizardMode}
          onToggleMode={() => setWizardMode((v) => !v)}
          stats={stats}
          pct={pct}
          sprs={sprs}
          onReset={handleReset}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Toolbar: filters + import/export */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter controls by status">
              {STATUS_FILTERS.map(({ key, label, activeCls }) => {
                const isActive = statusFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(key)}
                    className={`
                      px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150
                      ${isActive
                        ? activeCls ?? "bg-sky-700 text-white border-sky-600"
                        : "bg-slate-800/70 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700"
                      }
                    `}
                  >
                    {label}
                    <span className={`ml-1.5 tabular-nums ${isActive ? "opacity-80" : "text-slate-500"}`}>
                      {filterCounts[key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Import a previously exported JSON report"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <Upload size={12} />
                Import
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                title="Export a CSV report (spreadsheet / POA&M friendly)"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <FileSpreadsheet size={12} />
                CSV
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                title="Export a full JSON readiness report"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <Download size={12} />
                JSON
              </button>
            </div>
          </div>

          {/* Context line */}
          <div className="mb-4">
            {isSearchMode ? (
              <p className="text-slate-400 text-sm">
                <span className="text-white font-semibold">{displayedControls.length}</span>
                {" "}controls matching{" "}
                <span className="text-sky-400 font-mono text-xs bg-sky-950/40 px-1.5 py-0.5 rounded">{searchQuery}</span>
                {statusFilter !== "All" && (
                  <span className="text-slate-500"> · filtered to {statusFilter}</span>
                )}
              </p>
            ) : (
              <p className="text-slate-500 text-xs">
                {wizardMode
                  ? "Wizard Mode — plain-language questions"
                  : "Technical Mode — official control text"}
              </p>
            )}
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
              <p className="text-slate-600 text-sm mt-1">
                {statusFilter !== "All"
                  ? `No "${statusFilter}" controls here — try another status filter`
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
                note={getNote(control.id)}
                onSetNote={setNote}
                wizardMode={wizardMode}
                searchQuery={searchQuery}
              />
            ))}
          </div>

          <p className="text-center text-slate-700 text-xs mt-8 pb-4">
            NIST SP 800-171 Rev 2 · CMMC Level 2 · 110 Practices · SPRS scoring per DoD Assessment Methodology v1.2.1
          </p>
        </main>
      </div>
    </div>
  );
}
