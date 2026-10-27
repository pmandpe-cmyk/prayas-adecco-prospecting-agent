/**
 * AOP Tabs – manages segment pills in the toolbar.
 * Each tab stores its own editor HTML; switching tabs saves/restores content.
 */

import { NEW_SEGMENT_TEMPLATES } from "./templates-data.js";
import { getStepConfig } from "./step-configs.js";

let tabs = [];
let activeTabId = null;
let editor = null;
let defaultContent = "";
let containerEl = null;
let nextId = 1;
let editingTabId = null;

const ICON_BASE = "/assets/icons/utility-sprite/svg/symbols.svg";

function persistTabs() {
  const key = "aop-tabs-" + (window.CURRENT_STEP || "default");
  saveActiveContent();
  sessionStorage.setItem(key, JSON.stringify({ tabs, activeTabId, nextId }));
}

function dispatchTabsChanged() {
  document.dispatchEvent(new CustomEvent("aop-tabs-changed", {
    detail: {
      tabs: tabs.map(t => ({ id: t.id, name: t.name })),
      activeTabId
    }
  }));
}

export function getTabs() {
  return tabs.map(t => ({ id: t.id, name: t.name }));
}

export function getActiveTabId() {
  return activeTabId;
}

function uid() {
  return "tab_" + nextId++;
}

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

function saveActiveContent() {
  if (!editor || !activeTabId) return;
  const tab = tabs.find((t) => t.id === activeTabId);
  if (tab) tab.content = editor.getContent();
}

function activateTab(id) {
  saveActiveContent();
  activeTabId = id;
  const tab = tabs.find((t) => t.id === id);
  if (tab) editor.setContent(tab.content);
  renderTabs();
}

function removeTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;
  tabs.splice(idx, 1);
  if (activeTabId === id) {
    const next = tabs[Math.min(idx, tabs.length - 1)];
    activeTabId = next ? next.id : null;
    if (next) editor.setContent(next.content);
  }
  renderTabs();
}

function buildPill(tab) {
  const isActive = tab.id === activeTabId;
  const isFirst = tabs.indexOf(tab) === 0;

  const pill = document.createElement("span");
  pill.className = "slds-pill slds-pill_link aop-node-pill" + (isActive ? " aop-node-pill-active" : "");
  pill.dataset.tabId = tab.id;

  pill.innerHTML = `
    <span class="slds-pill__icon_container slds-current-color">
      <svg class="slds-icon slds-icon_xx-small" aria-hidden="true">
        <use xlink:href="${ICON_BASE}#${escapeHtml(tab.icon)}"></use>
      </svg>
    </span>
    <a href="#" class="slds-pill__action aop-node-pill slds-m-horizontal_xx-small${isFirst ? " slds-p-right_small" : ""}" title="${escapeHtml(tab.name)}">
      <span class="slds-pill__label">${escapeHtml(tab.name)}</span>
    </a>
    ${isFirst ? "" : `
    <div class="slds-dropdown-trigger slds-dropdown-trigger_click aop-tab-overflow">
      <button class="slds-button slds-button_icon slds-button_icon slds-pill__remove" aria-haspopup="true" title="More options">
        <svg class="slds-button__icon slds-icon-text-default" aria-hidden="true">
          <use xlink:href="${ICON_BASE}#chevrondown"></use>
        </svg>
        <span class="slds-assistive-text">More options</span>
      </button>
      <div class="slds-dropdown slds-dropdown_xx-small slds-dropdown_right">
        <ul class="slds-dropdown__list" role="menu" aria-label="More options">
          <li class="slds-dropdown__item" role="presentation">
            <a href="#" role="menuitem" tabindex="0" data-action="edit">
              <span title="Edit">Edit</span>
            </a>
          </li>
          <li class="slds-dropdown__item" role="presentation">
            <a href="#" role="menuitem" tabindex="-1" data-action="delete">
              <span title="Delete">Delete</span>
            </a>
          </li>
        </ul>
      </div>
    </div>`}
  `;

  pill.querySelector(".slds-pill__action").addEventListener("click", (e) => {
    e.preventDefault();
    if (tab.id !== activeTabId) activateTab(tab.id);
  });

  const overflowBtn = pill.querySelector(".aop-tab-overflow > .slds-button");
  if (overflowBtn) {
    overflowBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const trigger = overflowBtn.parentNode;
      const wasOpen = trigger.classList.contains("slds-is-open");
      closeAllDropdowns();
      if (!wasOpen) trigger.classList.add("slds-is-open");
    });
  }

  const editAction = pill.querySelector('[data-action="edit"]');
  if (editAction) {
    editAction.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllDropdowns();
      openModal(tab.id);
    });
  }

  const deleteAction = pill.querySelector('[data-action="delete"]');
  if (deleteAction) {
    deleteAction.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllDropdowns();
      removeTab(tab.id);
    });
  }

  return pill;
}

