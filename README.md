# 🛡️ NIST_CMMC_Readiness

An **interactive crosswalk and readiness assessment tool** for the NIST SP 800-171 Rev 2 and CMMC (Cybersecurity Maturity Model Certification) Level 2 frameworks. Built for defense contractors, GRC practitioners, and security teams who need to understand, track, and demonstrate compliance readiness across all 110 controls.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)
![Vulnerabilities](https://img.shields.io/badge/vulnerabilities-0-brightgreen)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Full Crosswalk** | All 110 NIST SP 800-171 Rev 2 controls mapped 1:1 to their CMMC Level 2 practice IDs |
| **Sidebar Navigation** | Navigate all 14 control families (AC, AT, AU, CM, IA, IR, MA, MP, PE, PS, RA, CA, SC, SI) with per-family progress indicators |
| **Technical ↔ Wizard Mode** | Toggle between official control text and plain-English questions for non-technical stakeholders |
| **Real-time Status Tracking** | Mark each control as `Not Started`, `In Progress`, or `Compliant` with one click |
| **Progress Tracker** | Live overall compliance percentage with a color-coded progress bar at the top |
| **Per-Family Progress** | Each sidebar entry and family header shows its own completion percentage |
| **SPRS Score Calculator** | Live DoD Assessment Methodology (v1.2.1) score — starts at 110, deducts official 5/3/1-point weights per unimplemented control, with partial credit for MFA (3.5.3) and FIPS crypto (3.13.11) and an SSP (3.12.4) gate warning |
| **Global Search** | Instant keyword search across all 110 controls — by ID, text, or topic (e.g. "MFA", "encryption", "audit logs") — press `/` to jump to the search box |
| **Status Filters** | Filter the control list to Not Started / In Progress / Compliant, with live counts |
| **Notes & Evidence** | Attach free-text notes (evidence locations, policy references, POA&M items) to any control |
| **Persistent State** | Assessment progress and notes are saved to `localStorage` — no backend required |
| **JSON / CSV Export** | Download a full readiness report as structured JSON (suitable for SSP appendices) or as CSV (spreadsheet / POA&M friendly) |
| **Import** | Restore an assessment from a previously exported JSON report — back up, share, or move between machines |
| **Responsive UI** | Sidebar collapses into a slide-out drawer on small screens |
| **Reset** | Clear all statuses and notes and start fresh with a single click |

---

## 🗂️ Project Structure

```
NIST_CMMC_Readiness/
├── src/
│   ├── app/
│   │   ├── layout.jsx          # Root Next.js layout + metadata
│   │   ├── page.jsx            # Main dashboard (entry point)
│   │   └── globals.css         # Tailwind directives + scrollbar styles
│   │
│   ├── components/
│   │   ├── Sidebar.jsx         # Family navigation with per-family progress
│   │   ├── Header.jsx          # Search bar, progress bar, mode toggle
│   │   ├── ControlCard.jsx     # Individual control card with crosswalk + status
│   │   └── FamilyHeader.jsx    # Family summary stats bar
│   │
│   ├── data/
│   │   ├── controls.js         # All 110 controls — the single source of truth
│   │   └── sprsWeights.js      # DoD Assessment Methodology v1.2.1 point weights
│   │
│   ├── hooks/
│   │   └── useAssessment.js    # State management + localStorage persistence
│   │
│   └── lib/
│       └── exportReport.js     # JSON/CSV report generation, download + import
│
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
└── .eslintrc.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18.17+ ([download](https://nodejs.org))
- **npm** v9+ (comes with Node)

### 1. Clone the repository

```bash
git clone https://github.com/errmorra/NIST_CMMC_Readiness.git
cd NIST_CMMC_Readiness
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

---

## 🏗️ Dropping Into a Fresh Next.js Project

If you want to integrate this into an existing Next.js app:

```bash
# 1. Create a new Next.js app (if starting from scratch)
npx create-next-app@latest my-grc-tool \
  --app \
  --no-typescript \
  --tailwind \
  --eslint

cd my-grc-tool

# 2. Install the one additional dependency
npm install lucide-react

# 3. Copy the project files from this repo:
#    src/data/controls.js
#    src/data/sprsWeights.js
#    src/hooks/useAssessment.js
#    src/lib/exportReport.js
#    src/components/Sidebar.jsx
#    src/components/Header.jsx
#    src/components/ControlCard.jsx
#    src/components/FamilyHeader.jsx
#    src/app/page.jsx   (replace the default)
#    src/app/layout.jsx (replace the default)
#    src/app/globals.css (merge with yours)
#    tailwind.config.js (merge with yours)

# 4. Run
npm run dev
```

---

## 📊 Data Schema

Each control in `src/data/controls.js` follows this schema:

```js
{
  id:           "3.1.1",                   // Unique key (NIST control number)
  nistId:       "3.1.1",                   // NIST SP 800-171 Rev 2 control ID
  cmmcId:       "AC.L2-3.1.1",            // CMMC Level 2 practice ID
  family:       "AC",                      // Family short code
  familyName:   "Access Control",          // Full family name
  nistText:     "Limit information...",    // Official NIST requirement text
  cmmcText:     "Limit system access...", // CMMC practice statement
  plainEnglish: "Do you restrict...",     // Plain-language wizard question
  guidance:     "Implement RBAC...",      // Implementation guidance note
  status:       "Not Started",            // Default — overridden by useAssessment hook
}
```

### Control Families Covered

| Code | Family | Controls |
|------|--------|----------|
| AC | Access Control | 22 |
| AT | Awareness & Training | 3 |
| AU | Audit & Accountability | 9 |
| CM | Configuration Management | 9 |
| IA | Identification & Authentication | 11 |
| IR | Incident Response | 3 |
| MA | Maintenance | 6 |
| MP | Media Protection | 9 |
| PE | Physical Protection | 6 |
| PS | Personnel Security | 2 |
| RA | Risk Assessment | 3 |
| CA | Security Assessment | 4 |
| SC | System & Communications Protection | 16 |
| SI | System & Information Integrity | 7 |
| **Total** | | **110** |

---

## 🎨 UI / Design Decisions

- **Dark enterprise theme** — `slate-950` background, `slate-900` surfaces; appropriate for GRC/security tooling
- **Color semantics**: sky/indigo = NIST/CMMC IDs; emerald = compliant; amber = in progress; slate = not started
- **Side-by-side crosswalk panels** — expand any card to see NIST and CMMC text side by side
- **No external UI library** — pure Tailwind + Lucide React; zero component framework lock-in
- **No backend** — all state in `localStorage`; works offline after first load

---

## 📈 SPRS Score Calculator

The header shows a live **SPRS score** computed per the *NIST SP 800-171 DoD Assessment Methodology, Version 1.2.1*:

- You start at **110**; each control not marked `Compliant` deducts its official weight (**5**, **3**, or **1** points), so scores range from **−203 to 110**.
- **MFA (3.5.3)** and **FIPS-validated cryptography (3.13.11)** get the methodology's built-in partial credit: marking them `In Progress` deducts 3 points instead of 5.
- **The SSP (3.12.4)** carries no point value — but without one an official assessment cannot be conducted, so the header shows a **"No SSP"** warning until it is marked compliant.
- Each control card shows its deduction weight (e.g. `−5 pts`); hover for details.
- A score of **88+** may qualify for Conditional CMMC Level 2 status; **110** is required for final status.

> Use this to estimate and plan. Your reportable SPRS score must come from a documented self-assessment against your SSP.

---

## 🔄 Exported Report Format

Clicking **JSON** downloads a structured file like:

```json
{
  "title": "NIST SP 800-171 / CMMC Level 2 Readiness Assessment",
  "generatedAt": "2025-06-02T14:30:00.000Z",
  "overallCompliance": {
    "pct": 42,
    "compliant": 46,
    "inProgress": 18,
    "notStarted": 46,
    "total": 110
  },
  "sprsScore": {
    "score": 12,
    "max": 110,
    "min": -203,
    "deducted": 98,
    "sspMissing": false,
    "methodology": "NIST SP 800-171 DoD Assessment Methodology v1.2.1"
  },
  "familySummary": [
    {
      "family": "Access Control",
      "code": "AC",
      "total": 22,
      "compliant": 18,
      "inProgress": 3,
      "notStarted": 1,
      "pct": 81
    }
  ],
  "controls": [
    {
      "nistId": "3.1.1",
      "cmmcId": "AC.L2-3.1.1",
      "family": "Access Control",
      "requirement": "Limit information system access...",
      "sprsWeight": 5,
      "status": "Compliant",
      "note": "Enforced via Entra ID conditional access; see SSP §3.1."
    }
  ]
}
```

This report can be attached to your **System Security Plan (SSP)** or shared with a C3PAO assessor as a gap analysis artifact. The same file can be re-imported later via the **Import** button to restore or share an assessment. A **CSV** export (one row per control, including SPRS weights and notes) is also available for spreadsheets and POA&M tracking.

---

## 🗺️ Roadmap / Future Enhancements

- [x] **SPRS Score Calculator** — Supplier Performance Risk System score computation
- [x] **Evidence Attachment** — attach notes, policy links, or screenshot references per control
- [ ] **POA&M Generator** — auto-generate a Plan of Action & Milestones for non-compliant controls
- [ ] **Multi-user / Backend** — PostgreSQL + Prisma for team-based assessments
- [ ] **PDF Export** — generate a formatted SSP-style PDF report
- [ ] **CMMC Level 1 overlay** — add the 17 Level 1 practices as a separate view
- [ ] **NIST 800-171A Assessment Objectives** — show the specific assessment methods per control
- [ ] **Control Dependencies** — visualize which controls depend on others

---

## 📚 Reference Documents

| Document | Source |
|---|---|
| NIST SP 800-171 Rev 2 | [NIST CSRC](https://csrc.nist.gov/publications/detail/sp/800-171/rev-2/final) |
| CMMC 2.0 Model | [DoD CMMC](https://www.acq.osd.mil/cmmc/) |
| CUI Registry | [Archives.gov](https://www.archives.gov/cui) |
| NIST SP 800-171A | [NIST CSRC](https://csrc.nist.gov/publications/detail/sp/800-171a/final) |
| DIBCAC Assessment Scoring | [DCSA](https://www.dcsa.mil/) |

---

## ⚠️ Disclaimer

This tool is provided for **informational and self-assessment purposes only**. It does not constitute an official CMMC assessment and cannot be used as a substitute for a formal assessment conducted by an accredited C3PAO (CMMC Third-Party Assessment Organization). Control text is sourced from NIST SP 800-171 Rev 2 and the CMMC 2.0 model documentation.

---

## 👤 Author

**errmorra** — [github.com/errmorra](https://github.com/errmorra)

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
