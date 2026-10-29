# Draft: D1 skip-enrich toggle placement

**To:** #adecco-prospecting-warroom, threaded on Jonathan's skip-enrich patch post (or DM Victor + Jonathan)
**Status:** draft, not sent

---

@Victor @Jonathan quick check on where the skip-enrich toggles live for 264.11 before this goes further.

The PRD (Tab 1 #5) puts the paid enrichment setting on the **Account Research** and **Find Prospects** steps. I've mocked it that way in the proto:
• **Account Research:** new "Enrich Accounts with ZoomInfo" toggle under the instructions, off by default, with a credit warning when it's turned on
• **Find Prospects:** the existing ZoomInfo toggle becomes the prospect enrichment setting (same pattern)

The current build puts both toggles in **Advanced Prospecting Settings → Record Creation**. Three reasons I'd lean toward the steps:
1. Each toggle sits next to the criteria it affects, so the cost/quality tradeoff is visible while you're writing them
2. Victor wants this easy to flip back on and compare, and the Advanced Settings modal is a few clicks deep
3. It keeps enrichment visually separate from Record Creation / staging, which we said are independent

Can we align on the steps for .11, or is there a constraint that keeps it in Advanced Settings for now? Screenshots attached. Labels are still pending the CX request.
