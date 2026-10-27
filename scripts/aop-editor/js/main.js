/**
 * Entry: init editor, slash suggestion, tooltip, toolbar.
 */

import { createEditor } from "./editor.js";
import { createSlashSuggestion, watchSlashTrigger } from "./slash-suggestion.js";
import { createTooltip } from "./tooltip.js";
import { getToolsForStep, getToolById, getToolIconSvg, buildToolBadgeHtml } from "./tools-data.js";
import { AGENT_TEMPLATES } from "./templates-data.js";
import { initTabs } from "./aop-editor-tabs.js";
import { getStepConfig } from "./step-configs.js";

const stepConfig = getStepConfig();
const activeTools = getToolsForStep(window.CURRENT_STEP || "account_research");

const toolbarEl = document.getElementById("toolbar");
const editorEl = document.getElementById("editor");
const btnUndo = document.getElementById("btn-undo");
const btnRedo = document.getElementById("btn-redo");
const btnReset = document.getElementById("btn-reset");
const toolsStatsEl = document.getElementById("tools-stats");
const toolsLibraryTrigger = document.getElementById("tools-library-trigger");
const toolsLibraryPopover = document.getElementById("tools-library-popover");
const toolsLibraryList = document.getElementById("tools-library-list");
const toolsLibraryDetail = document.getElementById("tools-library-detail");
const slashSuggestionEl = document.getElementById("slash-suggestion");
const toolTooltipEl = document.getElementById("tool-tooltip");

let editor = null;
let slashSuggestion = null;
let selectedTemplate = null;
let popoverOpen = false;
let detailTool = null;
let lastEditorRange = null;

function updateStats() {
  if (!editor) return;
  const count = editor.getMentionCount();
  if (toolsStatsEl) {
    toolsStatsEl.textContent = `${count} used`;
  }
}

// ---------- Editor & Slash ----------
editor = createEditor(editorEl);
if (!editor) throw new Error("Editor element not found");

slashSuggestion = createSlashSuggestion(
  slashSuggestionEl,
  editorEl,
  (range, tool) => {
    editor.replaceRangeWithTool(range, tool);
    updateStats();
  },
  activeTools
);

if (slashSuggestion) {
  editorEl.addEventListener("input", () => {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0).cloneRange();
    if (!range.collapsed || range.startOffset < 1) return;
    range.setStart(range.startContainer, range.startOffset - 1);
    if (range.toString() === "/") {
      slashSuggestion.show(range, "");
    }
  });
}

editorEl.addEventListener("keydown", (e) => {
  if (slashSuggestion?.isOpen?.() && ["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
    return;
  }
});

// Watch for any tool-mention DOM changes (add/remove/dismiss) and update the counter
new MutationObserver(() => updateStats()).observe(editorEl, { childList: true, subtree: true });

// Init tab system – loads the step's default template content into the editor
const defaultTemplate = AGENT_TEMPLATES.find(t => t.id === stepConfig.defaultTemplateId);
if (defaultTemplate) {
  initTabs(toolbarEl, editor, defaultTemplate.content);
  updateStats();
}

// ---------- Tooltip (tool badges) ----------
createTooltip(toolTooltipEl, editorEl);

// ---------- Toolbar ----------
if (btnUndo) btnUndo.addEventListener("click", () => { editor.undo(); updateStats(); });
if (btnRedo) btnRedo.addEventListener("click", () => { editor.redo(); updateStats(); });
if (btnReset) {
  btnReset.addEventListener("click", () => {
    if (selectedTemplate) editor.setContent(selectedTemplate.content);
    updateStats();
  });
}

// ---------- Tools library popover ----------
function renderToolsList() {
  if (!toolsLibraryList) return;
  const usedIds = new Set((editor.getUsedTools() || []).map((t) => t.id));
  toolsLibraryList.innerHTML = "";
  toolsLibraryList.classList.remove("hidden");
  toolsLibraryDetail.classList.add("hidden");
  detailTool = null;

  const header = document.createElement("div");
  header.className = "popover-header";
  header.innerHTML = `
    <h4 class="popover-title">Available Tools</h4>
  `;
  toolsLibraryList.appendChild(header);

  activeTools.forEach((tool) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "popover-item";
    const iconSvg = getToolIconSvg(tool.icon);
    const inUse = usedIds.has(tool.id);
    btn.innerHTML = `
      <span class="popover-item-icon">${iconSvg}</span>
      <div class="popover-item-body">
        <div class="popover-item-name">${escapeHtml(tool.name)}${inUse ? ' <span class="in-use-badge">✓ In use</span>' : ""}</div>
        <div class="popover-item-desc">${inUse ? "Added | In use" : "Added | Not in use"}</div>
      </div>
    `;
    btn.addEventListener("click", () => showToolDetail(tool));
    btn.querySelectorAll(".popover-item-icon svg").forEach((svg) => svg.classList.add("slds-icon_x-small"));
    toolsLibraryList.appendChild(btn);
  });
}

