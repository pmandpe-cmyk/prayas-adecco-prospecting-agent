(function () {
  // Renders a cadence sequence (array of email/call/linkedin steps) into a
  // container, using <template> blocks that must already exist in the page DOM
  // (#step-template-email, #step-template-call, #step-template-linkedin).
  // Also wires the shared #email-popover used for source citations.

  function setText(node, selector, text) {
    var el = node.querySelector(selector);
    if (el) el.textContent = text || '';
  }

  // Parse trusted HTML body strings from the JSON data into real DOM nodes
  // without using innerHTML. DOMParser does not execute scripts; the data
  // file is authored alongside the template and treated as trusted source.
  function setHTML(node, selector, html) {
    var el = node.querySelector(selector);
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
    if (!html) return;
    var doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
    var wrap = doc.body.firstChild;
    while (wrap && wrap.firstChild) {
      el.appendChild(wrap.firstChild);
    }
  }

  function fillCommon(node, step) {
    setText(node, '.js-step-header-label', step.headerLabel);
    setText(node, '.js-step-header-value', step.headerValue);
    setHTML(node, '.js-step-body', step.body);
  }

  function fillByType(node, step) {
    if (step.type === 'email') {
      setText(node, '.js-email-subject', step.subject);
    } else if (step.type === 'call') {
      setText(node, '.js-call-goal', step.goal);
    }
  }

  function fillDetails(node, details) {
    var host = node.querySelector('.js-step-details');
    if (!host) return;
    details.forEach(function (d) {
      var title = document.createElement('div');
      title.className = 'email-container-right-side-content-card-title slds-m-bottom_xx-small';
      title.textContent = d.title || '';
      var desc = document.createElement('div');
      desc.className = 'email-container-right-side-content-card-description slds-m-bottom_medium';
      desc.textContent = d.value || '';
      host.appendChild(title);
      host.appendChild(desc);
    });
  }

  function fillSources(node, sources) {
    var host = node.querySelector('.js-step-sources');
    if (!host) return;
    sources.forEach(function (s) {
      var pill = document.createElement('span');
      pill.className = 'email-source-pill';

      var iconWrap = document.createElement('span');
      iconWrap.className = 'email-source-pill__icon';
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', s.icon || '');
      svg.appendChild(use);
      iconWrap.appendChild(svg);

      var label = document.createElement('span');
      label.className = 'email-source-pill__label';
      label.textContent = s.label || '';

      pill.appendChild(iconWrap);
      pill.appendChild(label);
      host.appendChild(pill);
    });
  }

  // Per-step variant resolution. Each step may set `variant: "full" | "header-only"`
  // on the JSON; otherwise every step defaults to the full Preview/Details card.
  function effectiveVariant(step) {
    if (step.variant === 'full' || step.variant === 'header-only') return step.variant;
    return 'full';
  }

  function renderStep(step) {
    var tpl = document.getElementById('step-template-' + step.type);
    if (!tpl) return null;
    var clone = document.importNode(tpl.content, true);
    fillCommon(clone, step);

    if (effectiveVariant(step) === 'header-only') {
      var stepRoot = clone.querySelector('.step');
      if (stepRoot) stepRoot.classList.add('step--header-only');
      var card = clone.querySelector('.email-container');
      if (card) card.remove();
      return clone;
    }

    fillByType(clone, step);
    fillDetails(clone, step.details || []);
    fillSources(clone, step.sources || []);
    var stepRootEl = clone.querySelector('.step');
    if (stepRootEl) wireTabs(stepRootEl);
    return clone;
  }

  function render(container, steps) {
    if (!container || !Array.isArray(steps)) return;
    // Stash the steps array on the container so renderStepAt() (used by the
    // per-step Regenerate flow) can rebuild a single step from data without
    // the caller having to re-thread the array.
    container._stepsData = steps;
    while (container.firstChild) container.removeChild(container.firstChild);
    steps.forEach(function (step, index) {
      var fragment = renderStep(step);
      if (!fragment) return;
      var stepEl = fragment.querySelector('.step');
      if (stepEl) {
        stepEl.setAttribute('data-step-index', String(index));
        stepEl.setAttribute('data-regen-count', '0');
      }
      container.appendChild(fragment);
    });
  }

  // Resolve which step variant to render for a given regeneration iteration.
  // iteration 0 = base step, 1+ = rotate through step.regenerations[].
  // If the array is missing/empty, every iteration falls back to the base.
  function getEffectiveStep(step, iteration) {
    var alts = (step && step.regenerations) || [];
    if (iteration <= 0 || alts.length === 0) return step;
    return alts[(iteration - 1) % alts.length];
  }

  // Re-render a single step in place and return the new step root element.
  // Increments data-regen-count and rotates through `regenerations` if defined.
  function renderStepAt(container, steps, index) {
    if (!container || !Array.isArray(steps)) return null;
    var existing = container.querySelector('.step[data-step-index="' + index + '"]');
    if (!existing) return null;
    var step = steps[index];
    if (!step) return null;

    var prevCount = parseInt(existing.dataset.regenCount, 10) || 0;
    var nextCount = prevCount + 1;
    var effective = getEffectiveStep(step, nextCount);

    var fragment = renderStep(effective);
    if (!fragment) return null;
    var newStep = fragment.querySelector('.step');
    if (!newStep) return null;

    newStep.setAttribute('data-step-index', String(index));
    newStep.setAttribute('data-regen-count', String(nextCount));
    existing.replaceWith(fragment);
    // Wire popover for the new step subtree (idempotent on already-wired nodes).
    wirePopover(newStep);
    return newStep;
  }

  // ---------- Tabs (Details / Feedback) ----------
  // Each step renders SLDS default tabs scoped to its own .step subtree.
  // Templates ship with `data-tab-link` / `data-tab-panel` / `data-tab-item`
  // hooks (no hardcoded ids, since templates are cloned per step). wireTabs()
  // mints unique ids per clone so SLDS ARIA wiring stays valid across cards.

  var tabIdCounter = 0;

  function findStepTabsRoot(stepRoot) {
    return stepRoot && stepRoot.querySelector('[data-step-tabs]');
  }

  function wireTabs(stepRoot) {
    var tabsRoot = findStepTabsRoot(stepRoot);
    if (!tabsRoot || tabsRoot.dataset.tabsWired === 'true') return;

    var scopeId = ++tabIdCounter;
    var links = tabsRoot.querySelectorAll('[data-tab-link]');
    var panels = tabsRoot.querySelectorAll('[data-tab-panel]');

    panels.forEach(function (panel) {
      var name = panel.getAttribute('data-tab-panel');
      panel.id = 'we-tab-' + scopeId + '-' + name;
    });

    links.forEach(function (link) {
      var name = link.getAttribute('data-tab-link');
      var anchorId = 'we-tab-' + scopeId + '-' + name + '__item';
      link.id = anchorId;
      link.setAttribute('aria-controls', 'we-tab-' + scopeId + '-' + name);
      var panel = tabsRoot.querySelector('[data-tab-panel="' + name + '"]');
      if (panel) panel.setAttribute('aria-labelledby', anchorId);

      link.addEventListener('click', function (e) {
        e.preventDefault();
        activateTab(stepRoot, name);
      });
    });

    tabsRoot.dataset.tabsWired = 'true';
  }

  function activateTab(stepRoot, name) {
    var tabsRoot = findStepTabsRoot(stepRoot);
    if (!tabsRoot) return;

    tabsRoot.querySelectorAll('[data-tab-item]').forEach(function (item) {
      var match = item.getAttribute('data-tab-item') === name;
      item.classList.toggle('slds-is-active', match);
    });

    tabsRoot.querySelectorAll('[data-tab-link]').forEach(function (link) {
      var match = link.getAttribute('data-tab-link') === name;
      link.setAttribute('aria-selected', match ? 'true' : 'false');
      link.setAttribute('tabindex', match ? '0' : '-1');
    });

    tabsRoot.querySelectorAll('[data-tab-panel]').forEach(function (panel) {
      var match = panel.getAttribute('data-tab-panel') === name;
      panel.classList.toggle('slds-show', match);
      panel.classList.toggle('slds-hide', !match);
    });
  }

  // ---------- Popover (shared across all step instances) ----------
  //
  // setupPopoverOnce() creates a single closure that owns ALL popover-level
  // state (timers, active container, success-state flag, originating step
  // root for the Feedback handoff). wirePopover() is just a thin wrapper:
  // first call lazily initializes the singleton, every call iterates new
  // .email-container nodes and attaches their hover handlers using the
  // singleton's wireContainer. This means a renderStepAt() swap can safely
  // re-call wirePopover() without creating drifting closures.

  var popoverSetup = null;

  function setupPopoverOnce(pop) {
    var titleEl = pop.querySelector('.email-popover__title');
    var bodyEl = pop.querySelector('.email-popover__body');
    var sourceEl = pop.querySelector('.email-popover__source');
    var sourceUse = pop.querySelector('.email-popover__source-icon use');
    var sourceLbl = pop.querySelector('.email-popover__source-label');

    // M3 regions
    var questionRegion = pop.querySelector('[data-popover-question-region]');
    var questionText = pop.querySelector('[data-popover-question]');
    var successRegion = pop.querySelector('[data-popover-success-region]');
    var yesBtn = pop.querySelector('[data-popover-answer="yes"]');
    var noBtn = pop.querySelector('[data-popover-answer="no"]');

    var SHOW_DELAY = 400;
    var HIDE_DELAY = 600;
    var SUCCESS_DISMISS_MS = 1500;
    var DEFAULT_QUESTION = 'Is this a good opening line?';

    var showTimer;
    var hideTimer;
    var successDismissTimer;
    var pendingHl = null;
    var activeContainer = null;
    var activeStepRoot = null;
    var inSuccessState = false;

    function setSource(hl) {
      if (!sourceEl) return;
      var label = hl.dataset.sourceLabel;
      var icon = hl.dataset.sourceIcon;
      if (!label || !icon) {
        sourceEl.hidden = true;
        return;
      }
      sourceUse.setAttribute('xlink:href', icon);
      sourceLbl.textContent = label;
      sourceEl.hidden = false;
    }

    // Reset the popover body to its default (question visible, success
    // hidden, no pending success-dismiss timer). Called from showPopover()
    // on every show so re-hovering after a Yes click brings the question
    // back, and from forceHide() so the next show starts clean.
    function resetToQuestionState() {
      inSuccessState = false;
      clearTimeout(successDismissTimer);
      if (questionRegion) questionRegion.hidden = false;
      if (successRegion) successRegion.hidden = true;
    }

    function forceHide() {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      pop.hidden = true;
      if (activeContainer) {
        activeContainer.classList.remove('is-popover-visible');
        activeContainer = null;
      }
      activeStepRoot = null;
      resetToQuestionState();
    }

    function showPopover(container, hl) {
      titleEl.textContent = hl.dataset.popoverTitle || '';
      bodyEl.textContent = hl.dataset.popoverBody || '';
      setSource(hl);
      if (questionText) {
        questionText.textContent = hl.dataset.popoverQuestion || DEFAULT_QUESTION;
      }
      resetToQuestionState();
      activeStepRoot = hl.closest('.step') || null;

      pop.hidden = false;
      if (activeContainer && activeContainer !== container) {
        activeContainer.classList.remove('is-popover-visible');
      }
      activeContainer = container;
      container.classList.add('is-popover-visible');
      var anchor = container.querySelector('.email-container-left-side-content-card');
      var hlRect = hl.getBoundingClientRect();
      var anchorRect = anchor.getBoundingClientRect();
      pop.style.top = hlRect.top + 'px';
      pop.style.left = (anchorRect.right + 8) + 'px';
    }

    function scheduleHide() {
      // The success auto-dismiss timer owns the hide while success is showing
      // so a stray mouseleave during that ~1.5s window can't dismiss early.
      if (inSuccessState) return;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(forceHide, HIDE_DELAY);
    }

    function onYes() {
      if (questionRegion) questionRegion.hidden = true;
      if (successRegion) successRegion.hidden = false;
      inSuccessState = true;
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(successDismissTimer);
      successDismissTimer = setTimeout(forceHide, SUCCESS_DISMISS_MS);
    }

    function onNo() {
      // Derive a contextual textarea placeholder from the question text:
      //   "Is this a good opening line?" -> "Why wasn't this a good opening line?"
      // For any custom question that doesn't start with "Is ", fall back to
      // a generic prompt so the textarea isn't seeded with awkward text.
      var question = (questionText && questionText.textContent) || DEFAULT_QUESTION;
      var placeholder = /^Is /.test(question)
        ? question.replace(/^Is /, "Why wasn't ")
        : 'Tell us what to improve\u2026';
      var step = activeStepRoot;
      forceHide();
      if (step && window.StepFeedback) {
        window.StepFeedback.activateAndFocus(step, placeholder);
      }
    }

    function wireContainer(container) {
      if (container.dataset.popoverWired === 'true') return;
      container.dataset.popoverWired = 'true';

      container.addEventListener('mouseenter', function () {
        container.classList.remove('is-flashing');
        void container.offsetWidth;
        container.classList.add('is-flashing');
      }, { once: true });

      container.addEventListener('animationend', function (e) {
        if (e.animationName === 'email-highlight-pulse') {
          container.classList.remove('is-flashing');
        }
      });

      container.addEventListener('mouseover', function (e) {
        var hl = e.target.closest('.email-highlight');
        if (!hl || hl === pendingHl) return;
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        pendingHl = hl;
        if (!pop.hidden) {
          showPopover(container, hl);
        } else {
          showTimer = setTimeout(function () {
            showPopover(container, hl);
          }, SHOW_DELAY);
        }
      });

      container.addEventListener('mouseout', function (e) {
        var hl = e.target.closest('.email-highlight');
        if (!hl) return;
        if (hl.contains(e.relatedTarget)) return;
        clearTimeout(showTimer);
        pendingHl = null;
        scheduleHide();
      });

      container.addEventListener('mouseleave', function () {
        clearTimeout(showTimer);
        pendingHl = null;
        scheduleHide();
      });
    }

    pop.addEventListener('mouseleave', scheduleHide);
    pop.addEventListener('mouseenter', function () {
      clearTimeout(hideTimer);
    });
    if (yesBtn) yesBtn.addEventListener('click', onYes);
    if (noBtn) noBtn.addEventListener('click', onNo);

    return { wireContainer: wireContainer };
  }

  function wirePopover(root) {
    var pop = document.getElementById('email-popover');
    if (!pop) return;
    if (!popoverSetup) popoverSetup = setupPopoverOnce(pop);
    var scope = root || document;
    scope.querySelectorAll('.email-container').forEach(popoverSetup.wireContainer);
  }

  // ──────────────────────────────────────────────────────────────────
  // BEGIN icon-swap interaction (TESTING)
  // Click delegation for the icon-rail toggle button AND the step-header
  // label. Either click target toggles `step--collapsed` on the parent
  // .step, which (via step_04.scss) hides the preview/details card and
  // pins the chevron visible. ARIA state always lives on the canonical
  // icon button, regardless of which trigger the user clicked.
  // Idempotent — safe to call multiple times on the same container; the
  // listener only attaches once.
  // To remove: delete this block, its window.CadenceSequence.wireCollapse
  // export below, and the call site in step_04_write_messaging.js.
  // ──────────────────────────────────────────────────────────────────
  function wireCollapse(container) {
    if (!container || container.dataset.collapseWired === 'true') return;
    container.dataset.collapseWired = 'true';

    container.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('[data-step-toggle], .step-header');
      if (!trigger || !container.contains(trigger)) return;
      // Don't toggle if the user is in the middle of selecting text in the
      // header — selecting "Email 1: First Outreach" to copy still fires a
      // click on mouseup, and that shouldn't collapse the step.
      if (window.getSelection && window.getSelection().toString().length > 0) return;

      var step = trigger.closest('.step');
      if (!step) return;

      var nowCollapsed = !step.classList.contains('step--collapsed');
      step.classList.toggle('step--collapsed', nowCollapsed);

      // Always update ARIA on the icon button (the canonical accessible
      // affordance) so screen-reader state stays correct regardless of
      // whether the click landed on the icon or the header.
      var btn = step.querySelector('[data-step-toggle]');
      if (btn) {
        btn.setAttribute('aria-expanded', nowCollapsed ? 'false' : 'true');
        btn.setAttribute('aria-label', nowCollapsed ? 'Expand step' : 'Collapse step');
        btn.setAttribute('title', nowCollapsed ? 'Click to expand' : 'Click to collapse');
      }
    });
  }
  // END icon-swap interaction (TESTING)
  // ──────────────────────────────────────────────────────────────────

  window.CadenceSequence = {
    render: render,
    renderStepAt: renderStepAt,
    wirePopover: wirePopover,
    wireTabs: wireTabs,
    activateTab: activateTab,
    wireCollapse: wireCollapse
  };

  // Legacy auto-bootstrap for the standalone reference page (blank.html).
  // If a #steps-data JSON block + #steps-container exist, render and wire
  // the popover on DOMContentLoaded. Step 4 does not use this path; it calls
  // CadenceSequence.render() / wirePopover() explicitly.
  function legacyBootstrap() {
    var container = document.getElementById('steps-container');
    var dataScript = document.getElementById('steps-data');
    if (!container || !dataScript) return;
    var steps = [];
    try {
      var parsed = JSON.parse(dataScript.textContent || '[]');
      if (Array.isArray(parsed)) steps = parsed;
    } catch (e) { /* ignore */ }
    render(container, steps);
    wirePopover(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', legacyBootstrap);
  } else {
    legacyBootstrap();
  }
})();
