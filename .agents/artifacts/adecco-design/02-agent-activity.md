# 02 · Agent Activity (Run Log)

> **PRD:** Tab 2, *Agent Activity* · **UX:** Prayas · **CX:** Patricia Vaz
> **Eng:** Shrey Kharbanda (rationale, filtered contacts) · Sahil Godhane (credits, OutcomeSummary) · Rajkumar Pellakuru (report FK, columns) · Ronit Batchu / Matt Holland / Vandana Ramesh (error handling) · **QA:** Manika Sunal, Mukesh Dua, Kiran Kamath M
> **Legend:** 🟢 264.11 · 🟡 264.12 · 🔵 264.10 patch · ⚪ later

## Summary

Agent Activity is where Adecco decides whether to **trust** the agent and whether it's **worth the money**. It's the biggest UX job in .11. Adecco needs four answers from it:
1. **What happened in this run?** The run summary.
2. **Why was each account or prospect kept or dropped?** The match details.
3. **What did it cost?** ZoomInfo enrich calls and Flex.
4. **What went wrong, in plain language?** The error states.

Most of what QA filed this week comes down to one problem: **a number with no explanation behind it.** Examples are the "2 not added" chip, Enriched counts with no rows, a blank Results column, and raw AG009 text.

---

## 1. PRD requirements

| # | Pri | Requirement | Release | Notes |
|---|---|---|---|---|
| 1 | P0 | **Match details per account and prospect.** For each criterion show: met / not met / **no data**, plus the **source**. Accounts: Required / Optional. Prospects: **Ideal / Acceptable / Poor** | 🟢 accounts · ⚪ per-criterion prospects (D5) | GA's "Why This Prospect?" shows account criteria for qualified prospects only |
| 2 | P0 | **Run summary**: accounts processed, qualified/disqualified, prospects found / created / not created, skipped (cooldown), errors | 🟢 | |
| 3 | P0 | **ZoomInfo enrich calls** per run and per account, plus an **"Enriched" badge** on records | 🟢 | v1 = **call count**, not credits |
| 4 | P0 | **Flex credits** per run and per account, from Digital Wallet (near real time, or a 15-min / 1-hr job) | 🟢 | Already "Flex Credit Used" in proto |
| 5 | P0 | **Disqualified but charged**: how much was spent, at which step, and which filter disqualified it | 🟢 | |
| 6 | P0 | **Report type**, plus stamping the source agent and run on created Leads/Contacts | 🟢 (W-24630234 passes) | W-24660910: Name column blank |
| 7 | P1 | **Actual ZoomInfo credits** via the usage API (call vs credit vs no-charge) | ⚪ after .11 | Customer asked explicitly |
| 8 | P1 | **Validated but not created**: show the blocker (dupe, permission, flow error, limit) | 🟢 partly (W-24654087) | |
| 9 | P1 | **Contact-data filtered count**: prospects dropped for no email / callable phone | 🟢 (D6) | New with the contact pre-filter |
| 10 | P1 | **Itemized cost** by step (research, search, enrich, validate) | ⚪ | PRD question: should this become P0? |
| 11 | P1 | **Filter by vendor** (ZoomInfo, web, CRM) | ⚪ | |
| 12 | P2 | **Error retries**: retry failed accounts from the log | ⚪ | |

PRD open questions:
- Log retention (TTL): **at least 3 months**.
- Does the enrichment setting live in Tools or in Find Prospects? Answered by 01 / D1.
- Should itemized cost become P0?

---

## 2. What's been decided (Slack)

