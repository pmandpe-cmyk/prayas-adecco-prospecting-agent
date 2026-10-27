/**
 * Slash command "/" suggestion: show dropdown, filter tools, keyboard nav, insert on select.
 */

import { getToolIconSvg, buildToolBadgeHtml } from "./tools-data.js";

const MAX_ITEMS = 10;

/**
 * @param {HTMLElement} dropdownEl - #slash-suggestion
 * @param {HTMLElement} editorEl - contenteditable
 * @param {(range: Range, tool: object) => void} onSelect - replace range with tool
 * @param {object[]} [tools] - filtered tools for this step (defaults to all)
 */
export function createSlashSuggestion(dropdownEl, editorEl, onSelect, tools) {
  const toolsList = tools || [];
  let open = false;
  let selectedIndex = -1; // -1 = no selection when popover opens
  let filtered = [];
  let triggerRange = null; // Range that includes "/" and query (start fixed, end = current cursor)
  let triggerLi = null; // The <li> element where "/" was typed

  const listEl = dropdownEl.querySelector(".slash-suggestion-list");
  const detailEl = dropdownEl.querySelector(".slash-suggestion-detail");
  if (!listEl) return null;

  const DETAIL_GAP_PX = 8;
  const DETAIL_HIDE_DELAY = 200;
  let detailHideTimer = null;
  let lastMouseX = -1;
  let lastMouseY = -1;
  let mouseMovedSinceKeyboard = true;

  listEl.addEventListener("mousemove", (e) => {
    if (e.clientX !== lastMouseX || e.clientY !== lastMouseY) {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      mouseMovedSinceKeyboard = true;
    }
  });

  function scheduleHideDetail() {
    detailHideTimer = setTimeout(() => hideDetail(), DETAIL_HIDE_DELAY);
  }

  function cancelHideDetail() {
    if (detailHideTimer) {
      clearTimeout(detailHideTimer);
      detailHideTimer = null;
    }
  }

  listEl.addEventListener("mouseleave", () => scheduleHideDetail());

  if (detailEl) {
    detailEl.addEventListener("mouseenter", () => cancelHideDetail());
    detailEl.addEventListener("mouseleave", () => scheduleHideDetail());
  }

  let activeExample = { text: "", toolName: "" };

  function renderExampleLine(text, badgeHtml) {
    const parts = text.split(/\{\{tool\}\}/);
    const content = parts
      .map((p, i) => escapeHtml(p) + (i < parts.length - 1 ? badgeHtml : ""))
      .join("");
    return `<span class="slash-suggestion-detail-description slds-m-bottom_xx-small">${content}</span>`;
  }

  function renderExampleContainer(text, badgeHtml, toolName) {
    const exampleLineHtml = renderExampleLine(text, badgeHtml);
    return `<div class="slash-suggestion-container slds-p-around_x-small">
      ${exampleLineHtml}
      <button class="slds-button slds-button_icon slds-button_icon-border-filled use-btn" title="add-to-aop">
        <svg class="slds-button__icon" aria-hidden="true">
          <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#add"></use>
        </svg>
        <span class="slds-assistive-text">add</span>
      </button>
    </div>`;
  }

  function resolveExampleText(rawText, toolName) {
    return rawText.replace(/\{\{tool\}\}/g, toolName);
  }

  function wireUseButton(containerEl, toolName) {
    const btn = containerEl.querySelector(".use-btn");
    if (!btn) return;
    containerEl.addEventListener("mouseenter", () => {
      window.showGhostBullet?.(activeExample.text, activeExample.toolName, triggerLi);
    });
    containerEl.addEventListener("mouseleave", () => {
      window.removeGhostBullet?.();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.removeGhostBullet?.();
      window.insertExampleBullet?.(activeExample.text, activeExample.toolName, triggerRange, true);
      hide();
    });
  }

  function wireTabClicks(contentEl, tabs, badgeHtml, toolName) {
    const tabItems = contentEl.querySelectorAll(".tab-nav-cycler .slds-item > div");
    const exampleEl = contentEl.querySelector(".tab-nav-example");
    if (!tabItems.length || !exampleEl) return;

    tabItems.forEach((tabDiv, i) => {
      tabDiv.addEventListener("click", () => {
        const active = contentEl.querySelector(".tab-nav-cycler .slds-item-active");
        if (active) {
          active.classList.remove("slds-item-active");
          active.classList.add("slds-item-inactive");
        }
        tabDiv.classList.remove("slds-item-inactive");
        tabDiv.classList.add("slds-item-active");
        activeExample = { text: resolveExampleText(tabs[i].example, toolName), toolName };
        exampleEl.innerHTML = renderExampleContainer(tabs[i].example, badgeHtml, toolName);
        wireUseButton(exampleEl, toolName);
      });
    });
  }

  function showDetailFor(tool, itemEl) {
    if (!detailEl) return;
    cancelHideDetail();
    const dropdownRect = dropdownEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();
    detailEl.style.left = `${dropdownRect.right + DETAIL_GAP_PX}px`;
    detailEl.style.top = `${itemRect.top}px`;
    const contentEl = detailEl.querySelector(".slash-suggestion-detail-content");
    if (contentEl) {
      const useCase = tool.useCase != null ? tool.useCase : tool.description;
      const badgeHtml = buildToolBadgeHtml(tool);
      const tabs = Array.isArray(tool.tabs) ? tool.tabs.slice(0, 3) : [];

      if (tabs.length > 0) {
        activeExample = { text: resolveExampleText(tabs[0].example, tool.name), toolName: tool.name };
        const tabNavHtml = tabs.map((tab, i) =>
          `<li class="slds-item"><div class="${i === 0 ? 'slds-item-active' : 'slds-item-inactive'}">${escapeHtml(tab.label)}</div></li>`
        ).join("");
        contentEl.innerHTML = `
          <div class="slash-suggest-detail-content__header">
            <p class="slash-suggestion-detail-title">Use Case</p>
            <p class="slash-suggestion-detail-description">${escapeHtml(useCase)}</p>
          </div>
          <div class="slash-suggest-detail-content__body">
            <p class="slash-suggestion-detail-title">Try an example</p>
            <ul class="slds-list_horizontal slds-m-top_small slds-m-bottom_small slds-has-dividers_right tab-nav-cycler">
              ${tabNavHtml}
            </ul>
            <div class="slds-grid slds-grid_vertical tab-nav-example">${renderExampleContainer(tabs[0].example, badgeHtml, tool.name)}</div>
          </div>`;
        wireTabClicks(contentEl, tabs, badgeHtml, tool.name);
        wireUseButton(contentEl.querySelector(".tab-nav-example"), tool.name);
      } else {
        const examples = Array.isArray(tool.exampleUsage) ? tool.exampleUsage : [];
        const firstExample = examples[0] || "";
        activeExample = { text: resolveExampleText(firstExample, tool.name), toolName: tool.name };
        const exampleContainersHtml = examples.map((ex) => renderExampleContainer(ex, badgeHtml, tool.name)).join("");
        contentEl.innerHTML = `
          <div class="slash-suggest-detail-content__header">
            <p class="slash-suggestion-detail-title">Use Case</p>
            <p class="slash-suggestion-detail-description">${escapeHtml(useCase)}</p>
          </div>
          <div class="slash-suggest-detail-content__body">
            <p class="slash-suggestion-detail-title">Try an example</p>
            <div class="slds-grid slds-grid_vertical">${exampleContainersHtml}</div>
          </div>`;
        contentEl.querySelectorAll(".slash-suggestion-container").forEach((container, i) => {
          const btn = container.querySelector(".use-btn");
          if (!btn) return;
          container.addEventListener("mouseenter", () => {
            activeExample = { text: resolveExampleText(examples[i], tool.name), toolName: tool.name };
            window.showGhostBullet?.(activeExample.text, activeExample.toolName, triggerLi);
          });
          container.addEventListener("mouseleave", () => {
            window.removeGhostBullet?.();
          });
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            window.removeGhostBullet?.();
            window.insertExampleBullet?.(resolveExampleText(examples[i], tool.name), tool.name, triggerRange, true);
            hide();
          });
        });
      }
    }
    detailEl.classList.remove("hidden");
    detailEl.setAttribute("aria-hidden", "false");
  }

  function hideDetail() {
    if (!detailEl) return;
    detailEl.classList.add("hidden");
    detailEl.setAttribute("aria-hidden", "true");
  }

  /** Show detail for current keyboard selection, or hide if none selected. */
  function syncDetailToSelection() {
    if (selectedIndex >= 0 && selectedIndex < filtered.length) {
      const itemEl = listEl.children[selectedIndex];
      if (itemEl) showDetailFor(filtered[selectedIndex], itemEl);
    } else {
      hideDetail();
    }
  }

  function positionDropdown() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0).cloneRange();
    const rect = range.getBoundingClientRect();
    dropdownEl.style.left = `${rect.left}px`;
    dropdownEl.style.top = `${rect.bottom + 4}px`;
  }

  function filterItems(query) {
    const q = (query || "").toLowerCase().trim();
    return toolsList.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)
    ).slice(0, MAX_ITEMS);
  }

  function renderList() {
    listEl.innerHTML = "";
    filtered.forEach((tool, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slash-suggestion-item" + (selectedIndex >= 0 && index === selectedIndex ? " selected" : "");
      btn.setAttribute("role", "option");
      const iconColorClass = tool.color ? `slash-suggestion-item-icon--${tool.color}` : "";
      btn.innerHTML = `
        <span class="slash-suggestion-item-icon ${iconColorClass}">${getToolIconSvg(tool.icon)}</span>
        <div class="slash-suggestion-item-body">
          <div class="slash-suggestion-item-name">${escapeHtml(tool.name)}</div>
        </div>
      `;
      btn.addEventListener("click", () => selectTool(tool));
      btn.addEventListener("mouseenter", () => {
        if (!mouseMovedSinceKeyboard) return;
        listEl.classList.remove("keyboard-nav");
        selectedIndex = index;
        listEl.querySelectorAll(".slash-suggestion-item.selected").forEach((el) => el.classList.remove("selected"));
        btn.classList.add("selected");
        showDetailFor(tool, btn);
      });
      listEl.appendChild(btn);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function selectTool(tool) {
    if (!triggerRange || typeof onSelect !== "function") return;
    onSelect(triggerRange, tool);
    hide();
    editorEl.focus();
  }

  function show(initialRange, query) {
    triggerRange = initialRange;
    const startNode = initialRange.startContainer;
    const el = startNode.nodeType === 1 ? startNode : startNode.parentElement;
    triggerLi = el?.closest("li") || null;
    filtered = filterItems(query);
    selectedIndex = -1; // no item selected on open
    open = true;
    dropdownEl.classList.remove("hidden");
    hideDetail();
    renderList();
    positionDropdown();
  }

  function hide() {
    open = false;
    triggerRange = null;
    triggerLi = null;
    dropdownEl.classList.add("hidden");
    hideDetail();
    window.removeGhostBullet?.();
  }

  function updateQuery(query) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && triggerRange) {
      try {
        triggerRange.setEnd(sel.anchorNode, sel.anchorOffset);
      } catch (_) {}
    }
    filtered = filterItems(query);
    selectedIndex = selectedIndex < 0 ? -1 : Math.min(selectedIndex, Math.max(0, filtered.length - 1));
    renderList();
    positionDropdown();
    syncDetailToSelection();
  }

  function handleKeydown(e) {
    if (!open) return false;
    if (e.key === "Escape") {
      hide();
      editorEl.focus();
      e.preventDefault();
      return true;
    }
    if (e.key === "ArrowDown") {
      const n = filtered.length;
      selectedIndex = selectedIndex < n - 1 ? selectedIndex + 1 : (n > 0 ? 0 : -1);
      mouseMovedSinceKeyboard = false;
      listEl.classList.add("keyboard-nav");
      renderList();
      syncDetailToSelection();
      e.preventDefault();
      return true;
    }
    if (e.key === "ArrowUp") {
      const n = filtered.length;
      selectedIndex = selectedIndex <= 0 ? (n > 0 ? n - 1 : -1) : selectedIndex - 1;
      mouseMovedSinceKeyboard = false;
      listEl.classList.add("keyboard-nav");
      renderList();
      syncDetailToSelection();
      e.preventDefault();
      return true;
    }
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < filtered.length) {
        selectTool(filtered[selectedIndex]);
      }
      e.preventDefault();
      return true;
    }
    return false;
  }

  editorEl.addEventListener("keydown", (e) => {
    if (handleKeydown(e)) return;
    if (!open) return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Typing: update query after this key is applied
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const range = document.createRange();
        range.setStart(triggerRange.startContainer, triggerRange.startOffset);
        range.setEnd(sel.anchorNode, sel.anchorOffset);
        const text = range.toString();
        const query = text.startsWith("/") ? text.slice(1) : text;
        updateQuery(query);
      }, 0);
    }
  });

  // Close slash suggestion when user clicks outside it (main list or secondary detail popover)
  document.addEventListener("mousedown", (e) => {
    if (!open) return;
    if (dropdownEl.contains(e.target)) return;
    hide();
    editorEl.focus();
  });

  return { show, hide, updateQuery, isOpen: () => open, getFiltered: () => filtered };
}

/**
 * Start watching editor for "/" and open suggestion.
 * @param {HTMLElement} editorEl
 * @param {HTMLElement} dropdownEl
 * @param {object} editor - editor API with replaceRangeWithTool, getSelectionRange
 */
export function watchSlashTrigger(editorEl, dropdownEl, editor, slashSuggestion) {
  editorEl.addEventListener("input", (e) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0).cloneRange();
    if (range.collapsed && range.startOffset > 0) {
      range.setStart(range.startContainer, range.startOffset - 1);
      const text = range.toString();
      if (text === "/") {
        slashSuggestion.show(range, "");
        e.preventDefault = () => {};
      }
    }
  });

  editorEl.addEventListener("keydown", (e) => {
    if (e.key === "/") {
      // Let "/" be inserted, then on input we'll open
    }
  });
}
