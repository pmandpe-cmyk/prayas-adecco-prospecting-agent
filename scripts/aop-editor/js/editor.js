/**
 * Contenteditable editor: content, tool mentions, stats, dismiss, locked elements (data-locked="true").
 */

import { getToolById, buildToolBadgeHtml } from "./tools-data.js";

/** Selector for any locked element: data-locked="true" or data-lock / data-lock="true" (alias) */
const LOCKED_SELECTOR = "[data-locked=\"true\"], [data-lock], [data-lock=\"true\"]";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

const BLOCK_TAGS = new Set([
  "DIV","P","H1","H2","H3","H4","H5","H6","LI","BLOCKQUOTE","PRE",
  "UL","OL","SECTION","ARTICLE","ASIDE","HEADER","FOOTER","NAV","MAIN",
]);

function isBlockElement(node) {
  return node.nodeType === 1 && BLOCK_TAGS.has(node.tagName);
}

/** Locked element: has data-locked="true" or data-lock or data-lock="true" (alias) */
function isLockedElement(node) {
  if (!node) return false;
  const el = node.nodeType === 1 ? node : node.parentElement;
  if (!el) return false;
  const lockedEl = el.closest?.(LOCKED_SELECTOR) ?? null;
  if (!lockedEl) return false;
  const locked = lockedEl.getAttribute("data-locked");
  const lock = lockedEl.getAttribute("data-lock");
  return locked === "true" || lock === "" || lock === "true";
}

/** Normalize locked elements: set contenteditable="false" and data-locked="true" (keep data-lock as alias if present).
 *  For elements with data-info, insert a locked blockquote as the next sibling. */
function applyLockedElements(container) {
  if (!container) return;
  container.querySelectorAll(LOCKED_SELECTOR).forEach((lockedEl) => {
    lockedEl.setAttribute("data-locked", "true");
    lockedEl.setAttribute("contenteditable", "false");

    const infoText = lockedEl.getAttribute("data-info");
    if (infoText) {
      const nextSib = lockedEl.nextElementSibling;
      if (nextSib && nextSib.classList.contains("locked-info-blockquote")) return;
      const bq = document.createElement("blockquote");
      bq.className = "locked-info-blockquote";
      bq.setAttribute("data-locked", "true");
      bq.setAttribute("contenteditable", "false");
      bq.textContent = infoText;
      lockedEl.parentNode.insertBefore(bq, lockedEl.nextSibling);
    }
  });
}

/**
 * Next node in document order from (startContainer, startOffset), staying inside container.
 * Returns the node that would be affected by deleteContentForward.
 */
function getNextNodeInDocumentOrder(container, range) {
  let n = range.startContainer;
  let o = range.startOffset;
  if (n.nodeType === 3) {
    if (o < n.length) return n;
    n = n.parentNode;
    const idx = n ? Array.from(n.childNodes).indexOf(range.startContainer) : -1;
    if (idx === -1) return null;
    o = idx + 1;
  }
  if (!n || n.nodeType !== 1 || !container.contains(n)) return null;
  if (o < n.childNodes.length) return n.childNodes[o];
  while (n && n !== container) {
    const nextSib = n.nextSibling;
    if (nextSib && container.contains(nextSib)) return nextSib;
    n = n.parentNode;
  }
  return null;
}

/**
 * Previous node in document order from (startContainer, startOffset), staying inside container.
 * Returns the node that would be affected by deleteContentBackward.
 */
function getPreviousNodeInDocumentOrder(container, range) {
  let n = range.startContainer;
  let o = range.startOffset;
  if (n.nodeType === 3) {
    if (o > 0) return n;
    n = n.parentNode;
    const idx = n ? Array.from(n.childNodes).indexOf(range.startContainer) : -1;
    if (idx === -1) return null;
    o = idx;
  }
  if (!n || n.nodeType !== 1 || !container.contains(n)) return null;
  if (o > 0) return n.childNodes[o - 1];
  while (n && n !== container) {
    const prevSib = n.previousSibling;
    if (prevSib && container.contains(prevSib)) return prevSib;
    n = n.parentNode;
  }
  return null;
}

/** True if node is a locked element or is contained inside a locked element (within container). */
function isNodeLockedOrInsideLocked(container, node) {
  if (!node || !container.contains(node)) return false;
  const el = node.nodeType === 1 ? node : node.parentElement;
  if (!el) return false;
  const locked = el.closest(LOCKED_SELECTOR);
  return locked && container.contains(locked) && isLockedElement(locked);
}

