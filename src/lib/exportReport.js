import { CONTROLS, FAMILIES } from "../data/controls";
import { getWeight, SPRS_MAX, SPRS_MIN, SSP_GATE_ID } from "../data/sprsWeights";

const VALID_STATUSES = new Set(["Not Started", "In Progress", "Compliant"]);

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildReport(statuses, notes, pct, stats, sprs) {
  const timestamp = new Date().toISOString();

  const controlData = CONTROLS.map((c) => ({
    nistId: c.nistId,
    cmmcId: c.cmmcId,
    family: c.familyName,
    requirement: c.nistText,
    sprsWeight: getWeight(c.id),
    status: statuses[c.id] ?? "Not Started",
    note: notes?.[c.id] ?? "",
  }));

  const familySummary = FAMILIES.map((f) => {
    const controls = CONTROLS.filter((c) => c.family === f.code);
    const compliant = controls.filter((c) => (statuses[c.id] ?? "Not Started") === "Compliant").length;
    const inProgress = controls.filter((c) => (statuses[c.id] ?? "Not Started") === "In Progress").length;
    return {
      family: f.name,
      code: f.code,
      total: controls.length,
      compliant,
      inProgress,
      notStarted: controls.length - compliant - inProgress,
      pct: controls.length > 0 ? Math.round((compliant / controls.length) * 100) : 0,
    };
  });

  return {
    title: "NIST SP 800-171 / CMMC Level 2 Readiness Assessment",
    generatedAt: timestamp,
    overallCompliance: {
      pct,
      compliant: stats.compliant,
      inProgress: stats.inProgress,
      notStarted: stats.notStarted,
      total: stats.total,
    },
    sprsScore: sprs
      ? {
          score: sprs.score,
          max: SPRS_MAX,
          min: SPRS_MIN,
          deducted: sprs.deducted,
          sspMissing: sprs.sspMissing,
          methodology: "NIST SP 800-171 DoD Assessment Methodology v1.2.1",
        }
      : undefined,
    familySummary,
    controls: controlData,
  };
}

/**
 * Generate a JSON readiness report and trigger a browser download.
 */
export function exportReport(statuses, pct, stats, notes, sprs) {
  const report = buildReport(statuses, notes, pct, stats, sprs);
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  triggerDownload(blob, `cmmc-readiness-${report.generatedAt.slice(0, 10)}.json`);
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/**
 * Generate a CSV readiness report (one row per control) and trigger a download.
 * Suitable for spreadsheets, POA&M tracking, and stakeholder reporting.
 */
export function exportReportCsv(statuses, notes) {
  const timestamp = new Date().toISOString();
  const header = [
    "NIST ID", "CMMC ID", "Family", "Requirement", "SPRS Weight", "Status", "Notes",
  ];
  const rows = CONTROLS.map((c) => [
    c.nistId,
    c.cmmcId,
    c.familyName,
    c.nistText,
    c.id === SSP_GATE_ID ? "SSP (required)" : getWeight(c.id),
    statuses[c.id] ?? "Not Started",
    notes?.[c.id] ?? "",
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `cmmc-readiness-${timestamp.slice(0, 10)}.csv`);
}

/**
 * Parse a previously exported JSON report (or a raw { id: status } map) back
 * into { statuses, notes }. Throws with a friendly message when the file is
 * not recognizable.
 */
export function parseImportedReport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error("The selected file is not valid JSON.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The selected file does not look like a readiness report.");
  }

  // Full report format: { controls: [{ nistId, status, note }] }
  if (Array.isArray(data.controls)) {
    const statuses = {};
    const notes = {};
    for (const c of data.controls) {
      if (!c || typeof c.nistId !== "string") continue;
      if (VALID_STATUSES.has(c.status)) statuses[c.nistId] = c.status;
      if (typeof c.note === "string" && c.note.trim()) notes[c.nistId] = c.note;
    }
    if (Object.keys(statuses).length === 0) {
      throw new Error("No recognizable control statuses were found in the file.");
    }
    return { statuses, notes };
  }

  // Raw statuses map: { "3.1.1": "Compliant", ... }
  const statuses = {};
  for (const [id, status] of Object.entries(data)) {
    if (VALID_STATUSES.has(status)) statuses[id] = status;
  }
  if (Object.keys(statuses).length === 0) {
    throw new Error("No recognizable control statuses were found in the file.");
  }
  return { statuses, notes: {} };
}
