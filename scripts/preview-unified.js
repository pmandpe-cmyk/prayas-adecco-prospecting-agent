/* preview-unified.js — orchestrator for the Unified Preview panel
 *
 * Markup is rendered by `_preview-unified.html` (always renders all four
 * LIVE modes). Styles live at the bottom of `_preview-agent.scss`. This
 * file wires the cross-cutting interactions so every wizard step that
 * includes the partial gets the same UX without duplicated inline JS.
 *
 * Behaviors:
 *   1. Mode <select> → flips `data-active-mode` on the panel, mirrors
 *      the selected option's label into the faux pill, hides the
 *      previously-visible mode + un-hides the new one, and resets the
 *      new mode to its empty state via `scope._resetPreview()`.
 *   2. Refresh button → momentary spinner + reset of the active mode
 *      (same `_resetPreview()` call as the dropdown switch).
 *   3. Cycling pickers / detail tabs / momentary actions — carried
 *      over from the static-variant era of the unified panel; harmless
 *      to keep wired since the refactor still uses these primitives in
 *      a few places.
 *
 * Engine reset contract:
 *   Every live engine attaches a `_resetPreview()` method on its mode
 *   section root (the `<section data-mode="…">`):
 *     • data_source        → step_01_preview.js          (✓)
 *     • account_research   → aop-editor/preview.js        (✓)
 *     • discover_prospects → aop-editor/preview.js        (✓)
 *     • email              → email-preview.js             (✓)
 *
 *   When the dropdown switches mode, we call `_resetPreview()` on the
 *   newly-active section so it lands on its empty state — the user's
 *   explicit ask ("each time you switch the preview option, it should
 *   refresh the preview, meaning it lands on the empty state").
 *
 * Idempotent — `init()` on the same panel is a no-op (we tag the panel
 * with `data-preview-unified-wired`).
 */

