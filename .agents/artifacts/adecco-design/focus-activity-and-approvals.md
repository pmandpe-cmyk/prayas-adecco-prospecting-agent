# Focus brief: Agent Activity + Custom Approval Workflows

> Written Oct 28, 2026, after re-reading PRD Tabs 2 and 3 and Slack (#adecco-prospecting-warroom C0CBNJX3PNU, plus Patricia's label thread in C0CARN8P9T9).
> This updates `02-agent-activity.md` and `03-custom-approval-workflows.md`. Where they disagree, this file wins.

---

## 1. What changed since the briefs

| # | Change | Source | Effect on design |
|---|---|---|---|
| 1 | **The Record Creation label is decided for .11.** It stays a **third radio option**, labelled **"Hold for Approval"**, with the description *"The agent doesn't create records. Prospects are added to a list for sellers to review and approve."* | Patricia's thread C0CARN8P9T9 / 1793126306 (Rohini's call: "keeping the UI exp as is for .11"; Patricia gave the final copy) | Replaces my 03 recommendation (Option A, a separate checkbox) **for .11** |
| 2 | **.12 moves to a separate setting.** Thomas is moving staging out of `recordCreationType` into **its own param** in .11. Neeraj is filing a **.12 setup-UI story**. Patricia, Cordelia, and Ben want a Leads/Contacts picker plus a separate human-in-the-loop setting | Same thread | Option A (separate toggle) becomes the **.12 design** |
| 3 | **In staging mode, the agent never creates the Lead or Contact.** The FDE's custom work creates it (Neeraj: "latter"; Rohini: FDEs build the approval UI) | Same thread | **The proto copy is wrong.** It says "before the agent saves them as leads or contacts" |
| 4 | **The product doesn't build the approval UI.** Thomas: "we aren't actually building the experience for approving staged prospects." In Rebecca's lifecycle, green is FDE and blue is us. The product only supports **queue ownership and sharing** on the entity | 1793126306, 1793117037 | PRD Flow 1 (P1 product approval step) isn't .11. Nobody owns a reference UX for it. Patricia asked for one so she could write labels |
| 5 | **Staging stays gated** until a product approval/conversion flow exists, "else the entity will dangle" (Victor, Cordelia) | 1793123382 | The long-term case for a product approval UI is now explicit |
| 6 | **Advanced Settings: Rajkumar is going with your *Modal* version** "unless there is a strong push back." You preferred the Tab version | 1792869944 | Decide whether to push back |
| 7 | **The Agent Activity v1 alignment hasn't changed** (Victor). Report **enrich call counts**, not credits. Actual consumption comes after .11 | 1793117037 | No scope creep. Design the call count, not credits |
| 8 | **Credits are shown** in the Records Searched header and appended to the **account rationale text**. Sahil removed a separate credits table that "AI had implemented on its own." There are **no per-person credits** | 1792857927 | Don't design a per-prospect credit column for .11 |
| 9 | **The per-criterion prospect rationale is now a follow-up**, not a .11 bug. Shrey says the bug didn't match its title, and today's prospect rationale is a "comprehensive summary, just not per criteria style." Victor: "That might be okay for v1. Can you show me examples?" | 1793141120 | **D5 is still open.** Your mocks of A vs B are the input Victor needs |
| 10 | **Mukesh expects a row for every processed prospect** ("6 rows… 1 not added… explain why not added") | 1793141120 | A not-added row with a reason is still P0 |
| 11 | **2,000-contact volume risk is unresolved.** Should every filtered-out contact be recorded? Nobody knows the policy (Megan) | 1793141120 | Propose an **aggregate row** (see §3.3) |
| 12 | **Contacts with no email or callable phone are dropped at Search.** They never reach enrich and are "never returned as results to SOQL layer" | 1793138147 | They **can't appear as individual rows**. At most a count, if eng can provide one |
| 13 | **Bug status:** W-24663204 (stuck Running) and W-24663216 (Queued) have a PR ready. W-24663516 (Interrupted blanks) is fixed and waiting to merge. **W-24663222 (empty report → Completed) is downgraded to P3.** **Refresh is broken**: Mukesh calls it "very important," but it comes after the P1s | 1793141120 | The run-status states are being built now. Empty-report states are less urgent |
| 14 | **31% of Adecco's errors (70/227) come from their own flows and rules.** Victor: the fix is "deliver our new prospect entity as staging" | 1793112929 | Staging and Activity are linked. Activity should name **org-automation errors** separately |
| 15 | Kunal: don't rely on or show the Heroku `prospect-list-p0.html`. "Things don't look like that at all" | 1792867067 | Already a standing rule |

