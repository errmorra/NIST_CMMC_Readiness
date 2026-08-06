/**
 * SPRS scoring weights — NIST SP 800-171 DoD Assessment Methodology, Version 1.2.1.
 *
 * Scoring starts at 110. For each requirement NOT fully implemented, its weight
 * (5, 3, or 1) is subtracted, so scores range from -203 to 110.
 *
 * Special cases defined by the methodology:
 *   - 3.5.3 (MFA): -3 if partially implemented (remote + privileged users only),
 *     -5 if not implemented at all.
 *   - 3.13.11 (FIPS crypto): -3 if encryption is used but not FIPS-validated,
 *     -5 if no encryption is employed.
 *   - 3.12.4 (SSP): no point value — without a system security plan the
 *     assessment cannot be completed at all.
 *
 * In this tool, "In Progress" on 3.5.3 / 3.13.11 applies the partial -3
 * deduction; every other non-Compliant control deducts its full weight.
 */

const FIVE_POINT = [
  // Basic security requirements
  "3.1.1", "3.1.2", "3.2.1", "3.2.2", "3.3.1", "3.4.1", "3.4.2",
  "3.5.1", "3.5.2", "3.6.1", "3.6.2", "3.7.2", "3.8.3", "3.9.2",
  "3.10.1", "3.10.2", "3.12.1", "3.12.3", "3.13.1", "3.13.2",
  "3.14.1", "3.14.2", "3.14.3",
  // Derived security requirements
  "3.1.12", "3.1.13", "3.1.16", "3.1.17", "3.1.18", "3.3.5",
  "3.4.5", "3.4.6", "3.4.7", "3.4.8", "3.5.10", "3.7.5", "3.8.7",
  "3.11.2", "3.13.5", "3.13.6", "3.13.15", "3.14.4", "3.14.6",
  // Partial-credit specials (full weight is 5)
  "3.5.3", "3.13.11",
];

const THREE_POINT = [
  // Basic security requirements
  "3.3.2", "3.7.1", "3.8.1", "3.8.2", "3.9.1", "3.11.1", "3.12.2",
  // Derived security requirements
  "3.1.5", "3.1.19", "3.7.4", "3.8.8", "3.13.8", "3.14.5", "3.14.7",
];

/** Controls with built-in partial credit (-3 when partially implemented). */
export const PARTIAL_CREDIT_IDS = new Set(["3.5.3", "3.13.11"]);

/** The SSP requirement — a gate, not a scored deduction. */
export const SSP_GATE_ID = "3.12.4";

/** Maximum possible score. */
export const SPRS_MAX = 110;

/** Minimum possible score (110 - 313 total deductible points). */
export const SPRS_MIN = -203;

const WEIGHT_MAP = new Map();
FIVE_POINT.forEach((id) => WEIGHT_MAP.set(id, 5));
THREE_POINT.forEach((id) => WEIGHT_MAP.set(id, 3));

/** Point deduction for a control when it is not implemented. */
export function getWeight(id) {
  if (id === SSP_GATE_ID) return 0;
  return WEIGHT_MAP.get(id) ?? 1;
}

/**
 * Compute the SPRS score from a { controlId: status } map.
 * Returns { score, deducted, sspMissing }.
 */
export function computeSprsScore(statuses, controlIds) {
  let deducted = 0;
  controlIds.forEach((id) => {
    const status = statuses[id] ?? "Not Started";
    if (status === "Compliant") return;
    if (PARTIAL_CREDIT_IDS.has(id) && status === "In Progress") {
      deducted += 3;
      return;
    }
    deducted += getWeight(id);
  });
  const sspMissing = (statuses[SSP_GATE_ID] ?? "Not Started") !== "Compliant";
  return { score: SPRS_MAX - deducted, deducted, sspMissing };
}