### Cost reporting (Flex thread, ts 1792857927)
- **Kunal and Victor:** v1 reports the **number of enrich API calls**, not credits. The ~12-month free re-enrich window means calls ≠ credits, and showing credits risks billing disputes. Actual consumption comes **after .11** (PRD #7).
- **Sahil:** credits appear in the **Records Searched** table and header, and in the **account Rationale**. **Per-person credits aren't stored**, so no per-prospect cost column.
- Every LLM Gateway call consumes Flex, so every processed record has a Flex cost > 0.
- Customer (Oct 27): *"distinguish between an enrichment call being made, actual ZoomInfo credit consumption, and cases where enrichment does not generate an additional charge."* Design the label so it can grow from "Enrich calls" to "Enrich calls · Credits used" without a redesign.

### Match details (Neeraj bug thread, ts 1793141120)
- **Shrey:** making the prospect rationale per-criterion (✓ / ✗ / no data, source, Ideal/Acceptable/Poor) needs a **ValidateProspects prompt change**. That means more tokens and more Flex.
- **Victor:** *"That might be okay for v1. Can you show me examples?"* He also asked how much Flex it adds.
- **Current decision:** keep the **free-text** rationale for prospects in .11. Per-criterion is a follow-up (**D5**). Accounts already have per-criterion data.
- **Design ask:** mock **both** formats with real Adecco-style criteria so Victor has examples to compare.

### Filtered contacts and volume (same thread)
- **Shrey:** a single account can return up to **2,000 contacts** (CONTACT_QUERY_LIMIT). Recording every filtered-out contact bloats storage and inflates disqualified counts. The policy is still open (**D6**).
- **Disqualified storage (ts 1792867067):** disqualified records live in a **research entity**, not as Leads/Contacts.
- **Design implication:** show the filtered-out contacts as a **count with a reason breakdown** ("1,240 filtered: no email or callable phone 1,180 · title mismatch 60"). Don't render them as rows unless D6 says to store them.

### QA bugs to design states for (Manika, Mukesh, Kiran)
| Bug | What happens | State to design |
|---|---|---|
| **W-24654087** | "N not added" chip, *"no way to tell which 2 people it means or why"* | Make the chip clickable: it filters the table to those prospects, each with a reason |
| **W-24654083** | Errored ZI lookups counted as **Enriched** with no row | Enriched count = successful enrich only. Errors are counted separately |
| **W-24653786** | Raw **AG009** text on 1–2 of every 6 accounts | Human error copy (§5) |
| **W-24654097** | Replacing the source report wipes history, so Enriched shows "unavailable" | Rajkumar: FK SetNull + hide the AccountSource column. Design "Source report removed" as a neutral note, not an error |
| **W-24663204 / W-24663216** | Run stuck in **Running** / **Queued** | A "taking longer than usual" state after a threshold, with a help link |
| **W-24663222** (P3) | Empty or wrong report ends as **Completed** | "Completed · 0 accounts found in source", with a check-source hint |
| **W-24664053** | An empty ICP can be activated: AG010, but the run shows **Completed** | "Completed with errors" or "Failed". Prevent upstream (01) |
| **W-24663516** | Interrupted runs: Results / Records Searched blank (no OutcomeSummary). View Details still shows 110 | "Interrupted" status. Show partial counts from the detail rows. Fixed by Sahil, pending merge |
| **W-24658780** | Polish: bullets joined, filters misaligned, error text clipped | Spec bullet rendering, filter layout, wrap/expand for errors |
| **Refresh (Mukesh)** | The Refresh button on the Agent Activity tab doesn't work | Refresh must re-fetch and show a "Updated hh:mm" timestamp |
| **Manika Q1** | Errored vs checkFailed: two statuses that look the same | One "Error" status with a sub-reason, or clearly different labels |
| **Manika Q2** | Prospects with no email shown as **Qualified** | With the pre-filter on, these should be filtered. Check the label logic |
| **Manika Q3** | 255-character summary limit truncates the rationale | Truncate with "Show more" and keep the full text in the popover |
| **Manika Q4** | Duplicate "HubSpot" accounts in the source → 9 + 16 enrich calls | Show the per-account enrich count. Flag duplicates in the run summary |

### Performance (Tanuja ts 1792980142, Kiran ts 1792947004)
- **Tanuja:** 100-prospect runs only reached **28** because of timeouts. After parallel checks it reached **97**, and rejections now always carry a reason. Open question on skipped prospects:
  - **(A) Over-fetch candidates.** Preferred.
  - (B) Retry.
  - (C) Treat as an error.
- **Kiran:** re-runs raise p90 from 3.05 to 5.74 min (W-24653121). Runs are long, so the **Running** state needs progress, not just a spinner.

### Errors (Jeremy, ts 1793112929)
- **31% of Adecco errors (70 / 227) come from their own setup.** The cause is before-save Contact flows that throw.
- Errors need to separate **"your org's automation blocked this"** from **"the agent failed"**. This affects trust and support load.

### Data source on created records
- PRD #6: stamp the agent and run on Leads/Contacts. Report types pass (W-24630234).
- W-24660910: the Name column is blank in the report.

---

## 3. Current proto state and gaps

`prospect_list.html` + `scripts/agent-log.js` + `scripts/prospect-list.js` (the Activity tab of the Prospecting page).

| View | Today | Gap |
|---|---|---|
| **V1: Group by Account** (`agent_log_table_all`, ≈ L14230) | Columns: Records (account → prospect rows), Status (Qualified / Disqualified badge), Rationale (popover with bullet list), **Flex Credit Used**, Owner, Updated. "12 Accounts • Sorted By Records Researched" toolbar | ❌ No enrich count or Enriched badge. ❌ Rationale is a flat list, not met / not met / no data with source. ❌ No skipped / filtered / not-created rows. ❌ No error rows |
| **V2: Group by RunId** (`agent_log_table_run_all`, ≈ L17680) | Run list columns: Run, Agent, Status Summary, Records Processed, Duration, Started At, Owner, plus View Details | ❌ No status for Running / Queued / Interrupted / Failed. ❌ No enrich or Flex totals |
| **Run detail** (`.agent-log-run-detail`, ≈ L18820) | Back to Run List · "Run #1842 · Daily Prospecting" · agent · N Records · duration · started · filters (Records / Status / Owner) | ❌ **No run summary block** (PRD #2). ❌ No cost summary. ❌ No disqualified-but-charged. ❌ No vendor filter |
| V1/V2 switcher (≈ L300) | Proto-only "V1 / V2" listbox | Decide which one ships. Recommend **V2 run list → run detail** as primary |

⚠️ Don't use the Heroku `prospect-list-p0.html` (Kunal: old, not the real build).

---

## 4. Screens and states to design

### 4.1 Run list 🟢
- **Columns:** Run (# + trigger: Scheduled / Manual) · Status · Accounts · Prospects created · Enrich calls · Flex credits · Duration · Started.
- **Status values** (one badge each, never just a spinner):

| Status | Badge | Meaning |
|---|---|---|
| Queued | neutral | Waiting to start. After {X} min: "Still queued" with a tooltip |
| Running | info + progress "34 of 110 accounts" | In progress. After {X} min: "Taking longer than usual" |
| Completed | success | Everything processed |
| Completed with errors | warning | Some accounts failed. Shows a count |
| Interrupted | warning | Stopped partway. Shows partial counts |
| Failed | error | Run failed. Shows the reason (e.g. empty ICP, no source) |

- **Refresh:** a working button plus "Updated 10:42 AM". Optionally auto-refresh while any run is Running.

### 4.2 Run detail: summary block 🟢 (PRD #2–5)
Sits above the records table. Each tile is clickable and filters the table.

```
Run #1842 · Manual · Completed with errors · 4m 22s · Oct 28, 11:44 AM
┌ Accounts ───────────┐ ┌ Prospects ─────────────┐ ┌ Cost ──────────────────┐
│ 110 in source       │ │ 412 found by Search    │ │ 38 ZoomInfo enrich calls│
│  62 researched      │ │ 1,240 filtered (no     │ │ 14.5 Flex credits       │
│  40 skipped·cooldown│ │   email/phone) ⓘ      │ │ 3.1 Flex on disqualified│
│   6 errors        → │ │  97 validated          │ │   accounts ⓘ            │
│  21 qualified       │ │  88 created · 9 not  → │ └─────────────────────────┘
└─────────────────────┘ └────────────────────────┘
```
- **"Not created" → reasons** (W-24654087, PRD #8): Duplicate · Blocked by your org's automation · Permission · Limit reached.
- **Filtered (PRD #9):** the count plus a reason breakdown. No rows unless D6 decides otherwise.
- **Disqualified but charged (PRD #5):** a Flex/enrich total, and a drill-in showing step + filter for each account.
- **Duplicates in source:** an info note such as "2 accounts appear more than once in your source report".

### 4.3 Records table 🟢
- Account rows → prospect child rows (keep the V1 nesting inside the run detail).
- **Columns:** Name · Status · Match (summary such as "4 of 5 required met") · Enrich (badge) · Flex · Owner · Updated.
- **Enriched badge** (PRD #3): only on records where an enrich call **succeeded**. Errored enrich shows an "Enrich failed" badge, not "Enriched".
- **Account-level enrich count:** "3 enrich calls". There is no per-prospect cost, because it isn't stored (Sahil).
- **Statuses:** Qualified · Disqualified · Skipped (cooldown) · Filtered (no contact info) · Not created · Error.

### 4.4 Match details 🟢 accounts / ⚪ prospects per-criterion (PRD #1, D5)
A popover or side panel that replaces the flat bullet list.

**Account (🟢):**

| Criterion | Importance | Result | Source |
|---|---|---|---|
| Industry: Construction | Required | ✓ Met | ZoomInfo Search |
| Employees 20–250 | Required | ✓ Met (142) | Salesforce |
| HQ in UK or Ireland | Required | ✗ Not met (HQ: Australia) | Web |
| Hiring temp staff | Optional | – No data | – |

**Prospect: option A, free text (.11 current):** the comprehensive summary paragraph, with "Show more" (255-character issue).

**Prospect: option B, per-criterion (⚪, needs a prompt change):** rows for Job title, Seniority, Function, Location / remit, Contact info. Each gets a fit (**Ideal / Acceptable / Poor**), a result, and a source. "No data" must be visually distinct from "Not met". This matters most with enrich off, because Search only returns name, title, and company (see 01).

Deliverable: mock **both** A and B with the same Adecco UK SME example so Victor can choose.

### 4.5 Error rows and messages 🟢
- Every error row: **what happened → why → what to do**. No raw codes. The code can sit in a "Details" disclosure for support.
- Two families, styled differently:
  - **Agent / system error.** Example: "The agent couldn't finish researching this account. It'll try again in the next run."
  - **Blocked by your org.** Example: "A flow or validation rule in your org blocked creating this Lead: {flow name}." This is Jeremy's 31%.
- Errored ≠ checkFailed (Q1): use a single **Error** status with a sub-reason line.
- Long error text wraps, with "Show more". It never clips (W-24658780).

### 4.6 Empty and edge states
| State | Copy direction |
|---|---|
| No runs yet | "Your agent hasn't run yet. Runs appear here after the first scheduled or manual run." |
| 0 accounts in source | "Completed · No accounts found in {report}. Check that the report returns accounts." |
| All accounts skipped (cooldown) | "All 110 accounts were researched in the last {window}. Turn on Process All Accounts to test again." Link to 01 |
| Source report replaced | Neutral note: "The original source report was removed. Earlier run details are still available." |
| Retention | "Run history is kept for {3+} months." Footnote |

### 4.7 Later ⚪
- **Actual credits (P1 #7):** the cost tile splits into "Enrich calls 38 · Credits used 22 · 16 at no charge (enriched in last 12 months)".
- **Itemized cost (P1 #10):** a stacked breakdown by step.
- **Vendor filter (P1 #11):** a filter chip for ZoomInfo / Web / Salesforce.
- **Retry (P2 #12):** "Retry failed accounts" button on Completed with errors.
- **ICP column** once multi-ICP ships (05, #9).

---

## 5. Copy notes (drafts, CX to finalize)

| Item | Draft |
|---|---|
| Enrich count label | "ZoomInfo enrich calls". Never "credits" in v1 |
| Enrich count tooltip | "Number of times the agent asked ZoomInfo for full contact or company details. Records enriched in the last 12 months may not use a new credit." |
| Flex label | "Flex credits". Tooltip: "Salesforce credits used for research and AI steps in this run." |
| Disqualified cost | "Spent on disqualified accounts". Tooltip: "Flex credits and enrich calls used before an account or prospect was ruled out." |
| Filtered | "Filtered out: no email or callable phone" |
| Not created chip | "{N} not created". On click: "These prospects passed validation but weren't created. See the reason for each." |
| AG009-type error | "The agent couldn't complete research for this account. It'll try again in the next run." |
| Org automation error | "Your org's automation blocked creating this record." Then the flow or rule name, then "Ask your Salesforce admin to review it." |
| Interrupted | "This run stopped before it finished. Results show what was processed." |
| No data (criterion) | "No data". Tooltip: "The agent couldn't find this information without paid enrichment." |

Use "cooldown" (one word) everywhere. Don't mix "Records Researched", "Records Searched", and "Records Processed": pick **one** term (recommend "Accounts researched").

---

## 6. Edge cases
- **Enrich off.** The Enrich column shows "–" everywhere and the cost tile shows "0 enrich calls". That's a good outcome, so show it positively.
- **Staging (Record Creation = Prospects).** "Created" means *staged*, not Lead/Contact created. The label must change ("88 staged for review"), see 03.
- **Same person found twice across runs** (W-24653121 re-validates). Show "Already recommended" instead of double-counting.
- **Duplicate source accounts.** Counted once in the summary, with a duplicate note.
- **Long runs with 100 max prospects** (now 5 → 100). The table needs pagination or virtual scroll. Summary counts must come from the server, not the visible rows.
- **Over-fetch (Tanuja A).** If the agent fetches extra candidates, don't show the over-fetch as "disqualified". Keep it out of the counts, or label it "extra candidates not needed".
- **DNC.** If a phone is DNC and email exists, the record is created with DoNotCall = true. Add a note on the row: "Phone is on a Do Not Call list".

## 7. Open questions
| Q | Owner |
|---|---|
| D5: per-criterion prospect match details (prompt change, Flex cost) vs free text for v1. Victor wants examples | Victor, Shrey |
| D6: store every filtered contact (up to 2,000 per account) or only counts + reasons? | Victor, Shrey, Megan |
| Which view ships, V1 (by account) or V2 (by run)? Recommend V2 → detail | Victor |
| Thresholds for "taking longer than usual" (Running / Queued) | Ronit, Sahil |
| Flex freshness: real time vs 15-min/1-hr job. How do we label stale numbers? | Sahil |
| Retention period for the log (PRD: ≥ 3 months) | Victor |
| Skipped prospects: over-fetch (A) vs retry (B) vs error (C) and how each appears | Tanuja, Victor |
| Can we reliably tell an "org automation" error from an agent error? | Jeremy, Ronit |

## 8. Dependencies and gates
- `errorhandling` gate (all .11 error changes).
- `zoominfoskipenrichnoemail`: the Filtered count.
- Skip-enrich toggles (01) change what "Enriched" and "No data" mean.
- Staging (03) changes "Created" → "Staged".
- OutcomeSummary fix (W-24663516, Sahil) is required for interrupted-run counts.
- FK SetNull (W-24654097, Rajkumar) is required for "source removed" history.

## 9. Sources
PRD Tab 2 · Slack: 1792857927 (Flex / credits) · 1792867067 (disqualified storage) · 1793141120 (rationale, 2k contacts, Refresh) · 1792942888 / 1792989535 / 1793033899 (Manika QA) · W-24663516 thread (Kiran interrupted runs) · 1792947004 (Kiran perf) · 1792980142 (Tanuja timeouts) · 1793112929 (Jeremy 31% errors) · 1793117037 (customer answers)
