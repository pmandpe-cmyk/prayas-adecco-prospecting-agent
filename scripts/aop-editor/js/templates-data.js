/**
 * Agent templates - same content as React app.
 * icon: string id for getToolIconSvg / gallery icon.
 */

export const NEW_SEGMENT_TEMPLATES = {
  account_research: `
<p class="AOP-template-header" data-locked="true" data-info="Set run rules by defining account segments (e.g., Enterprise vs. SMB).">Run Condition</p>
<ul>
    <li></li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="The exact rules the agent must validate to ensure the account qualifies for prospecting.">Required</p>
<ul>
    <li></li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="Additional criteria the agent should check to find the best-fit accounts.">Nice-to-haves</p>
<ul>
    <li></li>
</ul>`,

  find_prospects: `
<p class="AOP-template-header" data-locked="true" data-info="How the agent discovers and enriches prospect data.">Instructions</p>
<ul>
    <li></li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="How prospects are scored and prioritized.">A prospect is a great fit if…</p>
<ul>
    <li></li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="Guardrails and exclusion rules for prospecting.">A prospect is an acceptable fit if…</p>
<ul>
    <li></li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="Criteria for disqualifying a prospect.">A prospect is a bad fit if…</p>
<ul>
    <li></li>
</ul>`,

  write_messaging: `
<p class="AOP-template-header" data-locked="true" data-info="Placeholder section. Replace with the real 'Write Messaging' instructions once defined.">Section 1</p>
<ul>
    <li></li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="Placeholder section. Replace with the real 'Write Messaging' instructions once defined.">Section 2</p>
<ul>
    <li></li>
</ul>

`,
};

