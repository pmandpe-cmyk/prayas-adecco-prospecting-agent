# Adecco Prospecting Agent — Phase 1 UX Prototype

## Context

Adecco needs UX design prototypes for their Prospecting Agent's Phase 1 (.11 release) features. The work covers four areas: contact/reachability filters, ZoomInfo enrichment controls, cooldown override settings, and analytics dashboard enhancements. These prototypes will be demo-ready for stakeholder presentation, built with `@websideproject/nuxt-protokit` (Nuxt 4 + Tailwind + Y.js schema-driven prototyping).

**Source**: PRD at Google Docs (link shared), Gemini summary of requirements discussion.

---

## Tech Stack

- **Framework**: Nuxt 4 via `@websideproject/nuxt-protokit`
- **Styling**: Tailwind CSS + Nuxt UI v3/v4
- **Persistence**: Y.js + IndexedDB (offline-first, auto-persisted)
- **Dependencies**: `@websideproject/nuxt-protokit`, `yjs`, `y-indexeddb`, `@nuxt/ui`, `tailwindcss`

---

## Project Setup

1. Initialize Nuxt 4 project in the working directory
2. Install dependencies: `@websideproject/nuxt-protokit yjs y-indexeddb @nuxt/ui tailwindcss`
3. Configure `nuxt.config.ts` with protokit module
4. Set up `assets/css/main.css` with Tailwind + Nuxt UI + protokit source scanning
5. Create base layout with navigation between the 4 prototype pages

---

## Prototype Pages (Phase 1)

### Page 1: Prospecting Configuration (Guided Config)

**Route**: `/config`

Contains three sub-features as sections within one `ProtoTool` schema:

#### 1a. Contact/Reachability Filters
- **Fields**:
  - `requirePhone` — toggle (default: false), label: "Require phone number"
  - `requireEmail` — toggle (default: false), label: "Require email address"  
  - `reachabilityMode` — segmented field with options: "Any", "Phone only", "Email only", "Phone & Email"
- **UI**: Embedded controls (not natural language), clearly grouped under a "Contact Reachability" section
- **Derived**: Show a text summary of current filter (e.g., "Prospects must have: Phone & Email")

#### 1b. ZoomInfo Enrichment Controls
- **Fields**:
  - `enableZoomInfoEnrichment` — toggle (default: true), label: "Enable ZoomInfo enrichment"
  - `zoomInfoScope` — segmented field, options: "All accounts", "New accounts only", "Manual only"; shown when enrichment is enabled (`showWhen`)
  - `monthlyApiLimit` — number field, label: "Monthly API call limit", trailing: "calls"
- **UI**: Grouped under "ZoomInfo Enrichment" section with a warning badge when disabled
- **Derived**: API usage estimate based on scope selection

#### 1c. Cooldown Override
- **Fields**:
  - `enableCooldown` — toggle (default: true), label: "Account cooldown period"
  - `cooldownDays` — number field (default: 30, min: 1, max: 90), label: "Cooldown period", trailing: "days"; shown when cooldown is enabled
  - `overrideCooldown` — toggle (default: false), label: "Override cooldown (experimental)", shown when cooldown is enabled
- **UI**: Grouped under "Account Cooldown" section with a warning result card when override is active
- **Result card**: Shows cooldown status with badge ("Active" green / "Overridden" warning / "Disabled" error)

### Page 2: Analytics Dashboard

**Route**: `/analytics`

Uses `ProtoDashboard` or custom layout with multiple visualization types:

#### 2a. Agent Activity Overview
- **Stat cards** (VizStatCards): Total sessions, Active sessions today, Avg. session duration, Prospects evaluated
- **Line chart** (VizLineChart): Sessions over time (last 30 days) — mock data
- **Bar chart** (VizBarChart): Qualified vs Disqualified accounts per day

#### 2b. Qualification Breakdown
- **Pie chart** (VizPieChart): Qualified vs Disqualified split
- **Funnel chart** (VizFunnelChart): Total accounts → Evaluated → Qualified → Approved → Converted
- **Collection table**: Disqualification reasons with counts (e.g., "No phone", "Industry mismatch", "Revenue too low", "Cooldown active")

#### 2c. API Usage Report
- **Stat cards**: ZoomInfo calls this month, Monthly limit, Remaining, Cost estimate
- **Area chart** (VizAreaChart): Daily API call volume over time
- **Progress bar** (VizProgressBar): Monthly API usage vs limit
- **Benchmark bar** (VizBenchmarkBar): Current month vs previous month usage

### Page 3: Prospect Approval Queue (stretch)

**Route**: `/approve` (if time permits, maps to Phase 2 preview)

- **Collection** with CRUD: List of prospects with status field (Pending / Approved / Rejected)
- **Table columns**: Name, Company, Title, Phone, Email, Score, Status
- **Item actions**: Approve, Reject
- **Status field**: colored badges per status

---

## Approach

We will build iteratively, confirming each page with you before moving to the next:

1. **Step 1**: Project scaffolding + base layout with navigation
2. **Step 2**: Prospecting Configuration page (filters, ZoomInfo, cooldown)
3. **Step 3**: Analytics Dashboard page (stats, charts, tables with mock data)
4. **Step 4**: Polish — styling, transitions, demo-ready tweaks
5. **(Optional) Step 5**: Prospect Approval Queue preview

At each step, we'll run the dev server, review in browser, and iterate.

---

## Mock Data

All data will be hardcoded mock data designed to tell a realistic Adecco story:
- Staffing industry accounts (Adecco's domain)
- Realistic prospect titles (Managing Director, VP Operations, etc.)
- Plausible qualification/disqualification numbers
- ZoomInfo-style API usage patterns

---

## Verification

- Run `npm run dev` and open in browser after each page
- Verify all fields persist on reload (IndexedDB)
- Verify conditional visibility (`showWhen`) works for dependent fields
- Verify charts render with mock data
- Verify responsive layout for demo presentation
- Screenshot key screens for stakeholder review
