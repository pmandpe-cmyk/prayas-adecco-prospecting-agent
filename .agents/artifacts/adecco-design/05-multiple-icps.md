# 05 · Multiple ICPs & ICP Sizing

> **PRD:** Tab 5, *Multiple ICPs per Agent* (Victor, Oct 25). *"Not yet prioritized: will need alignment with Adecco to see if truly necessary, or if this use case will simply be solved with Hunter."* · **Eng POC:** Neeraj · **UX:** Prayas
> **Effort (PRD):** M, 3 people / 2–3 sprints · **Reference:** Adecco ICP definition (Oct 23) + ICP sheet shared Oct 28
> **Legend:** 🟢 264.11 · 🟡 264.12 · 🔵 264.10 patch · ⚪ later

## Summary

There are two separate things in this tab.
1. **ICP sizing (P0).** Before running, show the agent manager roughly **how many accounts and prospects their criteria match**. This lets them spot an ICP that's too broad or too narrow early.
   - It's Victor's **top GC priority after .11**.
   - It's what the customer asked for (*"giving Ops an indication of the expected account and prospect population"*).
   - It may even **remove the need for two-stage approval** (03).
2. **ICP groups (P1).** One agent runs several ranked ICPs, each with its own sources, criteria, and routing. This avoids "one agent per ICP" (the org cap is 20 agents, or 50 with a support case).
   - Not prioritized. It may be solved by Hunter, and a **spike** is planned.

**Nothing ships in .11.** But the .11 preview work (01 §4.5: limits, "too broad") is the foundation for sizing, so design them together.

---

## 1. PRD requirements

| # | Pri | Requirement | UX? | Release |
|---|---|---|---|---|
| 1 | P0 | **ICP sizing**: per account + prospect ICP (per config today, per group later), an approximate total of accounts and prospects that meet the criteria. Used to widen or narrow criteria to match team throughput | **Yes** | ⚪ next after .11 |
| 2 | P1 | **ICP groups**: multiple groups in one agent. Each has its own Add Sources, Account Research criteria, Find Prospects criteria, Assign Prospects, and **default field values** (e.g. Brand). Source report read with the agent manager's access | **Yes** | ⚪ |
| 3 | P1 | **Manage groups**: add, edit, rename, remove | **Yes** | ⚪ |
| 4 | P1 | **Shared tools**: the Tools step stays agent-level for all groups | – | ⚪ |
| 5 | P1 | **Assignment per group**: own reps or queue (04). Groups can share reps or queues. Prospects go only to their group's reps or queue | – | ⚪ |
| 6 | P1 | **Distribution per group**: own method (equal / one rep / queue) and rules | – | ⚪ |
| 7 | P1 | **Stack ranking**: each run fills the highest-ranked group as far as possible before moving to the next | – | ⚪ |
| 8 | P1 | **Overlaps, no repeat enrichment**: an account that matches several groups goes to the highest rank. Reuse enrich data across groups and runs | – | ⚪ |
| 9 | P1 | **ICP in Agent Activity**: show, sort, filter, and group by ICP group (02) | – | ⚪ |
| 10 | P1 | **Existing agents** become one group, unchanged | – | ⚪ |
| 11 | P2 | **Weighting / caps per group**. Also weighted criteria (**High / Medium / Low**) beyond Required / Nice-to-have | – | ⚪ |

**Non-goals (PRD):**
- Replacing Hunter.
- Different tools per group.
- Separate budget rules per group.

**Decided in the PRD:**
- **Cooldown is agent-level**, across all groups (records overlap).
- Data access uses the agent manager's access. Use another brand's data only if the manager can already see it.

**PRD open questions:**
- How many ICPs and groups per agent? This sets the max groups.
- Is one agent one staffing opportunity or one market?
- Should queue routing be shared or separate per group?
- Max groups vs run time and Flex cost.
- Is Flex research reused across groups?
- Are approval settings per agent or per group?
- What happens when a rep gets a prospect at an account they can't see?
- Hunter carry-over.
- Routing Contacts, since queues can't own them.

---

## 2. What's been decided (Slack)

### ICP sizing is next (Victor, customer answers ts 1793117037)
- Customer: *"We need predictable and explainable results … giving Ops an indication of the expected account and prospect population so that an ICP that is too broad or too restrictive can be identified early."*
- **Victor's implications:**
  - **ICP sizing next**, as an output-size preview in GC.
  - If Ops can validate volume and quality early, **two-stage approval may be unnecessary**.
  - A **multi-ICP spike**.
