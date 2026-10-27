// Cadence popover wiring for Step 4 — Write Messaging.
//
// The cadence combobox in src/views/step_04_write_messaging.html opts into
// data-lookup-popover="true". src/scripts/app.js's initLookups skips its
// usual SLDS option-list rendering for that wrapper and instead exposes
// three helpers on the wrapper element:
//
//   el._lookupSelect(item)        // entity chip (Use as-is / Optimize)
//   el._lookupSelectAction(action) // sparkle chip (Generate Cadence)
//   el._lookupClose()              // optional manual close
//
// This module finds the popover, wires per-panel typeahead, click-to-pick
// rows that route through _lookupSelect, and the Generate submit button
// that routes through _lookupSelectAction. The chip text is what the
// orchestrator (src/scripts/step_04_write_messaging.js) reads via
// readSelectedName + resolveCadenceKey, so picking "Generate Cadence" as
// the agent action name routes to the GENERATED_KEY cadence in the JSON.
;(function () {
  'use strict'

  function init () {
    var wrapper = document.querySelector('[data-slds-lookup="CADENCE_DATA"][data-lookup-popover="true"]')
    if (!wrapper) return
    var popover = wrapper.querySelector('.cadence-popover')
    if (!popover) return

    // ── 1. Typeahead — each search input filters rows in its own panel.
    // data-search-text lives on the <li class="slds-listbox__item">; we
    // toggle [hidden] (CSS suppresses display). After filtering, count
    // visible rows and show/hide the panel's `.cadence-popover__empty`
    // empty-state element so the user gets feedback when zero rows match.
    popover.querySelectorAll('.cadence-popover__search').forEach(function (input) {
      input.addEventListener('input', function () {
        var q = (input.value || '').toLowerCase().trim()
        var panel = input.closest('.cadence-popover__panel')
        if (!panel) return
        var visibleCount = 0
        panel.querySelectorAll('.slds-listbox__item[data-search-text]').forEach(function (item) {
          var text = item.dataset.searchText || ''
          var matches = !q || text.indexOf(q) > -1
          if (matches) {
            item.removeAttribute('hidden')
            visibleCount++
          } else {
            item.setAttribute('hidden', '')
          }
        })
        var empty = panel.querySelector('.cadence-popover__empty')
        if (empty) {
          if (visibleCount === 0) empty.removeAttribute('hidden')
          else empty.setAttribute('hidden', '')
        }
      })
    })

    // ── 2. Click-to-pick — call wrapper._lookupSelect(item) so app.js
    // renders the entity chip, fires lookup-selection-change, and closes
    // the popover (close() inside select() removes slds-is-open from the
    // trigger). Stash the chosen variant on the wrapper so the
    // orchestrator can dispatch on it later.
    popover.querySelectorAll('.cadence-popover__list').forEach(function (list) {
      list.addEventListener('click', function (e) {
        var li = e.target.closest('.slds-listbox__item[data-cadence-name]')
        if (!li || !list.contains(li)) return
        var name = li.dataset.cadenceName
        var data = window.CADENCE_DATA || []
        var item = null
        for (var i = 0; i < data.length; i++) {
          if (data[i] && data[i].name === name) { item = data[i]; break }
        }
        if (!item) return

        var panel = li.closest('.cadence-popover__panel')
        var panelKey = panel && panel.dataset.panel
        // Map panel ID -> compact variant id matching the per-row-submenu
        // names used elsewhere in the codebase. Generate is handled by the
        // submit button below, not row clicks, so it's omitted here.
        var variant = panelKey === 'cadence-mode-optimize' ? 'optimize' : 'use-as-is'
        wrapper.dataset.lookupActionVariant = variant

        if (typeof wrapper._lookupSelect === 'function') {
          wrapper._lookupSelect(item)
        }
      })
    })

    // ── 3. Generate submit — route through wrapper._lookupSelectAction
    // with the "generate" entry from window.CADENCE_AGENT_ACTIONS so the
    // chip renders with the sparkle/blue agent style and its text matches
    // resolveCadenceKey()'s lookup ("Generate Cadence" -> GENERATED_KEY).
    var submit = popover.querySelector('.cadence-popover__prompt-submit')
    var promptEl = popover.querySelector('.cadence-popover__prompt')
    if (submit) {
      submit.addEventListener('click', function () {
        var actions = window.CADENCE_AGENT_ACTIONS || []
        var generateAction = null
        for (var i = 0; i < actions.length; i++) {
          if (actions[i] && actions[i].id === 'generate') { generateAction = actions[i]; break }
        }
        if (!generateAction) return
        wrapper.dataset.lookupActionVariant = 'generate'
        if (promptEl) {
          wrapper.dataset.lookupGeneratePrompt = promptEl.value || ''
        }
        if (typeof wrapper._lookupSelectAction === 'function') {
          wrapper._lookupSelectAction(generateAction)
        }
      })
    }
  }

  // app.js's initLookups runs at script load (top-level, not deferred)
  // and exposes the helpers we depend on. Defer our init to
  // DOMContentLoaded so the DOM is fully parsed; this script tag sits
  // after app.js in step_04_write_messaging.html so the helpers are
  // already attached by the time we run.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