/** Collapsed range that starts immediately before node (stays inside container). */
function rangeBeforeNode(container, node) {
  const r = document.createRange();
  r.setStartBefore(node);
  r.collapse(true);
  return r;
}

/** Collapsed range that starts immediately after node (stays inside container). */
function rangeAfterNode(container, node) {
  const r = document.createRange();
  r.setEndAfter(node);
  r.collapse(false);
  return r;
}

/** True if the current selection would be affected by Backspace or Delete touching a locked element */
function wouldDeletionAffectLockedElement(container, isBackspace) {
  const sel = window.getSelection();
  if (!sel.rangeCount || !container) return false;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.startContainer)) return false;

  const lockedEls = container.querySelectorAll(LOCKED_SELECTOR);
  for (const lockedEl of lockedEls) {
    if (range.intersectsNode(lockedEl)) return true;
  }

  if (!range.collapsed) return false;

  if (isBackspace) {
    let prev = getPreviousNodeInDocumentOrder(container, range);
    while (prev) {
      if (isNodeLockedOrInsideLocked(container, prev)) return true;
      if (prev.nodeType === 3 && prev.textContent.trim().length > 0) return false;
      if (prev.nodeType === 1 && !prev.matches?.(LOCKED_SELECTOR)) return false;
      prev = getPreviousNodeInDocumentOrder(container, rangeBeforeNode(container, prev));
    }
    return false;
  } else {
    let next = getNextNodeInDocumentOrder(container, range);
    while (next) {
      if (isNodeLockedOrInsideLocked(container, next)) return true;
      if (next.nodeType === 3 && next.textContent.trim().length > 0) return false;
      if (next.nodeType === 1 && !next.matches?.(LOCKED_SELECTOR)) return false;
      next = getNextNodeInDocumentOrder(container, rangeAfterNode(container, next));
    }
    return false;
  }
}

/** True if the current selection is inside a locked element (so typing should be blocked) */
function isSelectionInsideLockedElement(container) {
  const sel = window.getSelection();
  if (!sel.rangeCount || !container) return false;
  const node = sel.anchorNode;
  if (!node || !container.contains(node)) return false;
  const lockedEl = node.nodeType === 1 ? node.closest(LOCKED_SELECTOR) : node.parentElement?.closest(LOCKED_SELECTOR);
  return lockedEl ? isLockedElement(lockedEl) : false;
}

/** True if the current selection is inside a tool-mention badge (so typing should be blocked) */
function isSelectionInsideToolMention(container) {
  const sel = window.getSelection();
  if (!sel.rangeCount || !container) return false;
  const node = sel.anchorNode;
  if (!node || !container.contains(node)) return false;
  const mention = node.nodeType === 1 ? node.closest(".tool-mention") : node.parentElement?.closest(".tool-mention");
  return !!mention;
}

/**
 * @param {HTMLElement} el - contenteditable element
 */
