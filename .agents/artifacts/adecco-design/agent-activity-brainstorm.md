# Agent Activity: ideal UX vs what's deliverable in .11

> Brainstorm, Oct 28. Inputs: Victor call screenshots (1–3), PRD Tab 2 table (#1–12), and Slack feasibility signals.
> Goal: design the north star, then cut it to what .11 (Nov 7) can actually ship.

---

## 0. What the screenshots show (today's build)

| # | Screen | What's there | Notes |
|---|---|---|---|
| 1 | **Run list** ("Agent Sessions") | Session (date + ID) · Agent · Results chips · Records Searched · Status + View Details. Filters: Agent, Date. Refresh button | ⚠ **Two result formats**: row 1 is "Accounts: 1 of 1 qualified / Contacts: 14 of 25 qualified", the others are "4 Qualified / 0 Disqualified". Probably newer vs older builds. Pick one. ⚠ The column is called "Session ID" but shows the date. ⚠ Refresh is broken (QA) |
| 2 | **Run detail** | Back · date · filters Record Type / Status / Owner · "Records Searched" table: Record (name, company, title) · Status · **Why This Prospect** (free text) · Owner · Last Agent Update | ⚠ **Raw internal text is leaking**: "…returned **isQualified=false** with the following rationale…" ⚠ The column title "Why This Prospect" doesn't fit disqualified rows ⚠ Accounts and prospects are mixed in one flat list |
| 3 | **Older variant** | "Estimated ZoomInfo credits: 12" + "ZoomInfo credit rules" link · **Account outcomes** table · Records Searched with type (Account / Contact / External person) | ❌ **Sahil removed the Account outcomes table** ("never supposed to exist, AI implemented it"). Credits now live in the Records Searched header and the account's rationale text. ❌ **"Estimated credits" conflicts with Victor's v1 rule**: show **enrich calls**, not credits |

Takeaway: the bones exist (run list → run detail → reason per record). The .11 work is mostly **making it clear, consistent, and trustworthy**, not building new structures.

---

## 1. What an agent manager comes here to answer

1. **Did my run work?** Status, and what went wrong if it didn't.
2. **What did it find?** Accounts and prospects, qualified vs not.
3. **Why these and not those?** Match details against *my* GC criteria.
4. **What did it cost?** ZoomInfo enrich and Flex.
5. **What should I change?** Tune the ICP (customer: "predictable and explainable… identify too broad or too restrictive early").

The .11 version should answer 1–3 well, answer 4 honestly (calls only), and leave room for 5.

---

## 2. The ideal (north star, not .11)

```
RUN LIST
┌ Run ─────────────┬ Agent ──────┬ Funnel ─────────────────────────────┬ Cost ───────────┬ Status ─────────────┐
│ Oct 19, 10:45 PM │ UK SME Cons │ 12 accounts → 4 qualified           │ 6 enrich calls  │ Completed w/ errors │
│ 0CvEAI · Sched.  │             │ 25 prospects → 14 qualified → 9 new │ ~3.2 Flex       │ 2 errors · Details  │
└──────────────────┴─────────────┴─────────────────────────────────────┴─────────────────┴─────────────────────┘

RUN DETAIL
Summary strip: Accounts 12 · 4 qualified · 7 disq · 1 error | Prospects 25 · 14 qualified · 9 created · 3 not added
               | ZoomInfo 6 enrich calls (4 credits, 2 no-charge) | Flex 3.2 | 1,940 contacts filtered (no email/phone)
Insight:       "Most disqualifications: 'Director+ in Sales' (11 prospects)  → Edit criteria in setup"
Table:         Grouped by account (tree): Account row → its prospects. Columns: Record · Status · Reason · Cost · Owner
Row click →    Match details panel: per criterion  [criterion as written in GC] [Required/Optional | Ideal/Acceptable/Poor]
                                                    [Met / Not met / No data] [evidence] [source: Salesforce · Web · ZI Search · ZI Enrich]
Filters:       Record type · Status · Owner · Disqualified-but-charged · Vendor · ICP group
Actions:       Retry errored records (single / bulk) · Open report
```

---

## 3. PRD vs feasibility: the cut line

**Legend:**
- 🟢 the data exists today, so it's a UI/copy change only;
- 🟡 small eng work, likely OK for .11 (**confirm**);
- 🔴 new data or plumbing, so not .11.

| PRD # | Requirement | Feasibility signal (Slack) | .11 verdict | What we design for .11 |
|---|---|---|---|---|
| **1** Match details | Per criterion, met / not met / no data + source, Required/Optional · Ideal/Acceptable/Poor | **Accounts:** the rationale already uses the per-criterion format (QualifyAccount). **Prospects:** needs an LLM prompt change (tokens, evals). Shrey and Mukesh moved it to a follow-up. Victor: "might be okay for v1, show me examples" | 🟢 accounts · 🔴 prospects | Account: show the per-criterion text in a **details panel** (from the existing rationale). Prospect: a **clean free-text summary**. Mock **B (per-criterion prospect)** for Victor's decision |
| **2** Run summary | Qualified / disqualified / errored counts, accounts + prospects | Counts exist (chips). Errored count: confirm | 🟢/🟡 | One consistent result format. A summary strip on the detail page. An errors count |
| **3** Enrich indicator | Enrich calls per run + per account; "Enriched" label | Shrey: "this is what we display now for enrich call count." Per account: yes (rationale). **Per person: not stored** (Sahil) | 🟢 run + account · 🟡 "Enriched" badge per record (confirm source) | "**Enrich calls**" wording everywhere (not "credits"). Badge only if eng can reliably tell (bug W-24654083: errored enrich counted as Enriched) |
| **4** Flex usage | Per run + account, from Digital Wallet | Victor: "expose this next/future weeks after v1 logs." Kunal: "let's not count the tokens" | 🔴 | Nothing, or at most an info line ("Research uses Flex credits. See Digital Wallet"). **Leave a slot** in the layout |
| **5** Disqualified but charged | Flag + amount + step + filter | Needs per-record cost. Enrich is account-level only, Flex isn't available. Adecco has enrich off, so it's mostly moot for them | 🔴 (maybe 🟡 account-level "enriched, then disqualified") | Skip for .11, or ask whether "Enriched → Disqualified" at account level is cheap |
| **6** Report type | Runs / accounts / prospects / match / cost as a report type; stamp agent + run on Leads/Contacts | Backend. No Slack signal on status | ❓ ask | At most an "Open in Reports" link if it ships |
| 7 (P1) Actual ZI credits | Usage API | Customer OK with delaying it. Victor: post-.11 | 🔴 | — |
| 8 (P1) Validated but not created | Name the blocker (duplicate, validation rule, required field, permission) | Errors exist (AG009 raw text bug). Jeremy: 31% are Adecco flows/rules | 🟡 **copy only** | Plain-language error reasons, plus "Blocked by your org's automation" as its own type. Not-added rows (Mukesh's 6-rows expectation) |
| 9 (P1) Contact data filtering count | Count filtered at ZI Search | Megan: dropped at the connector, "never returned to SOQL layer." Needs plumbing | 🔴 | — (one help-text line at most) |
| 10 (P1) Itemized cost | — | Depends on 4/7 | 🔴 | — |
| 11 (P1) Vendor filter | — | Only one vendor today | 🔴 | — |
| 12 (P2) Retries | Retry from cached BPO | Not started | 🔴 | — |

**Not in the PRD, but QA says it's required for .11** (states, all 🟢/🟡):
- Refresh works.
- Queued shows *why* (W-24663216).
- A run stuck in Running ends as Failed with a reason (W-24663204).
- Interrupted shows partial counts (W-24663516).
- Empty report → "nothing to process" (W-24663222, P3).
- Report replaced: history kept (W-24654097).
- AG009 raw text cleaned (W-24653786).
- No `isQualified=false` style leaks (screenshot 2).

---

## 4. The .11 design (what to mock)

### 4.1 Run list
| Run | Agent | Results | Records reviewed | Status |
|---|---|---|---|---|
| **Oct 19, 2026, 10:45 PM**<br>0CvEAI | agent 2 | `Accounts: 1 of 1 qualified`<br>`Prospects: 14 of 25 qualified` | 26 | Completed · View details |
| Oct 19, 01:58 PM | agent 2 | `Accounts: 4 of 6 qualified` `Prospects: …` `⚠ 2 errors` | 31 | **Completed with errors** · View details |
| Oct 19, 01:44 PM | agent 2 | — | 0 | **Completed, nothing to process** ⓘ "The report had no accounts, or all were in cooldown." |
| Oct 19, 01:05 PM | agent 2 | partial counts | 12 | **Interrupted** ⓘ "The run stopped before finishing. Results so far are shown." |
| now | agent 2 | — | — | **Queued** ⓘ "Waiting for the current run to finish" |
| now | agent 2 | — | — | **Failed** ⓘ "The source report was deleted or you no longer have access." |

Decisions:
- **One result format.** Use row 1's "Accounts: X of Y qualified / Prospects: X of Y qualified". Use "Prospects" rather than "Contacts", since records may be Leads.
- **Rename the column to "Run".** The date is the primary line, the ID secondary. Pick *Run* or *Session* everywhere (the PRD says "run").
- **Rename "Records Searched" → "Records reviewed"**, or keep it and add a tooltip ("accounts + prospects the agent checked").
- **Enrich calls column:** only if the run-level number is easy to show (🟡 ask). For Adecco it will be 0.

### 4.2 Run detail
```
← Back to runs
Oct 19, 2026, 10:45 PM · agent 2 · Completed
┌ Accounts ──────────────┐ ┌ Prospects ────────────────────────┐ ┌ ZoomInfo ─────────────┐
│ 1 reviewed · 1 qualif. │ │ 25 reviewed · 14 qualified · 11 dq │ │ 0 enrich calls  ⓘ     │
│ 0 disqualified · 0 err │ │ 0 not added · 0 errors             │ │ Search uses no credits│
└────────────────────────┘ └────────────────────────────────────┘ └───────────────────────┘
Filters: Record type ▾  Status ▾ (Qualified / Disqualified / Not added / Error)  Owner ▾
┌ Record ────────────────────┬ Status ──────┬ Reason ───────────────────────────────┬ Owner ──┬ Updated ┐
│ Microsoft            [Acct]│ Qualified    │ Meets 4 of 4 required criteria.        │ …       │ …       │
│                            │              │ 2 enrich calls · View match details    │         │         │
│ Cheri Devlin      [Contact]│ Qualified    │ Director+ in Sales, matches the ICP…   │         │         │
│ Sales Director · Microsoft │              │ View details                           │         │         │
│ Fachrul Rozi      [Contact]│ Disqualified │ No email address.                      │         │         │
│ Ana Ruiz          [Contact]│ Not added    │ Already exists as a Contact.           │         │         │
│ Beacon Supply        [Acct]│ Error        │ Blocked by your org's automation:      │         │         │
│                            │              │ validation rule "Region_Required".     │         │         │
└────────────────────────────┴──────────────┴────────────────────────────────────────┴─────────┴─────────┘
```
Decisions:
- **Rename "Why This Prospect" → "Reason".** It works for qualified, disqualified, not added, and error rows.
- **Keep the flat table** (it's built), plus a Record type badge and filter.
  - Grouping by account (tree grid) is the ideal, but it's a bigger LWC change. 🔴 for .11 unless eng says it's cheap.
  - Mitigation: prospect rows show their account name (already there).
- **Reason column = one short sentence + "View details".** Truncated free text with "…" (today) hides the point.
  - Does the LLM give a short summary line? If not, show the first sentence. 🟡 ask.
- **Statuses:** Qualified · Disqualified · Not added · Error, plus "Held for approval" for Hold-for-Approval agents (03).

### 4.3 Match details (side panel or popover, opened from a row)
- **Account (🟢):**
  ```
  Microsoft · Qualified · Meets 4 of 4 required, 1 of 2 optional
  ✓ Required  Industry is Technology        Salesforce
  ✓ Required  200–5,000 employees           ZoomInfo Search
  ✗ Optional  Hiring for sales roles        Web research: no matching job posts
  – Optional  Uses Salesforce CPQ           No data
  ZoomInfo: 2 enrich calls
  ```
  This is rendered from the existing per-criterion rationale. **Ask:** is it structured data, or text we display as-is? If it's text, show it formatted (line breaks, ✓/✗ as written) and don't build columns.
- **Prospect, option A (🟢, ships):** a clean summary paragraph: "Great fit: Director+ in Sales matches your ICP for Director+ Sales roles…"
- **Prospect, option B (🔴, for Victor's decision):** the same layout as the account panel, with tiers Ideal / Acceptable / Poor. Mock it as "proposed".

### 4.4 Copy rules (cheap and important)
- **"Enrich calls," never "credits"** in v1. Help text: "A call can cost 1 ZoomInfo credit. Records enriched in the last 12 months don't use a new credit."
- **No internal strings:** `isQualified`, AG009, stack traces. Map them to a plain sentence plus "what to do."
- **Errors say whose problem it is:** "Agent error, try again later" vs "Blocked by your org's automation, ask your admin to review {rule}."

---

## 5. Questions for eng before mocking (Shrey / Neeraj / Ronit)

1. **Run-level enrich call count:** is it available for the run list, or only in the detail header?
2. **"Enriched" per record:** is there a reliable signal, given W-24654083?
3. **Account rationale:** structured per criterion (fields), or one text blob?
4. **Prospect rationale:** is there a short one-line summary, or only the long text?
5. **"Not added" rows:** will the not-added prospect plus its reason be stored and shown in .11 (Mukesh's bug)?
6. **Errored counts:** available per run (for "Completed with errors")?
7. **New statuses:** Failed / Interrupted / Queued with reason. Which ones will the P1 fixes produce, and with what reason text?
8. **Report type (#6):** is any of it in .11?
9. **Hold for Approval agents:** what status do their prospects show in Activity?

The answers move rows between 🟢, 🟡, and 🔴. Until then, mock 🟢 + 🟡 and label 🔴 items "Later."

---

## 6. Proposed build order in the proto (local, one at a time)
1. Run list: one result format, the new statuses with explanations, column renames.
2. Run detail: summary strip, the Reason column, status set, error copy.
3. Match details panel: account (real), prospect A (ships), prospect B (proposed).
4. *(Optional)* A "North star" tab or variant showing the ideal, so Victor can see where it's heading without anyone mistaking it for .11.
