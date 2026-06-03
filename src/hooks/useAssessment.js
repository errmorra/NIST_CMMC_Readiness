"use client";

import { useState, useEffect, useCallback } from "react";
import { CONTROLS } from "../data/controls";

const STORAGE_KEY = "cmmc_assessment_state";

export function useAssessment() {
  const [statuses, setStatuses] = useState({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setStatuses(JSON.parse(saved));
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

  // Aggregate stats
  const stats = CONTROLS.reduce(
    (acc, c) => {
      const s = statuses[c.id] ?? "Not Started";
      acc.total += 1;
      if (s === "Compliant") acc.compliant += 1;
      else if (s === "In Progress") acc.inProgress += 1;
      else acc.notStarted += 1;
      return acc;
    },
    { total: 0, compliant: 0, inProgress: 0, notStarted: 0 }
  );

  const pct = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;

  // Per-family stats
  const familyStats = {};
  CONTROLS.forEach((c) => {
    if (!familyStats[c.family]) {
      familyStats[c.family] = { total: 0, compliant: 0, inProgress: 0, notStarted: 0 };
    }
    const s = statuses[c.id] ?? "Not Started";
    familyStats[c.family].total += 1;
    if (s === "Compliant") familyStats[c.family].compliant += 1;
    else if (s === "In Progress") familyStats[c.family].inProgress += 1;
    else familyStats[c.family].notStarted += 1;
  });

  return { getStatus, setStatus, resetAll, stats, pct, familyStats, hydrated };
}
