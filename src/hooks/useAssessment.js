"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CONTROLS } from "../data/controls";
import { computeSprsScore } from "../data/sprsWeights";

const STORAGE_KEY = "cmmc_assessment_state";
const NOTES_KEY = "cmmc_assessment_notes";
const VALID_STATUSES = new Set(["Not Started", "In Progress", "Compliant"]);
const CONTROL_IDS = CONTROLS.map((c) => c.id);
const CONTROL_ID_SET = new Set(CONTROL_IDS);

function sanitizeStatuses(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const clean = {};
  for (const [id, status] of Object.entries(parsed)) {
    if (VALID_STATUSES.has(status)) clean[id] = status;
  }
  return clean;
}

function sanitizeNotes(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const clean = {};
  for (const [id, note] of Object.entries(parsed)) {
    if (typeof note === "string" && note.trim()) clean[id] = note;
  }
  return clean;
}

export function useAssessment() {
  const [statuses, setStatuses] = useState({});
  const [notes, setNotes] = useState({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedStatuses = sanitizeStatuses(JSON.parse(localStorage.getItem(STORAGE_KEY)));
      if (savedStatuses) setStatuses(savedStatuses);
    } catch (_) {
      // ignore parse errors
    }
    try {
      const savedNotes = sanitizeNotes(JSON.parse(localStorage.getItem(NOTES_KEY)));
      if (savedNotes) setNotes(savedNotes);
    } catch (_) {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever statuses/notes change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (_) {
      // ignore quota errors
    }
  }, [statuses, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (_) {
      // ignore quota errors
    }
  }, [notes, hydrated]);

  const getStatus = useCallback(
    (id) => statuses[id] ?? "Not Started",
    [statuses]
  );

  const setStatus = useCallback((id, status) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const getNote = useCallback((id) => notes[id] ?? "", [notes]);

  const setNote = useCallback((id, note) => {
    setNotes((prev) => {
      if (!note.trim()) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: note };
    });
  }, []);

  const resetAll = useCallback(() => {
    setStatuses({});
    setNotes({});
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(NOTES_KEY);
    } catch (_) {}
  }, []);

  /**
   * Bulk-restore assessment state (e.g. from an imported report).
   * Unknown control IDs and invalid statuses are dropped.
   * Returns the number of statuses applied.
   */
  const importState = useCallback((importedStatuses, importedNotes) => {
    const cleanStatuses = sanitizeStatuses(importedStatuses) ?? {};
    const cleanNotes = sanitizeNotes(importedNotes) ?? {};
    const knownStatuses = Object.fromEntries(
      Object.entries(cleanStatuses).filter(([id]) => CONTROL_ID_SET.has(id))
    );
    const knownNotes = Object.fromEntries(
      Object.entries(cleanNotes).filter(([id]) => CONTROL_ID_SET.has(id))
    );
    setStatuses(knownStatuses);
    setNotes(knownNotes);
    return Object.keys(knownStatuses).length;
  }, []);

  // Aggregate stats (overall + per-family) — recomputed only when statuses change.
  const { stats, pct, familyStats, sprs } = useMemo(() => {
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
    const sprs = computeSprsScore(statuses, CONTROL_IDS);
    return { stats, pct, familyStats, sprs };
  }, [statuses]);

  return {
    getStatus, setStatus,
    getNote, setNote,
    resetAll, importState,
    stats, pct, familyStats, sprs, hydrated,
  };
}
