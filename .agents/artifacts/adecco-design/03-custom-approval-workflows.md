# 03 · Custom Approval Workflows (Staging Prospects)

> **PRD:** Tab 3, *Custom Approval Workflows* · **UX:** Prayas · **CX:** Patricia Vaz, Cordelia Hsiao
> **Eng / data model:** Rebecca Greenberg · Shashank Tejura · Rohini Thakar · Caleb Smith · Thomas Morrow (GC entity UI) · Jason Levens · **FDE:** Giuseppe Cardace
> **Legend:** 🟢 264.11 · 🟡 264.12 · 🔵 264.10 patch · ⚪ later

## Summary

Adecco wants **people to approve prospects before any Lead exists or any money is spent on enrichment**.

- **Product, .11:** ships a **staging option**. Record Creation = Prospects stores results in the prospect entity instead of creating Leads/Contacts. It's gated to Adecco only.
- **FDE:** builds the approval UI on top (Flow 2).
- **Product, ⚪ later:** a real approval step in GC (Flow 1).

.11 UX scope is small: the **Record Creation option, its label, and its setup text**. Most of the thinking here sets up Flow 1 and makes sure staging reads correctly in Agent Activity.

---

## 1. PRD requirements

| # | Pri | Owner | Requirement | Release |
|---|---|---|---|---|
| 1 | P0 | Product | **Standalone Prospect entity.** Advanced Prospecting Settings → Record Creation = **"Prospects"**. Results stay in the prospect entity. No Lead/Contact until approved | 🟢 gated (`prospectingadeccoenhancements`) |
| 2 | P0 | FDE | **Two-stage approval page** (Ops → Sales) on the staged prospects | FDE, in parallel |
| 3 | P1 | Product | **Approval step in GC** (Flow 1): approve, then convert / assign / enrich / set field values / run automations | ⚪ |
| 4 | P1 | Product | **Conversion rules / field mapping** (prospect → Lead/Contact) | ⚪ |
| 5 | P1 | Product | **Access control**: pending records are private to the agent manager, plus sharing | ⚪ (partly in data model) |
| 6 | P1 | Product | **Prospects report type**. Warn that dashboards that run as a specific user may expose records | ⚪ |
| 7 | P1 | Product | **Duplicate handling**: merge or update existing Lead/Contact on approval | ⚪ |
| 8 | P2 | Product | **Manual update of existing records** from a prospect | ⚪ |
| 9 | TBD | Product | **Retention**: how long staged or rejected prospects live (~12 months, matching records-under-management) | ⚪ |

**Data model notes (PRD):**
- Reuse the existing prospect entity.
- Pending records are private to the agent manager.
- **Queues can only own Leads** today, which drives the queue design in 04.

**Flow 2 (FDE) steps (PRD):**
1. The agent stages prospects.
2. Ops / the agent manager reviews them, either approving (strategic gate) or rejecting.
3. Approved prospects go to the Sales queue.
4. A seller approves and the prospect is enriched.
5. The Lead/Contact is created.

**PRD open questions:**
- Do we capture a rejection reason?
- Does rejection trigger cooldown?
- Do pending prospects count toward the open-prospects limit?

---

## 2. What's been decided (Slack)

### Customer workflow update (Victor, Oct 27, ts 1793117037)
- *"keep the prospect in staging after Ops approval and assign it to the relevant Sales queue for review. The **Lead should only be created once Sales has approved** the prospect. The Ops approval is primarily intended as a safety and volume control."*
- On Sales rejection: *"no Lead should exist yet … The prospect should remain in staging with a **rejected status and, ideally, the rejection reason**."*
- **Victor's implications:**
  - Queues need to work on the **prospect entity** (not only Leads), see 04.
  - **Two-stage approval may be unnecessary** if Ops can check volume and quality early through ICP sizing (05).
  - Multi-ICP spike.
  - Actual credit consumption after .11.
- **Rebecca:** the product supports **queue ownership and sharing** on the entity. The **FDE builds the approval flow**.
- **Shrey:** queue users must **claim** records.

