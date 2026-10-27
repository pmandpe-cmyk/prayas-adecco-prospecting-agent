(function () {
  'use strict';

  // Scoped Email preview engine — drives the lead + cadence pickers, the
  // Generate button, the cadence-progress streaming animation, and the
  // rendered cadence-step email cards inside a single mode section. Lives
  // in the unified preview panel's Email mode and is bootable from any
  // step (so the dropdown can switch into Email on every wizard page).
  //
  // Design contract:
  //   • The engine never touches the global document for its own DOM hooks
  //     — every query is rooted at the `scope` element passed in. This
  //     lets multiple Email modes coexist on the same page (one per step)
  //     without ID collisions.
  //   • `scope` is expected to be the `<section data-mode="email" …>`
  //     element from `_preview-unified.html` (live variant). Required
  //     descendants:
  //         [data-slds-lookup="PROSPECT_DATA_FLAT"][data-lookup-meta="prospect"]
  //         [data-slds-lookup="CADENCE_DATA"][data-lookup-meta="cadence"]
  //         [data-wm-region="form"]
  //         [data-wm-region="progress"]      → contains [data-wm-progress-root]
  //         [data-wm-region="sequence"]      → contains [data-wm-steps-container]
  //         [data-wm-generate-btn]
  //   • The engine reads cadence + email content from the page-level
  //     <script id="step-04-data"> JSON block (the legacy step_04 data
  //     file is reused so the email content stays canonical). When that
  //     block is absent (e.g. on steps other than step_04), the engine
  //     falls back to a default cadence baked into shared.json so a
  //     non-step_04 page can still preview emails.
  //   • Reset hook: the init function attaches `scope._resetPreview()`,
  //     which `preview-unified.js` calls every time the dropdown is
  //     switched to this mode. It cancels any in-flight progress run,
  //     clears the rendered sequence, restores the form region, and
  //     re-evaluates the Generate button's disabled state.
  //
  // Why we don't reuse the legacy step_04_write_messaging.js orchestrator:
  // it wires global IDs (`#wm-generate-btn`, `#wm-progress-root`,
  // `#wm-steps-container`, `#write-messaging`) once on DOMContentLoaded
  // and assumes a single instance per page. Scoping it would have meant
  // rewriting the same set of helpers anyway, with the added complication
  // that the legacy version pulls in the cadence-popover and the per-step
  // Details/Feedback tabs (intentionally omitted from this functional
  // reconstruction — see the chat thread).

  var SUGGEST_PICK = 'High Touch Prospects';
  var GENERATED_KEY = 'Generated Cadence';

  // Shape of the legacy `step_04_write_messaging.json` payload. Mirrored
  // here so an Email mode booted on a non-step_04 page (which doesn't
  // ship a `<script id="step-04-data">`) still has a sensible default.
  var FALLBACK_DATA = {
    progressSteps: {
      existing: [
        { before: { title: 'Loading cadence template…', subtitle: 'Pulling steps and content from the saved cadence.' },
          after:  { title: 'Cadence Loaded', subtitle: 'Template steps and send windows ready.' } },
        { before: { title: 'Matching to lead…', subtitle: 'Mapping signals into the template.' },
          after:  { title: 'Lead Mapped', subtitle: 'Personalization applied.' } },
        { before: { title: 'Rendering Sequence…', subtitle: 'Drafting each step with sources.' },
          after:  { title: 'Sequence Ready', subtitle: 'Cadence steps generated.' } }
      ]
    },
    cadences: {}
  };

  function readPageData() {
    var script = document.getElementById('step-04-data');
    if (!script || !script.textContent) return FALLBACK_DATA;
    try {
      var parsed = JSON.parse(script.textContent);
      return {
        progressSteps: normalizeProgressSteps(parsed.progressSteps),
        cadences: parsed.cadences && typeof parsed.cadences === 'object' ? parsed.cadences : {}
      };
    } catch (e) {
      return FALLBACK_DATA;
    }
  }

  // Accept either the new `{ existing, suggest, generate }` object shape
  // (produced by step_04_write_messaging.json) or a flat array (legacy).
  function normalizeProgressSteps(raw) {
    if (Array.isArray(raw)) return { existing: raw, suggest: raw, generate: raw };
    if (raw && typeof raw === 'object') {
      return {
        existing: Array.isArray(raw.existing) ? raw.existing : [],
        suggest:  Array.isArray(raw.suggest)  ? raw.suggest  : [],
        generate: Array.isArray(raw.generate) ? raw.generate : []
      };
    }
    return { existing: [], suggest: [], generate: [] };
  }

  // Map the picked cadence label to the actual key in `cadences`. When the
  // user picks an agent action ("Suggest Cadence" / "Generate Cadence")
  // we redirect to the Generated entry / a hardcoded suggested cadence.
  function resolveCadenceKey(cadenceName) {
    if (!cadenceName) return null;
    var actions = window.CADENCE_AGENT_ACTIONS || [];
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      if (a && a.name === cadenceName) {
        if (a.id === 'generate') return GENERATED_KEY;
        if (a.id === 'suggest')  return SUGGEST_PICK;
        return cadenceName;
      }
    }
    return cadenceName;
  }

  function resolveProgressVariant(cadenceName) {
    if (!cadenceName) return 'existing';
    var actions = window.CADENCE_AGENT_ACTIONS || [];
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      if (a && a.name === cadenceName) {
        if (a.id === 'generate') return 'generate';
        if (a.id === 'suggest')  return 'suggest';
      }
    }
    return 'existing';
  }

  function findProspectMeta(name) {
    if (!name || !window.PROSPECT_DATA_FLAT) return null;
    var found = null;
    for (var i = 0; i < window.PROSPECT_DATA_FLAT.length; i++) {
      if (window.PROSPECT_DATA_FLAT[i].name === name) { found = window.PROSPECT_DATA_FLAT[i]; break; }
    }
    if (!found) return null;
    var parts = (found.name || '').trim().split(/\s+/);
    return {
      name: found.name || '',
      firstName: parts[0] || found.name || '',
      lastName: parts.length > 1 ? parts.slice(1).join(' ') : '',
      account: found.account || '',
      title: found.title || ''
    };
  }

  // Replace `{{prospect.firstName|lastName|name|account|title}}` tokens.
  // Strings that don't contain `{{` short-circuit early so this is cheap
  // to run on every step's body even when no tokens exist.
  function tokenize(value, prospect) {
    if (typeof value !== 'string' || value.indexOf('{{') < 0) return value;
    var p = prospect || {};
    return value
      .replace(/\{\{prospect\.firstName\}\}/g, p.firstName || '')
      .replace(/\{\{prospect\.lastName\}\}/g,  p.lastName  || '')
      .replace(/\{\{prospect\.name\}\}/g,      p.name      || '')
      .replace(/\{\{prospect\.account\}\}/g,   p.account   || '')
      .replace(/\{\{prospect\.title\}\}/g,     p.title     || '');
  }

  function tokenizeStep(step, prospect) {
    if (!step || typeof step !== 'object') return step;
    var out = JSON.parse(JSON.stringify(step));
    ['subject', 'body', 'goal', 'headerLabel', 'headerValue'].forEach(function (k) {
      if (typeof out[k] === 'string') out[k] = tokenize(out[k], prospect);
    });
    return out;
  }

  function resolveSteps(cadences, cadenceName, prospectName) {
    var cadence = cadenceName && cadences[cadenceName];
    if (!cadence || !cadence.prospects) return [];
    var bucket = cadence.prospects[prospectName] || cadence.prospects.default;
    return (bucket && Array.isArray(bucket.steps)) ? bucket.steps : [];
  }

  // Single-select lookups (app.js) render the chosen entity into a
  // `.slds-combobox__input-value .slds-truncate` chip. Read the chip
  // text rather than relying on the event payload because the
  // `lookup-selection-change` event for single-select does not carry
  // the source `el` reference (yet — TODO patch app.js once the
  // unification refactor lands).
  function readSelectedName(lookupEl) {
    if (!lookupEl) return '';
    var valueEl = lookupEl.querySelector('.slds-combobox__input-value .slds-truncate');
    var text = valueEl && valueEl.textContent ? valueEl.textContent.trim() : '';
    return text || (lookupEl.dataset.lookupDefault || '');
  }

  // Strict variant used only by the disable logic — does NOT fall back
  // to data-lookup-default. A cleared combobox correctly reports "no
  // selection" so Generate becomes disabled until the user picks again.
  function hasLookupSelection(lookupEl) {
    if (!lookupEl) return false;
    var valueEl = lookupEl.querySelector('.slds-combobox__input-value .slds-truncate');
    return !!(valueEl && valueEl.textContent && valueEl.textContent.trim());
  }

  // ──────────────────────────────────────────────────────────────────
  // Email-card renderer — replaces cadence-sequence.js's <template>-
  // driven flow. The unified panel is a narrow column, so the
  // simplified card design (no per-step Details/Feedback tabs, no
  // icon-swap collapse, no inline source citations) gives us a clean
  // "see the emails generated at each cadence step" read.
  // ──────────────────────────────────────────────────────────────────

  function buildSourcePill(source) {
    var pill = document.createElement('span');
    pill.className = 'em-source-pill';
    if (source.icon) {
      var iconWrap = document.createElement('span');
      iconWrap.className = 'em-source-pill__icon';
      var img = document.createElement('img');
      img.src = source.icon;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      iconWrap.appendChild(img);
      pill.appendChild(iconWrap);
    }
    var label = document.createElement('span');
    label.className = 'em-source-pill__label';
    label.textContent = source.label || '';
    pill.appendChild(label);
    return pill;
  }

  function buildEmailCard(step, index) {
    var card = document.createElement('article');
    card.className = 'em-step em-step--' + (step.type || 'email');
    card.setAttribute('data-step-index', String(index));

    var rail = document.createElement('div');
    rail.className = 'em-step__rail';
    var bullet = document.createElement('span');
    bullet.className = 'em-step__bullet';
    bullet.textContent = String(index + 1);
    rail.appendChild(bullet);

    var content = document.createElement('div');
    content.className = 'em-step__content';

    var header = document.createElement('header');
    header.className = 'em-step__header';
    var headerLabel = document.createElement('span');
    headerLabel.className = 'em-step__header-label';
    headerLabel.textContent = step.headerLabel || '';
    var headerValue = document.createElement('span');
    headerValue.className = 'em-step__header-value';
    headerValue.textContent = step.headerValue || '';
    header.appendChild(headerLabel);
    header.appendChild(headerValue);
    content.appendChild(header);

    var card2 = document.createElement('div');
    card2.className = 'em-step__email-card';

    if (step.type === 'email' && step.subject) {
      var subj = document.createElement('h4');
      subj.className = 'em-step__subject';
      subj.textContent = step.subject;
      card2.appendChild(subj);
    } else if (step.type === 'call' && step.goal) {
      var goal = document.createElement('h4');
      goal.className = 'em-step__subject';
      goal.textContent = step.goal;
      card2.appendChild(goal);
    }

    if (step.body) {
      var body = document.createElement('div');
      body.className = 'em-step__body';
      // The body strings ship with safe HTML (intentional — authors embed
      // <span class="email-highlight"> citation hooks). DOMParser keeps
      // the inert <span>s without executing scripts.
      var doc = new DOMParser().parseFromString('<div>' + step.body + '</div>', 'text/html');
      var wrap = doc.body.firstChild;
      while (wrap && wrap.firstChild) body.appendChild(wrap.firstChild);
      card2.appendChild(body);
    }

    content.appendChild(card2);

    if (Array.isArray(step.sources) && step.sources.length) {
      var sourceRow = document.createElement('div');
      sourceRow.className = 'em-step__sources';
      step.sources.forEach(function (s) { sourceRow.appendChild(buildSourcePill(s)); });
      content.appendChild(sourceRow);
    }

    card.appendChild(rail);
    card.appendChild(content);
    return card;
  }

  function renderSequenceInto(container, steps) {
    while (container.firstChild) container.removeChild(container.firstChild);
    steps.forEach(function (step, i) { container.appendChild(buildEmailCard(step, i)); });
  }

  // ──────────────────────────────────────────────────────────────────

  function setRegion(scope, name, generateBtn) {
    scope.setAttribute('data-wm-state', name);
    scope.querySelectorAll('[data-wm-region]').forEach(function (region) {
      region.hidden = region.dataset.wmRegion !== name;
    });
    if (generateBtn) {
      var capName = name.charAt(0).toUpperCase() + name.slice(1);
      var label = generateBtn.dataset['label' + capName];
      if (label) generateBtn.textContent = label;
      generateBtn.classList.toggle('slds-button_destructive', name === 'progress');
      generateBtn.classList.toggle('slds-button_brand',      name !== 'progress');
    }
  }

  // Public init. Idempotent on the same scope: subsequent calls bail
  // early so dropdown re-switches don't double-wire listeners. The
  // exported `_resetPreview` is what `preview-unified.js` calls when
  // switching modes, so the engine always lands the user back on the
  // form (empty) state.
  function initEmailPreview(scope) {
    if (!scope || scope.dataset.emailPreviewWired === 'true') return;
    scope.dataset.emailPreviewWired = 'true';

    var data = readPageData();

    var prospectLookupEl = scope.querySelector('[data-slds-lookup][data-lookup-meta="prospect"]');
    var cadenceLookupEl  = scope.querySelector('[data-slds-lookup][data-lookup-meta="cadence"]');
    var generateBtn      = scope.querySelector('[data-wm-generate-btn]');
    var progressRoot     = scope.querySelector('[data-wm-progress-root]');
    var stepsContainer   = scope.querySelector('[data-wm-steps-container]');

    var currentRun = null;

    function updateGenerateBtnState() {
      if (!generateBtn) return;
      var state = scope.getAttribute('data-wm-state');
      if (state === 'progress') { generateBtn.disabled = false; return; }
      generateBtn.disabled = !(
        hasLookupSelection(prospectLookupEl) && hasLookupSelection(cadenceLookupEl)
      );
    }

    function renderSequence() {
      var prospectName    = readSelectedName(prospectLookupEl);
      var rawCadenceName  = readSelectedName(cadenceLookupEl);
      var cadenceKey      = resolveCadenceKey(rawCadenceName);
      var prospectMeta    = findProspectMeta(prospectName);

      var rawSteps = resolveSteps(data.cadences, cadenceKey, prospectName);
      // Fall back to the canonical "default" cadence if the picked
      // cadence has no prospect-specific authored steps. The data file
      // ships with `cadences.default` whose templated steps adapt to
      // any prospect via the {{prospect.*}} token substitution below.
      if (!rawSteps.length) rawSteps = resolveSteps(data.cadences, 'default', prospectName);

      var steps = rawSteps.map(function (s) { return tokenizeStep(s, prospectMeta); });

      if (stepsContainer) renderSequenceInto(stepsContainer, steps);
      setRegion(scope, 'sequence', generateBtn);
      updateGenerateBtnState();
    }

    function startGeneration() {
      setRegion(scope, 'progress', generateBtn);
      updateGenerateBtnState();

      var rawCadenceName = readSelectedName(cadenceLookupEl);
      var variant        = resolveProgressVariant(rawCadenceName);
      var variantSteps   = (data.progressSteps && data.progressSteps[variant]) || [];

      // Skip the animated progress widget if either the dependency or the
      // payload is missing — fall straight through to the rendered
      // sequence so the user still sees the generated emails.
      if (!window.CadenceProgress || !progressRoot || !variantSteps.length) {
        renderSequence();
        return;
      }

      currentRun = window.CadenceProgress.mount(progressRoot, variantSteps, {
        onComplete: function () { currentRun = null; renderSequence(); }
      });
      currentRun.start();
    }

    function stopGeneration() {
      if (currentRun) { currentRun.reset(); currentRun = null; }
      setRegion(scope, 'form', generateBtn);
      updateGenerateBtnState();
    }

    function onGenerateClick() {
      var state = scope.getAttribute('data-wm-state');
      if (state === 'progress') stopGeneration();
      else startGeneration();
    }

    if (generateBtn) generateBtn.addEventListener('click', onGenerateClick);

    // app.js dispatches `lookup-selection-change` on every selection /
    // clear across ALL lookups on the page. The event payload doesn't
    // include the source `el` for the single-select branch, so we just
    // re-read both scoped lookups and update Generate's disabled state.
    document.addEventListener('lookup-selection-change', updateGenerateBtnState);

    // Reset hook consumed by `preview-unified.js`. Public API:
    // `scope._resetPreview()` cancels any in-flight progress run, clears
    // the rendered sequence (so the next Generate starts clean), flips
    // back to the form region, and re-checks Generate's disabled state.
    scope._resetPreview = function () {
      if (currentRun) { currentRun.reset(); currentRun = null; }
      if (stepsContainer) {
        while (stepsContainer.firstChild) stepsContainer.removeChild(stepsContainer.firstChild);
      }
      if (progressRoot) {
        while (progressRoot.firstChild) progressRoot.removeChild(progressRoot.firstChild);
      }
      setRegion(scope, 'form', generateBtn);
      updateGenerateBtnState();
    };

    setRegion(scope, 'form', generateBtn);
    updateGenerateBtnState();
  }

  // Auto-init if a live Email mode is already in the DOM at load. The
  // `preview-unified.js` script will also call this on dropdown switch,
  // and it's idempotent (the `data-email-preview-wired` flag short-
  // circuits subsequent calls).
  function autoInit() {
    document.querySelectorAll('.preview-panel--unified .pu-mode--email.pu-mode--live').forEach(function (scope) {
      initEmailPreview(scope);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  window.initEmailPreview = initEmailPreview;
})();
