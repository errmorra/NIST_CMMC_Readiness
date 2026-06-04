"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CONTROLS } from "../data/controls";

const STORAGE_KEY = "cmmc_assessment_state";
const VALID_STATUSES = new Set(["Not Started", "In Progress", "Compliant"]);

export function useAssessment() {
  const [statuses, setStatuses] = useState({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only accept a plain object of known status values; ignore anything else.
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const clean = {};
          for (const [id, status] of Object.entries(parsed)) {
            if (VALID_STATUSES.has(status)) clean[id] = status;
          }
          setStatuses(clean);
        }
      }
    } catch (_) {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever statuses change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (_) {
      // ignore quota errors
    }
  }, [statuses, hydrated]);

  const getStatus = useCallback(
    (id) => statuses[id] ?? "Not Started",
    [statuses]
  );

  const setStatus = useCallback((id, status) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const resetAll = useCallback(() => {
    setStatuses({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }, []);

  // Aggregate stats (overall + per-family) — recomputed only when statuses change.
  const { stats, pct, familyStats } = useMemo(() => {
    const stats = { total: 0, compliant: 0, inProgress: 0, notStarted: 0 };
    const familyStats = {};

    CONTROLS.forEach((c) => {
      const s = statuses[c.id] ?? "Not Started";

      stats.total += 1;
      if (s === "Compliant") stats.compliant += 1;
      else if (s === "In Progress") stats.inProgress += 1;
      else stats.notStarted += 1;

      if (!familyStats[c.family]) {
        familyStats[c.family] = { total: 0, compliant: 0, inProgress: 0, notStarted: 0 };
      }
      familyStats[c.family].total += 1;
      if (s === "Compliant") familyStats[c.family].compliant += 1;
      else if (s === "In Progress") familyStats[c.family].inProgress += 1;
      else familyStats[c.family].notStarted += 1;
    });

    const pct = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
    return { stats, pct, familyStats };
  }, [statuses]);

  return { getStatus, setStatus, resetAll, stats, pct, familyStats, hydrated };
}