- Customer: *"avoid having one agent per ICP … the ICP acts as a reusable template."* This argues for groups or templates over cloning agents.

### Preview limits as a precursor (Sam, Neeraj, Victor, ts 1793023363)
- W-24651733: the ICP preview breaks with large data or vague criteria. **The fix limits results** and/or shows a **"criteria needs improvement"** message, starting with the preview.
- **Implication:** sizing must be an **estimate** ("~12,400 accounts"), not a list. It should come from a count or sampling query, not by loading every row.

### Adecco's ICPs (Victor, Oct 28, ts 1793160996; PRD reference)
- **UK example (PRD):**
  - Accounts: SME staffing accounts in the UK & Ireland · Brand Adecco · Construction · **20–250 employees** · selected agency territory.
  - Goal: new contacts in the **existing portfolio**.
  - Persona: the **local workforce decision-maker**. Defined by buying role, function, seniority, title meaning, and whether they can act on staffing.
- **Impact weights:**
  - **High:** geography, size, industry.
  - **Medium:** need/signals, government, value/agreement, relationship, commercial objective.
  - **Low:** market, brand/service.
- **Testing feedback:**
  - The agent confuses **contact location vs company HQ vs actual company presence**. A UK test referenced Ireland, and an Ireland test referenced only the **Australian HQ (Arnott's)**.
  - Victor suggested **web crawlers** for location.
- **Prospect criteria they use:**
  - job title semantics;
  - buying role;
  - function;
  - seniority;
  - contact location / geographic remit;
  - email/phone availability;
  - combinations of these.
- They want **guidance on structuring ICPs to avoid using ZI credits**. That's a content/onboarding need, and sizing can carry it.

---

## 3. Current proto state and gaps

| File | Today | Gap |
|---|---|---|
| `step_02_account_research.html` | Preview panel (`aside.preview-panel--unified`, mode select, refresh) lists sample accounts | ❌ No total / estimate. ❌ No too-broad / too-narrow guidance |
| `step_03_find_prospects.html` | Prospect criteria + preview | ❌ No prospect-population estimate |
| GC shell (all steps) | Single-ICP flow, linear steps | ❌ No concept of groups. Steps assume one set of criteria |
| `step_06_review_activate.html` | Review | ❌ No "expected volume" summary |

---

## 4. Screens and states to design

### 4.1 ICP sizing (P0, ⚪ next) (D9)
**Where:** a persistent **size meter** at the top of the preview panel on Account Research and Find Prospects, plus a summary on Review & Activate.

```
┌ Estimated reach ─────────────────────────────────┐
│ ~1,850 accounts match   of 12,400 in your source │
│ ~6,200 prospects match  (≈ 3.4 per account)      │
│ ▁▂▃▅▇  Just right for 5 reps × 20 / week  ⓘ      │
│ Updated just now · Estimate, based on a sample   │
└──────────────────────────────────────────────────┘
```

**States:**

| State | Trigger | Message |
|---|---|---|
| Calculating | Criteria changed | Skeleton plus "Estimating…" Non-blocking |
| **Too broad** | > X accounts or > Y% of source | Warning: "Your criteria match most of your source. Add a Required criterion like industry or size to focus." |
| **Too narrow** | < Z accounts | Info: "Only 14 accounts match. Loosen a Required criterion or add sources." |
| Healthy | In band | Neutral/success: show throughput fit |
| **Can't estimate** | Timeout / too large (W-24651733) | "We couldn't estimate this ICP. It may be too broad. Try adding a criterion." Never blank |
| Criterion contribution ⚪ | Optional | Per-criterion funnel: "Industry: Construction → 4,100 · 20–250 employees → 2,300 · UK & IE → 1,850" |

**Throughput fit (optional):** compare the prospect estimate with the team's capacity (number of reps from Assign Prospects × max prospects per run). This answers the customer's "volume and quality" question.

**Cost hint:** "Researching these accounts uses about {N} Flex credits per full pass." Ties to the credit-guidance ask. Only include it if eng can estimate.

**Design questions for Victor (D9):**
- Is the estimate a **number** or a **band** (Too broad / Healthy / Too narrow)?
- Accounts only, or accounts + prospects? Prospect counts may need ZI Search, which costs 0 credits but has latency.
- Per config now, per group later. Design the meter so it can sit inside a group card.

### 4.2 ICP groups (P1, ⚪ after the spike)
**GC information architecture options (mock A and B):**
- **A. Group switcher in the GC header:** "ICP: UK SME Construction ▾ · + Add ICP". Steps 1–3 and 5 are per group. Tools (step 4) is shared and shows a "Shared across all ICPs" badge.
- **B. Groups overview step:** a new first step with **ranked group cards** (drag to reorder). Each card shows sources, size estimate, assignment, and an Edit button that opens the per-group steps.

**Group card contents:**
- rank;
- name;
- source report;
- size meter (4.1);
- routing (reps / queue);
- default fields (e.g. Brand = Adecco);
- status (complete / needs setup).

**Overlap:** an info row: "312 accounts also match a higher-ranked ICP. They'll go to 'UK SME Construction'."

**Existing agents:** shown as a single group, "Default ICP", with rename available.

**Manage:** Add · Duplicate (supports the "reusable template" idea) · Rename · Remove. Remove opens a confirmation modal covering pending prospects and history (see 06).

### 4.3 ICP in Agent Activity (P1 #9)
- Add an "ICP" column and filter/group in the run detail (02 §4.3).
- In match details, add the header "Matched ICP: UK SME Construction (rank 1)". This also covers the PRD's transparency theme: *"the rationale should say which ICP or rule an account matched."*

### 4.4 Weighted criteria (P2 #11)
- An importance picker per criterion: **High / Medium / Low** (Adecco's model) next to, or replacing, Required / Nice-to-have.
- Match details (02) then show weight per row.

### 4.5 Guidance content (customer ask)
A "How to build a cost-efficient ICP" help panel or inline tips:
- Put **High-impact firmographics** (geo, size, industry) as Required. They're free to check with Search.
- Avoid contact-level criteria that only enrichment can answer (e.g. exact location of an existing contact) if enrich is off (see 01).
- Make the distinction between "company HQ" and "company presence" explicit in the criteria text.

---

## 5. Copy notes (drafts)

| Item | Draft |
|---|---|
| Meter title | "Estimated reach" |
| Estimate caveat | "Estimate based on a sample of your source. Actual results can vary by run." |
| Too broad | "Your criteria match most of your source. Add a Required criterion to focus." |
| Too narrow | "Only {N} accounts match. Try loosening a Required criterion." |
| Can't estimate | "We couldn't estimate this ICP. It may be too broad." |
| Shared tools badge | "Shared across all ICPs" |
| Overlap | "{N} accounts also match a higher-ranked ICP and will go there." |

Avoid "ICP group" in the UI unless CX approves it. Consider "ICP" or "Segment" instead.

## 6. Edge cases
- **Source report changes** after sizing (W-24654097): the estimate goes stale. Show "Source changed · Re-estimate".
- **Sizing with skipped accounts (cooldown):** the estimate should be of the total population, with a separate count for "{N} in cooldown, won't run until {date}".
- **Brand-based sharing:** the agent manager may see fewer accounts than exist. The estimate reflects *their* access, so say so.
- **Contacts at existing accounts** (the UK objective) can't go to queues. The routing UI per group must handle Contacts (owner / FDE).
- **Org agent cap reached (20):** an empty state on "New agent" pointing to "Add an ICP to an existing agent" once groups exist.

## 7. Open questions
| Q | Owner |
|---|---|
| D9: number vs band, accounts vs accounts + prospects, placement (preview panel vs dedicated step) | Victor |
| How is the estimate computed (count query, sampling, ZI Search)? Latency and cost | Sam, Neeraj |
| Max groups per agent; Flex research reuse across groups | Neeraj |
| Multi-ICP spike outcome: build in Prospecting Agent or defer to Hunter? | Victor, Kunal |
| Group naming in UI ("ICP", "Segment", "Audience") | Patricia |

## 8. Dependencies and gates
- 01 §4.5 preview limits (W-24651733) come first.
- 02 Activity ICP column.
- 03 approvals: if sizing works, one-stage approval may be enough.
- 04 per-group queues.

## 9. Sources
PRD Tab 5 · Slack: 1793117037 (customer answers, Victor implications) · 1793023363 (Sam preview W-24651733) · 1793160996 (Victor Adecco ICP feedback + sheet)
