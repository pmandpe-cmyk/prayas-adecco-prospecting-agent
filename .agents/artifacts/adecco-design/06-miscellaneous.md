# 06 · Miscellaneous

> **PRD:** Tab 6, *Miscellaneous* (Victor, Oct 25) · **UX:** Prayas · **Eng:** Rajkumar Pellakuru (max prospects), Rohini Thakar · **QA:** Mukesh Dua
> **Legend:** 🟢 264.11 · 🟡 264.12 · 🔵 264.10 patch · ⚪ later

## Summary

Small items that don't fit the other tabs:
- **Agent deletion** (PRD P0, 🔵 264.10 patch).
- **Max prospects per account raised from 5 to 100** (🟢, from Slack).
- An **Advanced Settings summary on Agent Details** (asked for, **on hold**).
- **Review & Activate summary** of the new settings, recommended by this brief so the .11 changes are visible before activation.

---

## 1. PRD requirements

| # | Pri | Requirement | UX? | Release |
|---|---|---|---|---|
| 1 | P0 | **Agent deletion**: agent managers can delete a Prospecting Agent they no longer need. It stops running and frees a slot under the org's agent cap (20, or 50 via support) | Implicit (confirmation) | 🔵 264.10 patch (pre-checkin) |

**Goal:** remove unused agents so they stop running and free slots.
**Non-goal:** raising the agent cap. Tab 5 covers using fewer agents.
**Success metric:** a deleted agent stops running right away and frees a slot.

**PRD open questions:**
- **Eng:** when an agent is deleted, what happens to its **prospects pending approval**, its **Agent Activity history**, and the **records it already created**? Scheduled runs and source-report access should stop right away.
- **Customer:** what is "Coworker", and which assessment does it do vs. the prospecting agent? (From their ICP definition.)

---

## 2. What's been decided (Slack)

### Max prospects per account: 5 → 100 (Rajkumar, ts 1792869672)
- The max prospects setting on the Account record page goes **from 5 to 100**.
- Tanuja (ts 1792980142): at 100, runs reached only 28 prospects because of timeouts. Parallel checks fixed it (97). So 100 is achievable, but runs are longer (see 02 performance).

### Advanced Settings summary on Agent Details (Mukesh / Neeraj / Rohini, ts 1793141799)
- **Mukesh** asked for a summary of Advanced Settings on the **Agent Details** page, so testers and admins can see Process All Accounts, Record Creation, etc. without opening GC.
- **Neeraj:** **hold** for now.
- **Rohini:** staging only needs a small GC entity-selection change. Keep .11 scope minimal.
- → **D10** stays open. Design it, but don't push it for .11.

### Agent deletion (264.10 patch)
- Confirmed in the release map as part of the 264.10 patch (00 §5). Slack had no UX discussion. The pending-prospects question becomes more important with staging (03).

---

## 3. Current proto state and gaps

| File | Today | Gap |
|---|---|---|
| `agent_monitoring.html` / agent list | Agent list and monitoring | ❌ No Delete action or confirmation modal |
| Account record (prospect list on the Account) | — | ⚠️ Confirm where "max prospects" is set and displayed. The proto has no 100-cap state |
| Agent Details | — | ❌ No Advanced Settings summary (D10, on hold) |
| `step_06_review_activate.html` | Review & Activate | ❌ Doesn't summarize enrichment toggles, contact requirement, Process All Accounts, or Record Creation |

---

## 4. Screens and states to design

### 4.1 Delete agent 🔵
**Entry points:** the agent list row menu (⋯ → Delete) and the Agent Details header menu.

**Confirmation modal** (SLDS destructive). Content depends on the agent's state:
```
Delete "UK SME Construction"?
This agent stops running immediately and frees a slot in your org's agent limit (14 of 20 used).

What happens to its data
• Leads and Contacts it created stay in Salesforce.
• Run history in Agent Activity is {kept for N months | deleted}.        ← eng to confirm
• 23 prospects waiting for review will be {kept | deleted}.             ← only if staging; eng to confirm

Type the agent name to confirm: [               ]
                                              [Cancel]  [Delete agent]
```
- **Running agent:** "A run is in progress. Deleting stops it, and results so far are kept." Or block deletion until it finishes; confirm with eng.
- **After delete:** a toast "Agent deleted", and the list updates its slot count.
- **Alternative to offer:** "Deactivate instead" link. It keeps the config without running, but still uses a slot. Confirm with Victor whether this should be offered.

### 4.2 Max prospects (100) 🟢
- The field shows the new range (1–100) and helper text: "Higher limits make runs take longer."
- When an account reaches the limit, the Activity reason (02) is "Skipped: account has reached the limit of {N} open prospects". With staging (03), this depends on whether pending prospects count (open question there).

### 4.3 Review & Activate summary (recommended, 🟢 low cost)
Add a "Prospecting settings" card to `step_06`:

| Setting | Value |
|---|---|
| Account enrichment | Off (ZoomInfo Search only) |
| Prospect enrichment | Off |
| Contact requirement | Email or callable phone (not on Do Not Call list) |
| Process All Accounts | **On**, with a warning chip "Re-researches every run" |
| Record creation | Contacts & Accounts · Held for review |

Each row links back to its step. This also catches the empty-ICP problem (W-24664053): show a blocking error, "Add at least one prospect criterion".

### 4.4 Agent Details: Advanced Settings summary ⚪ (D10, on hold)
- A read-only panel on Agent Details with the same rows as 4.3, plus "Edit in setup ↗".
- Useful for QA and support. Revisit after .11.

---

## 5. Copy notes (drafts)

| Item | Draft |
|---|---|
| Delete modal title | "Delete {agent name}?" |
| Body | "This agent stops running immediately and frees a slot in your org's agent limit." |
| Created records | "Leads and Contacts it created stay in Salesforce." |
| Toast | "{agent name} was deleted." |
| Max prospects helper | "Higher limits make runs take longer." |
| Limit reached (Activity) | "Skipped: this account already has {N} open prospects." |

## 6. Edge cases
- **Delete while scheduled:** cancel future runs right away (PRD).
- **Delete an agent whose source report is shared by another agent:** no effect on the other agent. Make sure the copy doesn't imply otherwise.
- **Report types stamped with the source agent** (02 #6): after deletion, how do reports show the deleted agent? Suggest "{name} (deleted)".
- **Staged prospects owned by a queue** (03/04): deleting the agent shouldn't orphan records that sellers have claimed.
- **Max prospects lowered** below the current count: existing prospects aren't removed. The account just won't get new ones until it's under the limit.

## 7. Open questions
| Q | Owner |
|---|---|
| On delete: pending prospects, Activity history, created records? (PRD) | Neeraj / eng |
| Block delete during a run, or stop the run? | Eng |
| Offer "Deactivate" as an alternative? | Victor |
| D10: Advanced Settings summary on Agent Details (on hold) | Neeraj, Mukesh |
| Where is max prospects configured and shown (Account page vs GC)? | Rajkumar |
| Customer: what is "Coworker"? | Victor (customer) |

## 8. Dependencies and gates
- 264.10 patch (deletion).
- 03 staging (pending-prospect handling on delete).
- 01 settings (feed the Review & Activate summary).

## 9. Sources
PRD Tab 6 · Slack: 1792869672 (Rajkumar cooldown + max prospects) · 1792980142 (Tanuja timeouts) · 1793141799 (Mukesh / Neeraj / Rohini Agent Details summary)