function renderExampleLine(text, badgeHtml) {
  const parts = text.split(/\{\{tool\}\}/);
  const content = parts
    .map((p, i) => escapeHtml(p) + (i < parts.length - 1 ? badgeHtml : ""))
    .join("");
  return `<span class="slash-suggestion-detail-description slds-m-bottom_xx-small">${content}</span>`;
}

function wireTabClicks(container, tabs, badgeHtml) {
  const tabItems = container.querySelectorAll(".tab-nav-cycler .slds-item > div");
  const exampleEl = container.querySelector(".tab-nav-example");
  if (!tabItems.length || !exampleEl) return;

  tabItems.forEach((tabDiv, i) => {
    tabDiv.addEventListener("click", () => {
      const active = container.querySelector(".tab-nav-cycler .slds-item-active");
      if (active) {
        active.classList.remove("slds-item-active");
        active.classList.add("slds-item-inactive");
      }
      tabDiv.classList.remove("slds-item-inactive");
      tabDiv.classList.add("slds-item-active");
      exampleEl.innerHTML = renderExampleLine(tabs[i].example, badgeHtml);
    });
  });
}

function showToolDetail(tool) {
  detailTool = tool;
  toolsLibraryList.classList.add("hidden");
  toolsLibraryDetail.classList.remove("hidden");

  const useCase = tool.useCase != null ? tool.useCase : tool.description;
  const badgeHtml = buildToolBadgeHtml(tool);
  const tabs = Array.isArray(tool.tabs) ? tool.tabs.slice(0, 3) : [];

  if (tabs.length > 0) {
    const tabNavHtml = tabs.map((tab, i) =>
      `<li class="slds-item"><div class="${i === 0 ? 'slds-item-active' : 'slds-item-inactive'}">${escapeHtml(tab.label)}</div></li>`
    ).join("");
    toolsLibraryDetail.innerHTML = `
      <button type="button" class="popover-back" id="tools-detail-back">← Back to tools</button>
      <div class="popover-header">
        <h4 class="popover-title">${escapeHtml(tool.name)}</h4>
      </div>
      <div class="slash-suggest-detail-content__header">
        <p class="slash-suggestion-detail-title">Use Case</p>
        <p class="slash-suggestion-detail-description">${escapeHtml(useCase)}</p>
      </div>
      <div class="slash-suggest-detail-content__body">
        <p class="slash-suggestion-detail-title">Example Usage</p>
        <ul class="slds-list_horizontal slds-m-top_small slds-m-bottom_small slds-has-dividers_right tab-nav-cycler">
          ${tabNavHtml}
        </ul>
        <div class="slds-grid slds-grid_vertical tab-nav-example">${renderExampleLine(tabs[0].example, badgeHtml)}</div>
      </div>
    `;
    wireTabClicks(toolsLibraryDetail, tabs, badgeHtml);
  } else {
    const examples = Array.isArray(tool.exampleUsage) ? tool.exampleUsage : [];
    const exampleLinesHtml = examples.map((ex) => renderExampleLine(ex, badgeHtml)).join("");
    toolsLibraryDetail.innerHTML = `
      <button type="button" class="popover-back" id="tools-detail-back">← Back to tools</button>
      <div class="popover-header">
        <h4 class="popover-title">${escapeHtml(tool.name)}</h4>
      </div>
      <div class="slash-suggest-detail-content__header">
        <p class="slash-suggestion-detail-title">Use Case</p>
        <p class="slash-suggestion-detail-description">${escapeHtml(useCase)}</p>
      </div>
      <div class="slash-suggest-detail-content__body">
        <p class="slash-suggestion-detail-title">Example Usage</p>
        <div class="slds-grid slds-grid_vertical">${exampleLinesHtml}</div>
      </div>
    `;
  }

  const backBtn = toolsLibraryDetail.querySelector("#tools-detail-back");
  if (backBtn) backBtn.addEventListener("click", () => renderToolsList());
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

if (toolsLibraryTrigger) {
  toolsLibraryTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    lastEditorRange = editor.getSelectionRange();
    if (typeof window.openToolsModal === "function") {
      window.openToolsModal();
    }
  });
}

