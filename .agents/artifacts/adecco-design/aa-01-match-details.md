# Agent Activity · Aspect: Match details (PRD Tab 2 #1), in detail

> **PRD #1 (P0):** "Rationale to include Match details: for each account and prospect the agent processed, including disqualified ones, show each criterion's result (met / not met / no data) and source. Explain why by referring directly to the actual ICP criteria set in guided config, using Accounts: Required / Optional or Prospects: Ideal / Acceptable / Poor."
>
> **PRD Current State:** the GA Prospecting tab already has a detail panel that lists *"each account criterion (met / not met, Requirement vs. Nice-to-have, source such as Salesforce or Web Search) and the prospect's fit (e.g., Ideal Prospect). It covers qualified prospects only."*
>
> **PRD Non-goal:** "Re-explaining why qualified prospects qualified. The Prospecting tab already does this."

---

## 1. The requirement, phrase by phrase

| Phrase | What it means | Design implication | Open question |
|---|---|---|---|
| "for each **account and prospect**" | Two kinds of records, with **different explanation models** | Two panel variants that share one frame | — |
| "the agent **processed**" | Anything the agent looked at, not just what it created | Rows exist for Qualified, Disqualified, Not added, and Error. Error rows may have **partial** match details | Do errored records have any criteria results? |
| "**including disqualified** ones" | The new part. GA covers qualified only | The panel must lead with **why it failed**, not why it passed | — |
| "**each criterion's** result" | One line per criterion, not a summary paragraph | List layout, one row per criterion | How many criteria is typical (3? 12?) |
| "**met / not met / no data**" | Three states. "No data" ≠ "Not met" | Three distinct icons **plus words**. Never color only | When a **Required** criterion has **no data**, does the account pass or fail? |
| "and **source**" | Where the evidence came from | A fixed source vocabulary (see §4) | Do web sources have **URLs** we can link? |
| "referring **directly to the actual ICP criteria** set in guided config" | Quote the user's words, not the AI's paraphrase. Victor: "wants the exact user-specific language cited for disqualification" | Show the criterion **as written in setup**, then the evidence underneath | Are criteria stored as discrete items, or **extracted from free-text instructions** by the LLM? If extracted, "exact language" may not be possible |
| "**Accounts: Required / Optional**" | Account criteria have an importance label | A tag on each row | ⚠ **Wording clash:** PRD #1 says *Required / Optional*. The GA panel and PRD Tab 5 say *Requirement / Nice-to-have*. **Use whatever setup shows** |
| "**Prospects: Ideal / Acceptable / Poor**" | Prospects get a **fit tier** (defined in setup), not Required/Optional | The prospect panel leads with the tier. Criteria lines sit underneath | Is the tier **overall** (one per prospect) or **per criterion**? Does **Poor = disqualified**? |

---

## 2. What's real for .11

| Part | Status | Source |
|---|---|---|
| Account per-criterion explanation | ✅ The account rationale already has this format (QualifyAccount). Credit estimate appended (Sahil) | Slack 1793141120, 1792857927 |
| Prospect per-criterion | ❌ Needs an LLM prompt change (more tokens, evals). Moved to follow-up. Victor: "might be okay for v1, show me examples" | Slack 1793141120 |
| Prospect free-text summary | ✅ Ships ("comprehensive summary, just not per criteria style") | Shrey |
| Disqualified accounts/prospects stored | ✅ Research entity stores them (Rebecca) | Slack 1792867067 |
| Existing GA detail panel to reuse | ✅ Prospecting tab | PRD Current State |

**So .11 = account panel (per criterion) + prospect panel A (summary + tier, if available). Prospect panel B is proposed for Victor.**

---

## 3. Panel anatomy

