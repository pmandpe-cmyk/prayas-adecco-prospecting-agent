# Agent Activity: step-by-step plan for .11

> Built from PRD Tab 2 plus our brainstorm (Oct 28). Do these in cmux, one step at a time, local only.
> ✅ = data exists, so design and copy only · 🟡 = confirm with eng · ❌ = not .11 (label it "Later" if shown at all)
> Proto file: `prospect_list.html` (Activity tab) + `scripts/agent-log.js`

---

## Step 0: Set up (before designing)
- [ ] **Use the run-based view as the .11 base** (run list → run detail). Leave the tree view (accounts with nested prospects, Flex column) untouched. It's **version 2**.
- [ ] Send eng the 5 feasibility questions (bottom of this file). Don't wait on the answers. Design ✅ items first.

## Step 1: Run list ✅
- [ ] Page header and every label use **"Runs"** (not "Sessions").
- [ ] First column **"Run"**: date as the primary line and the **link to the detail**, run ID in small text below.
- [ ] **Results**: stacked chips in one format for every row:
  - `Accounts: 1 of 1 qualified`
  - `Prospects: 14 of 25 qualified` ("Prospects", not "Contacts")
  - add `⚠ 2 errors` only when there are errors.
- [ ] **Enrich calls** column replaces Records Searched (🟡 if eng has the number). Otherwise keep **Records Searched** with the tooltip "Accounts and prospects the agent reviewed."
- [ ] **A zero always says why.** Tooltip on `0`: "Enrichment is off for this agent. The agent used ZoomInfo Search, which doesn't use credits."
- [ ] Remove "View Details" from the Status cell (the date link replaces it).
- [ ] Filters: Agent, Date, plus **Status** (🟡).

## Step 2: Run statuses ✅ (QA bugs are being fixed now)
Each status has a badge plus a one-line explanation under it:

| Status | Explanation copy |
|---|---|
| Queued | Waiting for the current run to finish. |
| Running | Started {12} min ago. |
| Completed | (none) |
| Completed with errors | {2} records couldn't be processed. View details |
| Interrupted | The run stopped before finishing. Results so far are shown. *(show partial counts, never blank)* |
| Failed | The source report was deleted or you no longer have access. |
| Nothing to process | The report had no accounts, or all were in cooldown. |

## Step 3: Run detail header ✅
- [ ] `← Back to runs` · date · agent · status badge (same copy as Step 2).
- [ ] **Summary strip**, three tiles:
  - **Accounts:** reviewed · qualified · disqualified · errors
  - **Prospects:** reviewed · qualified · disqualified · not added · errors
  - **ZoomInfo:** `{n} enrich calls` ⓘ "Each call can use 1 ZoomInfo credit. Records enriched in the last 12 months don't use a new credit. ZoomInfo Search doesn't use credits."
- [ ] **Flex:** no number. At most a help line: "Research and qualification use Flex credits. See Digital Wallet for usage." ❌ numbers come later.

## Step 4: Records table ✅
- [ ] Keep the **flat table**. **Sort by account**, so each account is followed by its prospects (🟡 confirm sort).
- [ ] A **record-type badge** on every row: Account / Contact / Lead.
- [ ] Columns: **Record** (name · title · company) · **Status** · **Reason** · **Owner** · **Last updated**.
- [ ] Rename "Why This Prospect" → **"Reason"** (it fits every status).
- [ ] **Reason = one short sentence + "View details"**. No truncated paragraphs (🟡 confirm there's a short line, or use the first sentence).
- [ ] Status set: **Qualified · Disqualified · Not added · Error**.
- [ ] Filters: Record type · Status · Owner.

## Step 5: Match details panel (opens from "View details") ✅ / ❌
- [ ] **Account, real for .11:** a summary line ("Meets 4 of 4 required, 1 of 2 optional"), then one line per criterion:
  `✓/✗/– · Required/Optional · criterion as written in setup · evidence · source (Salesforce / Web / ZoomInfo Search / ZoomInfo Enrich)`, then `ZoomInfo: {n} enrich calls`.
  🟡 If the rationale is a text blob rather than fields, show it formatted as-is. Don't build columns.
- [ ] **Prospect, option A (ships):** a clean summary paragraph.
- [ ] **Prospect, option B (labelled "Proposed"):** the same layout as the account, with Ideal / Acceptable / Poor tiers. This is for Victor's "show me examples" (D5).

## Step 6: Copy rules (apply everywhere) ✅
- [ ] **"Enrich calls," never "credits"** in v1.
- [ ] **No internal strings:** `isQualified=false`, AG009, error codes. Map each to a plain sentence plus "what to do."
- [ ] Errors say **whose problem it is:**
  - **Agent error:** "Something went wrong on our side. Try running the agent again."
  - **Blocked by your org's automation:** "A flow or validation rule in your org stopped this record from being created. Ask your admin to review {rule}."
- [ ] Use one word for each thing everywhere: Run, Prospect, Enrich call.

## Step 7: Record-level problems ✅ / 🟡
- [ ] **Not added** row + reason (e.g. "Already exists as a Contact," "No email or callable phone"). 🟡 confirm it's stored (Mukesh's "6 rows" bug).
- [ ] **Error** row + plain reason + type (agent vs org automation) (PRD #8 copy).
- [ ] **"Enriched" badge** only when enrichment actually succeeded (🟡, bug W-24654083).
- [ ] 2,000-contact volume (D6): propose **one summary row per account**, e.g. "1,940 existing contacts didn't match prospect criteria." Mock it as "Proposed."

## Step 8: Empty, loading, and refresh states ✅
- [ ] No runs yet: "No runs yet. Your agent's runs will show here after it starts." + View agents.
- [ ] No runs match the filters: "No runs match these filters." + Clear filters.
- [ ] Loading skeleton for the list and the detail.
- [ ] **Refresh** updates the list and Running statuses (it's broken today, a QA bug).

## Step 9: Hold for Approval agents ✅
- [ ] Their prospect rows show the status **"Held for approval"** (not Created), and nothing links to a Lead that doesn't exist yet.
- [ ] Results chip: `Prospects: 14 of 25 qualified · held for approval`.

## Step 10: Wrap up
- [ ] Screenshot each step.
- [ ] Send Victor: the run list, the run detail, and **match details A vs B** (his D5 decision).
- [ ] Anything ❌ that appears in the mocks is labelled **"Later."**

---

## Not .11 (version 2 / later). Don't design now
- Tree view (accounts with nested prospects).
- Flex numbers (#4).
- Disqualified-but-charged (#5).
- Actual ZoomInfo credits (#7).
- Filtered-contacts count (#9).
- Itemized cost (#10).
- Vendor filter (#11).
- Retries (#12).
- "Most disqualified by criterion → edit setup" insight.
- Report type (#6): ask eng whether any of it is in .11.

## 5 questions for eng (Shrey / Neeraj)
1. Is the **enrich call count** available per run for the run list, or only in the detail header?
2. Is the **account rationale** stored as separate criteria or as one text block? Is there a **short one-line summary** for prospects?
3. Will **Not added** prospects and their reasons show in .11?
4. Which statuses will the P1 fixes produce (Queued / Failed / Interrupted / Completed with errors), and with what reason text? Is an **errored count** available per run?
5. Is a reliable **"Enriched" signal** available per record? Can the detail table **sort by account**?