function buildAddPill() {
  const pill = document.createElement("span");
  pill.className = "slds-pill slds-pill_link aop-node-pill";

  pill.innerHTML = `
    <span class="slds-pill__icon_container slds-current-color">
      <svg class="slds-icon slds-icon_xx-small" aria-hidden="true">
        <use xlink:href="${ICON_BASE}#add"></use>
      </svg>
    </span>
    <a href="#" class="slds-pill__action aop-node-pill aop-node-pill-add-button slds-m-horizontal_xx-small" title="Add segment">
      <span class="slds-pill__label">Add</span>
    </a>
  `;

  pill.querySelector(".slds-pill__action").addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  return pill;
}

function closeAllDropdowns() {
  document.querySelectorAll("#aop-tabs .slds-dropdown-trigger_click.slds-is-open")
    .forEach((el) => el.classList.remove("slds-is-open"));
}

function renderTabs() {
  if (!containerEl) return;
  containerEl.innerHTML = "";
  tabs.forEach((tab) => containerEl.appendChild(buildPill(tab)));
  containerEl.appendChild(buildAddPill());
  dispatchTabsChanged();
}

/* ── Modal ── */
function openModal(tabId) {
  editingTabId = tabId || null;
  const modal = document.getElementById("add-segment-modal");
  const backdrop = document.getElementById("add-segment-backdrop");
  const input = document.getElementById("segment-name-input");
  const heading = document.getElementById("add-segment-heading");
  if (!modal || !backdrop) return;

  if (editingTabId) {
    const tab = tabs.find((t) => t.id === editingTabId);
    if (input) input.value = tab ? tab.name : "";
    if (heading) heading.textContent = "Edit Instructions";
  } else {
    if (input) input.value = "";
    if (heading) heading.textContent = "Add Instructions";
  }

  modal.style.display = "";
  backdrop.style.display = "";
  modal.classList.add("slds-fade-in-open");
  backdrop.classList.add("slds-backdrop_open");
  if (input) input.focus();
  updateSaveBtn();
}

function closeModal() {
  editingTabId = null;
  const modal = document.getElementById("add-segment-modal");
  const backdrop = document.getElementById("add-segment-backdrop");
  if (!modal || !backdrop) return;

  modal.classList.remove("slds-fade-in-open");
  backdrop.classList.remove("slds-backdrop_open");
  modal.style.display = "none";
  backdrop.style.display = "none";
}

function updateSaveBtn() {
  const input = document.getElementById("segment-name-input");
  const saveBtn = document.getElementById("segment-save-btn");
  if (input && saveBtn) {
    saveBtn.disabled = !input.value.trim();
  }
}

function handleSave() {
  const input = document.getElementById("segment-name-input");
  const name = input ? input.value.trim() : "";
  if (!name) return;

  if (editingTabId) {
    const tab = tabs.find((t) => t.id === editingTabId);
    if (tab) tab.name = name;
    renderTabs();
    closeModal();
  } else {
    saveActiveContent();
    const stepKey = window.CURRENT_STEP || "account_research";
    const segmentContent = NEW_SEGMENT_TEMPLATES[stepKey] || NEW_SEGMENT_TEMPLATES.account_research;
    const newTab = { id: uid(), name, icon: "display_text", content: segmentContent };
    tabs.push(newTab);
    activeTabId = newTab.id;
    editor.setContent(newTab.content);
    renderTabs();
    closeModal();
  }
}

function wireModal() {
  const cancelBtn = document.getElementById("segment-cancel-btn");
  const closeBtn = document.getElementById("segment-close-btn");
  const saveBtn = document.getElementById("segment-save-btn");
  const input = document.getElementById("segment-name-input");

  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (saveBtn) saveBtn.addEventListener("click", handleSave);
  if (input) {
    input.addEventListener("input", updateSaveBtn);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) handleSave();
    });
  }
}

/* ── Public init ── */
export function initTabs(toolbarEl, editorInstance, templateContent) {
  editor = editorInstance;
  defaultContent = templateContent;

  containerEl = document.getElementById("aop-tabs");
  if (!containerEl) return;

  const storageKey = "aop-tabs-" + (window.CURRENT_STEP || "default");
  const saved = sessionStorage.getItem(storageKey);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      tabs = data.tabs;
      activeTabId = data.activeTabId;
      nextId = data.nextId || tabs.length + 1;
    } catch (_) {
      tabs = [{ id: uid(), name: "Default", icon: "display_text", content: defaultContent }];
      activeTabId = tabs[0].id;
    }
  } else {
    tabs = [{ id: uid(), name: "Default", icon: "display_text", content: defaultContent }];
    activeTabId = tabs[0].id;
  }

  const active = tabs.find(t => t.id === activeTabId);
  editor.setContent(active ? active.content : defaultContent);
  renderTabs();
  wireModal();

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".aop-tab-overflow")) closeAllDropdowns();
  });

  document.addEventListener("aop-tab-activate", (e) => {
    const id = e.detail && e.detail.tabId;
    if (id && id !== activeTabId && tabs.some(t => t.id === id)) {
      activateTab(id);
    }
  });

  window.addEventListener("beforeunload", persistTabs);
}