### Label and placement debate (Cordelia, ts 1793123382)
- Staging is **gated to Adecco only** until a product approval / conversion flow (Flow 1) exists.
- **Cordelia + Patricia:** the Record Creation picklist should stay **Contacts / Leads**. "Human in the loop" should be a **separate choice**, not a third object type, because "Prospects" isn't an object admins recognize.
- **Rebecca:** put the staging choice **next to the Contact vs Lead choice** so the relationship is clear.
- **Neeraj:** add **setup text** explaining it's meant for custom approval flows.
- **Jason Levens:** a new **research reference label** is needed for staged entries.
- → Decision **D7** (label) is open.

### Independence from skip-enrich (Victor, Jonathan)
- Skip-enrich (01) and staging are **independent**. Adecco will likely use both together.
- Megan: *"If Adecco turns on no enrichment for contacts & uses staging object this should not matter"* (re: the postponed "Do not require email" toggle).
- The contact pre-filter applies to staging too (Megan, PR 161222).

### Exec framing (Kunal, ts 1792733009)
- The FDE custom UI handles **queue assignment after approval**. Product doesn't build that UI in .11.

### GC change size (Rohini, Mukesh thread ts 1793141799)
- Staging only needs a **small GC entity-selection change**. Thomas Morrow owns the GC entity UI.

---

## 3. Current proto state and gaps

| File | Today | Gap |
|---|---|---|
| `step_05_prospect_assignment.html`, Advanced Prospecting Settings modal | **Record Creation**: "Select the Salesforce object to create for new prospects." Radios: Leads · **Contacts & Accounts** (checked, "Recommended") · **Prospects** | ❌ "Prospects" is presented as a peer object (the label CX is pushing back on). ❌ No explanation that nothing is created until approval. ❌ No setup text about custom approval flows. ❌ Not visibly gated |
| `step_05_prospect_assignment.html`, Assign Ownership / Hand Off to Agent | Assumes records get owners and go to Engagement Agent immediately | ❌ With staging on, owner assignment and hand-off happen **after** approval. These sections need a staged-mode note or must be disabled |
| `prospect_list.html` (Activity) | "Created" semantics | ❌ Needs "Staged" wording when staging is on (see 02) |
| `step_06_review_activate.html` | Review | ❌ Doesn't say "Prospects will be staged for review" |

---

## 4. Screens and states to design

### 4.1 Record Creation with staging 🟢 (D7)
Mock two options for Patricia, Cordelia, and Victor.

**Option A: separate checkbox (CX-preferred).**
```
Record Creation
Select the Salesforce object to create for approved prospects.
( ) Leads   (•) Contacts & Accounts  [Recommended]

[✓] Hold prospects for review before creating records
    The agent saves prospects for your team to approve first. No Leads or Contacts are
    created until a prospect is approved. Use this with a custom approval flow.  [Learn more]
```
- The object choice stays meaningful: it's the eventual conversion target, ready for Flow 1.
- It's honest that an approval flow must exist (FDE today).

