# 01 · Prospecting Enhancements (Guided Config)

> **PRD:** Tab 1, *Prospecting Enhancements* (Victor, updated Oct 25) · **UX:** Prayas · **CX:** Patricia Vaz
> **Eng:** Jonathan Tang (skip enrich) · Megan Zhu (contact filter) · Rajkumar Pellakuru / Tanuja Tammireddy (cooldown) · Sam Casacio (preview limits, research connection)
> **Legend:** 🟢 264.11 · 🟡 264.12 · 🔵 264.10 patch · ⚪ later

## Summary

These are the guided-config (GC) controls that decide **what the agent spends money on, and on whom**. For .11 the UX job is:
- **Placement.** Per the PRD, the skip-enrich toggles go **on the Account Research and Find Prospects steps**.
- **Honest copy.** Explain that Search still runs when enrich is off, what each setting costs, and how DNC is handled.
- **Warnings** on settings that burn credits.
- **Graceful failure** when an ICP is too broad for the preview.

---

## 1. PRD requirements

| # | Pri | Requirement | Release | UX? |
|---|---|---|---|---|
| 1 | P0 | **Paid enrichment off during research (org level)**: blacktab pref for account / prospect research | ⚪ **Reverted.** Superseded by #5 for .11 | No |
| 2 | P0 | **Skip cooldown**: agent-level GC setting. Applies to scheduled + manual runs and all ICP groups. **Off by default.** Warn that accounts are re-researched and use Flex every run | 🔵 264.10 patch (built as "Process All Accounts") | **Yes** |
| 3 | P0 | **Required contact channels** on Prospect Identification: email / phone / both / none. Uses ZI Search flags (hasEmail, hasDirectPhone, hasMobilePhone, hasCompanyPhone). Any phone type counts. Suggested default: None | 🟢 **Partly**: hardcoded "email OR callable phone" for Adecco. Configurable picker postponed | **Yes** |
| 4 | P0 | **Do Not Call**: if phone is required, a DNC phone = no phone. Otherwise still enrich, set DoNotCall = true on Lead/Contact, and note it in Agent Activity | 🟢 (DNC = not callable in the filter) | Copy |
| 5 | P0 | **Paid enrichment setting (agent level)** on the **Account Research** and **Prospect Identification** pages. Warn that "enriching first can improve matching but costs more" | 🟢 (Jonathan, per-agent toggles) | **Yes** |
| 6 | P1 | **Cooldown flag in preview**: flag leads/accounts currently in cooldown | ⚪ | **Yes** |
| 7 | P1 | **Search before Enrich** when paid APIs are on | ⚪ | No |
| 8 | P1 | **Run consistency**: same criteria give the same results across previews and runs | 🟢/🟡 accuracy work | Indirect |
| 9 | P1 | **No ad hoc SOQL**: stop regenerating SOQL per run | 🟢/🟡 | Indirect |
| 10 | P2 | **Configurable cooldown window**: none / 1 wk / 2 wk / **1 mo (default)** / 3 mo / 6 mo / 1 yr | ⚪ | **Yes** |

Related items from Slack, not numbered in the PRD:
- **W-24651733.** The GC ICP preview breaks with large data or vague criteria. It needs a limit and a "criteria needs improvement" message. 🟢 (Sam Casacio, priority over research connection)
- **W-24651730.** The ZoomInfo "research connection" routes discovery through the non-billable credential. 🟡 264.12

---

## 2. What's been decided (Slack)

