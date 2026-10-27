// Coordinates the Display picklist (Prospect view / Account view) across all
// three KPI tabs (Approval Required, Approved, Rejected). For each KPI tab,
// shows either the list-style table or the matching pivot-style table.
//
// Pairs with broadened selectors in app.js: accept/reject/feedback handlers
// match `.js-approval-required-table` so they fire on both list and pivot
// approval-required tables. Cross-view row removal is keyed by
// `data-prospect-id` and lives in app.js fadeAndRemove.

;(function () {
  var KPI_KINDS = ['approval_required', 'approved', 'rejected']
  var toggle = document.querySelector('.js-approval-view-toggle')
  if (!toggle) return

  var mode = 'list'

  function getListTable (kind) { return document.getElementById(kind + '_table') }
  function getPivotTable (kind) { return document.getElementById(kind + '_pivot_table') }
  function pivotTablesAll () {
    return KPI_KINDS.map(getPivotTable).filter(Boolean)
  }
  function activeKpiKind () {
    var card = document.querySelector('.kpi-card.kpi-card-active')
    // When the page has no KPI cards (e.g. they've been removed in favor of a
    // single default table view), fall back to 'approval_required' so the list
    // table stays visible and the list/pivot Display toggle still works.
    return card ? card.getAttribute('data-table') : 'approval_required'
  }

  function applyMode () {
    var activeKpi = activeKpiKind()
    KPI_KINDS.forEach(function (kind) {
      var listEl = getListTable(kind)
      var pivotEl = getPivotTable(kind)
      if (!listEl || !pivotEl) return
      var isActive = kind === activeKpi
      pivotEl.classList.toggle('slds-hide', !(isActive && mode === 'pivot'))
      listEl.classList.toggle('slds-hide', !(isActive && mode === 'list'))
    })
    toggle.querySelectorAll('a[role="menuitemcheckbox"][data-view]').forEach(function (a) {
      var active = a.getAttribute('data-view') === mode
      a.setAttribute('aria-checked', active ? 'true' : 'false')
      a.setAttribute('tabindex', active ? '0' : '-1')
      var li = a.closest('.slds-dropdown__item')
      if (li) li.classList.toggle('slds-is-selected', active)
    })
    var current = toggle.querySelector('.js-approval-view-current')
    if (current) current.textContent = mode === 'pivot' ? 'Account view' : 'Prospect view'
  }

  toggle.addEventListener('click', function (e) {
    var item = e.target.closest && e.target.closest('a[role="menuitemcheckbox"][data-view]')
    if (!item) return
    e.preventDefault()
    mode = item.getAttribute('data-view')
    applyMode()
    toggle.classList.remove('slds-is-open')
    var input = toggle.querySelector('.slds-combobox__input')
    if (input) input.setAttribute('aria-expanded', 'false')
  })

  // When the lead row of a company group is removed (accept/reject),
  // hop the merged company-level <td>s to the next sibling row in the
  // same group so the rowspans don't visually break.
  var MERGED_CELL_SELECTOR = ':scope > td.is-pivot-company-cell, :scope > td.is-pivot-why-account-cell'

  function transferCompanyCellIfNeeded (row) {
    if (!row || !row.parentNode) return
    if (!row.matches('.prospect-table-pivot tr')) return
    var mergedCells = row.querySelectorAll(MERGED_CELL_SELECTOR)
    if (!mergedCells.length) return
    var firstSpan = parseInt(mergedCells[0].getAttribute('rowspan') || '1', 10)
    if (firstSpan <= 1) return
    var nextRow = row.nextElementSibling
    if (!nextRow) return
    if (nextRow.dataset.pivotGroup !== row.dataset.pivotGroup) return
    nextRow.classList.add('is-pivot-group-start')
    var anchor = nextRow.firstElementChild
    Array.prototype.forEach.call(mergedCells, function (cell) {
      cell.setAttribute('rowspan', String(firstSpan - 1))
      nextRow.insertBefore(cell, anchor)
    })
  }

  // Defer the merged-cell hop to the moment the row begins fading out, so the
  // cells stay in place during the wait window after Accept/Reject and only
  // relocate when the row is about to be removed. Capture phase fires before
  // app.js's bubble-phase 'cleanup' listener on the same row.
  document.addEventListener('transitionend', function (e) {
    if (e.propertyName !== 'opacity') return
    var row = e.target
    if (!(row instanceof Element)) return
    if (!row.matches || !row.matches('.prospect-table-pivot tr.is-removing')) return
    transferCompanyCellIfNeeded(row)
  }, true)

  document.querySelectorAll('.kpi-card[data-table]').forEach(function (card) {
    card.addEventListener('click', function () { setTimeout(applyMode, 0) })
  })

  // Tag every pivot row across all KPIs with a stable group index, using the
  // is-pivot-group-start class as the group boundary marker. Each pivot table
  // resets the counter so its data-pivot-group values are local to the table.
  function tagPivotGroups () {
    pivotTablesAll().forEach(function (table) {
      var rows = table.querySelectorAll('tbody tr.js-prospect-row')
      var groupIdx = -1
      Array.prototype.forEach.call(rows, function (r) {
        if (r.classList.contains('is-pivot-group-start')) groupIdx++
        r.dataset.pivotGroup = String(groupIdx)
      })
    })
  }

  // Synchronize hover highlight across all rows in the same company group so
  // hovering a merged cell highlights every prospect row, and hovering any
  // prospect row highlights the merged Company / Why This Account cells.
  function setGroupHover (table, groupKey, on) {
    if (groupKey == null) return
    table.querySelectorAll('tr.js-prospect-row[data-pivot-group="' + groupKey + '"]')
      .forEach(function (r) { r.classList.toggle('is-pivot-hovered', on) })
  }

  pivotTablesAll().forEach(function (table) {
    table.addEventListener('mouseover', function (e) {
      var row = e.target.closest && e.target.closest('tr.js-prospect-row')
      if (!row || !table.contains(row)) return
      setGroupHover(table, row.dataset.pivotGroup, true)
    })
    table.addEventListener('mouseout', function (e) {
      var row = e.target.closest && e.target.closest('tr.js-prospect-row')
      if (!row) return
      var to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('tr.js-prospect-row')
      if (to && to.dataset.pivotGroup === row.dataset.pivotGroup) return
      setGroupHover(table, row.dataset.pivotGroup, false)
    })
  })

  tagPivotGroups()
  applyMode()
})()
