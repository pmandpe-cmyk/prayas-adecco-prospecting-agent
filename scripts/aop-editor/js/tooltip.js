/**
 * Tool badge hover tooltip: show tool name, description, inputs/outputs tabs.
 */

import { getToolById, getToolIconSvg } from "./tools-data.js";

/** Set to true to re-enable hover tooltip on tool badges. */
const BADGE_TOOLTIP_HOVER_ENABLED = false;

const DWELL_MS = 300;
const HIDE_GRACE_MS = 200;

/**
 * @param {HTMLElement} tooltipEl - #tool-tooltip
 * @param {HTMLElement} editorEl - container that has .tool-mention elements
 */
export function createTooltip(tooltipEl, editorEl) {
  let showTimeout = null;
  let hideTimeout = null;
  let currentToolId = null;

  function showTooltip(tool, x, y) {
    currentToolId = tool.id;
    const iconSvg = getToolIconSvg(tool.icon);
    const inputs = tool.details.inputs || [];
    const outputs = tool.details.outputs || [];
    tooltipEl.innerHTML = `
      <div class="tool-tooltip-header">
        <div class="tool-tooltip-icon">${iconSvg}</div>
        <div>
          <h3 class="tool-tooltip-title">${escapeHtml(tool.name)}</h3>
          <p class="tool-tooltip-desc">${escapeHtml(tool.description)}</p>
        </div>
      </div>
      <div class="tool-tooltip-tabs">
        <button type="button" class="tool-tooltip-tab active" data-tab="inputs">Inputs</button>
        <button type="button" class="tool-tooltip-tab" data-tab="outputs">Outputs</button>
      </div>
      <div class="tool-tooltip-body">
        <p class="hint" data-tab-hint="inputs">Inputs are information or data you give a tool so it can work</p>
        <p class="hint" data-tab-hint="outputs" style="display:none">Outputs are the results or data the tool returns after processing</p>
        <div data-tab-content="inputs">${paramsHtml(inputs)}</div>
        <div data-tab-content="outputs" style="display:none">${paramsHtml(outputs)}</div>
      </div>
    `;
    tooltipEl.style.left = `${x}px`;
    tooltipEl.style.top = `${y - 12}px`;
    tooltipEl.style.transform = "translate(-50%, -100%)";
    tooltipEl.setAttribute("data-tool-tooltip", "true");
    tooltipEl.classList.add("visible");
    tooltipEl.setAttribute("aria-hidden", "false");

    tooltipEl.querySelectorAll(".tool-tooltip-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.getAttribute("data-tab");
        tooltipEl.querySelectorAll(".tool-tooltip-tab").forEach((t) => t.classList.remove("active"));
        tooltipEl.querySelectorAll("[data-tab-hint], [data-tab-content]").forEach((el) => {
          el.style.display = el.getAttribute("data-tab-hint") === tabName || el.getAttribute("data-tab-content") === tabName ? "" : "none";
        });
        tab.classList.add("active");
      });
    });
  }

  function paramsHtml(params) {
    return params
      .map(
        (p) => `
        <div class="tool-tooltip-param">
          <div class="tool-tooltip-param-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
          <div>
            <div><span class="tool-tooltip-param-name">${escapeHtml(p.name)}</span><span class="tool-tooltip-param-type">${escapeHtml(p.type)}</span></div>
            <p class="tool-tooltip-param-desc">${escapeHtml(p.description)}</p>
          </div>
        </div>
      `
      )
      .join("");
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function hideTooltip() {
    tooltipEl.classList.remove("visible");
    tooltipEl.setAttribute("aria-hidden", "true");
    currentToolId = null;
  }

  function scheduleShow(tool, x, y) {
    if (showTimeout) clearTimeout(showTimeout);
    showTimeout = setTimeout(() => {
      showTimeout = null;
      showTooltip(tool, x, y);
    }, DWELL_MS);
  }

  function scheduleHide() {
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      hideTimeout = null;
      hideTooltip();
    }, HIDE_GRACE_MS);
  }

  function handleMouseOver(e) {
    const mention = e.target.closest(".tool-mention");
    const inTooltip = e.target.closest("[data-tool-tooltip]") || e.target.closest(".tool-tooltip");
    if (mention && !e.target.closest(".tool-dismiss")) {
      const toolId = mention.getAttribute("data-tool-id");
      const tool = toolId ? getToolById(toolId) : null;
      if (tool) {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
        const rect = mention.getBoundingClientRect();
        scheduleShow(tool, rect.left + rect.width / 2, rect.top);
      }
    }
    if (inTooltip && hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function handleMouseOut(e) {
    const related = e.relatedTarget;
    const leavingMention = e.target.closest(".tool-mention");
    const leavingTooltip = e.target.closest(".tool-tooltip") || e.target.closest("[data-tool-tooltip]");
    if (!leavingMention && !leavingTooltip) return;
    const enteringMention = related?.closest(".tool-mention");
    const enteringTooltip = related?.closest(".tool-tooltip") || related?.closest("[data-tool-tooltip]");
    if (enteringMention || enteringTooltip) return;
    if (showTimeout) {
      clearTimeout(showTimeout);
      showTimeout = null;
    }
    scheduleHide();
  }

  if (BADGE_TOOLTIP_HOVER_ENABLED) {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
  }

  return { showTooltip, hideTooltip };
}