**Option B: third radio (eng's build today).** Leads · Contacts & Accounts · **Prospects (review before creating)**, with the same helper text below when selected.
- Simpler to build, but it reads like a new object, and there's no conversion target.

**Recommendation: A.** It matches the CX input and Rebecca's "next to Contact vs Lead" point, and it carries over to Flow 1 without a relabel.

**Gate off:** the checkbox or radio is hidden entirely.

### 4.2 Downstream effects in GC when staging is on 🟢
- **Assign Prospects step:** an inline info box: "Prospects are held for review. Owners are assigned when a prospect is approved." Owner rules stay editable if the FDE flow uses them; confirm with Giuseppe.
- **Hand Off to Agent (Engagement):** disable or show "Starts after approval".
- **Review & Activate:** a summary row: "Record creation: Held for review (custom approval flow)".

### 4.3 Agent Activity in staged mode 🟢
Covered in 02:
- "Created" → "**Staged for review**".
- Prospect rows show the staged status.
- Cost tiles show that enrichment is deferred: "Contact enrichment happens after approval".

### 4.4 Flow 1: product approval step in GC ⚪ (P1 #3–7)
Design direction for later. Don't design in detail yet.
- **New GC step "Review & Approve"** (between Find Prospects and Assign Prospects). Settings:
  - who reviews (agent manager / queue / specific users);
  - one-stage vs two-stage;
  - what happens on approve: convert to Lead or Contact, assign, enrich, set default field values, run automations;
  - what happens on reject: keep with reason, apply cooldown or not.
- **Review surface:** a list of staged prospects with match details (02 §4.4) and **Approve / Reject** actions, plus bulk actions. Reject opens a **reason picklist** (Wrong title · Wrong location · Already engaged · Not a fit · Other plus a text field). Victor said "ideally the rejection reason" (D8).
- **Status model:** Pending review → Approved (Ops) → Approved (Sales) → Converted · or Rejected (stage, reason, by, when).
- **Duplicates on approve (P1 #7):** "A Lead for {name} already exists" with Update existing / Create anyway / Skip.
- **Field mapping (P1 #4):** a mapping table from prospect fields to Lead/Contact fields, using defaults from Assign Prospects.
- **Report type (P1 #6):** "Prospects" report type, plus an admin warning about dashboards that run as a specific user.

### 4.5 Victor's simplification to keep in mind
If ICP sizing (05) lets Ops **check volume and quality before the agent runs**, the Ops stage may go away. Then Flow 1 becomes **one stage: seller approves → enrich → create**. Design Flow 1 so the number of stages is a setting, not a fixed layout.

---

## 5. Copy notes (drafts, CX to finalize)

| Item | Draft |
|---|---|
| Checkbox label (A) | "Hold prospects for review before creating records" |
| Helper | "The agent saves prospects for your team to approve first. No Leads or Contacts are created until a prospect is approved. Use this with a custom approval flow." |
| Radio label (B) | "Prospects (review before creating)" |
| Assign step info | "Prospects are held for review. Owners are assigned after a prospect is approved." |
| Activity count | "{N} staged for review" |
| Rejected status | "Rejected · {reason}" |
| Research reference label (Jason) | e.g. "Staged prospect". Must match the reference used in the research entity |

Avoid "staging" in customer-facing copy. It's an eng term. Use "held for review" or "pending review".

---

## 6. Edge cases
- **Switching staging off with pending prospects.** What happens to the records already held? Show a confirmation: "{N} prospects are waiting for review. They'll stay available in your approval flow."
- **Agent deleted with pending prospects** (PRD Tab 6 open question), see 06.
- **Rejection and cooldown.** Should a rejected prospect's account go into cooldown? (PRD open question.) Affects 01 cooldown copy.
- **Open-prospects limit.** Do pending prospects count toward the max-prospects-per-account limit (now 100)? If yes, the agent may stop finding prospects for accounts with a full backlog. Needs an Activity reason: "Skipped: account has {N} prospects waiting for review".
- **Privacy.** Pending records are private to the agent manager. Sellers in a queue can't see them until they're shared or assigned (04).
- **Retention (~12 months).** Do rejected records expire? Whatever the answer, say so in the setup text or help.
- **Enrich after approval.** With contact enrich off, the phone number isn't known while the prospect is staged (01 §6). Don't show phone or email fields in the review UI as empty "missing" fields. Show "Available after approval".

## 7. Open questions
| Q | Owner |
|---|---|
| D7: "Prospects" as a third radio vs a separate "Hold for review" checkbox | Patricia, Cordelia, Victor |
| D8: rejection reason capture (picklist + text?) and status model for staged prospects | Victor, Giuseppe (FDE) |
| Does rejection trigger cooldown? | Victor |
| Do pending prospects count toward the open-prospects limit? | Victor, Rajkumar |
| Do owner rules in Assign Prospects still apply in staged mode (used by the FDE flow)? | Giuseppe, Rebecca |
| Research reference label for staged entries | Jason Levens, Patricia |
| Retention for staged / rejected prospects | Victor |

## 8. Dependencies and gates
- Gate `prospectingadeccoenhancements` (staging).
- 01: skip-enrich (independent, but used together).
- 02: Activity wording for staged prospects.
- 04: queues on the prospect entity (needed for the Sales-queue step of the customer flow).
- 05: ICP sizing may remove the Ops stage.

## 9. Sources
PRD Tab 3 · Slack: 1793117037 (customer answers + Victor's implications, Rebecca, Shrey) · 1793123382 (Cordelia label thread: Patricia, Rebecca, Neeraj, Jason) · 1792874803 (Megan) · 1793138147 (Megan filter applies to staging) · 1792733009 (Kunal exec update) · 1793141799 (Rohini GC change)