(function () {
  'use strict';

  // Tell aop-editor/preview.js to skip its legacy `#preview-root`
  // single-instance boot — we boot scoped instances through its
  // `bootAopPreview()` export from the unified panel instead. Set
  // BEFORE the AOP module evaluates (this script is a classic
  // <script>, the AOP module is a deferred type=module). Pages that
  // don't use the unified panel never load preview-unified.js, so the
  // legacy boot still runs there.
  //
  // Actually: aop-editor/preview.js's autoInit detects the unified
  // panel itself and chooses scoped vs. legacy boot accordingly, so
  // setting `AOP_LAZY_BOOT` here is unnecessary — we leave the
  // detection to the engine. The flag remains an opt-out escape hatch.

  var SPINNER_HTML =
    '<svg class="slds-button__icon slds-button__icon_left slds-icon_xx-small" aria-hidden="true">' +
      '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#spinner"></use>' +
    '</svg>';

  // Resolve the live mode <section> for a given mode id within a panel.
  function findModeSection(panel, modeId) {
    if (!panel || !modeId) return null;
    return panel.querySelector('[data-mode="' + modeId + '"]');
  }

  // Reset a mode by calling its scoped `_resetPreview()`. No-op when
  // the engine hasn't booted yet (e.g. the script load failed) or
  // when there's no live engine for this mode.
  function resetMode(panel, modeId) {
    var section = findModeSection(panel, modeId);
    if (section && typeof section._resetPreview === 'function') {
      section._resetPreview();
    }
  }

  // ── 1. Mode <select> drives `data-active-mode` ────────────────────
  // The CSS rules in `_preview-agent.scss` show/hide modes based on
  // `data-active-mode`. We also toggle the `hidden` attribute on each
  // `<section data-mode>` so non-CSS consumers (and assistive tech)
  // get the same answer; resetting the new mode keeps the user's
  // mental model that switching = a fresh preview.
  function wireModeSelect(panel) {
    var sel = panel.querySelector('[data-preview-mode]');
    if (!sel) return;
    var label = panel.querySelector('[data-preview-mode-label]');
    sel.addEventListener('change', function () {
      var value = sel.value;
      panel.setAttribute('data-active-mode', value);
      if (label) {
        var opt = sel.options[sel.selectedIndex];
        if (opt) label.textContent = opt.textContent;
      }
      panel.querySelectorAll('[data-mode]').forEach(function (section) {
        if (section.dataset.mode === value) section.removeAttribute('hidden');
        else section.setAttribute('hidden', 'hidden');
      });
      resetMode(panel, value);
    });
  }

  // ── 2. Refresh button — momentary spinner + reset active mode ────
  function wireRefresh(panel) {
    var btn = panel.querySelector('[data-preview-refresh]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var active = panel.getAttribute('data-active-mode');
      resetMode(panel, active);

      var icon = btn.querySelector('svg use');
      if (!icon) return;
      var original = icon.getAttribute('xlink:href');
      icon.setAttribute('xlink:href', '/assets/icons/utility-sprite/svg/symbols.svg#spinner');
      btn.disabled = true;
      setTimeout(function () {
        icon.setAttribute('xlink:href', original);
        btn.disabled = false;
      }, 700);
    });
  }

  // ── 3. Legacy cycling pickers (carried over for any `[data-options]`
  //   buttons that still exist on a step-specific page; the unified
  //   partial itself no longer ships them) ────────────────────────────
  function wireCyclingPickers(panel) {
    panel.querySelectorAll('[data-options]').forEach(function (button) {
      var raw = button.getAttribute('data-options');
      if (!raw) return;
      var options;
      try { options = JSON.parse(raw); } catch (_) { return; }
      if (!Array.isArray(options) || options.length === 0) return;

      var valueEl =
        button.querySelector('[data-pa-source-value]') ||
        button.querySelector('[data-pa-cadence-value]') ||
        button.querySelector('[data-pa-value]');
      if (!valueEl) return;

      button.addEventListener('click', function () {
        var current = valueEl.textContent.trim();
        var idx = options.indexOf(current);
        var next = options[(idx + 1) % options.length];
        valueEl.textContent = next;
      });
    });
  }

  // ── 4. Email pane inner tabs (Details / Feedback) — legacy
  //   carry-over for any step that still ships the old static markup.
  function wireDetailTabs(panel) {
    var detailTabs  = panel.querySelectorAll('.pa-email-detail-tab');
    var detailPanes = panel.querySelectorAll('[data-detail-pane]');
    if (!detailTabs.length) return;
    detailTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var id = tab.getAttribute('data-detail-tab');
        detailTabs.forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        detailPanes.forEach(function (p) {
          if (p.getAttribute('data-detail-pane') === id) {
            p.removeAttribute('hidden');
          } else {
            p.setAttribute('hidden', 'hidden');
          }
        });
      });
    });
  }

  // ── 5. Momentary action buttons ───────────────────────────────────
  function wireMomentaryActions(panel) {
    panel.querySelectorAll('[data-pa-momentary-action]').forEach(function (btn) {
      var busyLabel = btn.getAttribute('data-pa-momentary-action') || 'Working…';
      btn.addEventListener('click', function () {
        var original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = SPINNER_HTML + busyLabel;
        setTimeout(function () {
          btn.innerHTML = original;
          btn.disabled = false;
        }, 1100);
      });
    });
  }

  // ── 6. "Accounts are required" gate for AOP modes ─────────────────
  //
  // Overlay on top of the AOP engine's per-mode disable logic so the
  // Preview button stays disabled whenever `window.HunterAccounts`
  // reports zero configured Account sources — regardless of what the
  // engine's `syncPreviewButton(selected)` tries to do in response to
  // a lookup-selection-change event. The gate is intentionally
  // additive: it only ever forces `disabled = true`; the engine
  // still owns the "enable when a lookup selection lands" path when
  // the gate is inactive. This preserves any existing page-specific
  // validation without duplicating logic inside this file.
  //
  // Mechanism per gated section (one per AOP mode = 2 per panel):
  //   • On init + on every `hunter:accounts-changed` window event, we
  //     call `applyGate(section)` which:
  //       - Toggles the scoped-notification's `hidden` attribute.
  //       - Toggles the standard `[data-aop-empty-state]` (hides it
  //         while gated — spec says "Do not show the standard preview
  //         empty state").
  //       - Force-sets `disabled = true` on `[data-aop-action-btn]`
  //         while gated, and wires `aria-describedby` to the hidden
  //         `[data-aop-btn-desc]` span so screen-reader users get the
  //         reason for the disabled state.
  //       - Calls `section._resetPreview()` if any results are
  //         rendered so lingering result cards clear when the gate
  //         re-activates (e.g. user generated a preview, then went to
  //         Accounts and removed all sources, then came back).
  //   • A MutationObserver watches the button's `disabled` attribute.
  //     When gated is true and something (i.e. the AOP engine's
  //     lookup-selection handler at aop-editor/preview.js:2810)
  //     removes it, we immediately re-force `disabled = true`. This
  //     is the only way to overlay the engine's behaviour without
  //     modifying the engine itself. The observer is a no-op while
  //     the gate is inactive (early return), so it doesn't fight
  //     the engine after Accounts are configured.
  //
  // Only account_research + discover_prospects are gated. The
  // data_source mode IS the Accounts step's preview (it doesn't make
  // sense to gate the tool that adds sources on having sources), and
  // the email mode is downstream of prospects — email preview
  // implicitly requires prospects, which implicitly requires
  // Accounts, but per the spec we only gate the two AOP modes
  // explicitly called out.
  var GATED_MODES = ['account_research', 'discover_prospects'];

  function hasAccountSource() {
    return !!(window.HunterAccounts &&
              typeof window.HunterAccounts.hasSource === 'function' &&
              window.HunterAccounts.hasSource());
  }

  function applyGateToSection(section) {
    if (!section) return;
    var gated = false;
    var notice     = section.querySelector('[data-hunter-accounts-notice]');
    var emptyState = section.querySelector('[data-aop-empty-state]');
    var btn        = section.querySelector('[data-aop-action-btn]');
    var desc       = section.querySelector('[data-aop-btn-desc]');

    if (notice) {
      notice.setAttribute('hidden', 'hidden');
      notice.style.display = 'none';
    }

    if (emptyState) {
      // While gated, the notice IS the empty state — the standard
      // instructions list would double up as a redundant "hasn't
      // been run yet" affordance next to a "you can't run this"
      // warning, which reads noisier than helpful.
      if (gated) emptyState.setAttribute('hidden', 'hidden');
      else emptyState.removeAttribute('hidden');
    }

    if (btn) {
      if (gated) {
        // Layer over the engine's disabled flag. The MutationObserver
        // below re-forces this if the engine flips it back on later.
        btn.disabled = true;
        if (desc && desc.id) btn.setAttribute('aria-describedby', desc.id);
      } else {
        // Handing control back to the engine — don't touch `disabled`
        // here. If a lookup selection landed while we were gated the
        // engine's `syncPreviewButton(true)` fired and we re-forced
        // disable via the observer; now that the gate is inactive
        // the next lookup change (or the next `_resetPreview` cycle)
        // will settle the button to its natural state. Users can
        // also just re-click the selector or refresh to trigger it.
        btn.removeAttribute('aria-describedby');
      }
    }

    // Clear any stale preview results left over from before the gate
    // re-activated (see docstring). `_resetPreview` also un-hides the
    // empty state, so we re-hide it afterward while still gated.
    if (gated && typeof section._resetPreview === 'function') {
      var hasResults = !!(
        section.querySelector('.completed-card') ||
        section.querySelector('.result-card') ||
        section.querySelector('.full-preview-panel') ||
        section.querySelector('.loading')
      );
      if (hasResults) {
        section._resetPreview();
        if (emptyState) emptyState.setAttribute('hidden', 'hidden');
      }
    }
  }

  function applyGate(panel) {
    if (!panel) return;
    GATED_MODES.forEach(function (mode) {
      var section = findModeSection(panel, mode);
      applyGateToSection(section);
    });
  }

  function wireGate(panel) {
    // Wire a MutationObserver per gated section that re-forces
    // `disabled = true` on the Preview button whenever the AOP
    // engine tries to enable it while the gate is active.
    GATED_MODES.forEach(function (mode) {
      var section = findModeSection(panel, mode);
      if (!section) return;
      var btn = section.querySelector('[data-aop-action-btn]');
      if (!btn || btn.getAttribute('data-hb-gate-observed') === 'true') return;
      btn.setAttribute('data-hb-gate-observed', 'true');

      // The observer callback synchronously re-writes `disabled` when
      // the gate is active and the button just got enabled. Setting
      // `disabled = true` inside a mutation callback re-triggers the
      // observer, but the guard (`!btn.disabled` check) breaks the
      // loop on the second pass.
      var observer = new MutationObserver(function () {
        if (!hasAccountSource() && !btn.disabled) {
          btn.disabled = true;
        }
      });
      observer.observe(btn, { attributes: true, attributeFilter: ['disabled'] });
    });

    // Also re-run applyGate on every accounts-changed event. Registered
    // once per panel; the panel-scoped closure keeps the reference to
    // `panel` alive so we don't have to walk the DOM again.
    if (panel.getAttribute('data-hb-gate-listening') === 'true') return;
    panel.setAttribute('data-hb-gate-listening', 'true');
    window.addEventListener('hunter:accounts-changed', function () {
      applyGate(panel);
    });
  }

  function initPanel(panel) {
    if (!panel || panel.getAttribute('data-preview-unified-wired') === 'true') return;
    panel.setAttribute('data-preview-unified-wired', 'true');
    wireModeSelect(panel);
    wireRefresh(panel);
    wireCyclingPickers(panel);
    wireDetailTabs(panel);
    wireMomentaryActions(panel);
    // Gate wiring runs AFTER the AOP engines have attached their own
    // handlers (the aop-editor module is loaded before this script in
    // `_template.html`) — the MutationObserver's early-return-when-
    // ungated design tolerates the observer running before/after
    // engine writes either way, but ordering the wire calls this way
    // matches the natural DOM-ready → engine-init → gate-init flow.
    wireGate(panel);
    applyGate(panel);
  }

  // Re-apply the gate on mode-switch + refresh so a fresh mode picks
  // up the current gate state even if nothing else changed. Cheap:
  // each pass is a few querySelectors + a handful of attribute
  // toggles. Wrapping the existing helpers avoids duplicating the
  // wireModeSelect / wireRefresh logic just to append a gate call.
  var _wireModeSelectOrig = wireModeSelect;
  wireModeSelect = function (panel) {
    _wireModeSelectOrig(panel);
    var sel = panel.querySelector('[data-preview-mode]');
    if (!sel) return;
    sel.addEventListener('change', function () { applyGate(panel); });
  };

  var _wireRefreshOrig = wireRefresh;
  wireRefresh = function (panel) {
    _wireRefreshOrig(panel);
    var btn = panel.querySelector('[data-preview-refresh]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      // Run the gate re-application after the refresh's own reset
      // has settled (the original handler kicks a 700ms momentary
      // spinner, but the mode-reset itself is synchronous — the
      // gate can settle immediately).
      applyGate(panel);
    });
  };

  function initAll() {
    document.querySelectorAll('.preview-panel--unified').forEach(initPanel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