window.insertExampleBullet = function (exampleText, toolName, atRange, replace) {
  if (!editor || !editorEl) return;
  const tool = activeTools.find(t => t.name === toolName) || getToolById(toolName);
  const badgeHtml = tool
    ? buildToolBadgeHtml(tool, { dismissable: true })
    : escapeHtml(toolName);

  const idx = exampleText.indexOf(toolName);
  let bulletHtml;
  if (idx !== -1) {
    bulletHtml = escapeHtml(exampleText.slice(0, idx)) + badgeHtml + escapeHtml(exampleText.slice(idx + toolName.length));
  } else {
    bulletHtml = escapeHtml(exampleText);
  }

  const li = document.createElement("li");
  li.innerHTML = bulletHtml;
  li.classList.add("flash-highlight");
  const badge = li.querySelector(".tool-mention");
  if (badge) badge.classList.add("flash-highlight");
  li.addEventListener("animationend", () => {
    li.classList.remove("flash-highlight");
    if (badge) badge.classList.remove("flash-highlight");
  }, { once: true });
  let inserted = false;

  const range = atRange || lastEditorRange;
  if (range && editorEl.contains(range.startContainer)) {
    const anchorNode = range.startContainer.nodeType === 1
      ? range.startContainer
      : range.startContainer.parentElement;
    const cursorLi = anchorNode?.closest("li");

    if (cursorLi && editorEl.contains(cursorLi)) {
      if (replace || !cursorLi.textContent.trim()) {
        cursorLi.replaceWith(li);
      } else {
        cursorLi.after(li);
      }
      inserted = true;
    }
  }

  if (!inserted) {
    const lists = editorEl.querySelectorAll("ul");
    const targetList = lists.length ? lists[lists.length - 1] : null;
    if (targetList) {
      targetList.appendChild(li);
    } else {
      const ul = document.createElement("ul");
      ul.appendChild(li);
      editorEl.appendChild(ul);
    }
  }

  requestAnimationFrame(() => {
    li.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  lastEditorRange = null;
  updateStats();
};

let ghostBulletEl = null;

window.showGhostBullet = function (exampleText, toolName, targetLi) {
  window.removeGhostBullet();
  if (!targetLi || !editorEl) return;

  const tool = activeTools.find(t => t.name === toolName) || getToolById(toolName);
  const badgeHtml = tool
    ? buildToolBadgeHtml(tool, { dismissable: false })
    : escapeHtml(toolName);

  const idx = exampleText.indexOf(toolName);
  let bulletHtml;
  if (idx !== -1) {
    bulletHtml = escapeHtml(exampleText.slice(0, idx)) + badgeHtml + escapeHtml(exampleText.slice(idx + toolName.length));
  } else {
    bulletHtml = escapeHtml(exampleText);
  }

  const li = document.createElement("li");
  li.innerHTML = bulletHtml;
  li.classList.add("ghost-bullet");

  targetLi.after(li);
  targetLi.style.setProperty("display", "none");

  ghostBulletEl = li;
};

window.removeGhostBullet = function () {
  if (ghostBulletEl && ghostBulletEl.parentNode) {
    const prev = ghostBulletEl.previousElementSibling;
    if (prev && prev.style.display === "none") {
      prev.style.removeProperty("display");
    }
    ghostBulletEl.remove();
    ghostBulletEl = null;
  }
};

