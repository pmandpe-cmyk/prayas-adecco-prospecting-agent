# 04 · Queue Support

> **PRD:** Tab 4, *Queue Support* · **UX:** Prayas · **Eng:** Rebecca Greenberg (entity sharing), Shrey Kharbanda · **FDE:** Giuseppe Cardace
> **Legend:** 🟢 264.11 · 🟡 264.12 · 🔵 264.10 patch · ⚪ later

## Summary

Adecco sends prospects to **Sales queues** rather than to individual owners. In the customer's flow, a seller picks an approved prospect from a queue, approves it, and only then is it enriched and turned into a Lead.

**Nothing ships in .11.** The FDE handles queue assignment after approval in their custom UI (Kunal). The product work is ⚪ post-.11, so this brief is design-ready groundwork.

---

## 1. PRD requirements

**FDE (Flow 2):**

| # | Requirement |
|---|---|
| F1 | After Ops approval, assign the staged prospect to the right Sales queue |
| F2 | Sellers in the queue claim, review, and approve or reject |
| F3 | On Sales approval: enrich, create the Lead, and assign it to the claiming seller |

**Product:**

| # | Pri | Requirement | Release |
|---|---|---|---|
| 1 | P1 | **"Distribute all prospects to a queue"**: a third option in **Assign Prospects → Distribute Prospects**. Shown **only when Record Creation = Leads or Prospects** (queues can't own Contacts) | ⚪ |
| 2 | P1 | **Queue picker** (lookup of Lead-supported queues). Queue members **don't need** the prospecting permission | ⚪ |
| 3 | P1 | **Prospecting scope**: "Accounts that belong to members in the queue" or "All accounts" | ⚪ |
| 4 | P1 | **Queue cap**: up to **100k** records in a queue | ⚪ |
| 5 | P1 | **View and approve**: agent managers can review queued prospects before anyone claims them | ⚪ |
| 6 | P2 | **Licensed member count** with a warning icon when members lack a license | ⚪ |
| 7 | P2 | **Manage queue** link (opens Setup → Queues) | ⚪ |
| 8 | P2 | **Grant permission** to queue members from GC, with confirmation | ⚪ |

**Non-goals (PRD):**
- Contacts in queues.
- Mixing users and queues in one distribution.
- Round robin.

**PRD open questions:**
- What does Engagement Agent do with unclaimed Leads in a queue?
- Claim-first direction: should sellers claim before or after review?

---

## 2. What's been decided (Slack)

- **Customer, Oct 27 (ts 1793117037):** keep the prospect in staging after Ops approval and *"assign it to the relevant Sales queue for review."* The Lead is created only after Sales approves.
- **Victor's implication:** queues are needed on the **prospect entity**, not just Leads. This is a **change from the PRD**, which limits queues to Leads.
- **Rebecca:** the product supports **queue ownership and sharing** on the entity, and the **FDE builds the approval flow**.
- **Shrey:** queue users **must claim** records before working them. This answers the PRD's claim-first question for the FDE flow.
- **Kunal (exec update, ts 1792733009):** the FDE custom UI handles queue assignment after approval in the near term.
- Release map (00): "queues on the prospect entity" is listed as **post-.11**.

---

## 3. Current proto state and gaps

| File | Today | Gap |
|---|---|---|
| `step_05_prospect_assignment.html` | Sections: **Distribute Prospects**, Manage Routing, **Assign Ownership**, Hand Off to Agent. Advanced Settings includes "Route Prospects from Additional Account Owners" | ❌ No queue option. ❌ No queue picker / scope / member count. ❌ No logic that hides queues when Record Creation = Contacts |

---

## 4. Screens and states to design ⚪

### 4.1 Distribute Prospects with a queue option
```
Distribute Prospects
( ) To account owners
( ) To specific users
( ) To a queue                     ← only if Record Creation = Leads or held for review
    Queue  [ UK SME Sales Queue        ▾ ]   12 members · 2 without a license ⚠  Manage queue ↗
    Prospect accounts that belong to:
      (•) Members of this queue
      ( ) All accounts in the source
```
- **Contacts selected:** the queue option is disabled, with the tooltip "Queues can only own Leads. Change Record Creation to Leads to use a queue." (Or hide it; mock both.)
- **No queues exist:** empty state in the picker with "Create a queue in Setup ↗".
- **Licensed members (P2):** a warning icon plus a popover listing members without a license and a **Grant permission** action. The action has a confirmation modal: "Give {N} users access to prospects from this agent?"
- **Cap reached (100k):** an inline error on the run, plus an Activity reason: "Queue is full (100,000 records). Prospects weren't added."

### 4.2 Manager pre-claim review (P1 #5)
- From the queue list view or the agent page: "{N} prospects in {queue} · Review".
- The review list reuses the approval surface from 03 §4.4 (match details plus Approve / Reject).

### 4.3 Seller claim flow (FDE now, product later)
- Queue list → **Claim** (Shrey: must claim first) → review match details → Approve (enrich + create Lead, owner = claimer) or Reject (with reason).
- States:
  - Claimed by someone else: "Claimed by {name} 2h ago".
  - Released back to the queue.

### 4.4 Interaction with staging and multi-ICP
- With staging on (03), the queue owns the **staged prospect**. This needs queue support on the prospect entity (Victor).
- With multi-ICP (05), each ICP group can route to its own queue (Tab 5 #5–6). Design the queue picker so it can sit inside a per-group card.

---

## 5. Copy notes (drafts)

| Item | Draft |
|---|---|
| Option label | "To a queue" |
| Helper | "Prospects go to a queue. Queue members claim and work them." |
| Scope | "Prospect accounts owned by members of this queue" / "All accounts in the source" |
| Contacts disabled tooltip | "Queues can only own Leads. Change Record Creation to Leads to use a queue." |
| License warning | "{N} members can't see these prospects because they don't have the required license." *(Confirm which license applies.)* |

## 6. Edge cases
- **Queue deleted or renamed** after setup. Show an error on the agent and in the run summary: "The selected queue no longer exists."
- **Seller leaves the queue while holding claimed records.** Who owns them?
- **Engagement Agent + unclaimed Leads** (PRD open question). Recommend: hand-off starts only after a record is claimed.
- **Account-owner scope + a member who owns no accounts.** That member never receives prospects. Consider showing a hint in the member list.

## 7. Open questions
| Q | Owner |
|---|---|
| Queues on the prospect entity (customer flow) vs Leads only (PRD). Confirm the product direction | Victor, Rebecca |
| What does Engagement Agent do with unclaimed queue records? | Victor |
| Hide vs disable the queue option when Record Creation = Contacts | Patricia |
| How does the FDE UI assign a queue: per ICP, per region, or manually by Ops? | Giuseppe |

## 8. Dependencies and gates
- 03 staging (queue owns staged prospects).
- 05 multi-ICP per-group routing.
- Entity sharing / ownership work (Rebecca).

## 9. Sources
PRD Tab 4 · Slack: 1793117037 (customer answers, Victor, Rebecca, Shrey) · 1792733009 (Kunal exec update)