### 3.1 Shared frame
```
┌──────────────────────────────────────────────────────┐
│ [icon] Record name                         [Status]  │  ← header
│ Record type · title · account                         │
│──────────────────────────────────────────────────────│
│ VERDICT LINE (one sentence, the answer)              │  ← 1
│ Evaluated against: {Agent name} criteria · {date}    │  ← 2
│──────────────────────────────────────────────────────│
│ CRITERIA LIST                                         │  ← 3
│──────────────────────────────────────────────────────│
│ Cost line                                             │  ← 4
│ Footer: View agent setup ↗                            │  ← 5
└──────────────────────────────────────────────────────┘
```
1. **Verdict line.** The answer in one sentence. It is never truncated.
2. **Evaluated against.** Ties the result to *this agent's* criteria *at run time*. This matters if setup changed later.
3. **Criteria list.** Ordered by **Required first**. **Failures go first within each group** (Not met → No data → Met).
4. **Cost line.** "ZoomInfo: 2 enrich calls" or "No enrich calls (enrichment off)". No Flex number in .11.
5. **Footer link** to setup, so the manager can go and edit the criterion.

### 3.2 Account variant ✅ .11
```
Northstar Labs · Account                                   [Disqualified]
Didn't meet 1 required criterion.
Evaluated against: UK SME Construction criteria · Oct 19, 2026

REQUIRED
✗ Not met   Industry is Construction
            Northstar Labs is a software company.            Salesforce
✓ Met       Located in the UK or Ireland
            Headquartered in Manchester, UK.                 ZoomInfo Search
✓ Met       20–250 employees
            About 140 employees.                             ZoomInfo Search
OPTIONAL
– No data   Hiring for site or warehouse roles
            No job posts found.                              Web research
✓ Met       Existing relationship with Adecco
            2 closed-won opportunities.                      Salesforce

ZoomInfo: No enrich calls (enrichment is off for this agent)
View agent setup ↗
```

### 3.3 Prospect variant A ✅ .11 (what ships)
```
Cheri Devlin · Contact · Sales Director · Microsoft          [Qualified]
Ideal prospect                                               ← tier, if available
Evaluated against: UK SME Construction criteria · Oct 19, 2026

Why
Director-level in Sales, which matches your Ideal prospect description
("Director+ in Sales, RevOps, or Demand Gen"). Dual role also includes …

Found with: ZoomInfo Search
ZoomInfo: No enrich calls
```
- Show the full text, not the truncated table text.
- **Remove system strings** before display (e.g. "The original qualification analysis returned isQualified=false…").
- If the tier isn't available in .11, drop that line. Don't fake it.

### 3.4 Prospect variant B 🔶 Proposed (for Victor, D5)
```
David Lochridge · Contact · CTO · Microsoft               [Disqualified]
Poor fit: didn't match your Ideal or Acceptable prospect descriptions.

✗ Not met   Buying role: Director+ in Sales, RevOps, or Demand Gen
            Title is CTO (technology leadership).           ZoomInfo Search
✓ Met       Located in the UK or Ireland                    ZoomInfo Search
– No data   Has an email address
            ZoomInfo Search shows no email.                 ZoomInfo Search
```
Trade-off to state next to the mock: *"Needs a prompt change. Longer summaries and more Flex use for every customer."*

---

## 4. Vocabulary (microcopy)

### 4.1 Result states
| State | Icon | Word | Meaning (tooltip) | Color (secondary only) |
|---|---|---|---|---|
| Met | ✓ (utility:success) | **Met** | The agent found evidence this criterion is true. | Green |
| Not met | ✗ (utility:close) | **Not met** | The agent found evidence this criterion isn't true. | Red/error |
| No data | – (utility:dash or question) | **No data** | The agent couldn't find enough information to check this. | Gray |

- **The word is always visible.** The icon alone isn't enough (accessibility, and to tell No data apart from Not met).
- **No data + enrichment off:** add a hint to the evidence line: *"ZoomInfo Search didn't include this. Enrichment is off for this agent."* State the fact only. Don't upsell.

### 4.2 Importance tags
| Record | Tags | Note |
|---|---|---|
| Account | **Required** / **Optional** *(or Nice-to-have, matching setup)* | Use the setup words exactly. Check what GC shows today |
| Prospect | **Ideal** / **Acceptable** / **Poor** | Tier labels from setup. Used in the verdict ("Ideal prospect"), not as a per-row tag in A |

