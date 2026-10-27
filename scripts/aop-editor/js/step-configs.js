/**
 * Per-step configuration for the AOP editor.
 * Each AOP step page sets window.CURRENT_STEP to one of these keys.
 * main.js and preview.js read the active config to filter templates
 * and switch preview behaviour.
 *
 * Tool-to-step mapping lives in tools-data.js (each tool has a `steps` array).
 * Use getToolsForStep(stepKey) from tools-data.js to get the active tools.
 */

export const STEP_CONFIGS = {
  account_research: {
    stepNumber: 2,
    title: "Account Research",
    description: "Give your agent instructions on how to research accounts.",
    defaultTemplateId: "account_research",
    galleryTemplateIds: ["account_research", "blank"],
    previewType: "account",
    previewEntity: "Account",
    previewDataKey: "ACCOUNT_DATA",
    previewSearchPlaceholder: "Search Accounts...",
    previewLookupIcon: "standard-account",
    previewLookupDefault: "Acme Corporation",
    previewEmptyText:
      'Select an account and click <strong>Preview</strong> to see the research summary.',
    lockedSections: ["Run Condition", "Required", "Nice-to-haves"],
  },

  find_prospects: {
    stepNumber: 3,
    title: "Find Prospects",
    description:
      "Give your agent instructions on how to find prospects in a given account.",
    defaultTemplateId: "find_prospects",
    galleryTemplateIds: ["find_prospects", "blank"],
    previewType: "prospect",
    previewEntity: "Account",
    previewDataKey: "ACCOUNT_DATA",
    previewSearchPlaceholder: "Search Accounts...",
    previewLookupIcon: "standard-account",
    previewLookupDefault: "Acme Corporation",
    previewEmptyText:
      'Select an account and click <strong>Preview</strong> to see discovered prospects.',
    lockedSections: [
      "Instructions",
      "A prospect is a great fit if…",
      "A prospect is an acceptable fit if…",
      "A prospect is a bad fit if…",
    ],
  },

  write_messaging: {
    stepNumber: 4,
    title: "Write Messaging",
    description:
      "Give your agent instructions on how to write outreach emails for prospects.",
    defaultTemplateId: "write_messaging",
    galleryTemplateIds: ["write_messaging", "blank"],
    previewType: "email",
    previewEntity: "Prospect",
    previewDataKey: "PROSPECT_DATA_FLAT",
    previewSearchPlaceholder: "Search Prospects...",
    previewLookupIcon: "standard-contact",
    previewLookupMeta: "prospect",
    previewLookupDefault: "Sarah Chen",
    previewEmptyText:
      'Select a prospect and click <strong>Preview</strong> to see the generated email.',
    lockedSections: ["Section 1", "Section 2"],
  },

  full_preview: {
    stepNumber: 6,
    title: "Full Preview",
    previewType: "full_preview",
    previewEntity: "Account",
    previewDataKey: "ACCOUNT_DATA",
    previewSearchPlaceholder: "Search Accounts...",
    previewLookupIcon: "standard-account",
    previewLookupDefault: "Acme Corporation",
  },
};

export function getStepConfig() {
  const key = window.CURRENT_STEP || "account_research";
  return STEP_CONFIGS[key] || STEP_CONFIGS.account_research;
}
