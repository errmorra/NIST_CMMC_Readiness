import { CONTROLS, FAMILIES } from "../data/controls";

/**
 * Generate a JSON readiness report and trigger a browser download.
 */
export function exportReport(statuses, pct, stats) {
  const timestamp = new Date().toISOString();

  const controlData = CONTROLS.map((c) => ({
    nistId: c.nistId,
    cmmcId: c.cmmcId,
    family: c.familyName,
    requirement: c.nistText,
    status: statuses[c.id] ?? "Not Started",
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

  const report = {
    title: "NIST SP 800-171 / CMMC Level 2 Readiness Assessment",
    generatedAt: timestamp,
    overallCompliance: {
      pct,
      compliant: stats.compliant,
      inProgress: stats.inProgress,
      notStarted: stats.notStarted,
      total: stats.total,
    },
    familySummary,
    controls: controlData,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cmmc-readiness-${timestamp.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
