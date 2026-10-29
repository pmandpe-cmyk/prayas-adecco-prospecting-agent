# START HERE: Adecco Prospecting Agent (handoff context)

> For any Claude session working in this repo. Last updated **Oct 28, 2026**.
> Owner: **Prayas Mandpe (UX)**. PM: **Victor Weilin Liu**. Eng lead: **Neeraj Agicha**. Release **264.11 ships Nov 7**.
> Prayas started on Oct 27 and is still ramping up. Keep things simple, take one step at a time, and don't send him back into Slack or the PRD. Summarize for him instead.

---

## How to work with Prayas (standing rules)
1. **Proto edits are local only.** No commits, no pushes.
2. **One step at a time.** Pause after each change and show what changed. Take a screenshot when the change is visual.
3. **Do the work yourself**, but **get his approval before any change of direction** (new scope, reversing a decision, a new pattern).
4. **Never send Slack messages.** Drafts only.
5. **Never use or show the Heroku `prospect-list-p0.html`.** It's old (Kunal: "things don't look like that at all").
6. Save notes and artifacts to `.agents/artifacts/`.

## Running the proto
- Static SLDS HTML with root-relative `/assets` paths. Serve it with `python3 -m http.server 8765 --bind 127.0.0.1` from the repo root, then open http://127.0.0.1:8765/.
- Screenshot with headless Chrome. The browser MCP only works with https.
  ```
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,1400 --virtual-time-budget=4000 --screenshot=out.png http://127.0.0.1:8765/<file>.html
  ```

---

## The whole project in 4 lines
1. **Setup (GC config steps).** The first pass is done. Small fixes remain.
2. **Agent Activity.** The run history tab that shows what the agent did and why. **This is the main .11 design work. Engineering is building it now. ← TODAY'S FOCUS**
3. **Approval flow.** Manager approves, then the seller approves, and only then is a Lead created. Not in .11. Who designs it is unclear, and **Victor needs to answer** (DM draft below).
4. **Everything else** (queues in setup, multiple ICPs, agent deletion) comes after .11. Ignore it for now.

## Today's plan (Agent Activity), one step at a time
| Step | What | File |
|---|---|---|
| 1 | Screenshot the current Activity tab. Pick **V1 or V2** as the base (the proto has a switcher at ~L300) | `prospect_list.html` |
| 2 | **Run list statuses**, each with a plain explanation (table below) | `prospect_list.html` run list `agent_log_table_run_all` (~L17680) |
| 3 | **Run detail records table:** "Not added" rows with a reason; "Enriched" badge only when enrichment succeeded; "Held for approval" status for staging agents; one summary row per account for filtered-out contacts | `.agent-log-run-detail` (~L18820), `scripts/agent-log.js` |
| 4 | **Match details A vs B** (Victor asked to see examples) | rationale popover `#agent-log-rationale-popover` in `scripts/agent-log.js` |
| 5 | Error families: "Agent error" vs "Blocked by your org's automation" | run detail |

### Run statuses to design
| Status | When | Show |
|---|---|---|
| Queued | Another run is active (W-24663216) | "Waiting for the current run to finish" |
| Running | In progress | "Started 12 min ago." Refresh must work (known bug) |
| Completed | Normal | Counts |
| Completed with errors | Some records errored | Counts plus an error-count link |
| Interrupted | Run cut off (W-24663516) | Partial counts, never blank |
| Failed | Source report deleted / timeout (W-24663204) | Reason, e.g. "The source report was deleted or you lost access" |
| Completed, nothing to process | Empty report (W-24663222, P3, low priority) | "No accounts to process…" |