### Skip enrich (PRD #5): .11 scope
- **Neeraj, Oct 25 (ts 1792883998):** *"Skip-enrich before approval: separate account and contact toggles, off by default. When enrich is off, validation uses only search results. This needs to be a per agent setting in GC in .11."*
- Jonathan **paused the org-level BT value** (PRD #1) and pivoted to the per-agent toggles. Sam Casacio confirmed: *"W-24631254 added the agent-level 'skip enrichment' GC toggles but its org-level blacktab pref was reverted."*
- **Placement today (eng):** Jonathan put both toggles in **Advanced Prospecting Settings, under Record Creation**, behind a gate, "for today". **Our design follows the PRD instead:** Account toggle on Account Research, Prospect toggle on Find Prospects. Flag this to Victor and Jonathan as decision **D1**.
- **Victor and Jonathan:** skip-enrich is **independent of staging**. Don't tie it visually or logically to Record Creation = Prospects.
- **Megan:** the toggles matter for the "research mode" use case (Sam Casacio).
- **Victor (Siddarth thread):** *"we plan to make calling paid APIs an option, and in case it degrades lead quality, they should be able to flip it back on later and compare, while they are experimenting."* So the setting has to be easy to find and easy to reverse.
- **CX labels:** Jonathan filed a CX request for the "skip enrich" GC labels (C0BBVJZKEC8, p1793042315504139). The patch doc is *[Patch Approval] [264.11] – Prospecting Agent: Skip Contact Enrich or Skip Account Enrich*.

### Contact pre-filter (PRD #3 / #4): what actually ships
- **Megan, Oct 25 (ts 1792874803):** the *"Do not require Email" toggle* is ❌ **postponed**: *"specs are unclear … conflicting behaviors between this and the stop enrichment & staging work … postpone this to a later release."*
- **Megan, Oct 28 (ts 1793138147), the behavior now:**
  - After the ZI **Search**, drop contacts that have **no email AND no callable phone**. Dropped contacts never go to enrich.
  - Phone check order: **direct phone first**. If that isn't callable, check **mobile**.
  - At create, a Lead/Contact is created if it has **email OR callable phone**. Phone field = callable direct, otherwise mobile.
  - Gate: `com.salesforce.bluebirds.zoominfoskipenrichnoemail`. Staging uses the same logic (PR 161222).
- **Neeraj:** *"A phone on the Do-Not-Call list counts as no phone."*
- So for .11 there is **no user-facing choice**. The rule is fixed: *email or a callable phone*. The PRD's 4-option picker (email / phone / both / none) is ⚪ later.

### Skip cooldown (PRD #2)
- **Rajkumar (ts 1792869672):** built at agent level in **Advanced Settings**. *"When this setting is enabled, both scheduled and manual runs will process all accounts, regardless of whether an account is in the cooldown period."* He proposed making it manual-only, with an info message next to **Run Now**.
- **Victor:** *"The manual run should unblock their experimentation / testing"* and *"We can add it to auto at a later time? I don't want to rule out this request completely, but can postpone for further feedback."* No auto-vs-manual distinction for now.
- **Victor (Advanced Settings thread):** recommend it **only for experimentation**, wants a **CX info box**, and doesn't want things **buried under prospect assignments**. Rajkumar added a warning, which CX (Patricia) will rewrite.
- **Rajkumar:** *"we will move ahead with the Modal approach unless there is a strong push back."*
- **Kiran (Q4 perf, ts 1792947004):** re-running the same accounts raised p90 wall-clock time from 3.05 to 5.74 min, *"because we are re-researching accounts that already have prospects."* W-24653121: repeat runs re-validate prospects that were already recommended. Evidence for the warning copy: the setting costs time **and** Flex.

### Preview + matching
- **W-24651733 (Sam, Neeraj, Victor):** *"ICP preview in Guided Config can break when an org has a sufficiently large amount of data and the criteria is too vague."* Neeraj: *"start with preview … it should not be the case surely in preview that we crash even with a broad criteria."* Sam: *"I'll work under the assumption that we need a mechanism to restrict the results size in the preview."*
- **Rajkumar:** the cooldown/preview signal appears in the **preview on the right of the Account Research** step.
- **Megan (ts 1792881176), website matching:** host name only → name + website search → name-only exact match → LLM picks the best match. No direct UX impact, but this explains why matched accounts can change between runs.

### Existing CRM contacts (Siddarth thread, ts 1793042159)
- ZI **Search** can filter by criteria, but for a *specific* person it returns only **name, company, and job title** (seniority is coming with Jonathan's change). You can't learn a known contact's location without paying for Enrich.
- Kunal: *"The customer does not want us to do any enrich queries. But we can still do search queries."*
- Agreed: update the fields Search can return. Enriching existing contacts is **not supported** today (enhancement request).
- **UX implication:** with Contact enrich off, criteria like *contact location* may return "no data" for existing contacts. Match details (02) must show **no data**, not **not met**.

### Adecco ICP feedback (Victor, Oct 28, ts 1793160996)
- The agent mixes up **contact location vs company HQ vs actual company presence**. Example: a UK test referenced Ireland, and an Ireland test referenced only the Australian HQ.
- Adecco wants guidance on **structuring ICPs to avoid using ZI credits**. Their prospect criteria are job title semantics, buying role, function, seniority, contact location / geographic remit, email/phone availability, and combinations of these.

---

## 3. Current proto state and gaps

| File | Today | Gap |
|---|---|---|
| `step_02_account_research.html` | Instructions + Tools + **Preview panel** (`aside.preview-panel`, mode select, refresh) | ❌ No Account enrichment toggle (PRD #5). ❌ No cooldown flag in preview rows (PRD #6). ❌ No "too broad" preview state (W-24651733) |
| `step_03_find_prospects.html` (≈ L773–830) | **Contact Requirements**: "Only suggest prospects that have the selected contact information available." Phone Number and Email Address checkboxes. **Third-Party Enrichment**: "Allow the agent to use paid APIs to find and enrich prospect data. **Disabling this limits results to your CRM data only.**" ZoomInfo Lookup toggle | ❌ **Copy is wrong**: with enrich off, Search still runs (0 credits). ❌ No cost/quality warning. ❌ No DNC / "any phone type" helper. ❌ The checkboxes suggest a configurable choice that .11 doesn't offer |
| `step_05_prospect_assignment.html` (modal ≈ L3022+) | Advanced Prospecting Settings: Route Prospects from Additional Account Owners · **Process All Accounts** (toggle **checked by default** in proto) · Record Creation | ❌ The PRD says **off by default**, but the proto defaults to Enabled. ❌ No warning/info box when Enabled. ❌ No link back from Run Now |
| `step_06_review_activate.html` | Review | ⚠️ Doesn't summarize enrichment / cooldown choices (nice to have, see 06) |

---

## 4. Screens and states to design

### 4.1 Account Research: "Account enrichment" 🟢
Placement: a new settings block on `step_02` below Instructions/Tools. Mirror the step_03 Third-Party Enrichment block so the two pages match.

| State | Content |
|---|---|
| **Off (default)** | Toggle off. Helper: the agent researches accounts with Salesforce data, web research, and ZoomInfo **Search** (no ZoomInfo credits). |
| **On** | Toggle on, plus an inline **warning** (SLDS scoped notification, warning theme): enriching can improve matching, but each enriched account uses a ZoomInfo credit. |
| **Gate off** | Whole block hidden. Current behavior: enrich as today. |
| **No ZoomInfo connected** | Toggle disabled, with a "Connect ZoomInfo in Tools" hint. *(Confirm with eng whether this case is possible.)* |

### 4.2 Find Prospects: "Prospect enrichment" + Contact requirements 🟢
- **Prospect enrichment toggle:** same pattern as 4.1, replacing the current ZoomInfo Lookup block. Fix the copy as described in §5.
- **Contact requirements (.11, fixed rule).** Options, pick one with Victor (D4):
  - **A (recommended).** A read-only info row: "Prospects need an email address or a phone number that isn't on a Do Not Call list. Prospects without either are skipped before enrichment, so no ZoomInfo credits are used." This is honest about the fixed rule and needs no fake control.
  - **B.** Keep the checkboxes, both checked and disabled, with the same helper text. Riskier, because it looks configurable.
- **Later (⚪, PRD #3 full).** A radio group (Email required / Phone required / Both / None), plus the DNC helper "Phone numbers on a Do Not Call list don't count. Direct, mobile, and company phones all count."

### 4.3 Advanced Settings modal: Process All Accounts 🔵/🟢
- Default **Disabled** (fix the proto).
- When **Enabled**, show an **info/warning box** below the description (CX to finalize): for testing ICPs only; every run re-researches every account and uses Flex credits; runs take longer.
- Optional, if Victor agrees: an info line next to **Run Now** on the agent page, "Process All Accounts is on, so this run includes accounts in cooldown" (Rajkumar's proposal).

### 4.4 Account Research preview: cooldown flag ⚪ (P1)
- A row-level badge "In cooldown · until {date}" in the preview list, with a tooltip explaining that the agent skips this account until then.
- If Process All Accounts is on, show the badge as "In cooldown (will be processed)".

### 4.5 Preview: too-broad / too-large ICP 🟢 (W-24651733)
| State | Design |
|---|---|
| Loading > N sec | Skeleton plus "Checking your criteria against {source}…" |
| **Result capped** | "Showing the first {N} matches. Your criteria match more accounts than we can preview. Narrow them for a more accurate preview." |
| **Too broad / timeout** | Empty state with a warning illustration: "Your criteria are too broad to preview." Give tips such as adding industry, size, or location. Never a blank panel or a crash. |
| Too narrow (0) | "No accounts match these criteria." Suggest loosening Required criteria. |

This also lays the groundwork for **ICP sizing** (05, Tab 5 #1).

### 4.6 Configurable cooldown window ⚪ (P2)
A picklist in Advanced Settings that replaces or sits next to Process All Accounts: **No cooldown** (shows the same warning as 4.3) / 1 week / 2 weeks / **1 month (default)** / 3 months / 6 months / 1 year. Each option gets a hint (e.g. "3 months: quarterly planning"). Eng question: does a changed window apply to accounts already in skip history?

---

## 5. Copy notes (drafts, CX to finalize)

| Location | Current | Draft |
|---|---|---|
| Find Prospects, section description | "Allow the agent to use paid APIs to find and enrich prospect data. Disabling this limits results to your CRM data only." | "Let the agent pay to enrich prospects with ZoomInfo. When this is off, the agent still finds prospects with ZoomInfo Search, which doesn't use credits." |
| Toggle label (both steps) | "ZoomInfo Lookup" | "Enrich accounts with ZoomInfo" / "Enrich prospects with ZoomInfo" *(waiting on Jonathan's CX label request)* |
| Enrich-on warning (PRD #5) | none | "Enriching can improve matching, but each enriched record uses a ZoomInfo credit." |
| Contact requirements (.11) | "Only suggest prospects that have the selected contact information available." | "Prospects need an email address or a phone number that isn't on a Do Not Call list. Prospects without either are skipped before enrichment." |
| Process All Accounts, description | "Include every account from the data source in each run, including accounts in cool-down and accounts that were already prospected. Account owner rules still apply." | Keep it, but use "cooldown" (one word, consistent with the PRD) |
| Process All Accounts, warning (enabled) | none | "Use this only to test ICP criteria. Each run researches every account again, uses Flex credits, and takes longer." |

Style: sentence case, no "paid APIs" jargon, name **ZoomInfo** explicitly. "Credits" means ZoomInfo credits and "Flex credits" means Salesforce consumption. Never use the two interchangeably.

---

## 6. Edge cases
- **Enrich off + phone needed.** Search returns has* flags but no numbers. The phone number is only filled in when enrichment happens later (FDE Flow 2 after seller approval). Make sure designs don't promise a phone number in the prospect row.
- **Enrich off + existing CRM contact.** Criteria like location may show **no data**. That is not a failure (see 02 match details).
- **Process All Accounts + duplicates.** PRD open question: how do we avoid creating duplicate prospects for the same person? (W-24653121 re-validates prospects that were already recommended.)
- **Duplicate accounts in the source report** (Manika Q4: two "HubSpot" rows enriched 9 + 16 = 25 times). Consider warning in Add Sources or the preview that duplicates cost extra enrichment.
- **Empty ICP.** W-24664053: an agent with an empty Find Prospects ICP can be activated, and every account fails (AG010). Block activation in Review & Activate with a field-level error.
- **Non-account report.** W-24663222: the wizard accepts a non-account report. Validate in Add Sources.
- **Switchboard numbers.** PRD open question: does a company phone count? .11 checks direct, then mobile; company phone isn't mentioned in Megan's logic. Confirm before the copy says "any phone".

## 7. Open questions
| Q | Owner |
|---|---|
| D1: confirm toggles live on the GC steps (PRD) rather than Advanced Settings → Record Creation | Victor, Jonathan |
| D2: final labels from the CX request | Patricia |
| D3: Process All Accounts warning text; manual-only later? | Victor, Rajkumar, Patricia |
| D4: .11 contact requirement as read-only text (A) vs disabled checkboxes (B) | Victor, Megan |
| Does company phone count as callable in .11? | Megan |
| Preview cap size (N) and timeout threshold for W-24651733 | Sam Casacio |
| Is a "ZoomInfo not connected" state possible for the toggles? | Jonathan |

## 8. Dependencies and gates
- Skip enrich: Jonathan's patch (264.11). The gate is in his patch doc.
- Contact filter: `zoominfoskipenrichnoemail`.
- Cooldown: in 264.10 patch; Agent Activity shows cooldown-skipped info (see 02).
- Match details for "no data": 02 #1.
- ICP sizing builds on the preview states in 4.5: see 05.

## 9. Sources
PRD Tab 1 · Slack: 1792883998 (Neeraj .11 scope) · 1792874803 (Megan efficiency plan) · 1793138147 (Megan ZI filter) · 1792869944 (Advanced Settings location) · 1792869672 (Rajkumar cooldown) · 1792947004 (Kiran perf) · 1793023363 / 1793047399 (Sam W-24651733 / W-24651730) · 1793042159 (Siddarth existing contacts) · 1793152077 (Jonathan patch doc) · 1793043717 (CX label request) · 1793160996 (Adecco ICPs)
