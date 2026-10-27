/* eslint-env browser */

/**
 * Agent Monitoring page interactions.
 *
 * Wires up two behaviours on /agent_monitoring.html:
 *
 *   1. Metric cards act as radio-buttons filtering the table by outreach
 *      status. Records Assigned is the "show everything" state; the
 *      other three cards filter to `active`, `completed`, or one of the
 *      "incomplete" statuses (paused / pending / cancelled / awaiting).
 *      Only one card can be active at a time. Clicking the active card
 *      is a no-op (we don't toggle-off — matches the Monitoring
 *      reference and keeps the metadata row honest).
 *
 *   2. Row + select-all checkboxes drive the disabled state on the
 *      Approve / Cancel Outreach bulk-action buttons. Select-all
 *      toggles every VISIBLE row checkbox (i.e. respects the current
 *      metric filter), which matches the "acting on what you can see"
 *      convention SLDS lists use.
 *
 * The table is a flat list of prospects — no account grouping / no
 * chevron expand-collapse. The Account column carries the account
 * context per-row so grouping isn't needed for scannability.
 *
 * Kept intentionally dependency-free (no jQuery/no build step) —
 * matches src/scripts/agent-log.js style.
 */
(function () {
  'use strict'

  var root = document.querySelector('.agent-monitoring')
  if (!root) return

  var metrics = Array.prototype.slice.call(root.querySelectorAll('.agent-monitoring__metric'))
  var rows = Array.prototype.slice.call(root.querySelectorAll('.agent-monitoring__row_prospect'))
  var metaCount = root.querySelector('.js-agent-monitoring-count')
  var metaLabel = root.querySelector('.js-agent-monitoring-count-label')
  var approveBtn = root.querySelector('.js-agent-monitoring-approve')
  var cancelBtn = root.querySelector('.js-agent-monitoring-cancel')
  // Select-all lives in the `ui.th_select_all()` macro output with the
  // ID we passed in — the macro doesn't take a class hook, so target
  // by ID here.
  var selectAll = root.querySelector('#agent-monitoring-select-all')

  /**
   * Which outreach statuses count under each metric card.
   * `all` is a sentinel — the "Records Assigned" card shows every row
   * regardless of status, so `filterByMetric('all')` skips the filter
   * check entirely.
   */
  var METRIC_STATUSES = {
    all: null,
    active: ['active'],
    completed: ['completed'],
    incomplete: ['paused', 'pending', 'cancelled', 'awaiting']
  }

  var METRIC_LABELS = {
    all: 'records',
    active: 'active outreaches',
    completed: 'completed outreaches',
    incomplete: 'incomplete outreaches'
  }

  function rowMatchesMetric (row, metricKey) {
    var statuses = METRIC_STATUSES[metricKey]
    if (!statuses) return true // "all" case
    var status = row.getAttribute('data-outreach-status') || ''
    return statuses.indexOf(status) !== -1
  }

  /**
   * Apply the currently active metric filter to every prospect row.
   * Matched rows stay in the DOM flow with an intrinsic display;
   * non-matches get `display: none` via the `.is-filtered-out` class
   * so row numbering (which counts DOM order of visible rows) stays
   * predictable.
   */
  function applyFilter (metricKey) {
    var visibleCount = 0

    rows.forEach(function (row) {
      var matches = rowMatchesMetric(row, metricKey)
      row.classList.toggle('is-filtered-out', !matches)
      row.style.display = matches ? '' : 'none'
      if (matches) visibleCount += 1
    })

    if (metaCount) metaCount.textContent = String(visibleCount)
    if (metaLabel) metaLabel.textContent = METRIC_LABELS[metricKey] || 'records'

    renumberRows()
  }

  /**
   * Populate the "#" column on every prospect row in DOM order,
   * counting only rows that are currently visible under the active
   * metric filter. Runs on load and after every filter change so the
   * ranking always reflects what the user can see.
   */
  function renumberRows () {
    var n = 0
    rows.forEach(function (row) {
      var cell = row.querySelector('.js-agent-monitoring-row-num')
      if (!cell) return
      if (row.classList.contains('is-filtered-out')) {
        cell.textContent = ''
      } else {
        n += 1
        cell.textContent = String(n)
      }
    })
  }

  /* ----------------------------- Metric cards ----------------------------- */

  metrics.forEach(function (card) {
    card.addEventListener('click', function () {
      var key = card.getAttribute('data-metric')
      if (!key) return
      metrics.forEach(function (c) { c.classList.remove('is-active') })
      card.classList.add('is-active')
      applyFilter(key)
    })
  })

  /* ---------------------------- Row selection ----------------------------- */

  function updateBulkActions () {
    var checked = root.querySelectorAll(
      '.agent-monitoring__row_prospect:not(.is-filtered-out) .agent-monitoring__row-check:checked'
    )
    var hasSelection = checked.length > 0
    if (approveBtn) approveBtn.disabled = !hasSelection
    if (cancelBtn) cancelBtn.disabled = !hasSelection
  }

  root.querySelectorAll('.agent-monitoring__row-check').forEach(function (cb) {
    cb.addEventListener('change', function () {
      // If a row is toggled off, un-check the select-all header so it
      // stops advertising "all rows selected".
      if (!cb.checked && selectAll) selectAll.checked = false
      updateBulkActions()
    })
  })

  if (selectAll) {
    selectAll.addEventListener('change', function () {
      var target = selectAll.checked
      root.querySelectorAll('.agent-monitoring__row_prospect:not(.is-filtered-out) .agent-monitoring__row-check')
        .forEach(function (cb) { cb.checked = target })
      updateBulkActions()
    })
  }

  /* --------------------------- Filter dropdowns --------------------------- */

  /**
   * Minimal combobox handler for the four filter dropdowns. Reuses the
   * SLDS `slds-dropdown-trigger_click` structure but doesn't depend on
   * app.js' generic handler (which is scoped to the Prospecting page),
   * so this page stays self-contained.
   */
  root.querySelectorAll('.slds-dropdown-trigger_click').forEach(function (trigger) {
    var input = trigger.querySelector('[role="combobox"]')
    var listbox = trigger.querySelector('[role="listbox"]')
    if (!input || !listbox) return

    input.addEventListener('click', function (e) {
      e.stopPropagation()
      var opening = !trigger.classList.contains('slds-is-open')
      // Close any other open combobox first.
      root.querySelectorAll('.slds-dropdown-trigger_click.slds-is-open')
        .forEach(function (t) { t.classList.remove('slds-is-open') })
      trigger.classList.toggle('slds-is-open', opening)
      input.setAttribute('aria-expanded', String(opening))
    })

    listbox.querySelectorAll('[role="option"]').forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        e.stopPropagation()
        var label = opt.querySelector('.slds-media__body span')
        if (label) {
          var truncate = input.querySelector('.slds-truncate')
          if (truncate) truncate.textContent = label.textContent
        }
        listbox.querySelectorAll('.slds-is-selected').forEach(function (o) {
          o.classList.remove('slds-is-selected')
          o.setAttribute('aria-selected', 'false')
        })
        opt.classList.add('slds-is-selected')
        opt.setAttribute('aria-selected', 'true')
        trigger.classList.remove('slds-is-open')
        input.setAttribute('aria-expanded', 'false')
      })
    })
  })

  document.addEventListener('click', function () {
    root.querySelectorAll('.slds-dropdown-trigger_click.slds-is-open')
      .forEach(function (t) { t.classList.remove('slds-is-open') })
  })

  /* --------------------- Sortable-header no-op guard ---------------------
     The `sortable_th` macro from `_prospect_list/_macros.html` renders
     an `<a href="#">` so on the Prospecting page the sort JS in
     `prospect-list.js` can hydrate it. This page doesn't load that JS
     (each click would otherwise jump the viewport to the top via the
     `#` href). Swallow the default action so the header buttons read
     as inert-but-present affordances instead. */
  root.querySelectorAll('.agent-monitoring__table thead .slds-th__action').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault() })
  })

  /* --------------------- Activity Timeline side panel -------------------- */
  /**
   * Wire the trailing "View Details" hover-reveal link (per prospect row)
   * to the fixed-position `#am-side-panel` on the right edge of the page.
   * Reads the clicked row's `data-prospect-*` / `data-account-*`
   * attributes and pipes them into the panel header + into the "…for
   * {Company}" and "Lead assigned to {Agent}" slots inside the timeline
   * items (via `.js-am-panel-company` and `.js-am-panel-agent` hooks).
   *
   * Panel state is a plain `display: flex` toggle — no animation, no
   * focus trap. Matches the lightweight prototype-panel pattern already
   * in use by `#prospect-side-panel` in `scripts/prospect-list.js`.
   */
  var panel = document.getElementById('am-side-panel')
  var panelNameEl = document.getElementById('am-panel-header-name')
  var panelSubtitleEl = document.getElementById('am-panel-header-subtitle')
  var panelInitialsEl = document.getElementById('am-panel-header-initials')
  // Article whose right corners are squared off while the panel is
  // open, exactly like `.prospect-list-layout > article` on the
  // Prospecting page. Toggling `.slds-card-uplift-panel-is-open`
  // opts in to the shared rule at `prospect_list.scss:108`.
  var cardArticle = root.querySelector('article.agent-monitoring__card')

  /**
   * Reduce a person's name to at most two uppercase initials.
   * "Abigail Mercer" -> "AM"; "Cher" -> "C".
   */
  function initialsFor (fullName) {
    if (!fullName) return '—'
    var parts = String(fullName).trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '—'
    var first = parts[0].charAt(0)
    var last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
    return (first + last).toUpperCase()
  }

  function openPanelFromRow (row) {
    if (!panel || !row) return
    var name = row.getAttribute('data-prospect-name') || '—'
    var title = row.getAttribute('data-prospect-title') || ''
    var company = row.getAttribute('data-account-name') || ''
    var agent = row.getAttribute('data-prospect-agent') || 'Welo Engagement Assistant Agent'

    if (panelNameEl) panelNameEl.textContent = name
    if (panelSubtitleEl) {
      // "{title} · {company}" — falls back gracefully if either half
      // is missing so we never render " · Cirrus" or "VP of Sales · ".
      panelSubtitleEl.textContent = [title, company].filter(Boolean).join(' • ') || '—'
    }
    if (panelInitialsEl) {
      var initials = initialsFor(name)
      panelInitialsEl.textContent = initials
      panelInitialsEl.setAttribute('title', name)
    }

    // Pipe the prospect's company + assigned agent into the two
    // timeline items that reference them.
    panel.querySelectorAll('.js-am-panel-company').forEach(function (el) {
      el.textContent = company || '—'
    })
    panel.querySelectorAll('.js-am-panel-agent').forEach(function (el) {
      el.textContent = agent
    })

    panel.style.display = 'flex'
    if (cardArticle) cardArticle.classList.add('slds-card-uplift-panel-is-open')
  }

  function closePanel () {
    if (panel) panel.style.display = 'none'
    if (cardArticle) cardArticle.classList.remove('slds-card-uplift-panel-is-open')
  }

  // View Details click -> open. Uses delegation on the root so future-
  // rendered rows (e.g. from a filter re-render) still wire up.
  root.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('.js-am-view-details')
    if (!trigger) return
    e.preventDefault()
    var row = trigger.closest('.agent-monitoring__row_prospect')
    openPanelFromRow(row)
  })

  // Close button inside the panel.
  if (panel) {
    panel.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.js-am-panel-close')) {
        closePanel()
      }
      // Timeline month/section chevron — collapses the item list.
      var toggle = e.target.closest && e.target.closest('.js-am-timeline-section-toggle')
      if (toggle) {
        var section = toggle.closest('.js-am-timeline-section')
        if (section) {
          var isCollapsed = section.classList.toggle('is-collapsed')
          section.classList.toggle('is-open', !isCollapsed)
          toggle.setAttribute('aria-expanded', String(!isCollapsed))
        }
      }
      // Per-item expand chevron — SLDS 2 Activity Timeline reveals its
      // details article by adding `.slds-is-open` to the parent
      // `.slds-timeline__item_expandable`. `slds2_agentic.scss:5013-
      // 5030` handles the visibility + chevron rotation off that
      // class; we just toggle it, flip aria-expanded on the button,
      // and mirror the state on the details article's `hidden`
      // attribute so keyboard/screen-reader semantics match the
      // visual state.
      var expandBtn = e.target.closest && e.target.closest('.js-am-timeline-expand')
      if (expandBtn) {
        var item = expandBtn.closest('.slds-timeline__item_expandable')
        var detailsId = expandBtn.getAttribute('aria-controls')
        var details = detailsId ? document.getElementById(detailsId) : null
        if (item) {
          var opening = !item.classList.contains('slds-is-open')
          item.classList.toggle('slds-is-open', opening)
          expandBtn.setAttribute('aria-expanded', String(opening))
          if (details) {
            if (opening) details.removeAttribute('hidden')
            else details.setAttribute('hidden', '')
          }
        }
      }
    })
  }

  // Escape closes the panel when it's open.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return
    if (panel && panel.style.display !== 'none' && panel.style.display !== '') {
      closePanel()
    }
  })

  /* ------------------------------- Init ---------------------------------- */

  // Records Assigned is the default-selected metric per the reference;
  // ensure the initial DOM state matches (in case markup shipped without
  // is-active on any card).
  var initialActive = root.querySelector('.agent-monitoring__metric.is-active')
  if (!initialActive) {
    var first = root.querySelector('.agent-monitoring__metric[data-metric="all"]')
    if (first) first.classList.add('is-active')
  }
  var initialKey = (initialActive && initialActive.getAttribute('data-metric')) || 'all'
  applyFilter(initialKey)
  updateBulkActions()
})()