### Facts that constrain Activity (decided, don't reopen)
- **Cost:** v1 shows **enrich *call* counts**, not credits. Actual credit use comes after .11. There are no per-prospect credits. The account credit estimate appears in the Records Searched header and the account rationale text.
- **Flex:** anything that goes through the LLM Gateway uses Flex. Don't show token or Flex numbers in .11 (an informational note at most).
- **Prospect rationale:** what ships is a **free-text summary**. The per-criterion format (✓/✗/no data + source + Ideal/Acceptable/Poor) is a follow-up. Victor: "might be okay for v1, show me examples," so mock both.
- **Contacts with no email or callable phone** are dropped at ZoomInfo Search, before enrichment. They never show up downstream, so they can't be rows.
- **Every processed prospect needs a row**, including "Not added" with a reason (QA, Mukesh).
- **2,000-contact volume** (open, D6): propose an aggregate row per account instead of one row per filtered contact.
- **31% of Adecco's errors** come from their own flows and validation rules (Jeremy). Name these separately from agent errors.

---

## Approval flow: what's known (for when Victor answers)
- **Customer flow (Oct 27):**
  1. The agent finds prospects. They stay in staging.
  2. The agent manager (Ops) approves.
  3. The prospect's owner changes to a **Sales queue**.
  4. A seller **claims** it (claiming is required), reviews it, and approves.
  5. Only then: enrich, then the **Lead is created**.
  6. A rejection at either stage keeps the status and reason. No record is created.
- **Victor:** "We need to support queues for the prospect entity to allow sales to approve before leads are created."
- **Who builds what:** the product supports queue ownership and sharing on the prospect entity. The **FDE builds the approval UI**, status fields, and record creation (Rebecca, Thomas, Neeraj). The agent itself only creates the prospect record.
- **Open:** *which queue, and where is that stored?* Shashank asked Victor and nobody has answered ([link](https://salesforce.enterprise.slack.com/archives/C0CBNJX3PNU/p1793119397690989?thread_ts=1793117037.975109&cid=C0CBNJX3PNU)). The only fallback mentioned is an FDE trigger. Our proposal: a queue picker in setup plus an override at approval time.
- **Victor:** two stages may be unnecessary if ICP sizing lets Ops check volume early. Design the manager stage so it can be turned off.
- **Proposed statuses:** Pending manager review → Pending seller review (Unclaimed/Claimed) → Converted, or Rejected (stage, who, reason), or Conversion failed.

### Setup label (decided for .11)
- The Record Creation third radio option is **"Hold for Approval"**: *"The agent doesn't create records. Prospects are added to a list for sellers to review and approve."* (Patricia, CX.)
- The proto still says "Staged Prospects … before the agent saves them as leads or contacts." That's wrong. See `step_05_prospect_assignment.html` L3060–3070. The fix is pending Prayas's OK.
- **.12:** a separate "Hold for approval" checkbox under a Leads/Contacts picker (CX preference). Eng is splitting the metadata in .11.

### Draft DM to Victor (not sent; Prayas will send it)
> Hey Victor, quick scope check. I'd like to design the approval flow Adecco described (manager approves → prospect goes to a Sales queue → seller claims and approves → only then is the Lead created). Since the FDEs are building it, should I design it as a reference for them and for our future product version? If yes, I'll also propose where the manager picks the Sales queue (Shashank's open question in your customer-answers thread). Or should I stay focused on Agent Activity for .11 first?

---

## Other open items (not today)
- **Advanced Settings:** Rajkumar is going with the **Modal** version "unless strong pushback." Prayas preferred the Tab version. He needs to decide whether to push back.
- **Walkthrough items 2–7 are paused:**
  - Find Prospects copy fix;
  - Process All Accounts default off plus a warning;
  - read-only contact requirement;
  - match details A/B (now part of today's step 4);
  - hold-for-review option;
  - Heroku check.
- **The only proto change so far:** the Account Research enrichment toggle in `step_02_account_research.html`.
- **Unsent draft:** `slack-drafts/d1-toggle-placement.md`.

## Where the detail lives (read only if needed)
- `.agents/artifacts/adecco-design/focus-activity-and-approvals.md`: latest detailed brief for Activity and Approvals, with sources.
- `00-overview.md` … `06-miscellaneous.md`: per-PRD-tab briefs. Where they conflict with the focus brief, the focus brief wins.
- PRD: `~/Downloads/Prospecting Agent - Adecco Product Requirements.md` (Tab 2 at L163, Tab 3 at L237).
- Slack: #adecco-prospecting-warroom `C0CBNJX3PNU`.