export function createEditor(el) {
  if (!el) return null;

  function getContent() {
    return el.innerHTML;
  }

  function setContent(html) {
    lockedObserverActive = false;
    lockedObserver.disconnect();
    el.innerHTML = html || "";
    // Normalize tool mentions into full badge markup with dismiss button
    el.querySelectorAll("[data-type='tool-mention'], .tool-mention").forEach((mention) => {
      const id = mention.getAttribute("data-tool-id") || mention.getAttribute("data-id");
      if (!id) return;
      const tool = getToolById(id);
      if (!tool) return;
      const temp = document.createElement("span");
      temp.innerHTML = buildToolBadgeHtml(tool, { dismissable: true });
      mention.replaceWith(temp.firstElementChild);
    });
    // Locked elements: make non-editable and normalize data-locked / data-lock alias
    applyLockedElements(el);
    attachLockedInfoListeners();
    // Re-enable the locked-element MutationObserver for the new content
    lockedObserver.observe(el, { childList: true, subtree: true });
    lockedObserverActive = true;
    // Place cursor at end of document so user can type immediately
    moveCursorToEnd();
  }

  /** Move selection to the end of the editor content. */
  function moveCursorToEnd() {
    el.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Replace the given range with a tool mention and a space. Range is mutated.
   */
  function replaceRangeWithTool(range, tool) {
    range.deleteContents();
    const temp = document.createElement("span");
    temp.innerHTML = buildToolBadgeHtml(tool, { dismissable: true });
    const span = temp.firstElementChild;
    range.insertNode(span);
    const space = document.createTextNode("\u00A0");
    span.parentNode.insertBefore(space, span.nextSibling);
    const sel = window.getSelection();
    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  /**
   * Insert tool at current selection. Call this after deleting the "/" trigger range.
   */
  function insertToolAtCursor(tool) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0).cloneRange();
    replaceRangeWithTool(range, tool);
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStartAfter(el.lastChild || el);
    newRange.collapse(true);
    sel.addRange(newRange);
  }

  /**
   * Get current selection range (clone). Returns null if no selection.
   */
  function getSelectionRange() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return null;
    return sel.getRangeAt(0).cloneRange();
  }

  function getUsedTools() {
    const ids = new Set();
    const tools = [];
    el.querySelectorAll(".tool-mention[data-tool-id]").forEach((node) => {
      const id = node.getAttribute("data-tool-id");
      if (id && !ids.has(id)) {
        ids.add(id);
        const t = getToolById(id);
        if (t) tools.push(t);
      }
    });
    return tools;
  }

  function getMentionCount() {
    return el.querySelectorAll(".tool-mention[data-tool-id]").length;
  }

  function getCharacterCount() {
    return (el.innerText || "").length;
  }

  function focus() {
    el.focus();
  }

  function setupDismissClick() {
    el.addEventListener("click", (e) => {
      const dismiss = e.target.closest(".tool-dismiss");
      if (!dismiss) return;
      const mention = e.target.closest(".tool-mention");
      if (mention) {
        mention.style.transform = "scale(0.95)";
        mention.style.opacity = "0.5";
        requestAnimationFrame(() => {
          mention.remove();
        });
      }
    });
  }

  function setupLockedElementProtection() {
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      if (wouldDeletionAffectLockedElement(el, e.key === "Backspace")) {
        e.preventDefault();
      }
    });
    el.addEventListener("beforeinput", (e) => {
      if (e.inputType === "insertText" || e.inputType === "insertParagraph" || e.inputType === "insertLineBreak") {
        if (isSelectionInsideLockedElement(el) || isSelectionInsideToolMention(el)) e.preventDefault();
      }
      if (e.inputType === "deleteContentBackward" || e.inputType === "deleteContentForward") {
        if (wouldDeletionAffectLockedElement(el, e.inputType === "deleteContentBackward")) e.preventDefault();
      }
    });
  }

  function undo() {
    el.focus();
    document.execCommand("undo", false, null);
  }

  function redo() {
    el.focus();
    document.execCommand("redo", false, null);
  }

  el.addEventListener("click", (e) => {
    const dismiss = e.target.closest(".tool-dismiss");
    if (dismiss) return;

    const mention = e.target.closest(".tool-mention");
    if (mention) {
      const toolId = mention.getAttribute("data-tool-id") || mention.getAttribute("data-id");
      if (toolId && typeof window.openToolsModalForTool === "function") {
        window.openToolsModalForTool(toolId);
        return;
      }
    }

    requestAnimationFrame(() => {
      if (!isSelectionInsideToolMention(el)) return;
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const node = sel.anchorNode;
      const m = node?.nodeType === 1 ? node.closest(".tool-mention") : node?.parentElement?.closest(".tool-mention");
      if (!m) return;
      const range = document.createRange();
      range.setStartAfter(m);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    });
  });

  function setupAutoList() {
    el.addEventListener("beforeinput", (e) => {
      if (e.inputType !== "insertText" || e.data !== " ") return;

      const sel = window.getSelection();
      if (!sel.rangeCount || !sel.isCollapsed) return;
      const range = sel.getRangeAt(0);

      const node = range.startContainer;
      if (!node || node.nodeType !== 3 || !el.contains(node)) return;

      const textBefore = node.textContent.substring(0, range.startOffset);

      let listType = null;
      if (textBefore === "-") {
        listType = "ul";
      } else if (/^\d+\.?$/.test(textBefore)) {
        listType = "ol";
      }
      if (!listType) return;

      if (node.parentElement?.closest("ul, ol")) return;
      if (isLockedElement(node)) return;

      let block = node.parentElement;
      while (block && block !== el && !isBlockElement(block)) block = block.parentElement;

      if (block && block !== el) {
        const before = document.createRange();
        before.setStart(block, 0);
        before.setEnd(node, 0);
        if (before.toString().length > 0) return;
      }

      e.preventDefault();

      const list = document.createElement(listType);
      const li = document.createElement("li");
      list.appendChild(li);

      const frag = document.createDocumentFragment();
      const remaining = node.textContent.substring(range.startOffset);
      if (remaining) frag.appendChild(document.createTextNode(remaining));

      let sib = node.nextSibling;
      while (sib) {
        const next = sib.nextSibling;
        frag.appendChild(sib);
        sib = next;
      }

      if (frag.childNodes.length) {
        li.appendChild(frag);
      } else {
        li.appendChild(document.createTextNode(""));
      }

      if (block && block !== el) {
        block.parentNode.replaceChild(list, block);
      } else {
        node.parentNode.replaceChild(list, node);
      }

      const newRange = document.createRange();
      newRange.setStart(li.firstChild, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    });
  }

  function setupListIndent() {
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;

      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const li = sel.anchorNode?.nodeType === 1
        ? sel.anchorNode.closest("li")
        : sel.anchorNode?.parentElement?.closest("li");
      if (!li || !el.contains(li)) return;

      const parentList = li.parentElement;
      if (!parentList || !parentList.matches("ul, ol")) return;

      e.preventDefault();

      if (!e.shiftKey) {
        const prevLi = li.previousElementSibling;
        if (!prevLi || prevLi.tagName !== "LI") return;

        let subList = prevLi.querySelector(":scope > ul, :scope > ol");
        if (!subList) {
          subList = document.createElement(parentList.tagName.toLowerCase());
          prevLi.appendChild(subList);
        }
        subList.appendChild(li);
      } else {
        const parentLi = parentList.parentElement?.closest("li");
        if (!parentLi) return;
        const grandparentList = parentLi.parentElement;
        if (!grandparentList || !grandparentList.matches("ul, ol")) return;

        const siblingsAfter = [];
        let sib = li.nextElementSibling;
        while (sib) {
          siblingsAfter.push(sib);
          sib = sib.nextElementSibling;
        }

        grandparentList.insertBefore(li, parentLi.nextSibling);

        if (siblingsAfter.length) {
          let subList = li.querySelector(":scope > ul, :scope > ol");
          if (!subList) {
            subList = document.createElement(parentList.tagName.toLowerCase());
            li.appendChild(subList);
          }
          for (const s of siblingsAfter) subList.appendChild(s);
        }

        if (!parentList.children.length) parentList.remove();
      }

      sel.collapse(li, 0);
    });
  }

  function cleanupMentionStyles() {
    [...el.querySelectorAll("font")].forEach((font) => {
      if (!font.querySelector(".tool-mention") && !font.closest(".tool-mention")) return;
      while (font.firstChild) font.parentNode.insertBefore(font.firstChild, font);
      font.remove();
    });

    el.querySelectorAll(".tool-mention").forEach((mention) => {
      mention.removeAttribute("style");
      mention.setAttribute("contenteditable", "false");

      if (!mention.querySelector(".tool-dismiss")) {
        const dismiss = document.createElement("span");
        dismiss.className = "tool-dismiss";
        dismiss.setAttribute("data-action", "dismiss");
        mention.appendChild(dismiss);
      }
    });
  }

  el.addEventListener("input", cleanupMentionStyles);

  function attachLockedInfoListeners() {
    // no-op: blockquote is rendered inline by applyLockedElements
  }

  setupDismissClick();
  setupLockedElementProtection();
  setupAutoList();
  setupListIndent();

  let lockedObserverActive = true;
  const lockedObserver = new MutationObserver((mutations) => {
    if (!lockedObserverActive) return;
    for (const m of mutations) {
      for (const removed of m.removedNodes) {
        if (removed.nodeType !== 1 || !removed.matches(LOCKED_SELECTOR)) continue;
        lockedObserver.disconnect();
        if (m.nextSibling) {
          m.target.insertBefore(removed, m.nextSibling);
        } else {
          m.target.appendChild(removed);
        }
        applyLockedElements(el);
        attachLockedInfoListeners();
        lockedObserver.observe(el, { childList: true, subtree: true });
        return;
      }
    }
  });
  lockedObserver.observe(el, { childList: true, subtree: true });

  return {
    el,
    getContent,
    setContent,
    replaceRangeWithTool,
    insertToolAtCursor,
    getSelectionRange,
    getUsedTools,
    getMentionCount,
    getCharacterCount,
    focus,
    undo,
    redo,
  };
}