### 4.3 Sources (fixed list)
| Source label | When |
|---|---|
| **Salesforce** | Data from the org's records (account fields, opportunities, activities) |
| **Web research** | The agent's web search |
| **ZoomInfo Search** | Free ZoomInfo lookup |
| **ZoomInfo Enrich** | Paid ZoomInfo data (only when enrichment is on) |
| *(none)* | For **No data**, the source is where the agent *looked* ("Looked in: Web research") |

Use "Web research", not "Web Search". It matches the setup copy ("web research"). ❓ Confirm with Patricia.

### 4.4 Verdict lines
| Case | Copy |
|---|---|
| Account qualified | **Meets all {n} required criteria.** *(+ "and {m} of {k} optional" if optional criteria exist)* |
| Account disqualified, one fail | **Didn't meet 1 required criterion.** |
| Account disqualified, several | **Didn't meet {n} required criteria.** |
| Account disqualified on No data | **Not enough information to check {n} required criteria.** *(only if No data on a Required criterion fails the account, ❓)* |
| Prospect qualified | **{Ideal / Acceptable} prospect** |
| Prospect disqualified | **Poor fit: didn't match your Ideal or Acceptable prospect descriptions.** |
| Prospect not added | **Qualified, but not added: {reason}.** (e.g. "Already exists as a Contact.") |
| Error, partial | **Couldn't finish checking this record.** {plain reason}. Criteria checked so far are shown below. |

### 4.5 Other labels
| Element | Copy |
|---|---|
| Table link | **View details** |
| Panel title (account) | **Why this account?** → change to **Match details**, since "why" doesn't fit disqualified records |
| Panel title (prospect) | **Match details** |
| Evaluated against | **Evaluated against {agent name} criteria · {run date}** |
| Footer | **View agent setup** |
| Cost, enrich off | **No enrich calls (enrichment is off for this agent)** |
| Cost, enrich on | **ZoomInfo: {n} enrich calls** ⓘ "Each call can use 1 ZoomInfo credit. Records enriched in the last 12 months don't use a new credit." |

---

## 5. Edge cases
1. **Setup changed after the run.** The panel shows the criteria *as evaluated* ("Evaluated against… · Oct 19"). If they differ from today's setup: an info line, *"This agent's criteria have changed since this run."* ❓ Can we tell?
2. **Many criteria (10+).** Show the failed ones plus the first 5, then *"Show all {n} criteria."*
3. **Long criterion text.** Wrap it, max 2 lines, full text in a tooltip.
4. **Criteria extracted from free-text instructions.** If setup is a paragraph, the criterion label may be the AI's restatement. Label the list *"Criteria from your instructions"* so users don't expect word-for-word quotes. ❓
5. **Required criterion with No data.** It's the most confusing case. The verdict must say what happened (pass or fail). ❓ Needs the eng rule.
6. **Error mid-evaluation.** Show the checked criteria, plus *"Not checked"* for the rest (a fourth state that only appears on error rows).
7. **Enrichment off → lots of No data.** Expected for Adecco. The hint line explains it so it doesn't look broken.
8. **Prospect with no tier** (older runs, or tier not stored). Hide the tier line, keep the summary.
9. **Raw/system text in the rationale** (`isQualified=false`, AG009). Strip or map it. Never show it.
10. **Qualified records:** the PRD non-goal says don't re-explain. But Activity lists everything, so **reuse the same panel** for consistency rather than building a different one.

---

## 6. Questions for eng (add to the Activity list)
1. Account rationale: **structured per-criterion fields, or a text block** formatted by the LLM? (This decides whether we can sort failures first and show icons.)
2. Rule: **Required + No data = pass or fail?**
3. Is the **prospect tier** (Ideal / Acceptable / Poor) stored per prospect in .11?
4. Can we show the criterion **as written in setup**, or only the LLM's restatement?
5. Do web sources include **URLs**?
6. Can we tell that **criteria changed since the run**?

## 7. Decisions for Prayas
- [ ] Panel title: **"Match details"** (recommended) vs "Why this account/prospect?"
- [ ] Importance wording: match setup (**check GC**: Optional vs Nice-to-have)
- [ ] Source label: "Web research" vs "Web Search"
- [ ] Order: failures first (recommended) vs setup order
- [ ] Popover (current proto) vs **side panel** (more room for 5–10 criteria, recommended)