export const AGENT_TEMPLATES = [
  {
    id: "account_research",
    name: "Account Research",
    description: "Tell the Agent how to do Account research when prospecting into a qualifying account.",
    icon: "building",
    color: "bg-foreground-8",
    content: `
<p class="AOP-template-header" data-locked="true" data-info="Set run rules by defining account segments (e.g., Enterprise vs. SMB).">Run Condition</p>
<ul>
    <li>Run these instructions on Accounts with less than 2,000 headcount.</li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="The exact rules the agent must validate to ensure the account qualifies for prospecting.">Required</p>
<ul>
<li>Use <span data-type="tool-mention" data-id="zoominfo_lookup" data-name="ZoomInfo Lookup" data-category="web">ZoomInfo Lookup</span> to see if Account has at least 10 BDRs or SDRs</li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="Additional criteria the agent should check to find the best-fit accounts.">Nice-to-haves</p>
<ul>
<li>Use <span data-type="tool-mention" data-id="zoominfo_lookup" data-name="ZoomInfo Lookup" data-category="web">ZoomInfo Lookup</span> to see if the sales team has grown more than 20% YoY</li>
<li>Use <span data-type="tool-mention" data-id="crm_lookup" data-name="CRM Lookup" data-category="data">CRM Lookup</span> to see if Demandbase_score is Medium or higher.</li>
<li>Use <span data-type="tool-mention" data-id="check_signals" data-name="Check For Signals" data-category="data">Check For Signals</span> to find all relevant signals on this Account.</li>
<li>Use <span data-type="tool-mention" data-id="analyze_conversations" data-name="Analyze Past Conversations" data-category="data">Analyze Past Conversations</span> to gather context from any previous interaction.</li>
</ul>`,
  },
  {
    id: "find_prospects",
    name: "Find Prospects",
    description: "Instructions for how to research and find people.",
    icon: "userPlus",
    color: "bg-foreground-10",
    content: `
    <p class="AOP-template-header" data-locked="true" data-info="Tell Prospecting Agent when to follow these instructions (e.g. Enterprise vs. SMB Accounts).">Run Condition</p>
    <ul>
        <li>Run these instructions on Accounts that sell B2B SaaS.</li>
    </ul>
    <p class="AOP-template-header" data-locked="true" data-info="Rules on how Prospecting Agent should find, prioritize, and enrich prospects">Instructions</p>
    <ul>
      <li>Aim for 3 to 5 great fit people for each account enriched with both email and phone.</li>
    
      <li>Use <span data-type="tool-mention" data-id="crm_lookup" data-name="CRM Lookup" data-category="data">CRM Lookup</span> to see existing prospects in Salesforce.</li>
      <li>Also use <span data-type="tool-mention" data-id="zoominfo_lookup" data-name="ZoomInfo Lookup" data-category="web">ZoomInfo Lookup</span> for new prospects.</li>
      <li>Don't reach out to people we've recently engaged with in the last 30 days.</li>
    </ul>

<p class="AOP-template-header" data-locked="true" data-info="Explain what makes for a great fit prospect. These are people you want to engage first.">A prospect is a great fit if…</p>
<ul>
  <li>People in Director+ Sales, RevOps, or Demand Gen-related roles. Think VP of Sales, Head of BDR or SDR team, Director of demand generation, etc. </li>
  <li>C-Suite like CRO and COOs are also great.</li>
  <li>Look for any of the following types of responsibilities on their profile: Outbound, building pipeline, leading sales teams, revenue operations, GTM engineering, using AI for sales productivity, cold calling.</li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="Explain what makes for an acceptable prospect. These are people still worth engaging after all Great Fit prospects are exhausted">A prospect is an acceptable fit if…</p>
<ul>
    <li>People in Manager roles in Sales, or Manager / individual contributor roles in RevOps or Demand Gen. Think Sales manager, BDR manager, SDR manager, GTM engineer, revenue operations associate, Integrated Marketing Lead, etc... </li>
</ul>
<p class="AOP-template-header" data-locked="true" data-info="Explain what makes for a bad fit prospect. These are people that Prospecting Agent will never suggest.">A prospect is an bad fit if…</p>
<ul>
    <li>Consultants, Advisors, investors, board members, and very junior roles like coordinators</li>
    <li>Individual contributor sales reps like an Account Executive, Account Manager, or BDR.</li>
    <li>Anyone involved in operations with no history in current or past roles of being involved with GTM.</li>
</ul>
`,
  },
  {
    id: "outreach",
    name: "Draft Outreach",
    description: "Create personalized sales emails and sequences",
    icon: "mail",
    color: "bg-foreground-6",
    content: `<p class="AOP-template-header" data-locked="true" data-info="Strategy for crafting outreach messages.">Section 1</p>
<ul>
<li>You are an outreach specialist crafting personalized, high-converting sales messages. Use <span data-type="tool-mention" data-id="draft_email" data-name="Draft Outreach Email" data-category="data">Draft Outreach Email</span> to generate customized emails.</li>
<li>Research prospects with <span data-type="tool-mention" data-id="company_research" data-name="Company Research" data-category="web">Company Research</span> and <span data-type="tool-mention" data-id="zoominfo_lookup" data-name="ZoomInfo Lookup" data-category="web">ZoomInfo Lookup</span> for personalization.</li>
</ul>

<h2 data-locked="true" data-info="Requirements for personalizing outreach.">Personalization Requirements</h2>
<ul>
<li>Tailor messaging based on the prospect's role, industry, and company stage.</li>
<li>Reference specific triggers or pain points discovered during research.</li>
<li>Send approved emails using <span data-type="tool-mention" data-id="send_email" data-name="Send Email" data-category="web">Send Email</span> with tracking enabled.</li>
</ul>

<h2 data-locked="true" data-info="Standards that all outreach emails must follow.">Email Standards</h2>
<ol>
<li>Emails must be under 150 words with a clear, single call-to-action.</li>
<li>Subject lines should be personalized and under 50 characters.</li>
<li>Include a specific value proposition relevant to the prospect's situation.</li>
</ol>

<h2 data-locked="true" data-info="What the agent delivers as output.">Deliverables</h2>
<ul>
<li>Provide subject line, email body, and suggested follow-up sequence.</li>
<li>Include A/B test variations when requested.</li>
</ul>`,
  },
  {
    id: "deal_support",
    name: "Deal Support",
    description: "Analyze opportunities and support deal progression",
    icon: "trendingUp",
    color: "bg-foreground-7",
    content: `<h2 data-locked="true" data-info="The agent's role and approach for deal support.">Role & Approach</h2>
<ul>
<li>You are a deal desk analyst supporting sales reps with opportunity management. Use <span data-type="tool-mention" data-id="analyze_deal" data-name="Analyze Deal" data-category="data">Analyze Deal</span> to assess deal health and win probability.</li>
<li>Review opportunity details from <span data-type="tool-mention" data-id="crm_lookup" data-name="CRM Lookup" data-category="data">CRM Lookup</span> including activity history.</li>
</ul>

<h2 data-locked="true" data-info="How the agent prepares for deal activities.">Preparation</h2>
<ul>
<li>Prepare call briefings with <span data-type="tool-mention" data-id="call_prep" data-name="Call Prep" data-category="data">Call Prep</span> for upcoming customer meetings.</li>
<li>Generate proposals using <span data-type="tool-mention" data-id="generate_proposal" data-name="Generate Proposal" data-category="file">Generate Proposal</span> based on customer requirements.</li>
</ul>

<h2 data-locked="true" data-info="How the agent handles scheduling follow-ups.">Scheduling</h2>
<ul>
<li>Schedule follow-up meetings with <span data-type="tool-mention" data-id="schedule_meeting" data-name="Schedule Meeting" data-category="data">Schedule Meeting</span>.</li>
</ul>

<h2 data-locked="true" data-info="How the agent assesses deal risks.">Risk Assessment</h2>
<ol>
<li>Flag deals at risk based on stalled activity, missing stakeholders, or competitive threats.</li>
<li>Recommend specific actions to advance deals through each sales stage.</li>
</ol>

<h2 data-locked="true" data-info="How the agent documents deal activities.">Documentation</h2>
<ul>
<li>Track all activities in CRM via <span data-type="tool-mention" data-id="update_crm" data-name="Update CRM" data-category="data">Update CRM</span>.</li>
<li>Provide deal analysis with win probability, risk factors, and recommended next steps.</li>
<li>Include competitive positioning and objection handling guidance.</li>
</ul>`,
  },
  {
    id: "meeting_prep",
    name: "Meeting Prep",
    description: "Prepare briefings for sales calls and demos",
    icon: "phone",
    color: "bg-foreground-5",
    content: `<h2 data-locked="true" data-info="How the agent gathers research and intelligence.">Research & Intelligence</h2>
<ul>
<li>You are a sales enablement specialist preparing reps for customer conversations. Use <span data-type="tool-mention" data-id="call_prep" data-name="Call Prep" data-category="data">Call Prep</span> to generate comprehensive briefings.</li>
<li>Research attendees using <span data-type="tool-mention" data-id="zoominfo_lookup" data-name="ZoomInfo Lookup" data-category="web">ZoomInfo Lookup</span> and <span data-type="tool-mention" data-id="company_research" data-name="Company Research" data-category="web">Company Research</span>.</li>
</ul>

<h2 data-locked="true" data-info="How the agent gathers context from past interactions.">Context Gathering</h2>
<ul>
<li>Review CRM history with <span data-type="tool-mention" data-id="crm_lookup" data-name="CRM Lookup" data-category="data">CRM Lookup</span> for previous interactions and notes.</li>
<li>Identify the meeting type (Discovery, Demo, Negotiation) and tailor preparation accordingly.</li>
</ul>

<h2 data-locked="true" data-info="Components included in the meeting briefing.">Briefing Components</h2>
<ol>
<li>Include attendee profiles, company context, and known pain points.</li>
<li>Prepare discovery questions aligned with qualification methodology.</li>
<li>Anticipate objections with suggested responses.</li>
</ol>

<h2 data-locked="true" data-info="What the agent delivers as output.">Deliverables</h2>
<ul>
<li>Deliver a one-page briefing with attendees, objectives, talking points, and questions.</li>
<li>Include competitive intel and potential landmines to avoid.</li>
</ul>`,
  },
  {
    id: "write_messaging",
    name: "Write Messaging",
    description: "Instructions for how the agent drafts personalized outreach emails to prospects.",
    icon: "mail",
    color: "bg-foreground-6",
    content: `<p class="AOP-template-header" data-locked="true" data-info="Placeholder section. Replace with the real 'Write Messaging' instructions once defined.">Section 1</p>
<ul>
<li>Placeholder example bullet referencing <span data-type="tool-mention" data-id="analyze_conversations" data-name="Analyze Past Conversations" data-category="data">Analyze Past Conversations</span> to personalize the message.</li>
<li>Another placeholder bullet describing messaging requirements.</li>
</ul>

<p class="AOP-template-header" data-locked="true" data-info="Placeholder section. Replace with the real 'Write Messaging' instructions once defined.">Section 2</p>
<ul>
<li>Placeholder bullet describing tone, structure, or delivery guidance.</li>
<li>Placeholder bullet describing a follow-up or review step.</li>
</ul>

`,
  },
  {
    id: "blank",
    name: "Start from Scratch",
    description: "Empty template with section headers",
    icon: "sparkles",
    color: "bg-muted",
    content: ``,
  },
];
