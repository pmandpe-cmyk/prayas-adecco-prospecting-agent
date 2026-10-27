(function () {
  'use strict';

  // Step 4 — Write Messaging orchestrator.
  // Wires the Prospect + Cadence comboboxes, the Generate button, and the
  // CadenceProgress -> CadenceSequence flow. All copy lives in
  // src/views/data/step_04_write_messaging.json (injected at build time as
  // <script id="step-04-data">).

  // Hardcoded mapping for the "Suggest Cadence" agent action — the agent
  // pretends to score the prospect's existing cadences and picks one. Until
  // the real scoring logic lands, every Suggest selection resolves to this
  // cadence. "Generate Cadence" instead resolves to the dedicated
  // "Generated Cadence" entry in the JSON (a brand-new sequence).
  var SUGGEST_PICK = 'High Touch Prospects';
  var GENERATED_KEY = 'Generated Cadence';

  function parseData() {
    var script = document.getElementById('step-04-data');
    if (!script || !script.textContent) {
      return { progressSteps: { existing: [], suggest: [], generate: [] }, cadences: {} };
    }
    try {
      var parsed = JSON.parse(script.textContent);
      return {
        progressSteps: normalizeProgressSteps(parsed.progressSteps),
        cadences: parsed.cadences && typeof parsed.cadences === 'object' ? parsed.cadences : {}
      };
    } catch (e) {
      return { progressSteps: { existing: [], suggest: [], generate: [] }, cadences: {} };
    }
  }

  // Accept either the new `{ existing, suggest, generate }` object shape or the
  // legacy flat-array shape (treated as the same array for all three variants).
  function normalizeProgressSteps(raw) {
    if (Array.isArray(raw)) {
      return { existing: raw, suggest: raw, generate: raw };
    }
    if (raw && typeof raw === 'object') {
      return {
        existing: Array.isArray(raw.existing) ? raw.existing : [],
        suggest:  Array.isArray(raw.suggest)  ? raw.suggest  : [],
        generate: Array.isArray(raw.generate) ? raw.generate : []
      };
    }
    return { existing: [], suggest: [], generate: [] };
  }

  function findLookupEl(metaMode) {
    return document.querySelector('[data-slds-lookup][data-lookup-meta="' + metaMode + '"]');
  }

  function setState(rootEl, generateBtn, name) {
    rootEl.setAttribute('data-state', name);
    rootEl.querySelectorAll('[data-region]').forEach(function (region) {
      region.hidden = region.dataset.region !== name;
    });
    if (generateBtn) {
      var label = generateBtn.dataset['label' + name.charAt(0).toUpperCase() + name.slice(1)];
      if (label) generateBtn.textContent = label;
      generateBtn.classList.toggle('slds-button_brand', name !== 'progress');
      generateBtn.classList.toggle('slds-button_destructive', name === 'progress');
    }
  }

  // Look up the selected prospect record in PROSPECT_DATA_FLAT to derive
  // first/last name + account + title for token substitution. Returns null if
  // the prospect isn't in the data set (e.g. blank selection); tokenize()
  // handles that gracefully.
  function findProspectMeta(name) {
    if (!name || !window.PROSPECT_DATA_FLAT) return null;
    var found = null;
    for (var i = 0; i < window.PROSPECT_DATA_FLAT.length; i++) {
      if (window.PROSPECT_DATA_FLAT[i].name === name) {
        found = window.PROSPECT_DATA_FLAT[i];
        break;
      }
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

  // Replace {{prospect.firstName|lastName|name|account|title}} tokens in a
  // string. Safe on non-strings, undefined prospect, and missing fields.
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

  // Deep-clone a step (incl. its regenerations[]) and substitute prospect
  // tokens on every text-bearing field. Cadence-sequence.js consumes this
  // unchanged; the templating layer is fully owned by this orchestrator.
  function tokenizeStep(step, prospect) {
    if (!step || typeof step !== 'object') return step;
    var out = JSON.parse(JSON.stringify(step));
    ['subject', 'body', 'goal', 'headerLabel', 'headerValue'].forEach(function (k) {
      if (typeof out[k] === 'string') out[k] = tokenize(out[k], prospect);
    });
    if (Array.isArray(out.details)) {
      out.details.forEach(function (d) {
        if (d && typeof d.title === 'string') d.title = tokenize(d.title, prospect);
        if (d && typeof d.value === 'string') d.value = tokenize(d.value, prospect);
      });
    }
    if (Array.isArray(out.regenerations)) {
      out.regenerations = out.regenerations.map(function (alt) {
        return tokenizeStep(alt, prospect);
      });
    }
    return out;
  }

  // Map the picked cadence label to the actual cadence key in the JSON.
  // Existing cadence names pass through; the two agent actions get redirected
  // to either the Generated Cadence entry (always a new sequence) or the
  // hardcoded Suggest pick.
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

  // Pick which progressSteps variant to play during the loading state based
  // on whether the user picked an agent action or an existing cadence.
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

  function resolveSteps(cadences, cadenceName, prospectName) {
    var cadence = cadenceName && cadences[cadenceName];
    if (!cadence || !cadence.prospects) return [];
    var bucket = cadence.prospects[prospectName] || cadence.prospects.default;
    return (bucket && Array.isArray(bucket.steps)) ? bucket.steps : [];
  }

  function init() {
    var rootEl = document.getElementById('write-messaging');
    if (!rootEl) return;

    var data = parseData();
    var prospectLookupEl = findLookupEl('prospect');
    var cadenceLookupEl = findLookupEl('cadence');
    var generateBtn = document.getElementById('wm-generate-btn');
    var progressRoot = document.getElementById('wm-progress-root');
    var stepsContainer = document.getElementById('wm-steps-container');

    var currentRun = null;

    // The lookup widget (src/scripts/app.js initLookups) renders the chosen
    // value into `.slds-combobox__input-value .slds-truncate` for single-select.
    // It dispatches a 'lookup-selection-change' event but only includes the
    // source `el` for the multi-select branch, so we just read the DOM at the
    // moment Generate is clicked. data-lookup-default seeds the initial value.
    function readSelectedName(lookupEl) {
      if (!lookupEl) return '';
      var valueEl = lookupEl.querySelector('.slds-combobox__input-value .slds-truncate');
      var text = valueEl && valueEl.textContent ? valueEl.textContent.trim() : '';
      return text || (lookupEl.dataset.lookupDefault || '');
    }

    // Strict selection check used only for the disable logic. Unlike
    // readSelectedName(), this does NOT fall back to data-lookup-default,
    // so a cleared combobox correctly reports "no selection" even when
    // a default was originally seeded.
    function hasLookupSelection(lookupEl) {
      if (!lookupEl) return false;
      var valueEl = lookupEl.querySelector('.slds-combobox__input-value .slds-truncate');
      return !!(valueEl && valueEl.textContent && valueEl.textContent.trim());
    }

    // Disable Generate when either combobox is empty so the user can't kick
    // off a run with missing inputs. The Stop affordance during the
    // 'progress' state stays enabled regardless so the user can always cancel.
    function updateGenerateBtnState() {
      if (!generateBtn) return;
      var state = rootEl.getAttribute('data-state');
      if (state === 'progress') {
        generateBtn.disabled = false;
        return;
      }
      generateBtn.disabled = !(
        hasLookupSelection(prospectLookupEl) && hasLookupSelection(cadenceLookupEl)
      );
    }

    function renderSequence() {
      var prospectName = readSelectedName(prospectLookupEl);
      var rawCadenceName = readSelectedName(cadenceLookupEl);
      var cadenceKey = resolveCadenceKey(rawCadenceName);
      var prospectMeta = findProspectMeta(prospectName);

      var rawSteps = resolveSteps(data.cadences, cadenceKey, prospectName);

      // Fallback: if the resolved cadence has no real step data (e.g. the
      // user picked one of the 8 picker cadences without authored content),
      // fall back to the top-level "default" cadence. The data file ships
      // with a `default` entry whose templated steps adapt to any prospect.
      if (!rawSteps.length) {
        rawSteps = resolveSteps(data.cadences, 'default', prospectName);
      }

      var steps = rawSteps.map(function (s) { return tokenizeStep(s, prospectMeta); });

      if (window.CadenceSequence && stepsContainer) {
        window.CadenceSequence.render(stepsContainer, steps);
        window.CadenceSequence.wirePopover(stepsContainer);
        // BEGIN icon-swap (testing) — remove this line + the wireCollapse
        // block in cadence-sequence.js + the icon-swap markup/styles to
        // disable the per-step collapse interaction.
        if (window.CadenceSequence.wireCollapse) window.CadenceSequence.wireCollapse(stepsContainer);
        // END icon-swap (testing)
        if (window.StepFeedback) window.StepFeedback.init(stepsContainer);
      }
      setState(rootEl, generateBtn, 'sequence');
      updateGenerateBtnState();
    }

    function startGeneration() {
      setState(rootEl, generateBtn, 'progress');
      updateGenerateBtnState();
      var rawCadenceName = readSelectedName(cadenceLookupEl);
      var variant = resolveProgressVariant(rawCadenceName);
      var variantSteps = (data.progressSteps && data.progressSteps[variant]) || [];

      if (!window.CadenceProgress || !progressRoot || !variantSteps.length) {
        renderSequence();
        return;
      }
      currentRun = window.CadenceProgress.mount(progressRoot, variantSteps, {
        onComplete: function () {
          currentRun = null;
          renderSequence();
        }
      });
      currentRun.start();
    }

    function stopGeneration() {
      if (currentRun) {
        currentRun.reset();
        currentRun = null;
      }
      setState(rootEl, generateBtn, 'form');
      updateGenerateBtnState();
    }

    function onGenerateClick() {
      var state = rootEl.getAttribute('data-state');
      if (state === 'progress') {
        stopGeneration();
      } else {
        startGeneration();
      }
    }

    if (generateBtn) generateBtn.addEventListener('click', onGenerateClick);

    // The lookup widget dispatches this on every selection / clear; re-check
    // both comboboxes and disable Generate if either is empty.
    document.addEventListener('lookup-selection-change', updateGenerateBtnState);

    setState(rootEl, generateBtn, 'form');
    updateGenerateBtnState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