---

## 2. Custom Approval Workflows: what to do

### 2.1 For .11 (small, decided)
**Update the Record Creation option** in `step_05_prospect_assignment.html` (Advanced Settings modal, L3060–3070) to the decided copy:

| | Current proto | Decided (.11) |
|---|---|---|
| Label | Staged Prospects | **Hold for Approval** |
| Description | Hold new prospects for review before the agent saves them as leads or contacts. ❌ (the agent doesn't create them) | **The agent doesn't create records. Prospects are added to a list for sellers to review and approve.** |

Other .11 details to check in the proto:
- **Default.** The proto has Hold for Approval pre-checked. The product default should stay Contacts & Accounts (Recommended), and only Adecco's org would pick Hold. *Suggest: un-check it, or keep it checked only as the "Adecco demo" state.*
- **Assignment interaction.** With Hold for Approval, what does "Distribute Prospects" mean? The prospect record's owner is still set (queue support on the entity is product scope per Rebecca), so the step stays relevant.
- **Enrichment is independent** of Hold for Approval (the toggles in 01). No coupling in the UI.

### 2.2 For .12 (design now, so it's ready when Neeraj's story lands)
**Option A, already favored by CX and the PM side:**
```
Record Creation
Choose which records the agent creates.
( ) Leads
(•) Contacts & Accounts   [Recommended]

[✓] Hold for approval
    The agent doesn't create records until a seller approves the prospect.
    Approved prospects become {Contacts & Accounts}.
```
- The picker keeps meaning "what gets written." The checkbox means "is a human involved first."
- The metadata split (Thomas, .11) already supports this.
- Open item: if the FDE creates the record, does the picker still apply in Hold mode? Ask Neeraj and Thomas. If not, disable the picker with "Your approval process decides which records are created."

### 2.3 Reference approval experience (opportunity; confirm with Victor before investing)
Nobody owns the approver UX. The FDE (Giuseppe) builds it, but:
- Patricia needs it to write labels.
- Victor and Cordelia say staging can't go GA without a product approval/conversion flow.
- PRD Tab 3 Flow 1 (P1) defines it: Review & Approve, reject-reason picklist, status model, dupes, mapping.

A **lightweight reference flow** (pending list → prospect detail with match details → Approve / Reject with reason → status Pending / Approved / Rejected / Converted) would:
1. give the FDE a pattern consistent with the product;
2. unblock Patricia's labels;
3. become the starting point for the GA product flow.

Keep it to 2–3 screens, and reuse the match-details component from Activity.
**This is a scope expansion. Ask Victor first** (draft question in §5).

### 2.4 Later / not ours
- Two-stage approval (Ops → Sales): Victor says it may be unnecessary if **ICP sizing** in GC validates volume and quality early (05).
- Logging ownership changes and approval history is a custom FDE build (Rebecca).
- Queue claim flow: the FDE builds it. Product supports queue ownership on the entity (04).

---

## 3. Agent Activity: what to do (the main .11 UX)

### 3.1 Run list: statuses are being built now, so design them first
| Status | When | What the row shows |
|---|---|---|
| Queued | Another run is active (W-24663216) | "Waiting for the current run to finish" (today it gives no explanation) |
| Running | In progress | Progress or "Started 12 min ago." **Refresh must work** (bug) |
| Completed | Normal | Counts |
| Completed with errors | Some records errored | Counts plus an error count link |
| Interrupted | Run cut off (W-24663516) | Partial counts, **not blank** |
| Failed | Source report deleted (W-24663204), timeout | Reason, e.g. "The source report was deleted or you lost access" |
| Completed, nothing to process | Empty report (W-24663222, P3) | "No accounts to process. The report is empty or every account is in cooldown." Low priority |

### 3.2 Run summary tiles
Show **Qualified / Disqualified / Not added / Errored** (PRD #2), **Enrich calls** (not credits, #3), and **Records searched**.
- No credits column for prospects.
- The account-level credit **estimate** lives in the Records Searched header and the account rationale (Sahil). Label it as an estimate.
- Flex: "Uses Flex credits" as an informational note at most. Real numbers come later.

### 3.3 Records table
- **Every processed prospect gets a row**, including a **Not added** status chip plus its reason (Mukesh, W-24654087).
- **Volume (2,000 contacts, D6).** Propose an **aggregate row per account** instead of one row per filtered contact: *"1,940 existing contacts didn't match prospect criteria · View breakdown."* This avoids the storage and perf concern while staying explainable. Bring this proposal to Shrey and Neeraj.
- Contacts dropped at Search (no email / callable phone) don't exist downstream. Show a count only if eng can give one ("212 skipped: no email or callable phone"). Otherwise leave them out and add a help-text line.
- **Enriched badge** only when enrichment succeeded (W-24654083: errored enrich was counted as Enriched).
- **Hold for Approval agents:** prospect rows show status **"Held for approval"**, not "Created." Link to the record. Don't link to a Lead that doesn't exist.

### 3.4 Match details (D5): mock both, for Victor's "show me examples"
- **A: what ships.** The prospect gets a free-text summary. The account gets per-criterion lines plus the credit note appended.
- **B: follow-up.** The prospect gets per-criterion ✓ / ✗ / no data, the source, and an Ideal / Acceptable / Poor tier, matching the account and GC preview format.
- Put real-looking Adecco criteria side by side: buying role, seniority, contact location vs HQ, email/phone.
- Note the trade-off Shrey raised: more tokens and Flex cost on every customer.

### 3.5 Error families
Split errors into **"Agent error"** and **"Blocked by your org's automation"** (Jeremy: 31% are Adecco flows and validation rules).
- Copy: *"A flow or validation rule in your org stopped this record from being created. Review {rule name} or contact your admin."*
- Pair with AG009 raw text cleanup (W-24653786).
- This also shows why Hold for Approval helps: no CRM write, so no automation conflict.

### 3.6 Later (after .11)
- Actual credit consumption.
- Call vs credit vs no-charge split (the customer asked for this).
- Itemized Flex cost.
- Disqualified-but-charged filter.
- Report type with ICP group and cost.
- Retry from cache.
- Cost of pending prospects (Flex only) plus the vendor cost at approval (Tab 3 dependency).

---

## 4. Proto work implied (local only, one step at a time, needs your OK)

| Order | File | Change | Direction change? |
|---|---|---|---|
| 1 | `step_05_prospect_assignment.html` | Rename to **Hold for Approval** and use the decided description. Revisit the default selection | No, it aligns to the decision. But it supersedes the 03 Option A recommendation for .11 |
| 2 | `prospect_list.html` (Activity, run list) | Add the Queued / Failed / Interrupted / Completed-with-errors states plus explanations | No |
| 3 | `prospect_list.html` (run detail) | Not-added rows, the aggregate filtered row, the "Held for approval" status, fixing the Enriched badge | The aggregate row is a **proposal** |
| 4 | `prospect_list.html` (match details) | Rationale popover A vs B | No (D5 asks for both) |
| 5 | `prospect_list.html` (errors) | Org-automation error family | No |
| 6 | New `step_05` variant | .12 Option A toggle | No (CX preference) |
| 7 | New `approval_*.html` | Reference approval flow | **Yes, scope. Ask Victor** |

Also open: the Activity tab has **V1 and V2 switchers**. Which one is the .11 base?

---

## 5. Decisions to chase

| Q | Who | Suggested position |
|---|---|---|
| Advanced Settings: Modal (Rajkumar's default) vs Tab (your preference) | Rajkumar, Victor | Accept Modal for .11, propose Tab for .12 if more settings land. Or push back today, since "unless strong pushback" means the window is now |
| D5: prospect rationale format | Victor | Send A/B mocks |
| D6: record every filtered contact? | Shrey, Neeraj | Aggregate row per account |
| Should Prayas design a reference approval UX? | Victor (cc Giuseppe, Patricia) | Yes, 2–3 screens, reusing match details |
| Does the Leads/Contacts picker apply in Hold mode (FDE creates the records)? | Neeraj, Thomas | Needed for the .12 toggle design |
| Activity V1 vs V2 as the base | Neeraj / Victor | — |
| Can eng give a count of contacts dropped at Search? | Megan | — |

Draft question to Victor (not sent):
> Patricia asked what the approval experience looks like so she can finalize labels, and since staging stays gated until there's a product approval flow, would it help if I mocked a lightweight reference flow (pending list → review with match details → approve / reject with reason)? FDEs could align to it, and it'd be our starting point for GA. Or should I stay on Agent Activity for .11?

## Sources
- PRD Tabs 2 and 3 plus the Overview.
- Slack C0CBNJX3PNU: 1793117037 · 1793123382 · 1793141120 · 1793141799 · 1793138147 · 1792857927 · 1792867067 · 1793112929 · 1792869944.
- Slack C0CARN8P9T9: 1793126306 (label decision).
