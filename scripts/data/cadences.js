/**
 * Example sales cadence data for the Write Messaging step combobox.
 * Exposed as window.CADENCE_DATA for the generic [data-slds-lookup] helper.
 */

window.CADENCE_DATA = [
  { name: 'High Touch Prospects',         type: 'Multi-channel', steps: 8,  owner: 'Alicia Burton' },
  { name: 'Inbound MQL Follow-up',        type: 'Email-only',    steps: 5,  owner: 'Marcus Johnson' },
  { name: 'Enterprise Outbound',          type: 'Multi-channel', steps: 12, owner: 'Sarah Chen' },
  { name: 'Mid-Market Cold Outreach',     type: 'Email + Call',  steps: 7,  owner: 'Emily Rodriguez' },
  { name: 'SMB Velocity',                 type: 'Email-only',    steps: 4,  owner: 'Mike O\'Sullivan' },
  { name: 'Re-engagement — Closed Lost',  type: 'Email + LinkedIn', steps: 6, owner: 'Amanda Li' },
  { name: 'Event Follow-up — Dreamforce', type: 'Multi-channel', steps: 5,  owner: 'Sarah Chen' },
  { name: 'Webinar Attendees',            type: 'Email + Call',  steps: 6,  owner: 'Marcus Johnson' },
  { name: 'Demo Request Fast Track',      type: 'Email + Call',  steps: 3,  owner: 'David Park' },
  { name: 'Champion Nurture',             type: 'Email-only',    steps: 9,  owner: 'Amanda Li' },
  { name: 'Renewal Risk Outreach',        type: 'Multi-channel', steps: 6,  owner: 'Emily Rodriguez' },
  { name: 'Partner Referral Intro',       type: 'Email + Call',  steps: 4,  owner: 'Alicia Burton' }
];

/**
 * Agent-action items rendered in the second group of the cadence combobox
 * listbox (after the "Existing cadences" group). Always visible — never
 * filtered by typeahead. Selection just sets the chip for now; routing the
 * action to actual agent behavior is a follow-up wired in step_04_write_messaging.js
 * via the `lookup-selection-change` event (detail.action).
 */
window.CADENCE_AGENT_ACTIONS = [
  { id: 'suggest',  name: 'Suggest Cadence',  meta: 'Agent will find most applicable cadence.' },
  { id: 'generate', name: 'Generate Cadence', meta: 'Agent will create a new cadence from scratch.' }
];
