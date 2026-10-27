// Hierarchical Agent Log table behaviors: expand/collapse, column sort,
// and per-agent table swapping.
//
// The tables are rendered server-side by Nunjucks (see _agent-log-table.html
// and the agent_log_* macros in _macros.html). One `<table class="agent-log-table">`
// per agent is rendered; only the wrapper for the currently selected agent
// is visible, with the others hidden via .slds-hide. We wire expand/sort
// listeners to EVERY table on init so all three datasets stay interactive
// after a swap.
//
// Each <tr> carries:
//   - data-row-type="account" | "prospect"
//   - data-account-id="<id>"  (account id; on a prospect row this is the id
//                              of its parent company)
//   - data-sort-* attributes per column for stable client-side sort
//
// Expand/collapse is purely visual via the .agent-log-row_collapsed class;
// sort reorders parent groups (account + its prospect rows kept together).

;(function () {
  var tables = document.querySelectorAll('.agent-log-table')
  if (!tables.length) return

  // CSS.escape isn't available in older browsers we still see in Salesforce
  // sandbox QA; fall back to a minimal escaper that handles the characters
  // actually present in our account ids (alphanumerics + dashes).
  function cssEscape (s) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(s)
    return String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&')
  }

  // Numeric sort helper: returns NaN for non-numeric strings so the caller
  // can fall back to string compare without misordering "Awaiting Routing"
  // alongside "14.5".
  function asNumber (s) {
    if (s == null || s === '') return NaN
    var n = parseFloat(String(s).replace(/[^0-9.\-]/g, ''))
    return isNaN(n) ? NaN : n
  }

  // Parse "4m 22s" style durations to total seconds for sort ordering.
  // Falls back to NaN for anything we don't recognize so the caller can
  // drop to string compare instead of producing a meaningless 0 / 0 result.
  function asDurationSeconds (s) {
    if (s == null || s === '') return NaN
    var m = String(s).match(/(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/i)
    if (!m || (m[1] == null && m[2] == null)) return NaN
    var mins = m[1] ? parseInt(m[1], 10) : 0
    var secs = m[2] ? parseInt(m[2], 10) : 0
    return mins * 60 + secs
  }

  function compareValues (a, b, key) {
    // Numeric columns: credits (V1 + V2 run list), processed (V2 run list
    // record count), status (V2 run list — sort by qualified count).
    if (key === 'credits' || key === 'processed' || key === 'status') {
      var na = asNumber(a)
      var nb = asNumber(b)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
    }
    // Date columns: updated (V1 + V2 run detail), started (V2 run list).
    if (key === 'updated' || key === 'started') {
      var ta = Date.parse(a)
      var tb = Date.parse(b)
      if (!isNaN(ta) && !isNaN(tb)) return ta - tb
    }
    // Duration column (V2 run list): "Xm Ys" → seconds.
    if (key === 'duration') {
      var da = asDurationSeconds(a)
      var db = asDurationSeconds(b)
      if (!isNaN(da) && !isNaN(db)) return da - db
    }
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' })
  }

  // Wire expand/collapse and sort handlers to a single table. Called once
  // per `.agent-log-table` on page load so every agent's table stays
  // interactive regardless of which one is currently visible.
  function initTable (table) {
    var tbody = table.querySelector('tbody')
    if (!tbody) return

    function setExpanded (accountRow, expanded) {
      accountRow.classList.toggle('is-expanded', expanded)
      var btn = accountRow.querySelector('.js-agent-log-toggle')
      if (btn) btn.setAttribute('aria-expanded', expanded ? 'true' : 'false')
      var accountId = accountRow.getAttribute('data-account-id')
      if (!accountId) return
      var children = tbody.querySelectorAll(
        'tr.agent-log-row_prospect[data-account-id="' + cssEscape(accountId) + '"]'
      )
      Array.prototype.forEach.call(children, function (childRow) {
        childRow.classList.toggle('agent-log-row_collapsed', !expanded)
      })
    }

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.js-agent-log-toggle')
      if (!btn) return
      e.preventDefault()
      var accountRow = btn.closest('tr.agent-log-row_account')
      if (!accountRow) return
      var nowExpanded = !accountRow.classList.contains('is-expanded')
      setExpanded(accountRow, nowExpanded)
    })

    function sortAccountsBy (key, direction) {
      var dir = direction === 'descending' ? -1 : 1
      // Build groups: each group = [parentRow, ...childRows] preserved in
      // document order. Sorting groups (not individual rows) keeps children
      // attached to their parent. Parent rows are:
      //   - V1 account rows (.agent-log-row_account, with prospect children)
      //   - V2 Run List rows (.agent-log-row_run-list, no children)
      //   - V2 Run Detail record rows (.agent-log-row_record, no children)
      // Run List and Run Detail tables are flat, so each row becomes its
      // own single-element group — but we still go through the group
      // pipeline so the same sort handler works uniformly.
      var groups = []
      var current = null
      Array.prototype.forEach.call(tbody.children, function (row) {
        if (row.matches('tr.agent-log-row_account, tr.agent-log-row_run-list, tr.agent-log-row_record')) {
          current = [row]
          groups.push(current)
        } else if (current) {
          current.push(row)
        }
      })

      groups.sort(function (g1, g2) {
        var v1 = g1[0].getAttribute('data-sort-' + key) || ''
        var v2 = g2[0].getAttribute('data-sort-' + key) || ''
        return dir * compareValues(v1, v2, key)
      })

      // Re-append in new order. appendChild moves existing nodes, preserving
      // listeners, expanded state, and any classes already on the rows.
      groups.forEach(function (group) {
        group.forEach(function (row) { tbody.appendChild(row) })
      })
    }

    function clearSortIndicators (exceptTh) {
      var ths = table.querySelectorAll('thead th.slds-is-sortable')
      Array.prototype.forEach.call(ths, function (th) {
        if (th !== exceptTh) {
          th.setAttribute('aria-sort', 'none')
          th.classList.remove('slds-is-sorted')
        }
      })
    }

    table.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a.js-agent-log-sort')
      if (!link) return
      e.preventDefault()
      var th = link.closest('th[data-sort-key]')
      if (!th) return
      var key = th.getAttribute('data-sort-key')
      var current = th.getAttribute('aria-sort') || 'none'
      var next = current === 'ascending' ? 'descending' : 'ascending'
      clearSortIndicators(th)
      th.setAttribute('aria-sort', next)
      th.classList.add('slds-is-sorted')
      sortAccountsBy(key, next)
    })
  }

  Array.prototype.forEach.call(tables, initTable)

  // -- Agent picker + view-mode switcher -----------------------------------
  //
  // Two pickers compose the visible-table selection:
  //   1. Select Agent listbox (`#select-agent-listbox-log`) — picks which
  //      agent's data to show. Match key is the option's title (set on the
  //      inner label span by the macro markup); this string equality MUST
  //      match the wrapper's `data-agent-name` value.
  //   2. Logs view-mode dropdown (`.js-logs-view-option`, in the tab header)
  //      — flips between V1 (group by account, `data-view-mode="account"`)
  //      and V2 (group by run, `data-view-mode="run"`).
  //
  // We track both selections in module-level state and re-compute which
  // single wrapper to show whenever either changes. We also update the
  // summary count + label ("X Accounts" vs. "X Runs") to match the view.
  //
  // The generic combobox option handler in src/scripts/app.js already
  // updates the displayed text in the faux input on click, and the generic
  // dropdown-trigger button handler toggles the view-mode menu open/close
  // — we only add the swap-and-count behavior on top of those.

  var agentListbox = document.getElementById('select-agent-listbox-log')
  var viewOptions = document.querySelectorAll('.js-logs-view-option')
  var views = document.querySelectorAll('.js-agent-log-view[data-view-mode]')
  var wrappers = document.querySelectorAll('.slds-card-uplift-table-wrapper[data-agent-name]')
  var countEl = document.querySelector('.js-agent-log-count')
  var countLabelEl = document.querySelector('.js-agent-log-count-label')
  var sortSummaryEl = document.querySelector('.js-agent-log-sort-summary')

  // Module-level selection state. Defaults mirror the server-rendered
  // initial markup (All Agents combined wrapper, V1 / account view).
  // The "All Agents" wrapper carries data-agent-name="All Agents" and is
  // server-rendered with concatenated data across every per-agent set,
  // so the same applySelection rule ("show the wrapper whose name
  // matches `selectedAgent`") works without special-casing.
  var selectedAgent = 'All Agents'
  var selectedView = 'account'

  // Per-view row selector + summary copy. Centralized here so the count
  // math has a single source of truth and the count label / "Sorted by"
  // text stay in sync with the active view.
  //   - V1 parent rows: .agent-log-row_account (no V2 modifier)
  //   - V2 Run List rows: .agent-log-row_run-list
  // Run Detail views are nested inside the run wrapper but the count still
  // reflects the run list (we don't want the top-bar number to flicker on
  // drill-in).
  var VIEW_CONFIG = {
    account: {
      parentRowSelector: 'tr.agent-log-row_account',
      label: 'Accounts',
      sortSummary: 'Sorted By Records Researched'
    },
    run: {
      parentRowSelector: 'tr.agent-log-row_run-list',
      label: 'Runs',
      sortSummary: 'Sorted by Started At'
    }
  }

  // Drill back to the Run List view inside a wrapper (hide every detail
  // panel, re-show the list). Used both by the back button and as a reset
  // when the user changes agent or view-mode mid-drilldown so they don't
  // land on a stale detail for a different agent.
  function resetWrapperToList (wrap) {
    if (!wrap) return
    var list = wrap.querySelector('.js-agent-log-run-list')
    if (list) list.classList.remove('slds-hide')
    var details = wrap.querySelectorAll('.js-agent-log-run-detail')
    Array.prototype.forEach.call(details, function (d) {
      d.classList.add('slds-hide')
    })
  }

  function applySelection () {
    var cfg = VIEW_CONFIG[selectedView] || VIEW_CONFIG.account

    // Toggle which view container is visible (V1 vs. V2).
    Array.prototype.forEach.call(views, function (view) {
      view.classList.toggle('slds-hide', view.getAttribute('data-view-mode') !== selectedView)
    })

    // Within the active view, show only the selected agent's wrapper;
    // hide every other wrapper (across both views) so the JS sort/expand
    // listeners can stay wired everywhere without affecting visibility.
    // Also reset every V2 wrapper to its Run List view — if a user drilled
    // into a run, then changed agent/view, dropping back to the list keeps
    // them oriented when they switch back.
    var visibleCount = 0
    Array.prototype.forEach.call(wrappers, function (wrap) {
      var matchAgent = wrap.getAttribute('data-agent-name') === selectedAgent
      var matchView = wrap.getAttribute('data-view-mode') === selectedView
      var isVisible = matchAgent && matchView
      wrap.classList.toggle('slds-hide', !isVisible)
      if (wrap.getAttribute('data-view-mode') === 'run') {
        resetWrapperToList(wrap)
      }
      if (isVisible) {
        visibleCount = wrap.querySelectorAll(cfg.parentRowSelector).length
      }
    })

    if (countEl) countEl.textContent = visibleCount
    if (countLabelEl) countLabelEl.textContent = cfg.label
    if (sortSummaryEl) sortSummaryEl.textContent = cfg.sortSummary

    // Always drop out of run-detail mode on an agent/view change — the
    // open detail belonged to the previous selection, so the list
    // toolbar should be visible again. The DOM lookups are by class /
    // id, so they're cheap to repeat; we don't cache them because the
    // toolbar may not exist on every page that includes this script.
    var toolbar = document.querySelector('.js-agent-log-list-toolbar')
    if (toolbar) toolbar.classList.remove('slds-hide')
    var host = document.getElementById('tab-default-3')
    if (host) host.classList.remove('is-run-detail-mode')
  }

  if (agentListbox) {
    agentListbox.addEventListener('click', function (e) {
      var option = e.target.closest && e.target.closest('.slds-listbox__option')
      if (!option) return
      // Prefer the title attribute on the inner label span (the macro
      // markup sets it to the option's display text); fall back to text
      // content so this still works if the title is ever omitted.
      var label = option.querySelector('span[title]')
      var agentName = label ? label.getAttribute('title') : option.textContent.trim()
      if (!agentName) return

      // Move the checkmark (slds-is-selected + aria-selected="true") to
      // the just-clicked option. The generic combobox handler in app.js
      // updates the faux input text but doesn't touch listbox selection
      // state, so we do it here.
      var siblings = agentListbox.querySelectorAll('.slds-listbox__option')
      Array.prototype.forEach.call(siblings, function (opt) {
        var isSelected = opt === option
        opt.classList.toggle('slds-is-selected', isSelected)
        opt.setAttribute('aria-selected', isSelected ? 'true' : 'false')
      })

      selectedAgent = agentName
      applySelection()
    })
  }

  if (viewOptions.length) {
    Array.prototype.forEach.call(viewOptions, function (option) {
      option.addEventListener('click', function (e) {
        e.preventDefault()
        var mode = option.getAttribute('data-view-mode')
        if (!mode || !VIEW_CONFIG[mode]) return

        // Reflect selection on the listbox options (aria + visual check).
        Array.prototype.forEach.call(viewOptions, function (opt) {
          var isSelected = opt === option
          opt.classList.toggle('slds-is-selected', isSelected)
          opt.setAttribute('aria-selected', isSelected ? 'true' : 'false')
        })

        // Close the dropdown after a pick. The generic outside-click handler
        // in app.js handles dismissal too, but closing eagerly keeps the
        // interaction snappy when the user clicks the same option twice.
        var trigger = option.closest('.slds-dropdown-trigger_click')
        if (trigger) {
          trigger.classList.remove('slds-is-open')
          var btn = trigger.querySelector('.js-logs-view-toggle')
          if (btn) btn.setAttribute('aria-expanded', 'false')
        }

        selectedView = mode
        applySelection()
      })
    })
  }

  // -- Run List drill-in (V2) ----------------------------------------------
  //
  // Clicking anywhere on a Run List row opens that run's detail. We
  // delegate at the document level so the handler works regardless of
  // which agent's wrapper is currently visible, and we deliberately
  // ignore clicks that originated on an interactive element inside the
  // row (rationale popover triggers, the sort link in the header) so
  // those don't trip an unwanted drill-in. Enter/Space on a focused row
  // mirrors the click (rows carry tabindex="0" + role="row" from the
  // macro markup so they're focusable for keyboard users).
  //
  // The drill-in also flips the page into "run detail mode": the top
  // list-toolbar (parent summary count + Select Agent / Generated on /
  // View as filters) is hidden so the page reads as a dedicated
  // execution-detail screen and the detail header sits directly under
  // the top tabs. Back-button restores the list-toolbar.

  var listToolbar = document.querySelector('.js-agent-log-list-toolbar')
  // Use the tab body as the mode-class host so CSS rules can target both
  // the toolbar and the detail header in a single scope without leaking
  // outside the Logs tab.
  var detailModeHost = document.getElementById('tab-default-3') || document.body

  function setRunDetailMode (on) {
    if (listToolbar) listToolbar.classList.toggle('slds-hide', on)
    detailModeHost.classList.toggle('is-run-detail-mode', on)
  }

  function openRunDetail (row) {
    var wrap = row.closest('.slds-card-uplift-table-wrapper[data-view-mode="run"]')
    if (!wrap) return
    var runId = row.getAttribute('data-run-id')
    if (!runId) return
    var list = wrap.querySelector('.js-agent-log-run-list')
    if (list) list.classList.add('slds-hide')
    var details = wrap.querySelectorAll('.js-agent-log-run-detail')
    Array.prototype.forEach.call(details, function (d) {
      d.classList.toggle('slds-hide', d.getAttribute('data-run-id') !== runId)
    })
    setRunDetailMode(true)
    // Reset any filters carried over from a previous open of this detail.
    var open = wrap.querySelector('.js-agent-log-run-detail:not(.slds-hide)')
    if (open) resetRunDetailFilters(open)
    // Move keyboard focus into the detail so the back button is reachable
    // immediately, and screen readers announce the new view.
    var back = open && open.querySelector('.js-agent-log-back')
    if (back && typeof back.focus === 'function') back.focus()
  }

  // Run List rows have no children whose own click behavior we want to
  // preserve — the visual anchors (Run #N, owner name) and the trailing
  // chevron are all part of the drill-in affordance. Any future "Re-run"
  // button or similar should add `data-stop-row-click` to opt out.
  document.addEventListener('click', function (e) {
    var row = e.target.closest && e.target.closest('.js-agent-log-run-list-row')
    if (!row) return
    if (e.target.closest && e.target.closest('[data-stop-row-click]')) return
    openRunDetail(row)
  })

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return
    var row = document.activeElement && document.activeElement.closest
      ? document.activeElement.closest('.js-agent-log-run-list-row')
      : null
    if (!row) return
    // Only intercept when the row itself is the focused element — if the
    // user is in a sub-control like a header sort link, let the key
    // through to that control's own handling.
    if (document.activeElement !== row) return
    e.preventDefault()
    openRunDetail(row)
  })

  document.addEventListener('click', function (e) {
    var back = e.target.closest && e.target.closest('.js-agent-log-back')
    if (!back) return
    e.preventDefault()
    var wrap = back.closest('.slds-card-uplift-table-wrapper[data-view-mode="run"]')
    if (!wrap) return
    resetWrapperToList(wrap)
    setRunDetailMode(false)
    // Return focus to the run row we drilled into so keyboard users keep
    // their place in the list.
    var runId = back.closest('.js-agent-log-run-detail') && back.closest('.js-agent-log-run-detail').getAttribute('data-run-id')
    if (runId) {
      var sourceRow = wrap.querySelector('.js-agent-log-run-list-row[data-run-id="' + cssEscape(runId) + '"]')
      if (sourceRow && typeof sourceRow.focus === 'function') sourceRow.focus()
    }
  })

  // -- Run Detail filters (Records / Status / Owner) ------------------------
  //
  // Each Run Detail wrapper has its own filter bar (.js-agent-log-run-detail-
  // filters) with three SLDS combobox dropdowns. Picking an option:
  //   1. Moves slds-is-selected / aria-selected to the picked option
  //   2. Updates the faux-input text to the picked value
  //   3. Re-applies all three filters by hiding rows whose data-filter-*
  //      attribute doesn't match (the special "All X" default disables
  //      that axis)
  // We delegate at the document level so the handler covers every per-run
  // filter bar without per-element wiring, and we use exact-string match
  // on the data-filter-* attributes (server-rendered to plural form for
  // type, raw status text, owner name or "Unassigned").

  function applyRunDetailFilters (detail) {
    var bar = detail.querySelector('.js-agent-log-run-detail-filters')
    var tbody = detail.querySelector('table tbody')
    if (!bar || !tbody) return
    var inputs = bar.querySelectorAll('.slds-combobox__input[data-filter-key]')
    var active = {}
    Array.prototype.forEach.call(inputs, function (inp) {
      var key = inp.getAttribute('data-filter-key')
      var def = inp.getAttribute('data-filter-default')
      var val = (inp.querySelector('.slds-truncate') || inp).textContent.trim()
      if (val && val !== def) active[key] = val
    })
    var rows = tbody.querySelectorAll('tr.agent-log-row_record')
    Array.prototype.forEach.call(rows, function (row) {
      var hide = false
      for (var key in active) {
        if (row.getAttribute('data-filter-' + key) !== active[key]) {
          hide = true
          break
        }
      }
      row.classList.toggle('slds-hide', hide)
    })
  }

  function resetRunDetailFilters (detail) {
    var bar = detail.querySelector('.js-agent-log-run-detail-filters')
    if (!bar) return
    var inputs = bar.querySelectorAll('.slds-combobox__input[data-filter-default]')
    Array.prototype.forEach.call(inputs, function (inp) {
      var def = inp.getAttribute('data-filter-default')
      var span = inp.querySelector('.slds-truncate')
      if (span) span.textContent = def
      // Restore the selected-option visual state.
      var listbox = document.getElementById(inp.getAttribute('aria-controls'))
      if (listbox) {
        var opts = listbox.querySelectorAll('.slds-listbox__option')
        Array.prototype.forEach.call(opts, function (o, i) {
          var isDefault = i === 0
          o.classList.toggle('slds-is-selected', isDefault)
          o.setAttribute('aria-selected', isDefault ? 'true' : 'false')
        })
      }
    })
    applyRunDetailFilters(detail)
  }

  document.addEventListener('click', function (e) {
    var option = e.target.closest && e.target.closest('.js-run-detail-filter-option')
    if (!option) return
    var listbox = option.closest('[role="listbox"]')
    if (!listbox) return
    var value = option.getAttribute('data-filter-value')

    // Move selection state inside this listbox.
    var siblings = listbox.querySelectorAll('.slds-listbox__option')
    Array.prototype.forEach.call(siblings, function (opt) {
      var isSelected = opt === option
      opt.classList.toggle('slds-is-selected', isSelected)
      opt.setAttribute('aria-selected', isSelected ? 'true' : 'false')
    })

    // The generic combobox handler in app.js already updates the faux
    // input text + closes the dropdown — we just have to re-apply the
    // row filter for the parent detail.
    var detail = option.closest('.js-agent-log-run-detail')
    if (detail) applyRunDetailFilters(detail)

    // Suppress propagation so the document-level row-click handler
    // doesn't fire on the same event (the option click happens inside
    // a detail wrapper, not a run-list row, so it shouldn't trigger
    // drill-in — but defensive guard for any future overlap).
    e.stopPropagation()
  })

  // -- Rationale popover ----------------------------------------------------
  //
  // A single popover element (#agent-log-rationale-popover) is reused for
  // every rationale cell. We move it to <body> on init so it can't be
  // clipped by the scrollable card container, then use position:fixed +
  // viewport-relative coordinates for placement.
  //
  // Show/hide is gated by mouseover/mouseout (delegated on tbody) plus
  // focusin/focusout for keyboard users. A short hide delay lets the
  // pointer cross the gap between the cell and the popover without the
  // popover snapping shut mid-traverse.

  var popover = document.getElementById('agent-log-rationale-popover')
  if (popover) {
    if (popover.parentNode !== document.body) document.body.appendChild(popover)

    var titleEl = popover.querySelector('.js-rationale-popover-title')
    var listEl = popover.querySelector('.js-rationale-popover-list')
    var closeBtn = popover.querySelector('.js-rationale-popover-close')
    var hideTimer = null
    var activeCell = null

    function parseDetails (raw) {
      if (!raw) return []
      try {
        var parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch (err) {
        return []
      }
    }

    function populate (cell) {
      titleEl.textContent = cell.getAttribute('data-rationale-title') || ''
      listEl.innerHTML = ''
      var items = parseDetails(cell.getAttribute('data-rationale-details'))
      items.forEach(function (text) {
        var li = document.createElement('li')
        li.textContent = text
        listEl.appendChild(li)
      })
    }

    // Placement priority per spec:
    //   1. Right of cell, top-aligned with the row (default).
    //   2. Left of cell, top-aligned, when there's not enough space right.
    //   3. Above the cell as a last fallback.
    //   4. Below the cell if there's nowhere else to fit.
    //
    // The popover is always clamped inside an 8px viewport margin; the
    // caret offset (--caret-x / --caret-y) is recomputed against the cell
    // center so the arrow keeps pointing at the source even when the
    // popover gets shifted to stay on-screen.
    function positionFor (cell) {
      var GAP = 10
      var MARGIN = 8
      var rect = cell.getBoundingClientRect()
      var pw = popover.offsetWidth
      var ph = popover.offsetHeight
      var vw = document.documentElement.clientWidth
      var vh = document.documentElement.clientHeight

      var spaceRight = vw - rect.right - GAP - MARGIN
      var spaceLeft = rect.left - GAP - MARGIN
      var spaceAbove = rect.top - GAP - MARGIN

      var placement
      if (spaceRight >= pw) placement = 'right'
      else if (spaceLeft >= pw) placement = 'left'
      else if (spaceAbove >= ph) placement = 'top'
      else placement = 'bottom'

      var left, top
      if (placement === 'right' || placement === 'left') {
        left = placement === 'right'
          ? rect.right + GAP
          : rect.left - GAP - pw
        // Top-align with the row, then clamp so the popover stays on-screen.
        top = rect.top
        top = Math.max(MARGIN, Math.min(top, vh - ph - MARGIN))
      } else {
        var cellCenterX = rect.left + rect.width / 2
        left = cellCenterX - pw / 2
        left = Math.max(MARGIN, Math.min(left, vw - pw - MARGIN))
        top = placement === 'top'
          ? rect.top - GAP - ph
          : Math.min(rect.bottom + GAP, vh - ph - MARGIN)
      }

      popover.style.left = left + 'px'
      popover.style.top = top + 'px'
      popover.classList.remove('position-top', 'position-bottom', 'position-right', 'position-left')
      popover.classList.add('position-' + placement)

      if (placement === 'right' || placement === 'left') {
        var cellCenterY = rect.top + rect.height / 2
        var caretY = Math.max(12, Math.min(cellCenterY - top, ph - 12))
        popover.style.setProperty('--caret-y', caretY + 'px')
      } else {
        var cellCenterX2 = rect.left + rect.width / 2
        var caretX = Math.max(16, Math.min(cellCenterX2 - left, pw - 16))
        popover.style.setProperty('--caret-x', caretX + 'px')
      }
    }

    function show (cell) {
      clearTimeout(hideTimer)
      activeCell = cell
      populate(cell)
      // Make visible first (offsetWidth/offsetHeight need layout) without
      // showing it; the .is-open class transitions opacity in.
      popover.style.visibility = 'hidden'
      popover.style.opacity = '0'
      popover.classList.add('is-open')
      popover.setAttribute('aria-hidden', 'false')
      // Reflow then position so dimensions are accurate.
      // eslint-disable-next-line no-unused-expressions
      popover.offsetHeight
      positionFor(cell)
      popover.style.visibility = ''
      popover.style.opacity = ''
    }

    function hideNow () {
      popover.classList.remove('is-open', 'position-top', 'position-bottom')
      popover.setAttribute('aria-hidden', 'true')
      activeCell = null
    }

    function scheduleHide () {
      clearTimeout(hideTimer)
      hideTimer = setTimeout(hideNow, 100)
    }

    // Document-level delegation so the popover works for whichever agent
    // table is currently visible. We filter to `.js-rationale-cell` so we
    // only react to the rationale cells (the cells exist in all three
    // tables but only the visible wrapper is reachable by the pointer
    // anyway, since the others are display:none via .slds-hide).
    // relatedTarget tells us where the pointer is going; we suppress the
    // show/hide if the pointer is staying inside the same logical region
    // (cell or popover).
    document.addEventListener('mouseover', function (e) {
      var cell = e.target.closest && e.target.closest('.js-rationale-cell')
      if (!cell) return
      if (e.relatedTarget && cell.contains(e.relatedTarget)) return
      show(cell)
    })

    document.addEventListener('mouseout', function (e) {
      var cell = e.target.closest && e.target.closest('.js-rationale-cell')
      if (!cell) return
      var to = e.relatedTarget
      if (to && (cell.contains(to) || popover.contains(to))) return
      scheduleHide()
    })

    popover.addEventListener('mouseenter', function () { clearTimeout(hideTimer) })
    popover.addEventListener('mouseleave', function (e) {
      var to = e.relatedTarget
      if (to && activeCell && activeCell.contains(to)) return
      scheduleHide()
    })

    document.addEventListener('focusin', function (e) {
      var cell = e.target.closest && e.target.closest('.js-rationale-cell')
      if (!cell) return
      show(cell)
    })

    document.addEventListener('focusout', function (e) {
      var cell = e.target.closest && e.target.closest('.js-rationale-cell')
      if (!cell) return
      // If focus is moving to the popover (e.g. close button) keep it open;
      // otherwise schedule hide so blur dismisses.
      var to = e.relatedTarget
      if (to && popover.contains(to)) return
      scheduleHide()
    })

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault()
        hideNow()
      })
    }

    // The popover is fixed-positioned, so any scroll or resize would leave
    // it floating away from its anchor cell. Hiding on these events is
    // simpler and less surprising than re-positioning on every scroll.
    window.addEventListener('scroll', function () { if (activeCell) hideNow() }, true)
    window.addEventListener('resize', function () { if (activeCell) hideNow() })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && activeCell) hideNow()
    })
  }
})()
