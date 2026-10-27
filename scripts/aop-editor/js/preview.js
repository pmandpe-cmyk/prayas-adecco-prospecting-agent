import { getStepConfig, STEP_CONFIGS } from "./step-configs.js";
import { buildToolBadgeHtml as _buildToolBadgeHtml } from "./tools-data.js";
const stepConfig = getStepConfig();

// ---- SVG Sprites ----
function createIconSprites() {
	const ns = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(ns, "svg");
	svg.setAttribute("width", "0");
	svg.setAttribute("height", "0");
	svg.setAttribute("aria-hidden", "true");
  
	const viewBox = "0 0 16 16";
	const emptyCircleRectAngleCount = 16;
  
  
	// empty-circle
	const emptyCircle = document.createElementNS(ns, "symbol");
	emptyCircle.setAttribute("id", "empty-circle");
	emptyCircle.setAttribute("viewBox", viewBox);
	let rects = "";
	for (let r = 0; r < emptyCircleRectAngleCount; r++) {
	  const rotation = (360 / emptyCircleRectAngleCount) * r;
	  rects += `<rect fill="currentcolor" x="-1" width="2" height="2" transform="rotate(${rotation}) translate(0,6)"/>`;
	}
	emptyCircle.innerHTML = `<g transform="translate(8,8)">${rects}</g>`;
	svg.appendChild(emptyCircle);
  
	// half-circle
	const halfCircle = document.createElementNS(ns, "symbol");
	halfCircle.setAttribute("id", "half-circle");
	halfCircle.setAttribute("viewBox", viewBox);
	halfCircle.innerHTML = `
	  <clipPath id="half-circle-clip"><rect x="8" y="0" width="8" height="16"/></clipPath>
	  <circle fill="none" stroke="currentcolor" stroke-width="2" cx="8" cy="8" r="7"/>
	  <circle fill="currentcolor" cx="8" cy="8" r="5" clip-path="url(#half-circle-clip)"/>
	`;
	svg.appendChild(halfCircle);
  
	return svg;
  }
  
  // ---- SLDS Spinner ----
  function createSpinner() {
	const wrapper = document.createElement("div");
	wrapper.className = "spinner";
	return wrapper;
  }
  
  // ---- Icon ----
  function createIcon(icon, color) {
	const ns = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(ns, "svg");
	svg.setAttribute("width", "16px");
	svg.setAttribute("height", "16px");
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("class", "icon" + (color ? ` icon--${color}` : ""));
	const use = document.createElementNS(ns, "use");
	use.setAttribute("href", `#${icon}`);
	svg.appendChild(use);
	return svg;
  }
  
  // ---- SLDS Check Icon ----
  function createSLDSCheckIcon(title = "Complete") {
	const container = document.createElement("span");
	container.className = "slds-icon_container slds-icon_container_circle slds-icon-action-check";
	container.title = title;
	container.style.flexShrink = "0";
  
	const svgNS = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgNS, "svg");
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("viewBox", "0 0 9 7");
	svg.setAttribute("fill", "none");
	svg.classList.add("slds-icon", "slds-icon_xx-small");
	svg.style.width = "10px";
	svg.style.height = "10px";
	const path = document.createElementNS(svgNS, "path");
	path.setAttribute("fill-rule", "evenodd");
	path.setAttribute("clip-rule", "evenodd");
	path.setAttribute("d", "M8.78334 1.65L3.68333 6.81667C3.48333 7.01667 3.15 7.01667 2.95 6.81667L0.15 3.98333C-0.05 3.78333 -0.05 3.45 0.15 3.25L0.883334 2.51667C1.08333 2.31667 1.41667 2.31667 1.61667 2.51667L3.08333 4.01667C3.21667 4.15 3.45 4.15 3.58333 4.01667L7.31667 0.15C7.51667 -0.05 7.85 -0.05 8.05 0.15L8.78334 0.883333C9.01667 1.08333 9.01667 1.41667 8.78334 1.65V1.65Z");
	path.setAttribute("fill", "white");
	svg.appendChild(path);
  
	const assistive = document.createElement("span");
	assistive.className = "slds-assistive-text";
	assistive.textContent = title;
  
	container.appendChild(svg);
	container.appendChild(assistive);
	return container;
  }
  
  // ---- Warning Icon (stub — replace SVG with custom asset later) ----
  function createWarningIcon(title = "Warning") {
	const container = document.createElement("span");
	container.className = "slds-icon_container slds-icon_container_circle";
	container.title = title;
	container.style.flexShrink = "0";
	container.style.backgroundColor = "#5C5C5C";

	const svgNS = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgNS, "svg");
	svg.setAttribute("aria-hidden", "true");
	svg.classList.add("slds-icon", "slds-icon_xx-small");
	svg.style.width = "10px";
	svg.style.height = "10px";
	svg.style.fill = "white";
	const use = document.createElementNS(svgNS, "use");
	use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#warning");
	svg.appendChild(use);

	const assistive = document.createElement("span");
	assistive.className = "slds-assistive-text";
	assistive.textContent = title;

	container.appendChild(svg);
	container.appendChild(assistive);
	return container;
  }

  // ---- Fail Icon (stub — replace SVG with custom asset later) ----
  function createFailIcon(title = "Fail") {
	const container = document.createElement("span");
	container.className = "slds-icon_container slds-icon_container_circle";
	container.title = title;
	container.style.flexShrink = "0";
	container.style.backgroundColor = "#B60554";

	const svgNS = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgNS, "svg");
	svg.setAttribute("aria-hidden", "true");
	svg.classList.add("slds-icon", "slds-icon_xx-small");
	svg.style.width = "10px";
	svg.style.height = "10px";
	svg.style.fill = "white";
	const use = document.createElementNS(svgNS, "use");
	use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#error");
	svg.appendChild(use);

	const assistive = document.createElement("span");
	assistive.className = "slds-assistive-text";
	assistive.textContent = title;

	container.appendChild(svg);
	container.appendChild(assistive);
	return container;
  }

  // ---- Done Icon Factory ----
  function createDoneIcon(status, title) {
	if (status === "warning") return createWarningIcon(title);
	if (status === "fail") return createFailIcon(title);
	return createSLDSCheckIcon(title);
  }

  // ---- Loading Ellipsis ----
  function createEllipsis() {
	const div = document.createElement("div");
	div.className = "loading__ellipsis";
	for (let i = 0; i < 3; i++) {
	  const dot = document.createElement("div");
	  dot.className = "loading__ellipsis-dot";
	  dot.textContent = ".";
	  div.appendChild(dot);
	}
	return div;
  }
  
  // ---- Date Formatter ----
  function dateFormatted(date) {
	return new Intl.DateTimeFormat("en-US", {
	  dateStyle: "medium",
	  timeStyle: "medium",
	}).format(date);
  }
  
  // ---- Loading Step Block ----
  function createStepElement() {
	const el = document.createElement("div");
	el.className = "loading__step";
  
	const iconWrapper = document.createElement("span");
	const contentDiv = document.createElement("div");
	contentDiv.className = "loading__step-content";
	const titleDiv = document.createElement("div");
	titleDiv.className = "loading__step-title";
	const infoDiv1 = document.createElement("div");
	infoDiv1.className = "loading__step-info";
  
	contentDiv.appendChild(titleDiv);
	contentDiv.appendChild(infoDiv1);
	el.appendChild(iconWrapper);
	el.appendChild(contentDiv);
  
	return { el, iconWrapper, titleDiv, infoDiv1 };
  }
  
  function updateStepElement(refs, step) {
	const { el, iconWrapper, titleDiv, infoDiv1 } = refs;
	const { state, title, distance, fade, start, finish, thoughts, thoughtIndex } = step;
  
	// icon — only re-render if state (+ status for done) changed
	const iconKey = state === "done" ? "done-" + (step.status || "pass") : state;
	if (iconWrapper._lastState !== iconKey) {
	  iconWrapper._lastState = iconKey;
	  iconWrapper.innerHTML = "";
	  if (state === "done") {
		iconWrapper.appendChild(createDoneIcon(step.status || "pass", title));
	  } else {
		iconWrapper.appendChild(createSpinner());
	  }
	}
  
	// class
	el.className = "loading__step" + (state !== "waiting" ? " loading__step--in" : "");
  
	// style
	el.style.opacity = 1 - fade;
	el.style.transform = `translateY(${100 * distance}%)`;
  
	titleDiv.textContent = (state === "done" && step.doneTitle) ? step.doneTitle : (title || "");
  
	if (state === "done" && step.doneSubTitle) {
	  infoDiv1._thoughtSpan = null;
	  infoDiv1._lastThought = null;
	  infoDiv1.textContent = step.doneSubTitle;
	} else {
	  const currentThought = thoughts && thoughtIndex !== undefined ? thoughts[thoughtIndex] : null;
	  if (currentThought !== undefined && currentThought !== null) {
		if (!infoDiv1._thoughtSpan) {
		  infoDiv1.innerHTML = "";
		  const span = document.createElement("span");
		  span.className = "loading__step-thought";
		  infoDiv1.appendChild(span);
		  infoDiv1._thoughtSpan = span;
		  infoDiv1._lastThought = null;
		}
		const span = infoDiv1._thoughtSpan;
		if (infoDiv1._lastThought !== currentThought) {
		  span.classList.add("loading__step-thought--fade");
		  setTimeout(() => {
			span.textContent = currentThought;
			infoDiv1._lastThought = currentThought;
			span.classList.remove("loading__step-thought--fade");
		  }, 400);
		}
	  } else {
		infoDiv1.innerHTML = "";
		infoDiv1._thoughtSpan = null;
		infoDiv1._lastThought = null;
	  }
	}
  }
  
  // ---- Duration Formatter ----
  function durationFormatted(ms) {
	const s = Math.round(ms / 1000);
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60), rem = s % 60;
	return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
  }
  
  // ---- AOP Criteria Helpers ----
  function getSectionStatus(section) {
	const statusThought = (section.thoughts || []).find(t => t.field === "Status");
	if (!statusThought) return "na";
	const raw = (statusThought.value || "").trim().toLowerCase();
	const map = { "passed": "pass", "pass": "pass", "fail": "fail", "failed": "fail", "warning": "warning" };
	return map[raw] || "na";
  }

  function computeTitleStatus(item) {
	const statuses = (item.sections || []).map(getSectionStatus);
	if (item.statusRule === "anyPass") {
	  return statuses.some(s => s === "pass") ? "pass" : "warning";
	}
	return statuses.every(s => s === "pass") ? "pass" : "fail";
  }

  function computeAllStatuses(criteria) {
	return criteria.map(item => ({ ...item, status: computeTitleStatus(item) }));
  }

  function countNonPassSections(sections) {
	return (sections || []).reduce((count, section) => {
	  const status = getSectionStatus(section);
	  return (status !== "pass" && status !== "na") ? count + 1 : count;
	}, 0);
  }

  // ---- Default AOP Criteria (fallback for accounts without aopCriteria) ----
  const DEFAULT_AOP_CRITERIA = [
	{ title: "Account Selection", statusRule: "allPass", sections: [
	  { subTitle: "Criteria 1", thoughts: [
		{ field: "Account", value: "Unknown" },
		{ field: "Condition", value: "None" },
		{ field: "Status", value: "Passed" },
	  ]},
	]},
	{ title: "Requirements", statusRule: "allPass", sections: [
	  { subTitle: "Criteria 1", thoughts: [
		{ field: "Tool", value: "Research ZoomInfo" },
		{ field: "Condition", value: "BDR count ≥ 10" },
		{ field: "Actual", value: "—" },
		{ field: "Source", value: "Company API" },
		{ field: "Status", value: "n/a" },
	  ]},
	  { subTitle: "Criteria 2", thoughts: [
		{ field: "Tool", value: "CRM Lookup" },
		{ field: "Condition", value: "team_size > 20" },
		{ field: "Actual", value: "—" },
		{ field: "Source", value: "Account Record" },
		{ field: "Status", value: "n/a" },
	  ]},
	]},
	{ title: "Nice-to-Haves", statusRule: "anyPass", sections: [
	  { subTitle: "Criteria 1", thoughts: [
		{ field: "Tool", value: "Website Research" },
		{ field: "Condition", value: "Sells B2B SaaS == True" },
		{ field: "Actual", value: "—" },
		{ field: "Source", value: "n/a" },
		{ field: "Status", value: "n/a" },
	  ]},
	  { subTitle: "Criteria 2", thoughts: [
		{ field: "Tool", value: "CRM Lookup" },
		{ field: "Condition", value: "Demandbase score ≥ Medium" },
		{ field: "Actual", value: "—" },
		{ field: "Source", value: "n/a" },
		{ field: "Status", value: "n/a" },
	  ]},
	  { subTitle: "Criteria 3", thoughts: [
		{ field: "Tool", value: "Check for Signals" },
		{ field: "Condition", value: "n/a" },
		{ field: "Actual", value: "n/a" },
		{ field: "Source", value: "n/a" },
		{ field: "Status", value: "n/a" },
	  ]},
	  { subTitle: "Criteria 4", thoughts: [
		{ field: "Tool", value: "Analyze Past Conversations" },
		{ field: "Condition", value: "n/a" },
		{ field: "Actual", value: "n/a" },
		{ field: "Source", value: "n/a" },
		{ field: "Status", value: "n/a" },
	  ]},
	]},
  ];

  function createCompletedCard(totalMs, criteria, reasoning) {
	const ns = "http://www.w3.org/2000/svg";
  
	const completedCard = document.createElement("div");
	completedCard.className = "completed-card";
  
	// Header
	const header = document.createElement("button");
	header.className = "completed-card__header";
  
	const summary = document.createElement("div");
	summary.className = "completed-card__summary";
  
	const titleRow = document.createElement("div");
	titleRow.className = "completed-card__title";
	const titleText = document.createElement("span");
	titleText.textContent = "Completed";
	titleRow.appendChild(titleText);
  
	const timeRow = document.createElement("div");
	timeRow.className = "completed-card__time";
	timeRow.textContent = `${durationFormatted(totalMs)}`;
  
	summary.appendChild(titleRow);
	summary.appendChild(timeRow);
  
	// Chevron
	const chevronContainer = document.createElement("span");
	chevronContainer.className = "slds-icon_container slds-current-color completed-card__chevron";
	chevronContainer.title = "Toggle details";
  
	const chevronSvg = document.createElementNS(ns, "svg");
	chevronSvg.setAttribute("aria-hidden", "true");
	chevronSvg.setAttribute("viewBox", "0 0 52 52");
	chevronSvg.classList.add("slds-icon", "slds-icon_xx-small");
	const chevronPath = document.createElementNS(ns, "path");
	chevronPath.setAttribute("d", "M47.6 17.8L27.1 38.5c-.6.6-1.6.6-2.2 0L4.4 17.8c-.6-.6-.6-1.6 0-2.2l2.2-2.2c.6-.6 1.6-.6 2.2 0L26 31.2l17.2-17.8c.6-.6 1.6-.6 2.2 0l2.2 2.2c.6.6.6 1.6 0 2.2z");
	chevronSvg.appendChild(chevronPath);
  
	const chevronAssistive = document.createElement("span");
	chevronAssistive.className = "slds-assistive-text";
	chevronAssistive.textContent = "Toggle details";
  
	chevronContainer.appendChild(chevronSvg);
	chevronContainer.appendChild(chevronAssistive);
  
	// Success checkmark icon
	const checkContainer = document.createElement("span");
	checkContainer.className = "slds-icon_container slds-icon-utility-success";
	checkContainer.title = "checkmark";
	const checkSvg = document.createElementNS(ns, "svg");
	checkSvg.classList.add("slds-icon", "slds-icon_x-small");
	checkSvg.setAttribute("aria-hidden", "true");
	checkSvg.style.fill = "#066AFE";
	const checkUse = document.createElementNS(ns, "use");
	checkUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#success");
	checkSvg.appendChild(checkUse);
	const checkAssistive = document.createElement("span");
	checkAssistive.className = "slds-assistive-text";
	checkAssistive.textContent = "Checkmark";
	checkContainer.appendChild(checkSvg);
	checkContainer.appendChild(checkAssistive);

	header.appendChild(chevronContainer);
	header.appendChild(summary);
	header.appendChild(checkContainer);
  
	// Body
	const body = document.createElement("div");
	body.className = "completed-card__body";
	const bodyInner = document.createElement("div");
	bodyInner.className = "completed-card__body-inner";
	const list = document.createElement("div");
	list.className = "completed-card__list";
  
	// Reasoning accordion item (always first)
	if (reasoning) {
	  const reasoningItem = document.createElement("div");
	  reasoningItem.className = "completed-card__list-item";

	  const reasoningHeader = document.createElement("button");
	  reasoningHeader.className = "completed-card__list-item-header";

	  const reasoningIconSwap = document.createElement("div");
	  reasoningIconSwap.className = "icon-swap";

	  const sparkleSpan = document.createElement("span");
	  sparkleSpan.className = "slds-icon_container icon-swap__check";
	  sparkleSpan.title = "Sparkle";
	  const sparkleSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	  sparkleSvg.classList.add("slds-icon", "slds-icon_xx-small");
	  sparkleSvg.setAttribute("aria-hidden", "true");
	  sparkleSvg.style.fill = "#066AFE";
	  const sparkleUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
	  sparkleUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#sparkle");
	  sparkleSvg.appendChild(sparkleUse);
	  sparkleSpan.appendChild(sparkleSvg);
	  const sparkleAssistive = document.createElement("span");
	  sparkleAssistive.className = "slds-assistive-text";
	  sparkleAssistive.textContent = "Sparkle";
	  sparkleSpan.appendChild(sparkleAssistive);
	  reasoningIconSwap.appendChild(sparkleSpan);

	  const rChevronSpan = document.createElement("span");
	  rChevronSpan.className = "slds-icon_container icon-swap__chevron";
	  rChevronSpan.title = "chevronright";
	  const rChevronSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	  rChevronSvg.classList.add("slds-icon", "slds-icon_xx-small");
	  rChevronSvg.setAttribute("aria-hidden", "true");
	  rChevronSvg.style.fill = "#747474";
	  const rChevronUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
	  rChevronUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#chevronright");
	  rChevronSvg.appendChild(rChevronUse);
	  rChevronSpan.appendChild(rChevronSvg);
	  reasoningIconSwap.appendChild(rChevronSpan);

	  const reasoningLeftSide = document.createElement("div");
	  reasoningLeftSide.className = "completed-card__list-item-left-side";
	  reasoningLeftSide.appendChild(reasoningIconSwap);

	  const reasoningTitle = document.createElement("div");
	  reasoningTitle.className = "completed-card__list-item-title";
	  reasoningTitle.textContent = "Reasoning";
	  reasoningLeftSide.appendChild(reasoningTitle);

	  reasoningHeader.appendChild(reasoningLeftSide);

	  reasoningItem.appendChild(reasoningHeader);

	  const reasoningBody = document.createElement("div");
	  reasoningBody.className = "completed-card__list-item-body";
	  const reasoningBodyInner = document.createElement("div");
	  reasoningBodyInner.className = "completed-card__list-item-body-inner";

	  const reasoningParagraph = document.createElement("p");
	  reasoningParagraph.className = "completed-card__reasoning-text";
	  reasoningParagraph.textContent = reasoning;
	  reasoningBodyInner.appendChild(reasoningParagraph);

	  reasoningBody.appendChild(reasoningBodyInner);
	  reasoningItem.appendChild(reasoningBody);

	  reasoningHeader.addEventListener("click", () => {
		reasoningItem.classList.toggle("completed-card__list-item--open");
	  });

	  list.appendChild(reasoningItem);
	}

	criteria.forEach(s => {
	  const item = document.createElement("div");
	  item.className = "completed-card__list-item";

	  const itemHeader = document.createElement("button");
	  itemHeader.className = "completed-card__list-item-header";

	  const leftSide = document.createElement("div");
	  leftSide.className = "completed-card__list-item-left-side";

	  const iconSwap = document.createElement("div");
	  iconSwap.className = "icon-swap";

	  const statusSpan = document.createElement("span");
	  statusSpan.className = "slds-icon_container icon-swap__check";
	  statusSpan.title = "Checkmark";
	  const statusSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	  statusSvg.classList.add("slds-icon", "slds-icon_xx-small");
	  statusSvg.setAttribute("aria-hidden", "true");
	  statusSvg.style.fill = "#066AFE";
	  const statusUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
	  statusUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#success");
	  statusSvg.appendChild(statusUse);
	  statusSpan.appendChild(statusSvg);
	  const statusAssistive = document.createElement("span");
	  statusAssistive.className = "slds-assistive-text";
	  statusAssistive.textContent = "Checkmark";
	  statusSpan.appendChild(statusAssistive);
	  iconSwap.appendChild(statusSpan);

	  const chevronSpan = document.createElement("span");
	  chevronSpan.className = "slds-icon_container icon-swap__chevron";
	  chevronSpan.title = "chevronright";
	  const chevronSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	  chevronSvg.classList.add("slds-icon", "slds-icon_xx-small");
	  chevronSvg.setAttribute("aria-hidden", "true");
	  chevronSvg.style.fill = "#747474";
	  const chevronUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
	  chevronUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#chevronright");
	  chevronSvg.appendChild(chevronUse);
	  chevronSpan.appendChild(chevronSvg);
	  iconSwap.appendChild(chevronSpan);

	  leftSide.appendChild(iconSwap);

	  const itemTitle = document.createElement("div");
	  itemTitle.className = "completed-card__list-item-title";
	  itemTitle.textContent = s.title || "";
	  leftSide.appendChild(itemTitle);

	  itemHeader.appendChild(leftSide);

	  const rightSide = document.createElement("div");
	  rightSide.className = "completed-card__list-item-right-side";

	  const nonPassCount = countNonPassSections(s.sections);
	  if (nonPassCount > 0 && s.status === "fail") {
		const badge = document.createElement("span");
		badge.className = "slds-badge slds-theme_error";
		const badgeIconWrap = document.createElement("span");
		badgeIconWrap.className = "slds-badge__icon slds-badge__icon_left";
		const badgeIconContainer = document.createElement("span");
		badgeIconContainer.className = "slds-icon_container slds-icon-utility-error";
		badgeIconContainer.title = "Errors";
		const badgeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		badgeSvg.classList.add("slds-icon", "slds-icon_xx-small", "slds-icon-text-error");
		badgeSvg.setAttribute("aria-hidden", "true");
		const badgeUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
		badgeUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#error");
		badgeSvg.appendChild(badgeUse);
		badgeIconContainer.appendChild(badgeSvg);
		badgeIconWrap.appendChild(badgeIconContainer);
		badge.appendChild(badgeIconWrap);
		badge.appendChild(document.createTextNode(String(nonPassCount)));
		rightSide.appendChild(badge);
	  } else if (nonPassCount > 0 && s.status === "warning") {
		const badge = document.createElement("span");
		badge.className = "slds-badge slds-badge_lightest";
		const badgeIconWrap = document.createElement("span");
		badgeIconWrap.className = "slds-badge__icon slds-badge__icon_left";
		const badgeIconContainer = document.createElement("span");
		badgeIconContainer.className = "slds-icon_container slds-icon-utility-warning";
		badgeIconContainer.title = "Warnings";
		const badgeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		badgeSvg.classList.add("slds-icon", "slds-icon_xx-small", "slds-icon-text-warning");
		badgeSvg.setAttribute("aria-hidden", "true");
		const badgeUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
		badgeUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#warning");
		badgeSvg.appendChild(badgeUse);
		badgeIconContainer.appendChild(badgeSvg);
		badgeIconWrap.appendChild(badgeIconContainer);
		badge.appendChild(badgeIconWrap);
		badge.appendChild(document.createTextNode(String(nonPassCount)));
		rightSide.appendChild(badge);
	  }

	  itemHeader.appendChild(rightSide);

	  item.appendChild(itemHeader);

	  // Accordion body (subtitles + fields) — collapsible
	  const itemBody = document.createElement("div");
	  itemBody.className = "completed-card__list-item-body";
	  const itemBodyInner = document.createElement("div");
	  itemBodyInner.className = "completed-card__list-item-body-inner";

	  if (s.sections && s.sections.length) {
		s.sections.forEach(section => {
		  const sectionWrap = document.createElement("div");
		  sectionWrap.className = "completed-card__section";

		  if (section.subTitle) {
			const itemSubTitle = document.createElement("div");
			itemSubTitle.className = "completed-card__list-item-subtitle";
			itemSubTitle.textContent = section.subTitle;
			sectionWrap.appendChild(itemSubTitle);
		  }

		  if (section.thoughts && section.thoughts.length) {
			const ul = document.createElement("ul");
			ul.className = "completed-card__list-item-thoughts";
			section.thoughts.forEach(thought => {
			  const li = document.createElement("li");
			  li.className = "completed-card__list-item-info";

			  if (thought.field === "Status") {
				const raw = (thought.value || "").trim().toLowerCase();
				const statusMap = { "passed": "pass", "pass": "pass", "fail": "fail", "failed": "fail", "warning": "warning", "n/a": "na" };
				const statusKey = statusMap[raw] || "na";
				li.appendChild(document.createTextNode(thought.field + ": "));
				const valueSpan = document.createElement("span");
				valueSpan.className = "completed-card__status completed-card__status--" + statusKey;
				valueSpan.textContent = thought.value;
				li.appendChild(valueSpan);
			  } else {
				li.textContent = `${thought.field}: ${thought.value}`;
			  }

			  ul.appendChild(li);
			});
			sectionWrap.appendChild(ul);
		  }

		  itemBodyInner.appendChild(sectionWrap);
		});
	  }

	  itemBody.appendChild(itemBodyInner);
	  item.appendChild(itemBody);

	  // Toggle accordion on click
	  itemHeader.addEventListener("click", () => {
		item.classList.toggle("completed-card__list-item--open");
	  });

	  list.appendChild(item);
	});
  
	bodyInner.appendChild(list);
	body.appendChild(bodyInner);
	completedCard.appendChild(header);
	completedCard.appendChild(body);
  
	// Toggle
	header.addEventListener("click", () => {
	  completedCard.classList.toggle("completed-card--open");
	});
  
	return completedCard;
  }
  
  // ---- Source Icon Config ----
  const SOURCE_ICON_PATH = "/assets/images/source_icons/";
  const SOURCE_ICON_MAP = {
	"ZoomInfo":     { href: SOURCE_ICON_PATH + "source_zoominfo.svg" },
	"Demandbase":   { href: SOURCE_ICON_PATH + "source_demandbase.svg" },
	"6sense":       { href: SOURCE_ICON_PATH + "source_6sense.svg" },
	"Gong":         { href: SOURCE_ICON_PATH + "source_gong.svg" },
	"Zoom":         { href: SOURCE_ICON_PATH + "source_zoom.svg" },
	"Gmail":        { href: SOURCE_ICON_PATH + "source_gmail.svg" },
	"Slack":        { href: SOURCE_ICON_PATH + "source_slack.svg" },
	"Apollo":       { href: SOURCE_ICON_PATH + "source_appollo.svg" },
	"G2":           { href: SOURCE_ICON_PATH + "source_g2.svg" },
	"Moody's":      { href: SOURCE_ICON_PATH + "source_moodys.svg" },
	"SalesIntel":   { href: SOURCE_ICON_PATH + "source_salesintel.svg" },
	"D&B":          { href: SOURCE_ICON_PATH + "source_db.svg" },
	"Salesforce":   { href: SOURCE_ICON_PATH + "source_salesforce.svg" },
	"Email":        { href: SOURCE_ICON_PATH + "source_gmail.svg" },
  };

  function getSourceIconConfig(label) {
	if (SOURCE_ICON_MAP[label]) return SOURCE_ICON_MAP[label];
	return { href: SOURCE_ICON_PATH + "source_web.svg" };
  }

  // ---- Popover HTML Helpers ----
  function escapePopoverHtml(text) {
	var div = document.createElement('div');
	div.textContent = text || '';
	return div.innerHTML;
  }

  var TOOL_COLORS = {
	'Research ZoomInfo': 'color1',
	'Website Research': 'color2',
	'Lookup CRM': 'color3',
	'Check For Signals': 'color4',
	'Analyze Past Conversations': 'color5'
  };

  function buildToolBadgeHtml(toolName) {
	var color = TOOL_COLORS[toolName] || 'color1';
	return _buildToolBadgeHtml({ id: '', name: toolName, category: '', color: color, icon: 'sparkle' });
  }

  function buildQueryPopoverHtml(evidence) {
	return '<div class="source-popover__header">' +
	  '<p class="source-popover__title">Evidence</p>' +
	  buildToolBadgeHtml(evidence.tool) +
	  '</div>' +
	  '<div class="source-popover__body">' +
	  '<div class="evidence_container">' +
	  '<div class="source-popover__title slds-m-bottom_x-small">Query</div>' +
	  '<dl class="slds-dl_horizontal">' +
	  '<dt class="slds-dl_horizontal__label source-popover__field">Search:</dt>' +
	  '<dd class="slds-dl_horizontal__detail source-popover__value-reg">' + escapePopoverHtml(evidence.search) + '</dd>' +
	  '<dt class="slds-dl_horizontal__label source-popover__field">Result:</dt>' +
	  '<dd class="slds-dl_horizontal__detail source-popover__value-bold">' + escapePopoverHtml(evidence.result) + '</dd>' +
	  '</dl></div></div>';
  }

  function buildCrmRecordPopoverHtml(evidence) {
	var fieldsHtml = (evidence.fields || []).map(function(f) {
	  return '<dt class="slds-dl_inline__label source-popover__field">' + escapePopoverHtml(f.label) + ':</dt>' +
		'<dd class="slds-dl_inline__detail source-popover__value-bold">' + escapePopoverHtml(f.value) + '</dd>';
	}).join('');
	return '<div class="source-popover__header">' +
	  '<p class="source-popover__title">Evidence</p>' +
	  buildToolBadgeHtml(evidence.tool) +
	  '</div>' +
	  '<div class="source-popover__body">' +
	  '<div class="evidence_container">' +
	  '<div class="source-popover__title slds-m-bottom_x-small"><a>' + escapePopoverHtml(evidence.recordName) + '</a></div>' +
	  '<dl class="slds-dl_inline">' + fieldsHtml + '</dl>' +
	  '</div></div>';
  }

  function buildWebResearchPopoverHtml(evidence) {
	return '<div class="source-popover__header">' +
	  '<p class="source-popover__title">Evidence</p>' +
	  buildToolBadgeHtml(evidence.tool) +
	  '</div>' +
	  '<div class="source-popover__body">' +
	  '<div class="evidence_container">' +
	  '<div class="slds-grid slds-grid_align-spread slds-m-bottom_x-small">' +
	  '<div class="slds-grid slds-grid_vertical">' +
	  '<div class="source-popover__value-bold slds-truncate"><a>' + escapePopoverHtml(evidence.title) + '</a></div>' +
	  '<div class="source-popover__value-reg slds-truncate"><a>' + escapePopoverHtml(evidence.url) + '</a></div>' +
	  '</div></div>' +
	  '<div class="source-popover__field slds-line-clamp_small">' + escapePopoverHtml(evidence.snippet) + '</div>' +
	  '</div></div>';
  }

  function buildConversationPopoverHtml(evidence) {
	var convsHtml = (evidence.conversations || []).map(function(c) {
	  return '<div class="evidence_container">' +
		'<div class="slds-grid slds-grid_align-spread slds-m-bottom_x-small">' +
		'<div class="slds-grid slds-grid_vertical">' +
		'<div class="source-popover__value-bold slds-truncate"><a>' + escapePopoverHtml(c.title) + '</a></div>' +
		'<div class="source-popover__value-reg slds-truncate"><a>' + escapePopoverHtml(c.contact) + '</a></div>' +
		'</div>' +
		(c.date ? '<div class="source-popover__field slds-truncate">' + escapePopoverHtml(c.date) + '</div>' : '') +
		'</div>' +
		'<div class="source-popover__field slds-line-clamp_small">' + escapePopoverHtml(c.quote) + '</div>' +
		'</div>';
	}).join('');
	return '<div class="source-popover__header">' +
	  '<p class="source-popover__title">Evidence</p>' +
	  buildToolBadgeHtml(evidence.tool) +
	  '</div>' +
	  '<div class="source-popover__body">' + convsHtml + '</div>';
  }

  function buildPopoverByTool(evidence) {
	if (!evidence || !evidence.tool) return '';
	switch (evidence.tool) {
	  case 'Research ZoomInfo':
	  case 'Check For Signals':
		return buildQueryPopoverHtml(evidence);
	  case 'Lookup CRM':
		return buildCrmRecordPopoverHtml(evidence);
	  case 'Website Research':
		return buildWebResearchPopoverHtml(evidence);
	  case 'Analyze Past Conversations':
		return buildConversationPopoverHtml(evidence);
	  default:
		return buildQueryPopoverHtml(evidence);
	}
  }

  // ---- Bullet Status Icon ----
  function createBulletStatusIcon(status) {
	const map = {
	  pass:    { icon: "check", fill: "var(--slds-g-color-on-surface-3)" },
	  fail:    { icon: "error",   fill: "#B60554" },
	  warning: { icon: "warning", fill: "#DD7A01" },
	};
	const cfg = map[status] || { icon: "info", fill: "#747474" };
	const ns = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(ns, "svg");
	svg.classList.add("slds-icon", "slds-icon_xx-small", "result-card__status-icon");
	svg.setAttribute("aria-hidden", "true");
	svg.style.fill = cfg.fill;
	const use = document.createElementNS(ns, "use");
	use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#" + cfg.icon);
	svg.appendChild(use);
	return svg;
  }

  // ---- Source Badge ----
  function createSourceBadge(source, evidence) {
	if (!source || !source.label) return null;
	const iconCfg = getSourceIconConfig(source.label);
	const ns = "http://www.w3.org/2000/svg";

	const badge = document.createElement("span");
	badge.className = "slds-badge slds-badge_lightest source";

	const badgeIcon = document.createElement("span");
	badgeIcon.className = "slds-badge__icon slds-badge__icon_left";

	const iconContainer = document.createElement("span");
	iconContainer.className = "slds-icon_container";
	iconContainer.title = source.label;

	const svg = document.createElementNS(ns, "svg");
	svg.classList.add("slds-icon", "slds-icon_xx-small");
	svg.setAttribute("aria-hidden", "true");

	const use = document.createElementNS(ns, "use");
	use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", iconCfg.href);
	svg.appendChild(use);

	iconContainer.appendChild(svg);
	badgeIcon.appendChild(iconContainer);
	badge.appendChild(badgeIcon);
	badge.appendChild(document.createTextNode(source.label));

	if (evidence) badge._evidence = evidence;

	return badge;
  }

  // ---- Qualification Status ----
  function getQualificationStatus(account) {
	const criteria = computeAllStatuses(account?.aopCriteria || DEFAULT_AOP_CRITERIA);
	const acctSel = criteria.find(c => c.title === "Account Selection");
	const reqs = criteria.find(c => c.title === "Requirements");
	if ((acctSel && acctSel.status !== "pass") || (reqs && reqs.status !== "pass")) {
	  return "disqualified";
	}
	return "qualified";
  }

  // ---- Result Card ----
  function createBulletWithBadge(text, source, status, evidence) {
	const li = document.createElement("li");
	li.className = "result-card__bullet";
	li.appendChild(createBulletStatusIcon(status));
	const textSpan = document.createElement("span");
	textSpan.className = "result-card__bullet-text";
	textSpan.textContent = text;
	li.appendChild(textSpan);
	const badge = createSourceBadge(source, evidence);
	if (badge) li.appendChild(badge);
	return li;
  }

  function createResultCard(account) {
	const card = document.createElement("div");
	card.className = "result-card";

	const criteria = computeAllStatuses(account?.aopCriteria || DEFAULT_AOP_CRITERIA);
	const reqCriteria = criteria.find(c => c.title === "Requirements");
	const nthCriteria = criteria.find(c => c.title === "Nice-to-Haves");

	const reqOverallStatus = reqCriteria ? reqCriteria.status : "na";
	const demandbaseStatus = (nthCriteria && nthCriteria.sections[1]) ? getSectionStatus(nthCriteria.sections[1]) : "na";

	// Title with qualification badge
	const title = document.createElement("div");
	title.className = "result-card__title";
	title.appendChild(document.createTextNode("Summary"));
	const qualStatus = getQualificationStatus(account);
	const qualBadge = document.createElement("span");
	qualBadge.className = "slds-badge " + (qualStatus === "qualified" ? "slds-theme_success" : "slds-theme_error");
	qualBadge.textContent = qualStatus === "qualified" ? "Qualified" : "Disqualified";
	title.appendChild(qualBadge);

	const body = document.createElement("div");
	body.className = "result-card__body";

	const research = account?.research;
	if (research) {
	  // --- Requirements section ---
	  const reqTitle = document.createElement("div");
	  reqTitle.className = "result-card__section_title";
	  reqTitle.textContent = "Requirements";
	  body.appendChild(reqTitle);

	  const reqList = document.createElement("ul");
	  reqList.className = "result-card__list slds-p-vertical_x-small";

	  if (research.bdrTeamSize != null) {
		reqList.appendChild(createBulletWithBadge(
		  "BDR team size is " + research.bdrTeamSize,
		  research.bdrSource,
		  reqOverallStatus,
		  research.bdrEvidence
		));
	  }

	  if (research.b2bSaas && research.b2bSaasSource) {
		reqList.appendChild(createBulletWithBadge(
		  "Sells B2B SaaS",
		  research.b2bSaasSource,
		  "pass",
		  research.b2bSaasEvidence
		));
	  } else if (research.soc2 && research.soc2Source) {
		reqList.appendChild(createBulletWithBadge(
		  "Has SOC 2 certificate",
		  research.soc2Source,
		  "pass",
		  research.soc2Evidence
		));
	  }

	  body.appendChild(reqList);

	  // --- Nice-to-haves section ---
	  const nthTitle = document.createElement("div");
	  nthTitle.className = "result-card__section_title";
	  nthTitle.textContent = "Nice-to-haves";
	  body.appendChild(nthTitle);

	  const nthList = document.createElement("ul");
	  nthList.className = "result-card__list slds-p-vertical_x-small";

	  if (research.salesTeamGrowth) {
		nthList.appendChild(createBulletWithBadge(
		  "Sales team grew " + research.salesTeamGrowth + " YoY",
		  research.salesTeamGrowthSource,
		  "pass",
		  research.salesTeamGrowthEvidence
		));
	  }

	  if (research.demandbaseScore) {
		nthList.appendChild(createBulletWithBadge(
		  "Demandbase score is " + research.demandbaseScore,
		  research.demandbaseSource,
		  demandbaseStatus,
		  research.demandbaseEvidence
		));
	  }

	  if (research.pastOpp) {
		const opp = research.pastOpp;

		nthList.appendChild(createBulletWithBadge(
		  "There " + (opp.count === 1 ? "is" : "are") + " " + opp.count +
		  " closed-lost opp" + (opp.count > 1 ? "s" : "") +
		  " from " + opp.monthsAgo + " months ago",
		  opp.oppSource,
		  "pass",
		  opp.oppEvidence
		));

		if (opp.calls && opp.callSentiment) {
		  nthList.appendChild(createBulletWithBadge(
			"Based on " + opp.calls + " call" + (opp.calls !== 1 ? "s" : "") + ", " + opp.callSentiment,
			opp.callSource,
			"pass",
			opp.callEvidence
		  ));
		}

		if (opp.emails && opp.emailSentiment) {
		  nthList.appendChild(createBulletWithBadge(
			opp.emailSentiment,
			opp.emailSource,
			"pass",
			opp.emailEvidence
		  ));
		}
	  }

	  if (research.signals && research.signals.length) {
		research.signals.forEach(function(signal) {
		  nthList.appendChild(createBulletWithBadge(signal.text, signal.source, "pass", signal.evidence));
		});
	  }

	  body.appendChild(nthList);
	}

	card.appendChild(title);
	card.appendChild(body);
	return card;
  }
  
  // ---- Loading Component ----
  function initLoading(container, account, onDone) {
	const criteria = computeAllStatuses(account?.aopCriteria || DEFAULT_AOP_CRITERIA);

	const stepsData = [
	  { id: 0, state: "waiting", title: "Preparing", criteriaIndex: 0,
		doneTitles: { pass: "Valid Account", fail: "Invalid Account", warning: "Valid Account" },
		thoughts: [
		  "Reading Run Conditions",
		  "Checking For Errors",
		  "Verifying Account",
	  ]},
	  { id: 1, state: "waiting", title: "Checking Requirements", criteriaIndex: 1,
		doneTitles: { pass: "Requirements Met", fail: "Requirements Not Met", warning: "Requirements Not Met" },
		thoughts: [
		  "Checking Salesforce",
		  "Checking ZoomInfo",
	  ]},
	  { id: 2, state: "waiting", title: "Checking Nice-to-Haves", criteriaIndex: 2,
		doneTitles: { pass: "Nice-to-haves Met", fail: "No Nice-to-haves", warning: "Some Nice-to-haves" },
		thoughts: [
		  "Reading website",
		  "Checking Salesforce",
		  "Collecting Signals",
		  "Analyzing past conversations",
	  ]},
	];
	const stepCount = stepsData.length;
  
	const THOUGHT_TICK_MS = 1750;
	let currentStep = 0;
	let timer = null;
	const startTime = new Date();
  
	// Build DOM
	const loadingDiv = document.createElement("div");
	loadingDiv.className = "loading";
  
	const stepsDiv = document.createElement("div");
	stepsDiv.className = "loading__steps";
	loadingDiv.appendChild(stepsDiv);
  
	// Create DOM elements per step
	const stepRefs = stepsData.map(() => createStepElement());
	stepRefs.forEach(r => stepsDiv.appendChild(r.el));
  
	container.appendChild(loadingDiv);
  
	function getDistance(i, step, allDone) {
	  if (allDone || i <= step) {
		return i;
	  }
	  return i - 1;
	}

	function render() {
	  const allDone = currentStep === stepCount;
	  loadingDiv.className = "loading" + (allDone ? " loading--done" : "");

	  const stepHeightRem = 2;
	  stepsDiv.style.height = (Math.min(currentStep + 1, stepCount) * stepHeightRem) + "rem";

	  stepsData.forEach((s, i) => {
		const distance = getDistance(i, currentStep, allDone);
		const fade = allDone ? 0 : (i > currentStep ? 1 : 0);
		updateStepElement(stepRefs[i], { ...s, distance, fade });
	  });
	}
  
	function updatedItem(item) {
	  const { id, state, start, thoughts, thoughtIndex } = item;
	  const updated = { id, state };
  
	  if (!start) {
		updated.start = new Date();
		updated.state = "progress";
		updated.thoughtIndex = 0;
		return updated;
	  }
  
	  if (thoughts && thoughts.length) {
		const next = (thoughtIndex === undefined ? 0 : thoughtIndex) + 1;
		if (next < thoughts.length) {
		  updated.thoughtIndex = next;
		  return updated;
		}
	  }
  
	  // All thoughts exhausted — step is done
	  updated.finish = new Date();
	  updated.state = "done";
	  const criteriaItem = criteria[item.criteriaIndex];
	  updated.status = criteriaItem ? criteriaItem.status : "pass";
	  updated.doneTitle = (item.doneTitles && item.doneTitles[updated.status]) || item.title;
	  const thoughtCount = thoughts ? thoughts.length : 0;
	  const secs = Math.round((thoughtCount * THOUGHT_TICK_MS) / 1000);
	  updated.doneSubTitle = `Completed in ${secs}s`;
	  return updated;
	}
  
	function tick(delay = 0) {
	  timer = setTimeout(() => {
		if (currentStep >= stepCount) return;
  
		const item = stepsData[currentStep];
		const updated = updatedItem(item);
		Object.assign(item, updated);
  
		render();
  
		if (updated.state === "done") {
		  currentStep++;
		  if (currentStep < stepCount) {
			tick(50);
		  } else {
			const DONE_DWELL_MS = 800;
			const FADE_OUT_MS = 300;
			const RESULT_STAGGER_MS = 300;

			setTimeout(() => {
			  loadingDiv.style.transition = `opacity ${FADE_OUT_MS}ms`;
			  loadingDiv.style.opacity = "0";
			  setTimeout(() => {
				loadingDiv.style.display = "none";
			const totalMs = new Date() - startTime;
			const completedCard = createCompletedCard(totalMs, criteria, account?.reasoning);
			const resultCard = createResultCard(account);
				container.appendChild(completedCard);
				container.appendChild(resultCard);
				requestAnimationFrame(() => {
				  requestAnimationFrame(() => {
					completedCard.classList.add("completed-card--visible");
					setTimeout(() => resultCard.classList.add("result-card--visible"), RESULT_STAGGER_MS);
				  });
				});
			  }, FADE_OUT_MS);
			  if (onDone) onDone();
			}, DONE_DWELL_MS);
		  }
		} else {
		  tick(THOUGHT_TICK_MS);
		}
	  }, delay);
	}
  
	let paused = false;

	render();
	tick(0);
  
	return {
	  stop: () => clearTimeout(timer),
	  pause: () => { paused = true; clearTimeout(timer); },
	  resume: () => { if (paused) { paused = false; tick(0); } },
	  isPaused: () => paused,
	};
  }
  
  // ---- Prospect Preview ----
  function getProspectList(account) {
    const prospectsByAccount = window.PROSPECT_BY_ACCOUNT || {};
    const accountName = account ? account.name : "";
    const entry = prospectsByAccount[accountName];
    if (!entry) return [];
    return Array.isArray(entry) ? entry : (entry.prospects || []);
  }

  function getProspectReasoning(account) {
    const prospectsByAccount = window.PROSPECT_BY_ACCOUNT || {};
    const accountName = account ? account.name : "";
    const entry = prospectsByAccount[accountName];
    if (!entry || Array.isArray(entry)) return "";
    return entry.reasoning || "";
  }

  function getProspectFitLabel(score) {
    if (score >= 80) return { text: "Great Fit", cls: "slds-theme_success" };
    if (score >= 50) return { text: "Acceptable Fit", cls: "slds-badge_lightest" };
    return { text: "Bad Fit", cls: "slds-theme_error" };
  }

  function createProspectResultCard(account) {
    const ns = "http://www.w3.org/2000/svg";
    const prospects = getProspectList(account);
    const topProspects = prospects
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);

    const card = document.createElement("div");
    card.className = "result-card";

    const title = document.createElement("div");
    title.className = "result-card__title";
    title.textContent = "Summary";
    card.appendChild(title);

    const body = document.createElement("div");
    body.className = "result-card__body";

    if (topProspects.length === 0) {
      const empty = document.createElement("p");
      empty.className = "slds-p-around_medium slds-text-color_weak";
      empty.textContent = "No prospects found for this account.";
      body.appendChild(empty);
      card.appendChild(body);
      return card;
    }

    topProspects.forEach(prospect => {
      const row = document.createElement("div");
      row.className = "prospect-row-item";

      const header = document.createElement("div");
      header.className = "slds-grid slds-grid_vertical-align-center";

      const nameEl = document.createElement("p");
      nameEl.className = "prospect-preview-record-name slds-m-right_xx-small";
      const nameLink = document.createElement("a");
      nameLink.textContent = prospect.name;
      nameEl.appendChild(nameLink);
      header.appendChild(nameEl);

      const titleEl = document.createElement("p");
      titleEl.textContent = "- " + prospect.title;
      header.appendChild(titleEl);

      const fit = getProspectFitLabel(prospect.score || 0);
      const fitBadge = document.createElement("span");
      fitBadge.className = "slds-badge " + fit.cls + " slds-m-left_x-small";
      fitBadge.textContent = " " + fit.text;
      header.appendChild(fitBadge);

      if (prospect.notInCrm) {
        const crmBadge = document.createElement("span");
        crmBadge.className = "slds-badge slds-badge_new-contact";
        const crmIconWrap = document.createElement("span");
        crmIconWrap.className = "slds-badge__icon slds-badge__icon_left";
        const crmIconContainer = document.createElement("span");
        crmIconContainer.className = "slds-icon_container";
        const crmSvg = document.createElementNS(ns, "svg");
        crmSvg.classList.add("slds-icon", "slds-icon_xx-small");
        crmSvg.style.fill = "var(--slds-g-color-palette-cloud-blue-60)";
        crmSvg.setAttribute("aria-hidden", "true");
        const crmUse = document.createElementNS(ns, "use");
        crmUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#not_in_sync");
        crmSvg.appendChild(crmUse);
        crmIconContainer.appendChild(crmSvg);
        crmIconWrap.appendChild(crmIconContainer);
        crmBadge.appendChild(crmIconWrap);
        crmBadge.appendChild(document.createTextNode("Not in CRM"));
        header.appendChild(crmBadge);
      }

      row.appendChild(header);

      const bullets = prospect.bullets || [];
      if (bullets.length) {
        const ul = document.createElement("ul");
        ul.className = "result-card__list slds-p-vertical_x-small";
        bullets.forEach(b => {
          ul.appendChild(createBulletWithBadge(b.text, b.source, "pass", b.evidence));
        });
        row.appendChild(ul);
      }

      body.appendChild(row);
    });

    card.appendChild(body);
    return card;
  }

  function getProspectStepsForAccount(account) {
    const prospects = getProspectList(account);
    const prospectCount = prospects.length;

    const searchThoughts = ["Searching ZoomInfo for contacts"];
    prospects.forEach(p => {
      searchThoughts.push("Found " + p.name + " — " + p.title);
    });
    if (prospectCount === 0) searchThoughts.push("No matching contacts found");

    const scoreThoughts = [];
    prospects.forEach(p => {
      scoreThoughts.push("Scoring " + p.name + " (ICP fit)");
    });
    if (scoreThoughts.length === 0) scoreThoughts.push("No prospects to score");
    scoreThoughts.push("Ranking " + prospectCount + " prospect" + (prospectCount !== 1 ? "s" : ""));

    return [
      { id: 0, state: "waiting", title: "Finding Contacts",
        doneTitles: { pass: prospectCount + " Contact" + (prospectCount !== 1 ? "s" : "") + " Found" },
        thoughts: searchThoughts },
      { id: 1, state: "waiting", title: "Prioritizing",
        doneTitles: { pass: prospectCount + " Prospect" + (prospectCount !== 1 ? "s" : "") + " Scored" },
        thoughts: scoreThoughts },
    ];
  }

  function createProspectCompletedCard(totalMs, account) {
    const ns = "http://www.w3.org/2000/svg";
    const prospects = getProspectList(account);
    const reasoning = getProspectReasoning(account);

    const goodFit  = prospects.filter(p => p.score >= 80);
    const okFit    = prospects.filter(p => p.score >= 50 && p.score < 80);
    const badFit   = prospects.filter(p => p.score < 50);

    const completedCard = document.createElement("div");
    completedCard.className = "completed-card";

    // --- Header ---
    const header = document.createElement("button");
    header.className = "completed-card__header";

    const summary = document.createElement("div");
    summary.className = "completed-card__summary";

    const titleRow = document.createElement("div");
    titleRow.className = "completed-card__title";
    const titleText = document.createElement("span");
    titleText.textContent = "Completed";
    titleRow.appendChild(titleText);

    const timeRow = document.createElement("div");
    timeRow.className = "completed-card__time";
    timeRow.textContent = durationFormatted(totalMs);

    summary.appendChild(titleRow);
    summary.appendChild(timeRow);

    const chevronContainer = document.createElement("span");
    chevronContainer.className = "slds-icon_container slds-current-color completed-card__chevron";
    chevronContainer.title = "Toggle details";
    const chevronSvg = document.createElementNS(ns, "svg");
    chevronSvg.setAttribute("aria-hidden", "true");
    chevronSvg.setAttribute("viewBox", "0 0 52 52");
    chevronSvg.classList.add("slds-icon", "slds-icon_xx-small");
    const chevronPath = document.createElementNS(ns, "path");
    chevronPath.setAttribute("d", "M47.6 17.8L27.1 38.5c-.6.6-1.6.6-2.2 0L4.4 17.8c-.6-.6-.6-1.6 0-2.2l2.2-2.2c.6-.6 1.6-.6 2.2 0L26 31.2l17.2-17.8c.6-.6 1.6-.6 2.2 0l2.2 2.2c.6.6.6 1.6 0 2.2z");
    chevronSvg.appendChild(chevronPath);
    const chevronAssistive = document.createElement("span");
    chevronAssistive.className = "slds-assistive-text";
    chevronAssistive.textContent = "Toggle details";
    chevronContainer.appendChild(chevronSvg);
    chevronContainer.appendChild(chevronAssistive);

    const checkContainer = document.createElement("span");
    checkContainer.className = "slds-icon_container slds-icon-utility-success";
    checkContainer.title = "checkmark";
    const checkSvg = document.createElementNS(ns, "svg");
    checkSvg.classList.add("slds-icon", "slds-icon_x-small");
    checkSvg.setAttribute("aria-hidden", "true");
    checkSvg.style.fill = "#066AFE";
    const checkUse = document.createElementNS(ns, "use");
    checkUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#success");
    checkSvg.appendChild(checkUse);
    const checkAssistive = document.createElement("span");
    checkAssistive.className = "slds-assistive-text";
    checkAssistive.textContent = "Checkmark";
    checkContainer.appendChild(checkSvg);
    checkContainer.appendChild(checkAssistive);

    header.appendChild(chevronContainer);
    header.appendChild(summary);
    header.appendChild(checkContainer);

    // --- Body ---
    const body = document.createElement("div");
    body.className = "completed-card__body";
    const bodyInner = document.createElement("div");
    bodyInner.className = "completed-card__body-inner";
    const list = document.createElement("div");
    list.className = "completed-card__list";

    // 1. Reasoning accordion item
    if (reasoning) {
      list.appendChild(createProspectReasoningItem(reasoning));
    }

    // 2-4. Fit bucket accordion items
    const buckets = [
      { label: "Great Fit", prospects: goodFit,  status: "pass" },
      { label: "Acceptable Fit",   prospects: okFit,    status: "warning" },
      { label: "Bad Fit",  prospects: badFit,   status: "fail" },
    ];
    buckets.forEach(bucket => {
      if (bucket.prospects.length) {
        list.appendChild(createProspectBucketItem(bucket));
      }
    });

    bodyInner.appendChild(list);
    body.appendChild(bodyInner);
    completedCard.appendChild(header);
    completedCard.appendChild(body);

    header.addEventListener("click", () => {
      completedCard.classList.toggle("completed-card--open");
    });

    return completedCard;
  }

  function createProspectReasoningItem(reasoning) {
    const item = document.createElement("div");
    item.className = "completed-card__list-item";

    const hdr = document.createElement("button");
    hdr.className = "completed-card__list-item-header";

    const iconSwap = document.createElement("div");
    iconSwap.className = "icon-swap";

    const sparkleSpan = document.createElement("span");
    sparkleSpan.className = "slds-icon_container icon-swap__check";
    sparkleSpan.title = "Sparkle";
    const sparkleSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    sparkleSvg.classList.add("slds-icon", "slds-icon_xx-small");
    sparkleSvg.setAttribute("aria-hidden", "true");
    sparkleSvg.style.fill = "#066AFE";
    const sparkleUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    sparkleUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#sparkle");
    sparkleSvg.appendChild(sparkleUse);
    sparkleSpan.appendChild(sparkleSvg);
    const sparkleAssistive = document.createElement("span");
    sparkleAssistive.className = "slds-assistive-text";
    sparkleAssistive.textContent = "Sparkle";
    sparkleSpan.appendChild(sparkleAssistive);
    iconSwap.appendChild(sparkleSpan);

    const rChevronSpan = document.createElement("span");
    rChevronSpan.className = "slds-icon_container icon-swap__chevron";
    rChevronSpan.title = "chevronright";
    const rChevronSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    rChevronSvg.classList.add("slds-icon", "slds-icon_xx-small");
    rChevronSvg.setAttribute("aria-hidden", "true");
    rChevronSvg.style.fill = "#747474";
    const rChevronUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    rChevronUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#chevronright");
    rChevronSvg.appendChild(rChevronUse);
    rChevronSpan.appendChild(rChevronSvg);
    iconSwap.appendChild(rChevronSpan);

    const leftSide = document.createElement("div");
    leftSide.className = "completed-card__list-item-left-side";
    leftSide.appendChild(iconSwap);

    const title = document.createElement("div");
    title.className = "completed-card__list-item-title";
    title.textContent = "Reasoning";
    leftSide.appendChild(title);

    hdr.appendChild(leftSide);

    item.appendChild(hdr);

    const bdy = document.createElement("div");
    bdy.className = "completed-card__list-item-body";
    const bdyInner = document.createElement("div");
    bdyInner.className = "completed-card__list-item-body-inner";
    const p = document.createElement("p");
    p.className = "completed-card__reasoning-text";
    p.textContent = reasoning;
    bdyInner.appendChild(p);
    bdy.appendChild(bdyInner);
    item.appendChild(bdy);

    hdr.addEventListener("click", () => {
      item.classList.toggle("completed-card__list-item--open");
    });

    return item;
  }

  function createProspectBucketItem(bucket) {
    const item = document.createElement("div");
    item.className = "completed-card__list-item";

    const hdr = document.createElement("button");
    hdr.className = "completed-card__list-item-header";

    const leftSide = document.createElement("div");
    leftSide.className = "completed-card__list-item-left-side";

    const iconSwap = createListItemIconSwap("pass");
    leftSide.appendChild(iconSwap);

    const title = document.createElement("div");
    title.className = "completed-card__list-item-title";
    title.textContent = bucket.label;
    leftSide.appendChild(title);

    hdr.appendChild(leftSide);

    const rightSide = document.createElement("div");
    rightSide.className = "completed-card__list-item-right-side";

    const badgeCfg = {
      pass:    { cls: "slds-theme_success" },
      warning: { cls: "slds-badge_lightest" },
      fail:    { cls: "slds-theme_error" },
    };
    const bc = badgeCfg[bucket.status] || badgeCfg.pass;
    const badge = document.createElement("span");
    badge.className = "slds-badge " + bc.cls;
    badge.textContent = String(bucket.prospects.length);
    rightSide.appendChild(badge);

    hdr.appendChild(rightSide);

    item.appendChild(hdr);

    const bdy = document.createElement("div");
    bdy.className = "completed-card__list-item-body";
    const bdyInner = document.createElement("div");
    bdyInner.className = "completed-card__list-item-body-inner";

    bucket.prospects.forEach(prospect => {
      const section = document.createElement("div");
      section.className = "completed-card__section";

      const subTitle = document.createElement("div");
      subTitle.className = "completed-card__list-item-subtitle";
      subTitle.textContent = prospect.name;
      section.appendChild(subTitle);

      const fields = [
        { label: "Title", value: prospect.title },
        { label: "Department", value: prospect.department },
        { label: "Seniority", value: prospect.seniority },
        { label: "Email", value: prospect.email },
        { label: "Phone", value: prospect.phone },
      ];

      const ul = document.createElement("ul");
      ul.className = "completed-card__list-item-thoughts";
      fields.forEach(f => {
        if (!f.value) return;
        const li = document.createElement("li");
        li.className = "completed-card__list-item-info";
        li.textContent = f.label + ": " + f.value;
        ul.appendChild(li);
      });
      section.appendChild(ul);

      bdyInner.appendChild(section);
    });

    bdy.appendChild(bdyInner);
    item.appendChild(bdy);

    hdr.addEventListener("click", () => {
      item.classList.toggle("completed-card__list-item--open");
    });

    return item;
  }

  function createListItemIconSwap(status) {
    const iconSwap = document.createElement("div");
    iconSwap.className = "icon-swap";

    const statusIconMap = {
      pass:    { icon: "success",  fill: "#066AFE", label: "Checkmark" },
      warning: { icon: "warning",  fill: "#5C5C5C", label: "Warning" },
      fail:    { icon: "error",    fill: "#B60554", label: "Fail" },
    };
    const iconCfg = statusIconMap[status] || statusIconMap.pass;

    const statusSpan = document.createElement("span");
    statusSpan.className = "slds-icon_container icon-swap__check";
    statusSpan.title = iconCfg.label;
    const statusSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    statusSvg.classList.add("slds-icon", "slds-icon_xx-small");
    statusSvg.setAttribute("aria-hidden", "true");
    statusSvg.style.fill = iconCfg.fill;
    const statusUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    statusUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#" + iconCfg.icon);
    statusSvg.appendChild(statusUse);
    statusSpan.appendChild(statusSvg);
    const statusAssistive = document.createElement("span");
    statusAssistive.className = "slds-assistive-text";
    statusAssistive.textContent = iconCfg.label;
    statusSpan.appendChild(statusAssistive);
    iconSwap.appendChild(statusSpan);

    const chevronSpan = document.createElement("span");
    chevronSpan.className = "slds-icon_container icon-swap__chevron";
    chevronSpan.title = "chevronright";
    const chevronSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chevronSvg.classList.add("slds-icon", "slds-icon_xx-small");
    chevronSvg.setAttribute("aria-hidden", "true");
    chevronSvg.style.fill = "#747474";
    const chevronUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    chevronUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#chevronright");
    chevronSvg.appendChild(chevronUse);
    chevronSpan.appendChild(chevronSvg);
    iconSwap.appendChild(chevronSpan);

    return iconSwap;
  }

  function initProspectLoading(container, account, onDone) {
    const stepsData = getProspectStepsForAccount(account);
    const stepCount = stepsData.length;
    const THOUGHT_TICK_MS = 950;
    let currentStep = 0;
    let timer = null;
    const startTime = new Date();

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "loading";
    const stepsDiv = document.createElement("div");
    stepsDiv.className = "loading__steps";
    loadingDiv.appendChild(stepsDiv);

    const stepRefs = stepsData.map(() => createStepElement());
    stepRefs.forEach(r => stepsDiv.appendChild(r.el));
    container.appendChild(loadingDiv);

    function render() {
      const allDone = currentStep === stepCount;
      loadingDiv.className = "loading" + (allDone ? " loading--done" : "");
      stepsDiv.style.height = (Math.min(currentStep + 1, stepCount) * 2) + "rem";
      stepsData.forEach((s, i) => {
        const distance = (allDone || i <= currentStep) ? i : i - 1;
        const fade = allDone ? 0 : (i > currentStep ? 1 : 0);
        updateStepElement(stepRefs[i], { ...s, distance, fade });
      });
    }

    function tick(delay = 0) {
      timer = setTimeout(() => {
        if (currentStep >= stepCount) return;
        const item = stepsData[currentStep];
        if (!item.start) { item.start = new Date(); item.state = "progress"; item.thoughtIndex = 0; }
        else if (item.thoughts && (item.thoughtIndex + 1) < item.thoughts.length) { item.thoughtIndex++; }
        else {
          item.state = "done"; item.finish = new Date(); item.status = "pass";
          item.doneTitle = (item.doneTitles && item.doneTitles.pass) || item.title;
          item.doneSubTitle = `Completed in ${Math.round((item.thoughts.length * THOUGHT_TICK_MS) / 1000)}s`;
          currentStep++;
        }
        render();
        if (currentStep < stepCount) { tick(item.state === "done" ? 50 : THOUGHT_TICK_MS); }
        else {
          const DONE_DWELL_MS = 800;
          const FADE_OUT_MS = 300;
          setTimeout(() => {
            loadingDiv.style.transition = `opacity ${FADE_OUT_MS}ms`;
            loadingDiv.style.opacity = "0";
            setTimeout(() => {
              loadingDiv.style.display = "none";
              const totalMs = new Date() - startTime;
              const completedCard = createProspectCompletedCard(totalMs, account);
              container.appendChild(completedCard);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  completedCard.classList.add("completed-card--visible");
                });
              });

              const resultCard = createProspectResultCard(account);
              container.appendChild(resultCard);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  resultCard.classList.add("result-card--visible");
                });
              });

              if (onDone) onDone();
            }, FADE_OUT_MS);
          }, DONE_DWELL_MS);
        }
      }, delay);
    }

    let paused = false;
    render(); tick(0);
    return {
      stop: () => clearTimeout(timer),
      pause: () => { paused = true; clearTimeout(timer); },
      resume: () => { if (paused) { paused = false; tick(0); } },
      isPaused: () => paused,
    };
  }

  // ---- Write Messaging Preview ----
  // NOTE: loading steps, completed-card fields, and email body are placeholders
  // the user will refine later. Structure mirrors initProspectLoading so it can
  // be swapped 1:1 when real data arrives.
  function createEmailResultCard(prospect) {
    const card = document.createElement("div");
    card.className = "result-card email-result-card";

    const title = document.createElement("div");
    title.className = "result-card__title";
    title.textContent = "Summary";
    card.appendChild(title);

    const body = document.createElement("div");
    body.className = "result-card__body";

    const name = prospect && prospect.name ? prospect.name : "the prospect";
    const firstName = name.split(/\s+/)[0];
    const role = prospect && prospect.title ? prospect.title : "your role";
    const account = prospect && prospect.account ? prospect.account : "your company";
    const email = prospect && prospect.email ? prospect.email : "prospect@example.com";

    const meta = document.createElement("div");
    meta.className = "email-result-card__meta";
    meta.innerHTML =
      '<div class="email-result-card__row"><span class="email-result-card__label">To</span>' +
      '<span class="email-result-card__value">' + name + ' &lt;' + email + '&gt;</span></div>' +
      '<div class="email-result-card__row"><span class="email-result-card__label">Subject</span>' +
      '<span class="email-result-card__value">Quick idea for ' + account + '\u2019s pipeline growth</span></div>';
    body.appendChild(meta);

    const emailBody = document.createElement("div");
    emailBody.className = "email-result-card__body";
    emailBody.innerHTML =
      '<p>Hi ' + firstName + ',</p>' +
      '<p>Noticed ' + account + ' has been scaling its GTM team and figured, as ' + role +
      ', you\u2019ve probably been in the middle of those pipeline conversations. Teams at a similar stage have been using our platform to tighten up how their reps prioritize outbound \u2014 usually translating into a measurable lift in qualified meetings within the first quarter.</p>' +
      '<p>Worth a quick 15 minutes next week to compare notes on what\u2019s working for ' + account + '?</p>' +
      '<p>Best,<br/>Alex</p>';
    body.appendChild(emailBody);

    card.appendChild(body);
    return card;
  }

  function createEmailCompletedCard(totalMs, prospect) {
    const ns = "http://www.w3.org/2000/svg";
    const accountName = prospect && prospect.account ? prospect.account : "the prospect's account";
    const reasoning =
      "I reviewed " + (prospect && prospect.name ? prospect.name : "the prospect") +
      "'s role and recent activity at " + accountName +
      " to ground the email in context. I picked a single pain point the agent has the strongest signal for, kept the message under 120 words, and closed with a low-friction ask so the prospect can reply quickly.";

    const completedCard = document.createElement("div");
    completedCard.className = "completed-card";

    // --- Header: chevron (L) | summary | check (R) ---
    const header = document.createElement("button");
    header.className = "completed-card__header";

    const summary = document.createElement("div");
    summary.className = "completed-card__summary";

    const titleRow = document.createElement("div");
    titleRow.className = "completed-card__title";
    const titleText = document.createElement("span");
    titleText.textContent = "Completed";
    titleRow.appendChild(titleText);

    const timeRow = document.createElement("div");
    timeRow.className = "completed-card__time";
    timeRow.textContent = durationFormatted(totalMs);

    summary.appendChild(titleRow);
    summary.appendChild(timeRow);

    const chevronContainer = document.createElement("span");
    chevronContainer.className = "slds-icon_container slds-current-color completed-card__chevron";
    chevronContainer.title = "Toggle details";
    const chevronSvg = document.createElementNS(ns, "svg");
    chevronSvg.setAttribute("aria-hidden", "true");
    chevronSvg.setAttribute("viewBox", "0 0 52 52");
    chevronSvg.classList.add("slds-icon", "slds-icon_xx-small");
    const chevronPath = document.createElementNS(ns, "path");
    chevronPath.setAttribute("d", "M47.6 17.8L27.1 38.5c-.6.6-1.6.6-2.2 0L4.4 17.8c-.6-.6-.6-1.6 0-2.2l2.2-2.2c.6-.6 1.6-.6 2.2 0L26 31.2l17.2-17.8c.6-.6 1.6-.6 2.2 0l2.2 2.2c.6.6.6 1.6 0 2.2z");
    chevronSvg.appendChild(chevronPath);
    chevronContainer.appendChild(chevronSvg);
    const chevronAssistive = document.createElement("span");
    chevronAssistive.className = "slds-assistive-text";
    chevronAssistive.textContent = "Toggle details";
    chevronContainer.appendChild(chevronAssistive);

    const checkContainer = document.createElement("span");
    checkContainer.className = "slds-icon_container slds-icon-utility-success";
    checkContainer.title = "checkmark";
    const checkSvg = document.createElementNS(ns, "svg");
    checkSvg.classList.add("slds-icon", "slds-icon_x-small");
    checkSvg.setAttribute("aria-hidden", "true");
    checkSvg.style.fill = "#066AFE";
    const checkUse = document.createElementNS(ns, "use");
    checkUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#success");
    checkSvg.appendChild(checkUse);
    checkContainer.appendChild(checkSvg);
    const checkAssistive = document.createElement("span");
    checkAssistive.className = "slds-assistive-text";
    checkAssistive.textContent = "Checkmark";
    checkContainer.appendChild(checkAssistive);

    header.appendChild(chevronContainer);
    header.appendChild(summary);
    header.appendChild(checkContainer);

    // --- Body: Reasoning + 3 nested accordion rows with icon-swap ---
    const body = document.createElement("div");
    body.className = "completed-card__body";
    const bodyInner = document.createElement("div");
    bodyInner.className = "completed-card__body-inner";
    const list = document.createElement("div");
    list.className = "completed-card__list";

    list.appendChild(createProspectReasoningItem(reasoning));

    const rows = [
      {
        title: "Personalization signals",
        body:
          "Placeholder: signals the agent used to personalize the message — role, recent account news, and prior engagement history.",
      },
      {
        title: "Email composition",
        body:
          "Placeholder: notes on the subject line, opening hook, value proposition, and single call to action chosen for this draft.",
      },
      {
        title: "Quality review",
        body:
          "Placeholder: checks on tone, length, reading level, and adherence to your email standards before the draft is surfaced.",
      },
    ];
    rows.forEach(r => list.appendChild(createEmailListItem(r.title, r.body)));

    bodyInner.appendChild(list);
    body.appendChild(bodyInner);
    completedCard.appendChild(header);
    completedCard.appendChild(body);

    header.addEventListener("click", () => {
      completedCard.classList.toggle("completed-card--open");
    });

    return completedCard;
  }

  function createEmailListItem(titleText, bodyText) {
    const item = document.createElement("div");
    item.className = "completed-card__list-item";

    const hdr = document.createElement("button");
    hdr.className = "completed-card__list-item-header";

    const leftSide = document.createElement("div");
    leftSide.className = "completed-card__list-item-left-side";
    leftSide.appendChild(createListItemIconSwap("pass"));

    const title = document.createElement("div");
    title.className = "completed-card__list-item-title";
    title.textContent = titleText;
    leftSide.appendChild(title);

    hdr.appendChild(leftSide);
    item.appendChild(hdr);

    const bdy = document.createElement("div");
    bdy.className = "completed-card__list-item-body";
    const bdyInner = document.createElement("div");
    bdyInner.className = "completed-card__list-item-body-inner";
    const p = document.createElement("p");
    p.className = "completed-card__reasoning-text";
    p.textContent = bodyText;
    bdyInner.appendChild(p);
    bdy.appendChild(bdyInner);
    item.appendChild(bdy);

    hdr.addEventListener("click", () => {
      item.classList.toggle("completed-card__list-item--open");
    });

    return item;
  }

  function initEmailLoading(container, prospect, onDone) {
    // Placeholder loading steps — user will replace with the real sequence.
    const stepsData = [
      { id: 0, state: "waiting", title: "Gathering prospect context",
        doneTitles: { pass: "Context gathered" },
        thoughts: ["Reading prospect profile", "Pulling account signals", "Reviewing past conversations"] },
      { id: 1, state: "waiting", title: "Drafting email",
        doneTitles: { pass: "Email drafted" },
        thoughts: ["Selecting personalization angle", "Writing subject line", "Composing body copy"] },
      { id: 2, state: "waiting", title: "Reviewing tone and length",
        doneTitles: { pass: "Draft reviewed" },
        thoughts: ["Checking tone", "Trimming to target length", "Confirming call to action"] },
    ];
    const stepCount = stepsData.length;
    const THOUGHT_TICK_MS = 1400;
    let currentStep = 0;
    let timer = null;
    const startTime = new Date();

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "loading";
    const stepsDiv = document.createElement("div");
    stepsDiv.className = "loading__steps";
    loadingDiv.appendChild(stepsDiv);

    const stepRefs = stepsData.map(() => createStepElement());
    stepRefs.forEach(r => stepsDiv.appendChild(r.el));
    container.appendChild(loadingDiv);

    function render() {
      const allDone = currentStep === stepCount;
      loadingDiv.className = "loading" + (allDone ? " loading--done" : "");
      stepsDiv.style.height = (Math.min(currentStep + 1, stepCount) * 2) + "rem";
      stepsData.forEach((s, i) => {
        const distance = (allDone || i <= currentStep) ? i : i - 1;
        const fade = allDone ? 0 : (i > currentStep ? 1 : 0);
        updateStepElement(stepRefs[i], { ...s, distance, fade });
      });
    }

    function tick(delay = 0) {
      timer = setTimeout(() => {
        if (currentStep >= stepCount) return;
        const item = stepsData[currentStep];
        if (!item.start) { item.start = new Date(); item.state = "progress"; item.thoughtIndex = 0; }
        else if (item.thoughts && (item.thoughtIndex + 1) < item.thoughts.length) { item.thoughtIndex++; }
        else {
          item.state = "done"; item.finish = new Date(); item.status = "pass";
          item.doneTitle = (item.doneTitles && item.doneTitles.pass) || item.title;
          item.doneSubTitle = `Completed in ${Math.round((item.thoughts.length * THOUGHT_TICK_MS) / 1000)}s`;
          currentStep++;
        }
        render();
        if (currentStep < stepCount) { tick(item.state === "done" ? 50 : THOUGHT_TICK_MS); }
        else {
          const DONE_DWELL_MS = 800;
          const FADE_OUT_MS = 300;
          setTimeout(() => {
            loadingDiv.style.transition = `opacity ${FADE_OUT_MS}ms`;
            loadingDiv.style.opacity = "0";
            setTimeout(() => {
              loadingDiv.style.display = "none";
              const totalMs = new Date() - startTime;
              const completedCard = createEmailCompletedCard(totalMs, prospect);
              container.appendChild(completedCard);
              requestAnimationFrame(() => requestAnimationFrame(() => completedCard.classList.add("completed-card--visible")));

              const resultCard = createEmailResultCard(prospect);
              container.appendChild(resultCard);
              requestAnimationFrame(() => requestAnimationFrame(() => resultCard.classList.add("result-card--visible")));

              if (onDone) onDone();
            }, FADE_OUT_MS);
          }, DONE_DWELL_MS);
        }
      }, delay);
    }

    let paused = false;
    render(); tick(0);
    return {
      stop: () => clearTimeout(timer),
      pause: () => { paused = true; clearTimeout(timer); },
      resume: () => { if (paused) { paused = false; tick(0); } },
      isPaused: () => paused,
    };
  }

  // ---- Full Preview (Account Research + Find Prospects) ----
  const SHOW_COMPLETED_CARD = true;

  function createFullPreviewPanel(account) {
    const ns = "http://www.w3.org/2000/svg";
    const prospects = getProspectList(account);
    const topProspects = prospects
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);
    let currentProspectIndex = 0;

    const panel = document.createElement("div");
    panel.className = "full-preview-panel";

    // ── Header ──
    const header = document.createElement("div");
    header.className = "full-preview-panel__header";

    const avatar = document.createElement("span");
    avatar.className = "slds-col slds-no-flex slds-m-right_small slds-avatar slds-avatar_medium slds-avatar_circle";
    const avatarIcon = document.createElement("div");
    avatarIcon.className = "slds-icon-standard-contact slds-icon_container";
    const avatarInner = document.createElement("span");
    avatarInner.style.cssText = "--sds-c-icon-color-background: #9050E9;";
    const avatarSvg = document.createElementNS(ns, "svg");
    avatarSvg.classList.add("slds-icon");
    avatarSvg.setAttribute("aria-hidden", "true");
    const avatarUse = document.createElementNS(ns, "use");
    avatarUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/standard-sprite/svg/symbols.svg#contact");
    avatarSvg.appendChild(avatarUse);
    avatarInner.appendChild(avatarSvg);
    avatarIcon.appendChild(avatarInner);
    avatar.appendChild(avatarIcon);
    header.appendChild(avatar);

    const titleBlock = document.createElement("div");
    titleBlock.className = "full-preview-panel__header-title";
    const nameEl = document.createElement("span");
    nameEl.className = "full-preview-panel__header-name";
    const subtitleEl = document.createElement("span");
    subtitleEl.className = "full-preview-panel__header-subtitle";
    titleBlock.appendChild(nameEl);
    titleBlock.appendChild(subtitleEl);
    header.appendChild(titleBlock);

    const navGroup = document.createElement("div");
    navGroup.className = "slds-button-group";
    navGroup.setAttribute("role", "group");

    function makeNavBtn(direction) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slds-button slds-button_icon-x-small slds-button_icon slds-button_icon-border-filled";
      btn.title = direction === "up" ? "Previous" : "Next";
      const svg = document.createElementNS(ns, "svg");
      svg.classList.add("slds-button__icon");
      svg.setAttribute("aria-hidden", "true");
      const use = document.createElementNS(ns, "use");
      use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href",
        "/assets/icons/utility-sprite/svg/symbols.svg#chevron" + direction);
      svg.appendChild(use);
      btn.appendChild(svg);
      const assistive = document.createElement("span");
      assistive.className = "slds-assistive-text";
      assistive.textContent = direction === "up" ? "Previous" : "Next";
      btn.appendChild(assistive);
      return btn;
    }

    const upBtn = makeNavBtn("up");
    const downBtn = makeNavBtn("down");
    navGroup.appendChild(upBtn);
    navGroup.appendChild(downBtn);
    header.appendChild(navGroup);

    panel.appendChild(header);

    const divider = document.createElement("div");
    divider.className = "slds-has-divider_bottom";
    panel.appendChild(divider);

    // ── Body ──
    const body = document.createElement("div");
    body.className = "full-preview-panel__body";

    // -- "Why this account?" accordion --
    function buildAccountAccordion() {
      const section = document.createElement("section");
      section.className = "slds-accordion__section slds-is-open";

      const summaryDiv = document.createElement("div");
      summaryDiv.className = "slds-accordion__summary";
      const heading = document.createElement("h2");
      heading.className = "slds-accordion__summary-heading";

      const toggleBtn = document.createElement("button");
      toggleBtn.className = "slds-button slds-button_reset slds-accordion__summary-action";
      toggleBtn.setAttribute("aria-expanded", "true");
      const switchIcon = document.createElementNS(ns, "svg");
      switchIcon.classList.add("slds-accordion__summary-action-icon", "slds-button__icon", "slds-button__icon_left");
      switchIcon.setAttribute("aria-hidden", "true");
      const switchUse = document.createElementNS(ns, "use");
      switchUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#switch");
      switchIcon.appendChild(switchUse);
      toggleBtn.appendChild(switchIcon);
      const labelSpan = document.createElement("span");
      labelSpan.className = "slds-accordion__summary-content";
      labelSpan.textContent = "Why this account?";
      toggleBtn.appendChild(labelSpan);
      heading.appendChild(toggleBtn);

      const qualStatus = getQualificationStatus(account);
      const qualBadge = document.createElement("span");
      qualBadge.className = "slds-badge " + (qualStatus === "qualified" ? "slds-theme_success" : "slds-theme_error");
      qualBadge.textContent = qualStatus === "qualified" ? "Qualified" : "Disqualified";
      heading.appendChild(qualBadge);

      summaryDiv.appendChild(heading);
      section.appendChild(summaryDiv);

      const content = document.createElement("div");
      content.className = "slds-accordion__content";

      const criteria = computeAllStatuses(account?.aopCriteria || DEFAULT_AOP_CRITERIA);
      const reqCriteria = criteria.find(c => c.title === "Requirements");
      const nthCriteria = criteria.find(c => c.title === "Nice-to-Haves");
      const reqOverallStatus = reqCriteria ? reqCriteria.status : "na";
      const demandbaseStatus = (nthCriteria && nthCriteria.sections[1]) ? getSectionStatus(nthCriteria.sections[1]) : "na";

      const research = account?.research;
      if (research) {
        const reqList = document.createElement("ul");
        reqList.className = "result-card__list slds-p-vertical_x-small";

        if (research.bdrTeamSize != null) {
          reqList.appendChild(createBulletWithBadge(
            "BDR team size is " + research.bdrTeamSize,
            research.bdrSource, reqOverallStatus, research.bdrEvidence));
        }
        if (research.b2bSaas && research.b2bSaasSource) {
          reqList.appendChild(createBulletWithBadge(
            "Sells B2B SaaS",
            research.b2bSaasSource, "pass", research.b2bSaasEvidence));
        } else if (research.soc2 && research.soc2Source) {
          reqList.appendChild(createBulletWithBadge(
            "Has SOC 2 certificate",
            research.soc2Source, "pass", research.soc2Evidence));
        }
        if (research.salesTeamGrowth) {
          reqList.appendChild(createBulletWithBadge(
            "Sales team grew " + research.salesTeamGrowth + " YoY",
            research.salesTeamGrowthSource, "pass", research.salesTeamGrowthEvidence));
        }
        if (research.demandbaseScore) {
          reqList.appendChild(createBulletWithBadge(
            "Demandbase score is " + research.demandbaseScore,
            research.demandbaseSource, demandbaseStatus, research.demandbaseEvidence));
        }
        if (research.pastOpp) {
          const opp = research.pastOpp;
          reqList.appendChild(createBulletWithBadge(
            "There " + (opp.count === 1 ? "is" : "are") + " " + opp.count +
            " closed-lost opp" + (opp.count > 1 ? "s" : "") +
            " from " + opp.monthsAgo + " months ago",
            opp.oppSource, "pass", opp.oppEvidence));
          if (opp.calls && opp.callSentiment) {
            reqList.appendChild(createBulletWithBadge(
              "Based on " + opp.calls + " call" + (opp.calls !== 1 ? "s" : "") + ", " + opp.callSentiment,
              opp.callSource, "pass", opp.callEvidence));
          }
          if (opp.emails && opp.emailSentiment) {
            reqList.appendChild(createBulletWithBadge(
              opp.emailSentiment, opp.emailSource, "pass", opp.emailEvidence));
          }
        }
        if (research.signals && research.signals.length) {
          research.signals.forEach(function(signal) {
            reqList.appendChild(createBulletWithBadge(signal.text, signal.source, "pass", signal.evidence));
          });
        }
        content.appendChild(reqList);
      }

      section.appendChild(content);

      toggleBtn.addEventListener("click", () => {
        section.classList.toggle("slds-is-open");
        toggleBtn.setAttribute("aria-expanded",
          section.classList.contains("slds-is-open") ? "true" : "false");
      });

      return section;
    }

    // -- "Why this prospect?" accordion --
    const prospectContent = document.createElement("div");
    prospectContent.className = "slds-accordion__content";

    const prospectFitBadge = document.createElement("span");
    prospectFitBadge.className = "slds-badge";

    function renderProspectContent(prospect) {
      prospectContent.innerHTML = "";
      if (!prospect) return;
      const bullets = prospect.bullets || [];
      if (bullets.length) {
        const ul = document.createElement("ul");
        ul.className = "result-card__list slds-p-vertical_x-small";
        bullets.forEach(b => {
          ul.appendChild(createBulletWithBadge(b.text, b.source, "pass", b.evidence));
        });
        prospectContent.appendChild(ul);
      }
    }

    function updateFitBadge(prospect) {
      if (!prospect) {
        prospectFitBadge.textContent = "";
        prospectFitBadge.className = "slds-badge";
        return;
      }
      const fit = getProspectFitLabel(prospect.score || 0);
      prospectFitBadge.className = "slds-badge " + fit.cls;
      prospectFitBadge.textContent = fit.text;
    }

    function updatePanel() {
      const prospect = topProspects[currentProspectIndex];
      if (prospect) {
        nameEl.textContent = prospect.name;
        subtitleEl.textContent = prospect.title || "";
        renderProspectContent(prospect);
        updateFitBadge(prospect);
      } else {
        nameEl.textContent = "No prospects";
        subtitleEl.textContent = "";
        prospectContent.innerHTML = "";
        updateFitBadge(null);
      }
    }

    function buildProspectAccordion() {
      const section = document.createElement("section");
      section.className = "slds-accordion__section slds-is-open";

      const summaryDiv = document.createElement("div");
      summaryDiv.className = "slds-accordion__summary";
      const heading = document.createElement("h2");
      heading.className = "slds-accordion__summary-heading";

      const toggleBtn = document.createElement("button");
      toggleBtn.className = "slds-button slds-button_reset slds-accordion__summary-action";
      toggleBtn.setAttribute("aria-expanded", "true");
      const switchIcon = document.createElementNS(ns, "svg");
      switchIcon.classList.add("slds-accordion__summary-action-icon", "slds-button__icon", "slds-button__icon_left");
      switchIcon.setAttribute("aria-hidden", "true");
      const switchUse = document.createElementNS(ns, "use");
      switchUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#switch");
      switchIcon.appendChild(switchUse);
      toggleBtn.appendChild(switchIcon);
      const labelSpan = document.createElement("span");
      labelSpan.className = "slds-accordion__summary-content";
      labelSpan.textContent = "Why this prospect?";
      toggleBtn.appendChild(labelSpan);
      heading.appendChild(toggleBtn);
      heading.appendChild(prospectFitBadge);

      summaryDiv.appendChild(heading);
      section.appendChild(summaryDiv);
      section.appendChild(prospectContent);

      toggleBtn.addEventListener("click", () => {
        section.classList.toggle("slds-is-open");
        toggleBtn.setAttribute("aria-expanded",
          section.classList.contains("slds-is-open") ? "true" : "false");
      });

      return section;
    }

    body.appendChild(buildAccountAccordion());
    body.appendChild(buildProspectAccordion());
    panel.appendChild(body);

    // ── Navigation ──
    upBtn.addEventListener("click", () => {
      if (topProspects.length === 0) return;
      currentProspectIndex = (currentProspectIndex - 1 + topProspects.length) % topProspects.length;
      updatePanel();
    });
    downBtn.addEventListener("click", () => {
      if (topProspects.length === 0) return;
      currentProspectIndex = (currentProspectIndex + 1) % topProspects.length;
      updatePanel();
    });

    updatePanel();
    return panel;
  }

  function createFullPreviewCompletedCard(totalMs, account) {
    const ns = "http://www.w3.org/2000/svg";
    const criteria = computeAllStatuses(account?.aopCriteria || DEFAULT_AOP_CRITERIA);
    const prospects = getProspectList(account);
    const accountReasoning = account?.reasoning || "";
    const prospectReasoning = getProspectReasoning(account);
    const combinedReasoning = [accountReasoning, prospectReasoning].filter(Boolean).join(" Then, ");

    const goodFit = prospects.filter(p => p.score >= 80);
    const okFit   = prospects.filter(p => p.score >= 50 && p.score < 80);
    const badFit  = prospects.filter(p => p.score < 50);

    const completedCard = document.createElement("div");
    completedCard.className = "completed-card";

    const header = document.createElement("button");
    header.className = "completed-card__header";

    const summary = document.createElement("div");
    summary.className = "completed-card__summary";
    const titleRow = document.createElement("div");
    titleRow.className = "completed-card__title";
    const titleText = document.createElement("span");
    titleText.textContent = "Completed";
    titleRow.appendChild(titleText);
    const timeRow = document.createElement("div");
    timeRow.className = "completed-card__time";
    timeRow.textContent = durationFormatted(totalMs);
    summary.appendChild(titleRow);
    summary.appendChild(timeRow);

    const chevronContainer = document.createElement("span");
    chevronContainer.className = "slds-icon_container slds-current-color completed-card__chevron";
    chevronContainer.title = "Toggle details";
    const chevronSvg = document.createElementNS(ns, "svg");
    chevronSvg.setAttribute("aria-hidden", "true");
    chevronSvg.setAttribute("viewBox", "0 0 52 52");
    chevronSvg.classList.add("slds-icon", "slds-icon_xx-small");
    const chevronPath = document.createElementNS(ns, "path");
    chevronPath.setAttribute("d", "M47.6 17.8L27.1 38.5c-.6.6-1.6.6-2.2 0L4.4 17.8c-.6-.6-.6-1.6 0-2.2l2.2-2.2c.6-.6 1.6-.6 2.2 0L26 31.2l17.2-17.8c.6-.6 1.6-.6 2.2 0l2.2 2.2c.6.6.6 1.6 0 2.2z");
    chevronSvg.appendChild(chevronPath);
    const chevronAssistive = document.createElement("span");
    chevronAssistive.className = "slds-assistive-text";
    chevronAssistive.textContent = "Toggle details";
    chevronContainer.appendChild(chevronSvg);
    chevronContainer.appendChild(chevronAssistive);

    const checkContainer = document.createElement("span");
    checkContainer.className = "slds-icon_container slds-icon-utility-success";
    checkContainer.title = "checkmark";
    const checkSvg = document.createElementNS(ns, "svg");
    checkSvg.classList.add("slds-icon", "slds-icon_x-small");
    checkSvg.setAttribute("aria-hidden", "true");
    checkSvg.style.fill = "#066AFE";
    const checkUse = document.createElementNS(ns, "use");
    checkUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#success");
    checkSvg.appendChild(checkUse);
    const checkAssistive = document.createElement("span");
    checkAssistive.className = "slds-assistive-text";
    checkAssistive.textContent = "Checkmark";
    checkContainer.appendChild(checkSvg);
    checkContainer.appendChild(checkAssistive);

    header.appendChild(chevronContainer);
    header.appendChild(summary);
    header.appendChild(checkContainer);

    const body = document.createElement("div");
    body.className = "completed-card__body";
    const bodyInner = document.createElement("div");
    bodyInner.className = "completed-card__body-inner";
    const list = document.createElement("div");
    list.className = "completed-card__list";

    if (combinedReasoning) {
      list.appendChild(createProspectReasoningItem(combinedReasoning));
    }

    criteria.forEach(s => {
      const item = document.createElement("div");
      item.className = "completed-card__list-item";

      const itemHeader = document.createElement("button");
      itemHeader.className = "completed-card__list-item-header";

      const leftSide = document.createElement("div");
      leftSide.className = "completed-card__list-item-left-side";
      leftSide.appendChild(createListItemIconSwap(s.status || "pass"));
      const itemTitle = document.createElement("div");
      itemTitle.className = "completed-card__list-item-title";
      itemTitle.textContent = s.title || "";
      leftSide.appendChild(itemTitle);
      itemHeader.appendChild(leftSide);

      const rightSide = document.createElement("div");
      rightSide.className = "completed-card__list-item-right-side";
      const nonPassCount = countNonPassSections(s.sections);
      if (nonPassCount > 0 && s.status === "fail") {
        const badge = document.createElement("span");
        badge.className = "slds-badge slds-theme_error";
        const badgeIconWrap = document.createElement("span");
        badgeIconWrap.className = "slds-badge__icon slds-badge__icon_left";
        const badgeIconContainer = document.createElement("span");
        badgeIconContainer.className = "slds-icon_container slds-icon-utility-error";
        badgeIconContainer.title = "Errors";
        const badgeSvg = document.createElementNS(ns, "svg");
        badgeSvg.classList.add("slds-icon", "slds-icon_xx-small", "slds-icon-text-error");
        badgeSvg.setAttribute("aria-hidden", "true");
        const badgeUse = document.createElementNS(ns, "use");
        badgeUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#error");
        badgeSvg.appendChild(badgeUse);
        badgeIconContainer.appendChild(badgeSvg);
        badgeIconWrap.appendChild(badgeIconContainer);
        badge.appendChild(badgeIconWrap);
        badge.appendChild(document.createTextNode(String(nonPassCount)));
        rightSide.appendChild(badge);
      } else if (nonPassCount > 0 && s.status === "warning") {
        const badge = document.createElement("span");
        badge.className = "slds-badge slds-badge_lightest";
        const badgeIconWrap = document.createElement("span");
        badgeIconWrap.className = "slds-badge__icon slds-badge__icon_left";
        const badgeIconContainer = document.createElement("span");
        badgeIconContainer.className = "slds-icon_container slds-icon-utility-warning";
        badgeIconContainer.title = "Warnings";
        const badgeSvg = document.createElementNS(ns, "svg");
        badgeSvg.classList.add("slds-icon", "slds-icon_xx-small", "slds-icon-text-warning");
        badgeSvg.setAttribute("aria-hidden", "true");
        const badgeUse = document.createElementNS(ns, "use");
        badgeUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#warning");
        badgeSvg.appendChild(badgeUse);
        badgeIconContainer.appendChild(badgeSvg);
        badgeIconWrap.appendChild(badgeIconContainer);
        badge.appendChild(badgeIconWrap);
        badge.appendChild(document.createTextNode(String(nonPassCount)));
        rightSide.appendChild(badge);
      }
      itemHeader.appendChild(rightSide);
      item.appendChild(itemHeader);

      const itemBody = document.createElement("div");
      itemBody.className = "completed-card__list-item-body";
      const itemBodyInner = document.createElement("div");
      itemBodyInner.className = "completed-card__list-item-body-inner";
      if (s.sections && s.sections.length) {
        s.sections.forEach(section => {
          const sectionWrap = document.createElement("div");
          sectionWrap.className = "completed-card__section";
          if (section.subTitle) {
            const itemSubTitle = document.createElement("div");
            itemSubTitle.className = "completed-card__list-item-subtitle";
            itemSubTitle.textContent = section.subTitle;
            sectionWrap.appendChild(itemSubTitle);
          }
          if (section.thoughts && section.thoughts.length) {
            const ul = document.createElement("ul");
            ul.className = "completed-card__list-item-thoughts";
            section.thoughts.forEach(thought => {
              const li = document.createElement("li");
              li.className = "completed-card__list-item-info";
              if (thought.field === "Status") {
                const raw = (thought.value || "").trim().toLowerCase();
                const statusMap = { "passed": "pass", "pass": "pass", "fail": "fail", "failed": "fail", "warning": "warning", "n/a": "na" };
                const statusKey = statusMap[raw] || "na";
                li.appendChild(document.createTextNode(thought.field + ": "));
                const valueSpan = document.createElement("span");
                valueSpan.className = "completed-card__status completed-card__status--" + statusKey;
                valueSpan.textContent = thought.value;
                li.appendChild(valueSpan);
              } else {
                li.textContent = `${thought.field}: ${thought.value}`;
              }
              ul.appendChild(li);
            });
            sectionWrap.appendChild(ul);
          }
          itemBodyInner.appendChild(sectionWrap);
        });
      }
      itemBody.appendChild(itemBodyInner);
      item.appendChild(itemBody);
      itemHeader.addEventListener("click", () => {
        item.classList.toggle("completed-card__list-item--open");
      });
      list.appendChild(item);
    });

    const buckets = [
      { label: "Great Fit", prospects: goodFit,  status: "pass" },
      { label: "Acceptable Fit", prospects: okFit, status: "warning" },
      { label: "Bad Fit",  prospects: badFit,   status: "fail" },
    ];
    buckets.forEach(bucket => {
      if (bucket.prospects.length) {
        list.appendChild(createProspectBucketItem(bucket));
      }
    });

    bodyInner.appendChild(list);
    body.appendChild(bodyInner);
    completedCard.appendChild(header);
    completedCard.appendChild(body);

    header.addEventListener("click", () => {
      completedCard.classList.toggle("completed-card--open");
    });

    return completedCard;
  }

  function initFullPreviewLoading(container, account, onDone) {
    const criteria = computeAllStatuses(account?.aopCriteria || DEFAULT_AOP_CRITERIA);
    const prospectSteps = getProspectStepsForAccount(account);

    const accountSteps = [
      { id: 0, state: "waiting", title: "Preparing", criteriaIndex: 0,
        doneTitles: { pass: "Valid Account", fail: "Invalid Account", warning: "Valid Account" },
        thoughts: ["Reading Run Conditions", "Checking For Errors", "Verifying Account"] },
      { id: 1, state: "waiting", title: "Checking Requirements", criteriaIndex: 1,
        doneTitles: { pass: "Requirements Met", fail: "Requirements Not Met", warning: "Requirements Not Met" },
        thoughts: ["Checking Salesforce", "Checking ZoomInfo"] },
      { id: 2, state: "waiting", title: "Checking Nice-to-Haves", criteriaIndex: 2,
        doneTitles: { pass: "Nice-to-haves Met", fail: "No Nice-to-haves", warning: "Some Nice-to-haves" },
        thoughts: ["Reading website", "Checking Salesforce", "Collecting Signals", "Analyzing past conversations"] },
    ];

    const stepsData = accountSteps.concat(
      prospectSteps.map((s, i) => ({ ...s, id: accountSteps.length + i, isProspectStep: true }))
    );
    const stepCount = stepsData.length;

    const THOUGHT_TICK_MS = 1750;
    let currentStep = 0;
    let timer = null;
    const startTime = new Date();

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "loading";
    const stepsDiv = document.createElement("div");
    stepsDiv.className = "loading__steps";
    loadingDiv.appendChild(stepsDiv);

    const stepRefs = stepsData.map(() => createStepElement());
    stepRefs.forEach(r => stepsDiv.appendChild(r.el));
    container.appendChild(loadingDiv);

    function render() {
      const allDone = currentStep === stepCount;
      loadingDiv.className = "loading" + (allDone ? " loading--done" : "");
      stepsDiv.style.height = (Math.min(currentStep + 1, stepCount) * 2) + "rem";
      stepsData.forEach((s, i) => {
        const distance = (allDone || i <= currentStep) ? i : i - 1;
        const fade = allDone ? 0 : (i > currentStep ? 1 : 0);
        updateStepElement(stepRefs[i], { ...s, distance, fade });
      });
    }

    function tick(delay = 0) {
      timer = setTimeout(() => {
        if (currentStep >= stepCount) return;
        const item = stepsData[currentStep];

        if (!item.start) {
          item.start = new Date();
          item.state = "progress";
          item.thoughtIndex = 0;
        } else if (item.thoughts && (item.thoughtIndex + 1) < item.thoughts.length) {
          item.thoughtIndex++;
        } else {
          item.state = "done";
          item.finish = new Date();
          if (item.isProspectStep) {
            item.status = "pass";
            item.doneTitle = (item.doneTitles && item.doneTitles.pass) || item.title;
          } else {
            const criteriaItem = criteria[item.criteriaIndex];
            item.status = criteriaItem ? criteriaItem.status : "pass";
            item.doneTitle = (item.doneTitles && item.doneTitles[item.status]) || item.title;
          }
          const thoughtCount = item.thoughts ? item.thoughts.length : 0;
          item.doneSubTitle = `Completed in ${Math.round((thoughtCount * THOUGHT_TICK_MS) / 1000)}s`;
          currentStep++;
        }

        render();

        if (currentStep < stepCount) {
          tick(item.state === "done" ? 50 : THOUGHT_TICK_MS);
        } else {
          const DONE_DWELL_MS = 800;
          const FADE_OUT_MS = 300;
          const RESULT_STAGGER_MS = 300;

          setTimeout(() => {
            loadingDiv.style.transition = `opacity ${FADE_OUT_MS}ms`;
            loadingDiv.style.opacity = "0";
            setTimeout(() => {
              loadingDiv.style.display = "none";
              const totalMs = new Date() - startTime;

              if (SHOW_COMPLETED_CARD) {
                const completedCard = createFullPreviewCompletedCard(totalMs, account);
                container.appendChild(completedCard);
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    completedCard.classList.add("completed-card--visible");
                  });
                });
              }

              const panel = createFullPreviewPanel(account);
              container.appendChild(panel);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  panel.classList.add("full-preview-panel--visible");
                });
              });

              if (onDone) onDone();
            }, FADE_OUT_MS);
          }, DONE_DWELL_MS);
        }
      }, delay);
    }

    let paused = false;
    render();
    tick(0);

    return {
      stop: () => clearTimeout(timer),
      pause: () => { paused = true; clearTimeout(timer); },
      resume: () => { if (paused) { paused = false; tick(0); } },
      isPaused: () => paused,
    };
  }

  // ---- Source Popover (shared singleton — one popover element for all
  // booted AOP scopes on the page) ----
  let sourcePopoverEl = null;
  let spHideTimeout;

  function ensureSourcePopover() {
    if (sourcePopoverEl && document.body.contains(sourcePopoverEl)) return sourcePopoverEl;
    sourcePopoverEl = document.createElement("div");
    sourcePopoverEl.className = "source-popover";
    sourcePopoverEl.id = "sourcePopover";
    sourcePopoverEl.addEventListener("mouseenter", function () {
      clearTimeout(spHideTimeout);
    });
    sourcePopoverEl.addEventListener("mouseleave", function () {
      sourcePopoverEl.classList.remove("is-visible");
    });
    document.body.appendChild(sourcePopoverEl);
    return sourcePopoverEl;
  }

  function showSourcePopover(badge) {
    const evidence = badge._evidence;
    if (!evidence) return;
    const pop = ensureSourcePopover();

    clearTimeout(spHideTimeout);
    pop.innerHTML = buildPopoverByTool(evidence);

    pop.style.left = "0";
    pop.style.top = "0";
    pop.classList.add("is-visible");

    const popRect = pop.getBoundingClientRect();
    const badgeRect = badge.getBoundingClientRect();
    const badgeCenterX = badgeRect.left + badgeRect.width / 2;
    let left = badgeCenterX - popRect.width / 2;

    const viewportW = window.innerWidth;
    left = Math.max(4, Math.min(left, viewportW - popRect.width - 4));

    const top = badgeRect.bottom + 6;

    pop.style.left = left + "px";
    pop.style.top = top + "px";
    pop.style.setProperty("--arrow-left", (badgeCenterX - left) + "px");
  }

  function hideSourcePopover() {
    spHideTimeout = setTimeout(function () {
      if (sourcePopoverEl) sourcePopoverEl.classList.remove("is-visible");
    }, 300);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Public init: bootAopPreview(scope, stepConfigOverride?)
  //
  // Boots a scoped instance of the AOP preview engine inside `scope`.
  // The scope element MUST contain the legacy hook nodes carrying the
  // following data-attrs (rendered by `_preview-unified.html`'s LIVE
  // variants for account_research / discover_prospects):
  //   [data-aop-root]            → the engine's content host
  //   [data-aop-empty-state]     → the empty-state placeholder
  //   [data-aop-action-btn]      → the Preview / Stop button
  //   [data-slds-lookup]         → the lookup combobox (one per scope)
  //
  // Returns a controller `{ resetToEmpty, destroy }`. `preview-unified.js`
  // calls `resetToEmpty()` on dropdown switch / refresh, and `destroy()`
  // on tear-down (when the lazy-swap rebuilds the panel for a different
  // mode).
  //
  // `stepConfigOverride` lets the caller pass a specific config (e.g.
  // `STEP_CONFIGS.account_research` for the Account Research mode and
  // `STEP_CONFIGS.find_prospects` for Find Prospects) without depending
  // on the global `window.CURRENT_STEP`. Falls back to the import-time
  // `stepConfig` (resolved from `window.CURRENT_STEP`) when omitted.
  // ─────────────────────────────────────────────────────────────────────
  export function bootAopPreview(scope, stepConfigOverride) {
    if (!scope) return null;
    if (scope.dataset.aopPreviewWired === "true") return null;
    scope.dataset.aopPreviewWired = "true";

    // Allow callers to pass either a STEP_CONFIGS key (string) or a
    // resolved config object. The unified panel passes the string key
    // ("account_research" / "find_prospects") because it needs to boot
    // multiple AOP scopes with different configs on the same page; the
    // legacy backward-compat boot below passes the import-time
    // `stepConfig` object directly.
    const cfg =
      typeof stepConfigOverride === "string"
        ? STEP_CONFIGS[stepConfigOverride] || stepConfig
        : stepConfigOverride || stepConfig;

    // Mount the icon-sprite SVG once per scope so the empty/half circle
    // refs used by the loading animations resolve inside this scope.
    const root = scope.querySelector("[data-aop-root]") || scope;
    root.appendChild(createIconSprites());

    const previewEmptyEl = scope.querySelector("[data-aop-empty-state]");
    if (previewEmptyEl && !previewEmptyEl.innerHTML.trim() && cfg.previewEmptyText) {
      previewEmptyEl.innerHTML = cfg.previewEmptyText;
    }

    // Hover-source popover handlers — one popover serves all scopes,
    // but the listeners are attached per-scope so events outside the
    // scope's content area never trigger this popover.
    const onMouseEnter = (e) => {
      const badge = e.target.closest(".source");
      if (badge && badge._evidence) showSourcePopover(badge);
    };
    const onMouseLeave = (e) => {
      const badge = e.target.closest(".source");
      if (badge) hideSourcePopover();
    };
    root.addEventListener("mouseenter", onMouseEnter, true);
    root.addEventListener("mouseleave", onMouseLeave, true);

    const actionBtn = scope.querySelector("[data-aop-action-btn]");
    const emptyState = previewEmptyEl;
    // Lookup may live outside the scope subtree on legacy pages (the
    // `[data-slds-lookup]` was a sibling of `#preview-root`, not a
    // descendant). Try scope first, then fall back to the document so
    // the existing single-instance pages keep working unchanged.
    const lookupEl = scope.querySelector("[data-slds-lookup]") ||
                     document.querySelector("[data-slds-lookup]");
    let cleanup = null;
    let running = false;
    let selectedAccount = null;

    // DEBUG: pause button — kept from the legacy boot for parity.
    const pauseBtn = document.createElement("button");
    pauseBtn.className = "slds-button slds-button_neutral slds-m-left_x-small";
    pauseBtn.textContent = "Pause";
    pauseBtn.style.display = "none";
    if (actionBtn && actionBtn.parentNode) {
      actionBtn.parentNode.insertBefore(pauseBtn, actionBtn.nextSibling);
    }
    pauseBtn.addEventListener("click", () => {
      if (!cleanup) return;
      if (cleanup.isPaused()) {
        cleanup.resume();
        pauseBtn.textContent = "Pause";
      } else {
        cleanup.pause();
        pauseBtn.textContent = "Resume";
      }
    });

    const hasLookupSelection = () => {
      const container = lookupEl && lookupEl.querySelector(".slds-combobox_container");
      return container && container.classList.contains("slds-has-selection");
    };

    const getSelectedAccountFromDOM = () => {
      const container = lookupEl && lookupEl.querySelector(".slds-combobox_container");
      if (!container || !container.classList.contains("slds-has-selection")) return null;
      const nameEl = container.querySelector(".slds-truncate");
      if (!nameEl) return null;
      const name = nameEl.textContent.trim();
      const dataSource = window[cfg.previewDataKey] || window.ACCOUNT_DATA || [];
      return dataSource.find((a) => a.name === name) || null;
    };

    const syncPreviewButton = (selected) => {
      if (actionBtn) actionBtn.disabled = !selected;
    };

    selectedAccount = getSelectedAccountFromDOM();
    syncPreviewButton(hasLookupSelection());

    function resetToEmpty() {
      if (cleanup) cleanup.stop();
      cleanup = null;
      running = false;
      pauseBtn.style.display = "none";
      if (actionBtn) actionBtn.textContent = "Preview";

      const old = root.querySelector(".loading");
      if (old) root.removeChild(old);
      const oldCompletedCard = root.querySelector(".completed-card");
      if (oldCompletedCard) root.removeChild(oldCompletedCard);
      root.querySelectorAll(".result-card").forEach((el) => el.remove());
      root.querySelectorAll(".full-preview-panel").forEach((el) => el.remove());

      if (emptyState) emptyState.style.display = "";
    }

    // Scope-filtered lookup-selection-change handler — only react when
    // the source lookup belongs to this scope. App.js now ships `el` on
    // every dispatch (single + multi + clear branches), so the test is
    // a contains() check against the scope.
    const onLookupChange = (e) => {
      const sourceEl = e.detail && e.detail.el;
      if (sourceEl && lookupEl && !lookupEl.contains(sourceEl) && sourceEl !== lookupEl) {
        return;
      }
      syncPreviewButton(e.detail.selected);
      selectedAccount = e.detail.selected ? e.detail.account : null;
      if (!e.detail.selected) resetToEmpty();
    };
    document.addEventListener("lookup-selection-change", onLookupChange);

    function stop() {
      if (cleanup) cleanup.stop();
      cleanup = null;
      running = false;
      pauseBtn.style.display = "none";
      if (actionBtn) actionBtn.textContent = "Preview";

      const old = root.querySelector(".loading");
      if (old) root.removeChild(old);

      const hasContent =
        root.querySelector(".completed-card") ||
        root.querySelector(".result-card") ||
        root.querySelector(".full-preview-panel");
      if (emptyState && !hasContent) emptyState.style.display = "";
    }

    function start() {
      stop();

      const old = root.querySelector(".loading");
      if (old) root.removeChild(old);
      const oldCompletedCard = root.querySelector(".completed-card");
      if (oldCompletedCard) root.removeChild(oldCompletedCard);
      root.querySelectorAll(".result-card").forEach((el) => el.remove());
      root.querySelectorAll(".full-preview-panel").forEach((el) => el.remove());

      if (emptyState) emptyState.style.display = "none";
      running = true;
      if (actionBtn) actionBtn.textContent = "Stop";

      if (cfg.stepNumber) {
        sessionStorage.setItem("aop_previewed_step" + cfg.stepNumber, "true");
      }
      if (cfg.previewType === "full_preview") {
        sessionStorage.setItem("aop_previewed_step4", "true");
        sessionStorage.setItem("aop_previewed_step5", "true");
      }

      const onDone = () => {
        running = false;
        if (actionBtn) actionBtn.textContent = "Preview";
      };

      if (cfg.previewType === "full_preview") {
        cleanup = initFullPreviewLoading(root, selectedAccount, onDone);
      } else if (cfg.previewType === "prospect") {
        cleanup = initProspectLoading(root, selectedAccount, onDone);
      } else if (cfg.previewType === "email") {
        cleanup = initEmailLoading(root, selectedAccount, onDone);
      } else {
        cleanup = initLoading(root, selectedAccount, onDone);
      }
    }

    if (actionBtn) {
      actionBtn.addEventListener("click", () => {
        if (running) stop();
        else start();
      });
    }

    // Uniform reset hook consumed by `preview-unified.js` — every live
    // mode (data_source, account_research, discover_prospects, email)
    // exposes `scope._resetPreview()` so the dropdown switch handler can
    // flip whichever mode just became active back to its empty state
    // without knowing which engine drives it.
    scope._resetPreview = resetToEmpty;

    return {
      resetToEmpty,
      destroy: () => {
        if (cleanup) cleanup.stop();
        document.removeEventListener("lookup-selection-change", onLookupChange);
        root.removeEventListener("mouseenter", onMouseEnter, true);
        root.removeEventListener("mouseleave", onMouseLeave, true);
        if (pauseBtn && pauseBtn.parentNode) pauseBtn.parentNode.removeChild(pauseBtn);
        delete scope._resetPreview;
        delete scope.dataset.aopPreviewWired;
      },
    };
  }

  // Auto-boot every AOP scope inside the unified panel on the page.
  // Each `<section class="pu-mode--live" data-mode="account_research">` /
  // `[data-mode="discover_prospects"]` becomes its own scoped instance
  // with its own controller. Pages that still ship the legacy
  // `#preview-root` (no unified panel) fall back to the single-instance
  // boot below.
  function autoInitUnified() {
    const aopScopes = document.querySelectorAll(
      '.preview-panel--unified .pu-mode--live[data-mode="account_research"], ' +
      '.preview-panel--unified .pu-mode--live[data-mode="discover_prospects"]'
    );
    aopScopes.forEach((scope) => {
      const mode = scope.getAttribute("data-mode");
      const cfgKey =
        mode === "discover_prospects" ? "find_prospects" : "account_research";
      bootAopPreview(scope, cfgKey);
    });
    return aopScopes.length > 0;
  }

  // Legacy single-instance boot — runs only when there is no unified
  // panel on the page (i.e. pages that still drive the AOP engine via
  // the global `#preview-root` markup). Skipped when the unified panel
  // claims any AOP scope.
  function autoInitLegacy() {
    const legacyRoot = document.getElementById("preview-root");
    if (!legacyRoot) return;
    legacyRoot.setAttribute("data-aop-root", "");
    const empty = document.getElementById("preview-empty-state");
    if (empty) empty.setAttribute("data-aop-empty-state", "");
    const btn = document.getElementById("preview-action-btn");
    if (btn) btn.setAttribute("data-aop-action-btn", "");
    bootAopPreview(legacyRoot.parentElement || document.body, stepConfig);
  }

  function autoInit() {
    if (window.AOP_LAZY_BOOT) return; // explicit opt-out (legacy escape hatch)
    const wiredUnified = autoInitUnified();
    if (!wiredUnified) autoInitLegacy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }

  // Expose for the unified-panel orchestrator. The export above gives
  // ESM consumers (which is the historical entry point) the same hook,
  // so this is the script-tag fallback.
  window.bootAopPreview = bootAopPreview;