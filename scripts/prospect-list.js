// Copyright (c) 2017-present, Salesforce.com, Inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

'use strict'

/*
 * IIFE wrap (added during Hunter Agent port): this file is the verbatim
 * copy of File B's `app.js` (Prospect List / Prospecting flow), loaded
 * ALONGSIDE File A's own `/scripts/app.js`. Both files declare the same
 * top-level `const`s at script scope (`tabs`, `defaultTabs`, `scopedTabs`,
 * `assignTabEvents`, `tabActiveReset`, `tabActiveSet`, `tabPanelsReset`,
 * `tabPanelShow`, and others). Classic <script> tags share a single
 * script-lexical scope inside the realm, so the second-loaded file would
 * throw `SyntaxError: Identifier 'tabs' has already been declared` at
 * parse time and *none* of its handlers (tab switching, KPI cards, side
 * panels, feedback popover, accept/reject, cadence modal, column
 * resize) would attach.
 *
 * Wrapping the body in an IIFE gives every declaration its own function
 * scope, eliminating the collision without needing to rename any
 * identifier. The five genuinely-global helpers this file exposes
 * (`toggleSldsOpen`, `showToast`, `setPanelDisplay`, `openCadenceModal`,
 * `closeCadenceModal`) still work — they're `window.X = X` property
 * assignments below, unaffected by scope isolation.
 */
;(function () {

/**
 * These interactions are provided for prototyping use ONLY.
 *
 * Browser support, accessibility and security are not concerns in this prototype.
 * This is not aimed at being keyboard accessible or screen-reader friendly.
 * For these reasons, the JavaScript below is NOT for production use.
 */

const warningStyles = `
  color: #fff;
  background-color: #c23934;
  display: block;
  text-align: center;
  padding: 8px 32px;
  font: 100 16px/28px sans-serif;
  background-image: linear-gradient(45deg,rgba(0,0,0,.025) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.025) 50%,rgba(0,0,0,.025) 75%,transparent 75%,transparent);
  background-size: 64px 64px;
`
console.log('%c%s', warningStyles, 'Please do not use the provided JavaScript in production!')
console.log('Code in app.js is not built for accessibility, performance, or cross-browser compatibility.')

/**
 * Generic toggle for the slds-is-open class.
 * Use for accordions, dropdowns, expandable sections, etc.
 * @param {Element|string} elementOrSelector - DOM element or CSS selector string
 * @returns {boolean} Whether the element has slds-is-open after the toggle
 */
function toggleSldsOpen (elementOrSelector) {
  const element = typeof elementOrSelector === 'string'
    ? document.querySelector(elementOrSelector)
    : elementOrSelector
  if (!element) return false
  element.classList.toggle('slds-is-open')
  return element.classList.contains('slds-is-open')
}

// Expose for use from HTML (e.g. onclick="toggleSldsOpen(this)")
if (typeof window !== 'undefined') window.toggleSldsOpen = toggleSldsOpen

/**
 * Open / Close an element (internal helper)
 * @param {Node} element
 */
const toggle = (element) => toggleSldsOpen(element)

/**
 * Open / Close an element's parent
 * @param {Node} element
 */
const toggleParent = (element) => toggleSldsOpen(element.parentNode)

/*
 * Shell utilities disabled (Hunter Agent port): the two blocks below are
 * duplicates of handlers already registered globally by File A's
 * `src/scripts/app.js` on every page. In File B those handlers were the
 * ONLY implementation on the page; in File A they'd fire alongside the
 * shell's handlers, and since both toggle `.slds-is-open` non-idempotently
 * every click would open + close in the same frame (net: nothing visible
 * happens). The specific symptom this broke is the Logs tab's V1/V2
 * view-mode dropdown, but any `.slds-dropdown-trigger_click > .slds-button`
 * or `.slds-combobox` faux-input on the page would suffer the same fate.
 *
 * Removed:
 *   1. `.slds-dropdown-trigger_click > .slds-button` click → toggleParent
 *      → owned by app.js line ~43-47.
 *   2. `.slds-dropdown-trigger_click .slds-combobox__input` click → toggle
 *      → owned by app.js `initPicklists()` line ~562+ (full combobox
 *      lifecycle including keyboard + option-select).
 *
 * If you ever port this file back to a standalone app that doesn't ship
 * File A's app.js, re-enable both blocks — they're the correct
 * implementation for a standalone context.
 */
// Dropdown menus — owned by app.js
// Combobox / dropdown trigger — owned by app.js initPicklists()

/**
 * Combobox: close on option select and show selected value
 */
const comboboxOptions = document.querySelectorAll('.slds-dropdown-trigger_click .slds-listbox__option')

Array.from(comboboxOptions).forEach((option) => {
  option.addEventListener('click', (event) => {
    const trigger = event.currentTarget.closest('.slds-dropdown-trigger_click')
    if (!trigger) return
    const valueSpan = trigger.querySelector('.slds-combobox__input .slds-truncate')
    const comboboxInput = trigger.querySelector('.slds-combobox__input')
    if (valueSpan && !valueSpan.id.startsWith('assign-to')) {
      const labelEl = event.currentTarget.querySelector('.slds-media__body span')
      const selectedText = labelEl ? labelEl.textContent.trim() : event.currentTarget.textContent.trim()
      valueSpan.textContent = selectedText
    }
    trigger.classList.remove('slds-is-open')
    if (comboboxInput) comboboxInput.setAttribute('aria-expanded', 'false')
  }, false)
})

/**
 * Select all: checking the header checkbox selects/deselects all row checkboxes in the same table.
 * Also keeps the header checkbox in sync (indeterminate) when rows are toggled individually.
 */
document.addEventListener('change', (event) => {
  const checkbox = event.target
  if (checkbox.type !== 'checkbox') return

  const table = checkbox.closest('table')
  if (!table) return

  const isHeaderCheckbox = !!checkbox.closest('thead')

  if (isHeaderCheckbox) {
    const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]')
    rowCheckboxes.forEach((cb) => { cb.checked = checkbox.checked })
    checkbox.indeterminate = false
  } else {
    const headerCheckbox = table.querySelector('thead input[type="checkbox"]')
    if (!headerCheckbox) return
    const rowCheckboxes = Array.from(table.querySelectorAll('tbody input[type="checkbox"]'))
    const checkedCount = rowCheckboxes.filter((cb) => cb.checked).length
    if (checkedCount === 0) {
      headerCheckbox.checked = false
      headerCheckbox.indeterminate = false
    } else if (checkedCount === rowCheckboxes.length) {
      headerCheckbox.checked = true
      headerCheckbox.indeterminate = false
    } else {
      headerCheckbox.checked = false
      headerCheckbox.indeterminate = true
    }
  }
}, false)

/**
 * Combobox: close open dropdowns when clicking outside
 */
document.addEventListener('click', (event) => {
  document.querySelectorAll('.slds-dropdown-trigger_click.slds-is-open').forEach((trigger) => {
    if (!trigger.contains(event.target)) {
      trigger.classList.remove('slds-is-open')
      const comboboxInput = trigger.querySelector('.slds-combobox__input')
      if (comboboxInput) comboboxInput.setAttribute('aria-expanded', 'false')
    }
  })
}, false)

/**
 * Tabs
 * https://www.lightningdesignsystem.com/components/tabs/
 */

const tabs = (variant) => document.querySelectorAll(`.slds-tabs_${variant} [role=tablist] [role=tab]`)
const tabActiveReset = (tab) => Array.from(tab.parentNode.parentNode.querySelectorAll('li'))
  .forEach((element) => element.classList.remove('slds-is-active'))
const tabActiveSet = (tab) => tab.parentNode.classList.add('slds-is-active')
const tabAriaReset = (tab) => Array.from(tab.parentNode.parentNode.querySelectorAll('[role="tab"]'))
  .forEach((t) => {
    t.setAttribute('aria-selected', 'false')
    t.setAttribute('tabindex', '-1')
  })
const tabAriaSet = (tab) => {
  tab.setAttribute('aria-selected', 'true')
  tab.setAttribute('tabindex', '0')
}
const tabPanelsReset = (tab) => Array.from(tab.closest('.slds-tabs_default').querySelectorAll('[role="tabpanel"]'))
  .forEach((tabpanel) => {
    tabpanel.classList.remove('slds-show')
    tabpanel.classList.remove('slds-hide')
    tabpanel.classList.add('slds-hide')
  })
const tabPanelShow = (tab) => {
  const tabpanel = document.getElementById(tab.getAttribute('aria-controls'))
  tabpanel.classList.remove('slds-show')
  tabpanel.classList.remove('slds-hide')
  tabpanel.classList.add('slds-show')
}

const defaultTabs = tabs('default')
const scopedTabs = tabs('scoped')

const assignTabEvents = (event) => {
  event.preventDefault()
  tabActiveReset(event.currentTarget)
  tabActiveSet(event.currentTarget)
  tabAriaReset(event.currentTarget)
  tabAriaSet(event.currentTarget)
  tabPanelsReset(event.currentTarget)
  tabPanelShow(event.currentTarget)
}

Array.from(defaultTabs).forEach((tab) => {
  tab.addEventListener('click', assignTabEvents, false)
})
Array.from(scopedTabs).forEach((tab) => {
  tab.addEventListener('click', assignTabEvents, false)
})

// Close any open side panel when switching between the outer Prospects / Agents /
// Knowledge tabs, since the panel references a row in the currently-visible
// table. The Knowledge tab uses id `tab-default-4__item` (see the comment on
// its <li> in prospect_list.html — Logs kept #tab-default-3 to preserve
// pinned selectors in agent-log.js / prospect_list.scss).
const outerTabIds = ['tab-default-1__item', 'tab-default-2__item', 'tab-default-4__item']
document.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]')
  if (!tab || !outerTabIds.includes(tab.id)) return
  if (typeof closePanel === 'function') closePanel()
  if (typeof closeAgentPanel === 'function') closeAgentPanel()
}, false)

/**
 * Prospect list KPI cards: switch table when clicking Approved / Rejected / Approval Required
 */
const kpiCards = document.querySelectorAll('.kpi-card[data-table]')
const prospectTables = document.querySelectorAll('.prospect-table-content')
const summaryCountEl = document.getElementById('summary-count')

const tableIdToDataTable = {
  approval_required_table: 'approval_required',
  approved_table: 'approved',
  rejected_table: 'rejected'
}

const showProspectTable = (tableId) => {
  prospectTables.forEach((table) => {
    const isTarget = table.id === tableId
    table.classList.toggle('slds-hide', !isTarget)
  })
  const activeDataTable = tableIdToDataTable[tableId]
  kpiCards.forEach((card) => {
    const isActive = card.getAttribute('data-table') === activeDataTable
    if (isActive) {
      card.classList.add('kpi-card-active')
    } else {
      card.classList.remove('kpi-card-active')
    }
  })
  if (summaryCountEl) {
    const activeCard = document.querySelector('.kpi-card[data-table].kpi-card-active')
    const countEl = activeCard && activeCard.querySelector('.kpi-card-count')
    summaryCountEl.textContent = countEl ? countEl.textContent.trim() : ''
  }
}

Array.from(kpiCards).forEach((card) => {
  card.addEventListener('click', () => {
    const tableId = card.getAttribute('data-table')
    if (tableId) {
      const tableMap = {
        approval_required: 'approval_required_table',
        approved: 'approved_table',
        rejected: 'rejected_table'
      }
      showProspectTable(tableMap[tableId] || tableId)
    }
  }, false)
})

/**
 * Generic: set an element's visibility by toggling display between block and none.
 * Use for panels, drawers, etc. that should be shown/hidden without removing from DOM.
 * @param {Element} element - DOM element to show or hide
 * @param {boolean} show - true = display:block (or optional display value), false = display:none
 * @param {string} [displayWhenOpen='block'] - optional CSS display value when show is true (e.g. 'flex')
 */
function setPanelDisplay (element, show, displayWhenOpen) {
  if (!element) return
  element.style.display = show ? (displayWhenOpen || 'block') : 'none'
}

/**
 * Prospect side panel: open/close via setPanelDisplay, load row data, Up/Down navigation, row selection
 */
const prospectPanel = document.getElementById('prospect-side-panel')
const prospectListArticle = document.querySelector('.prospect-list-layout article.slds-card-uplift')
const panelHeaderName = document.getElementById('panel-header-name')
const panelHeaderTitle = document.getElementById('panel-header-title')
const panelHeaderIcon = document.getElementById('panel-header-icon')
const panelHeaderIconInner = document.getElementById('panel-header-icon-inner')
const panelHeaderIconUse = document.getElementById('panel-header-icon-use')
const panelWhyAccountList = document.getElementById('panel-why-account-list')
const panelWhyProspectList = document.getElementById('panel-why-prospect-list')

/* Panel closed by default */
if (prospectPanel) setPanelDisplay(prospectPanel, false)

function parseRowData (row) {
  const whyAccount = row.getAttribute('data-why-account')
  const whyProspect = row.getAttribute('data-why-prospect-bullets')
  const isApprovalTable = !!row.closest('#approval_required_table')
  const prospectIndex = isApprovalTable ? parseInt(row.getAttribute('data-prospect-index'), 10) : -1
  return {
    name: row.getAttribute('data-prospect-name') || '—',
    title: row.getAttribute('data-prospect-title') || '—',
    icon: row.getAttribute('data-prospect-icon') || 'prospect',
    whyAccount: (whyAccount && whyAccount !== '[]') ? (() => { try { return JSON.parse(whyAccount) } catch (e) { return [] } })() : [],
    whyProspectBullets: (whyProspect && whyProspect !== '[]') ? (() => { try { return JSON.parse(whyProspect) } catch (e) { return [] } })() : [],
    approvalRowIndex: prospectIndex,
    isNewContact: row.getAttribute('data-is-new-contact') === 'true'
  }
}

function fillPanel (data) {
  if (panelHeaderName) panelHeaderName.textContent = data.name
  if (panelHeaderTitle) panelHeaderTitle.textContent = data.title
  if (panelHeaderIcon) {
    panelHeaderIcon.className = 'slds-icon-standard-' + (data.icon === 'contact' ? 'contact' : data.icon === 'lead' ? 'lead' : 'prospect') + ' slds-icon_container'
    panelHeaderIcon.setAttribute('title', '')
  }
  if (panelHeaderIconUse) panelHeaderIconUse.setAttribute('xlink:href', '/assets/icons/standard-sprite/svg/symbols.svg#' + (data.icon === 'contact' ? 'contact' : data.icon === 'lead' ? 'lead' : 'prospect'))
  if (panelHeaderIconInner) panelHeaderIconInner.style.setProperty('--sds-c-icon-color-background', data.icon === 'contact' ? '#9050E9' : 'rgb(27, 150, 255)')
  var newContactBadge = document.getElementById('panel-new-contact-badge')
  if (newContactBadge) newContactBadge.style.display = data.isNewContact ? '' : 'none'
  var accountCards = document.querySelectorAll('[id^="why-account-research-card"]')
  var hasAccountCard = data.approvalRowIndex >= 0 && document.getElementById('why-account-research-card-' + data.approvalRowIndex)
  if (hasAccountCard) {
    if (panelWhyAccountList) panelWhyAccountList.style.display = 'none'
    accountCards.forEach(function (c) { c.style.display = c.id === 'why-account-research-card-' + data.approvalRowIndex ? '' : 'none' })
  } else {
    if (panelWhyAccountList) {
      panelWhyAccountList.style.display = ''
      panelWhyAccountList.innerHTML = (data.whyAccount && data.whyAccount.length)
        ? data.whyAccount.map((text) => '<li>' + escapeHtml(text) + '</li>').join('')
        : '<li>—</li>'
    }
    accountCards.forEach(function (c) { c.style.display = 'none' })
  }
  var prospectCards = document.querySelectorAll('[id^="why-prospect-research-card"]')
  var hasProspectCard = data.approvalRowIndex >= 0 && document.getElementById('why-prospect-research-card-' + data.approvalRowIndex)
  if (hasProspectCard) {
    if (panelWhyProspectList) panelWhyProspectList.style.display = 'none'
    prospectCards.forEach(function (c) { c.style.display = c.id === 'why-prospect-research-card-' + data.approvalRowIndex ? '' : 'none' })
  } else {
    if (panelWhyProspectList) {
      panelWhyProspectList.style.display = ''
      panelWhyProspectList.innerHTML = (data.whyProspectBullets && data.whyProspectBullets.length)
        ? data.whyProspectBullets.map((text) => '<li>' + escapeHtml(text) + '</li>').join('')
        : '<li>—</li>'
    }
    prospectCards.forEach(function (c) { c.style.display = 'none' })
  }
}

function escapeHtml (text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Show an SLDS toast notification.
 * @param {'success'|'error'|'warning'|'info'} type - Visual theme
 * @param {string} messageHtml - Inner HTML for the toast body
 * @param {number} [duration=5000] - Auto-dismiss delay in ms (0 = manual only)
 * @returns {HTMLElement|null} The toast wrapper element
 */
function showToast (type, messageHtml, duration) {
  if (duration === undefined) duration = 5000
  var container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:10000;'
    document.body.appendChild(container)
  }

  var themes = {
    success: { theme: 'slds-theme_success', icon: 'success' },
    error:   { theme: 'slds-theme_error',   icon: 'error' },
    warning: { theme: 'slds-theme_warning', icon: 'warning' },
    info:    { theme: 'slds-theme_info',    icon: 'info' }
  }
  var cfg = themes[type] || themes.info

  var wrapper = document.createElement('div')
  wrapper.className = 'slds-notify_container slds-is-relative'
  wrapper.innerHTML =
    '<div class="slds-notify slds-notify_toast ' + cfg.theme + '" role="status">' +
      '<span class="slds-assistive-text">' + cfg.icon + '</span>' +
      '<span class="slds-icon_container slds-icon-utility-' + cfg.icon + ' slds-m-right_small slds-no-flex slds-align-top" title="' + cfg.icon + '">' +
        '<svg class="slds-icon slds-icon_small" aria-hidden="true">' +
          '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#' + cfg.icon + '"></use>' +
        '</svg>' +
      '</span>' +
      '<div class="slds-notify__content">' +
        '<h2 class="slds-text-heading_small">' + messageHtml + '</h2>' +
      '</div>' +
      '<div class="slds-notify__close">' +
        '<button class="slds-button slds-button_icon slds-button_icon-inverse" title="Close">' +
          '<svg class="slds-button__icon" aria-hidden="true">' +
            '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#close"></use>' +
          '</svg>' +
          '<span class="slds-assistive-text">Close</span>' +
        '</button>' +
      '</div>' +
    '</div>'

  wrapper.style.opacity = '0'
  wrapper.style.transition = 'opacity 0.3s ease'
  container.appendChild(wrapper)
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      wrapper.style.opacity = '1'
    })
  })

  var dismiss = function () {
    wrapper.style.opacity = '0'
    wrapper.style.transition = 'opacity 0.3s ease'
    setTimeout(function () { wrapper.remove() }, 300)
  }

  var closeBtn = wrapper.querySelector('.slds-notify__close button')
  if (closeBtn) closeBtn.addEventListener('click', dismiss)
  if (duration > 0) setTimeout(dismiss, duration)

  return wrapper
}

if (typeof window !== 'undefined') window.showToast = showToast

function setSelectedRow (row) {
  document.querySelectorAll('.js-prospect-row.slds-is-selected').forEach((r) => {
    r.classList.remove('slds-is-selected')
    r.setAttribute('aria-selected', 'false')
  })
  if (row) {
    row.classList.add('slds-is-selected')
    row.setAttribute('aria-selected', 'true')
  }
}

function getVisibleTable () {
  return document.querySelector('.prospect-table-content:not(.slds-hide)')
}

function openPanelForRow (row) {
  const data = parseRowData(row)
  fillPanel(data)
  const agentPanelEl = document.getElementById('agent-side-panel')
  if (agentPanelEl) setPanelDisplay(agentPanelEl, false)
  if (prospectPanel) setPanelDisplay(prospectPanel, true, 'flex')
  if (prospectListArticle) prospectListArticle.classList.add('slds-card-uplift-panel-is-open')
  setSelectedRow(row)
}

function closePanel () {
  if (prospectPanel) setPanelDisplay(prospectPanel, false)
  if (prospectListArticle) prospectListArticle.classList.remove('slds-card-uplift-panel-is-open')
  setSelectedRow(null)
}

function reindexTableRows (table) {
  if (!table) return
  var rows = table.querySelectorAll('tbody tr.js-prospect-row')
  rows.forEach(function (row, i) {
    row.setAttribute('data-prospect-index', i)
  })
}

function updateKpiCounts () {
  var mapping = [
    { key: 'approval_required', id: 'approval_required_table' },
    { key: 'approved', id: 'approved_table' },
    { key: 'rejected', id: 'rejected_table' }
  ]
  mapping.forEach(function (m) {
    var tbody = document.querySelector('#' + m.id + ' tbody')
    var count = tbody ? tbody.querySelectorAll('tr.js-prospect-row').length : 0
    var card = document.querySelector('.kpi-card[data-table="' + m.key + '"]')
    if (card) {
      var countEl = card.querySelector('.kpi-card-count')
      if (countEl) countEl.textContent = count
    }
  })
  if (summaryCountEl) {
    var activeCard = document.querySelector('.kpi-card[data-table].kpi-card-active')
    var countEl = activeCard && activeCard.querySelector('.kpi-card-count')
    summaryCountEl.textContent = countEl ? countEl.textContent.trim() : ''
  }
}

function formatTodayDate () {
  var d = new Date()
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
}

function buildFeedbackCellHtml (feedbackValue) {
  var val = feedbackValue || ''
  var escaped = escapeHtml(val)
  return '<div class="slds-grid slds-grid_align-spread slds-td-formatter slds-p-vertical_x-small">' +
    '<div class="slds-line-clamp_medium js-feedback-display" title="' + escaped + '">' + escaped + '</div>' +
    '<button class="slds-button slds-button_icon slds-cell-edit__button slds-m-left_x-small slds-no-flex js-feedback-edit-btn" tabindex="-1" title="Give Feedback">' +
      '<svg class="slds-button__icon slds-button__icon_hint slds-button__icon_edit" aria-hidden="true">' +
        '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#edit"></use>' +
      '</svg>' +
      '<span class="slds-assistive-text">Give Feedback</span>' +
    '</button>' +
  '</div>' +
  '<section class="slds-popover slds-popover_small slds-popover_edit slds-hide js-feedback-popover" role="dialog">' +
    '<div class="slds-popover__body">' +
      '<div class="slds-form-element slds-grid slds-wrap">' +
        '<label class="slds-form-element__label slds-form-element__label_edit slds-no-flex">' +
          '<span class="slds-assistive-text">Feedback</span>' +
        '</label>' +
        '<div class="slds-form-element__control slds-grow">' +
          '<textarea class="slds-input js-feedback-textarea" style="max-width:100%;min-width:100%;">' + escaped + '</textarea>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<footer class="slds-popover__footer">' +
      '<div class="slds-grid slds-grid_vertical-align-center slds-grid_align-spread">' +
        '<button class="slds-button slds-button_base js-feedback-cancel">Cancel</button>' +
        '<button class="slds-button slds-button_neutral js-feedback-submit">Submit</button>' +
      '</div>' +
    '</footer>' +
  '</section>'
}

// --- Approval required table: row action helpers ---

var TIMEOUT_ACCEPT = 300
var TIMEOUT_ACCEPT_NO_FEEDBACK = 4500
var TIMEOUT_REJECT_WITH_FEEDBACK = 300
var TIMEOUT_REJECT_NO_FEEDBACK = 4500

var rejectTimers = new WeakMap()
var acceptTimers = new WeakMap()

function getRowFeedbackValue (row) {
  var display = row.querySelector('.js-feedback-display')
  if (!display) return ''
  if (display.classList.contains('feedback-hint')) {
    return (display.dataset.originalFeedback || '').trim()
  }
  return display.textContent.trim()
}

function hasFeedback (row) {
  return getRowFeedbackValue(row) !== ''
}

function startFeedbackProgress (row, durationMs) {
  var prog = row && row.querySelector('.feedback-hint__progress')
  if (!prog) return
  prog.style.setProperty('--feedback-hint-progress-duration', (durationMs / 1000) + 's')
  prog.classList.remove('is-running')
  void prog.offsetWidth
  prog.classList.add('is-running')
}

function stopFeedbackProgress (row) {
  var prog = row && row.querySelector('.feedback-hint__progress')
  if (prog) prog.classList.remove('is-running')
}

function fadeAndRemove (row) {
  row.classList.add('is-removing')
  var prospectId = row.getAttribute('data-prospect-id')
  if (prospectId) {
    document.querySelectorAll('tr.js-prospect-row[data-prospect-id="' + prospectId + '"]').forEach(function (r) {
      if (r !== row) r.classList.add('is-removing')
    })
  }
  var removed = false
  function cleanup () {
    if (removed) return
    removed = true
    if (prospectId) {
      document.querySelectorAll('tr.js-prospect-row[data-prospect-id="' + prospectId + '"]').forEach(function (r) { r.remove() })
    } else {
      row.remove()
    }
    document.querySelectorAll('.prospect-table-content').forEach(reindexTableRows)
    updateKpiCounts()
  }
  row.addEventListener('transitionend', cleanup, { once: true })
  setTimeout(cleanup, 400)
}

function disableRowButtons (row) {
  row.querySelectorAll('.slds-actions-formatter button').forEach(function (btn) {
    btn.disabled = true
  })
}

function moveProspectRow (row, targetTableId) {
  var targetTable = document.getElementById(targetTableId)
  if (!targetTable || !row) return null
  var tbody = targetTable.querySelector('tbody')
  if (!tbody) return null

  var prospectName = row.getAttribute('data-prospect-name') || 'Prospect'
  var dataTableKey = targetTableId === 'approved_table' ? 'approved' : 'rejected'
  row.setAttribute('data-table-id', dataTableKey)

  var lastTd = row.querySelector('td:last-child')
  if (lastTd) {
    lastTd.innerHTML =
      '<div class="slds-grid slds-actions-formatter">' +
        '<div class="slds-button-group" role="group">' +
          '<button type="button" class="slds-button slds-button_neutral js-review-btn">Review</button>' +
        '</div>' +
      '</div>'
  }

  var todayStr = formatTodayDate()
  var dateTd = document.createElement('td')
  dateTd.className = 'slds-cell_action-mode js-action-date-cell'
  dateTd.setAttribute('role', 'gridcell')
  dateTd.innerHTML = '<div class="slds-truncate slds-td-formatter slds-p-vertical_x-small" title="' + todayStr + '">' + todayStr + '</div>'
  row.insertBefore(dateTd, lastTd)

  if (targetTableId === 'rejected_table' || targetTableId === 'approved_table') {
    var feedbackTd = document.createElement('td')
    feedbackTd.className = 'slds-cell-edit'
    feedbackTd.setAttribute('role', 'gridcell')
    feedbackTd.innerHTML = buildFeedbackCellHtml('')
    row.insertBefore(feedbackTd, lastTd)
  }

  var firstRow = tbody.querySelector('tr')
  if (firstRow) {
    tbody.insertBefore(row, firstRow)
  } else {
    tbody.appendChild(row)
  }
  document.querySelectorAll('.prospect-table-content').forEach(reindexTableRows)
  updateKpiCounts()
  closePanel()

  return prospectName
}

function navigatePanel (direction) {
  const table = getVisibleTable()
  if (!table) return
  const rows = Array.from(table.querySelectorAll('.js-prospect-row'))
  const current = table.querySelector('.js-prospect-row.slds-is-selected')
  const currentIndex = current ? parseInt(current.getAttribute('data-prospect-index'), 10) : -1
  let nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (nextIndex < 0) nextIndex = 0
  if (nextIndex >= rows.length) nextIndex = rows.length - 1
  const targetRow = rows[nextIndex]
  if (targetRow) {
    openPanelForRow(targetRow)
  }
}

document.addEventListener('click', (e) => {
  const acceptBtn = e.target.closest('.js-approval-required-table button[title="Accept"]')
  if (acceptBtn) {
    const row = acceptBtn.closest('tr.js-prospect-row')
    if (row && !row.classList.contains('is-accepted') && !row.classList.contains('is-rejected')) {
      row.classList.add('is-accepted')
      disableRowButtons(row)
      const name = row.getAttribute('data-prospect-name') || 'Prospect'
      showToast('success', escapeHtml(name) + ' has been approved.')
      const timeout = hasFeedback(row) ? TIMEOUT_ACCEPT : TIMEOUT_ACCEPT_NO_FEEDBACK
      const timerId = setTimeout(function () {
        acceptTimers.delete(row)
        fadeAndRemove(row)
      }, timeout)
      if (!hasFeedback(row)) {
        acceptTimers.set(row, timerId)
        startFeedbackProgress(row, TIMEOUT_ACCEPT_NO_FEEDBACK)
      }
    }
    return
  }
  const rejectBtn = e.target.closest('.js-approval-required-table button[title="Reject"]')
  if (rejectBtn) {
    const row = rejectBtn.closest('tr.js-prospect-row')
    if (row && !row.classList.contains('is-accepted') && !row.classList.contains('is-rejected')) {
      row.classList.add('is-rejected')
      disableRowButtons(row)
      const name = row.getAttribute('data-prospect-name') || 'Prospect'
      if (!hasFeedback(row)) {
        const timerId = setTimeout(function () {
          rejectTimers.delete(row)
          showToast('error', escapeHtml(name) + ' has been rejected.')
          fadeAndRemove(row)
        }, TIMEOUT_REJECT_NO_FEEDBACK)
        rejectTimers.set(row, timerId)
        startFeedbackProgress(row, TIMEOUT_REJECT_NO_FEEDBACK)
      } else {
        showToast('error', escapeHtml(name) + ' has been rejected.')
        setTimeout(function () { fadeAndRemove(row) }, TIMEOUT_REJECT_WITH_FEEDBACK)
      }
    }
    return
  }
  const reviewBtn = e.target.closest('.js-review-btn')
  if (reviewBtn) {
    const row = reviewBtn.closest('tr.js-prospect-row')
    if (row) openPanelForRow(row)
    return
  }
  if (e.target.closest('.js-panel-close')) {
    closePanel()
    return
  }
  if (e.target.closest('.js-panel-up')) {
    navigatePanel('up')
    return
  }
  if (e.target.closest('.js-panel-down')) {
    navigatePanel('down')
    return
  }
  var feedbackEditBtn = e.target.closest('.js-feedback-edit-btn')
  if (feedbackEditBtn) {
    var td = feedbackEditBtn.closest('td.slds-cell-edit')
    var editRow = td && td.closest('tr.js-prospect-row')
    if (editRow) {
      if (rejectTimers.has(editRow)) { clearTimeout(rejectTimers.get(editRow)); rejectTimers.delete(editRow) }
      if (acceptTimers.has(editRow)) { clearTimeout(acceptTimers.get(editRow)); acceptTimers.delete(editRow) }
      stopFeedbackProgress(editRow)
    }
    var popover = td && td.querySelector('.js-feedback-popover')
    if (popover) {
      document.querySelectorAll('.js-feedback-popover:not(.slds-hide)').forEach(function (p) {
        p.classList.add('slds-hide')
      })
      popover.classList.remove('slds-hide')
      var textarea = popover.querySelector('.js-feedback-textarea')
      if (textarea) textarea.focus()
    }
    return
  }
  var feedbackCancelBtn = e.target.closest('.js-feedback-cancel')
  if (feedbackCancelBtn) {
    var cancelPopover = feedbackCancelBtn.closest('.js-feedback-popover')
    var cancelRow = cancelPopover && cancelPopover.closest('tr.js-prospect-row')
    if (cancelRow && (cancelRow.classList.contains('is-rejected') || cancelRow.classList.contains('is-accepted'))) {
      if (cancelPopover) cancelPopover.classList.add('slds-hide')
      if (rejectTimers.has(cancelRow)) { clearTimeout(rejectTimers.get(cancelRow)); rejectTimers.delete(cancelRow) }
      if (acceptTimers.has(cancelRow)) { clearTimeout(acceptTimers.get(cancelRow)); acceptTimers.delete(cancelRow) }
      stopFeedbackProgress(cancelRow)
      var cancelName = cancelRow.getAttribute('data-prospect-name') || 'Prospect'
      if (cancelRow.classList.contains('is-rejected')) showToast('error', escapeHtml(cancelName) + ' has been rejected.')
      else showToast('success', escapeHtml(cancelName) + ' has been approved.')
      fadeAndRemove(cancelRow)
    } else if (cancelPopover) {
      cancelPopover.classList.add('slds-hide')
      var cancelTd = cancelPopover.closest('td.slds-cell-edit')
      var cancelDisplay = cancelTd && cancelTd.querySelector('.js-feedback-display')
      var cancelTextarea = cancelPopover.querySelector('.js-feedback-textarea')
      if (cancelDisplay && cancelTextarea) cancelTextarea.value = cancelDisplay.textContent
    }
    return
  }
  var feedbackSubmitBtn = e.target.closest('.js-feedback-submit')
  if (feedbackSubmitBtn) {
    var submitPopover = feedbackSubmitBtn.closest('.js-feedback-popover')
    var submitTd = submitPopover && submitPopover.closest('td.slds-cell-edit')
    var submitRow = submitTd && submitTd.closest('tr.js-prospect-row')
    var submitDisplay = submitTd && submitTd.querySelector('.js-feedback-display')
    var submitTextarea = submitPopover && submitPopover.querySelector('.js-feedback-textarea')
    if (submitDisplay && submitTextarea) {
      var value = submitTextarea.value.trim()
      submitDisplay.textContent = value
      submitDisplay.setAttribute('title', value)
    }
    if (submitPopover) submitPopover.classList.add('slds-hide')
    if (submitRow && (submitRow.classList.contains('is-rejected') || submitRow.classList.contains('is-accepted'))) {
      if (rejectTimers.has(submitRow)) { clearTimeout(rejectTimers.get(submitRow)); rejectTimers.delete(submitRow) }
      if (acceptTimers.has(submitRow)) { clearTimeout(acceptTimers.get(submitRow)); acceptTimers.delete(submitRow) }
      stopFeedbackProgress(submitRow)
      var submitName = submitRow.getAttribute('data-prospect-name') || 'Prospect'
      if (submitRow.classList.contains('is-rejected')) showToast('error', escapeHtml(submitName) + ' has been rejected.')
      else showToast('success', escapeHtml(submitName) + ' has been approved.')
      fadeAndRemove(submitRow)
    }
    return
  }
}, false)

if (typeof window !== 'undefined') window.setPanelDisplay = setPanelDisplay

/**
 * Agent side panel: open/close via setPanelDisplay, and populate content from
 * window.__agents (injected by _agents-tab.html) based on the row's data-agent-index.
 */
const agentPanel = document.getElementById('agent-side-panel')
const agentPanelHeaderName = document.getElementById('agent-panel-header-name')
const agentPanelCreatedDate = document.getElementById('agent-panel-created-date')
const agentPanelStatus = document.getElementById('agent-panel-status')
const agentPanelSource = document.getElementById('agent-panel-source')
const agentPanelDistribution = document.getElementById('agent-panel-distribution')
const agentPanelRouting = document.getElementById('agent-panel-routing')
const agentPanelOwnership = document.getElementById('agent-panel-ownership-description')
const agentPanelUsers = document.getElementById('agent-panel-users')
const agentPanelDeactivate = document.getElementById('agent-panel-deactivate')

if (agentPanel) setPanelDisplay(agentPanel, false)

const AGENT_SOURCE_META = {
  report: {
    iconClass: 'slds-icon-standard-report',
    sprite: '/assets/icons/standard-sprite/svg/symbols.svg#report',
    background: 'rgb(6, 165, 154)'
  },
  list: {
    iconClass: 'slds-icon-standard-list-email',
    sprite: '/assets/icons/standard-sprite/svg/symbols.svg#list_email',
    background: 'rgb(99, 115, 129)'
  },
  campaign: {
    iconClass: 'slds-icon-standard-campaign',
    sprite: '/assets/icons/standard-sprite/svg/symbols.svg#campaign',
    background: 'rgb(240, 112, 50)'
  }
}

const AGENT_STATUS_META = {
  active: { theme: 'slds-theme_success', label: 'Active' },
  inactive: { theme: 'slds-theme_shade', label: 'Inactive' },
  error: { theme: 'slds-theme_error', label: 'Error' }
}

function escapeHtml (str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderAgentStatus (status) {
  const meta = AGENT_STATUS_META[status] || { theme: 'slds-theme_shade', label: status || '—' }
  return '<span class="slds-badge ' + meta.theme + '">' + escapeHtml(meta.label) + '</span>'
}

function renderAgentSourcePill (source) {
  if (!source) return ''
  const meta = AGENT_SOURCE_META[source.type] || AGENT_SOURCE_META.report
  return (
    '<button class="slds-p-vertical_xx-small slds-p-right_xx-small slds-p-left_xx-small popover-pill-container">' +
      '<span class="prospecting-agent-summary-source-value">' +
        '<span class="prospecting-agent-summary-source-value__icon ' + meta.iconClass + ' slds-icon_container">' +
          '<span class="boundary" style="--sds-c-icon-color-background: var(--slds-c-icon-color-background, ' + meta.background + ')">' +
            '<svg focusable="false" aria-hidden="true" class="slds-icon slds-icon_x-small icon">' +
              '<use xlink:href="' + meta.sprite + '"></use>' +
            '</svg>' +
          '</span>' +
        '</span> ' +
        escapeHtml(source.name || '') +
      '</span>' +
    '</button>'
  )
}

function renderAgentUserPill (user) {
  return (
    '<span class="popover-pill-container">' +
      '<span class="prospecting-agent-summary-user-pill">' +
        '<span class="prospecting-agent-summary-user-pill__icon slds-icon-standard-user slds-icon_container">' +
          '<span class="boundary" style="--sds-c-icon-color-background: var(--slds-c-icon-color-background, rgb(16, 124, 173))">' +
            '<svg focusable="false" aria-hidden="true" class="slds-icon slds-icon_x-small icon">' +
              '<use xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#user"></use>' +
            '</svg>' +
          '</span>' +
        '</span> ' +
        escapeHtml(user && user.name || '') +
      '</span>' +
    '</span>'
  )
}

function fillAgentPanel (agent) {
  if (!agent) return
  if (agentPanelHeaderName) agentPanelHeaderName.textContent = agent.name || '—'
  if (agentPanelCreatedDate) agentPanelCreatedDate.textContent = agent.createdDate || '—'
  if (agentPanelStatus) agentPanelStatus.innerHTML = renderAgentStatus(agent.status)
  if (agentPanelSource) agentPanelSource.innerHTML = renderAgentSourcePill(agent.source)
  if (agentPanelDistribution) agentPanelDistribution.textContent = agent.prospectDistribution || ''
  if (agentPanelRouting) agentPanelRouting.textContent = agent.routing || ''
  if (agentPanelOwnership) agentPanelOwnership.textContent = agent.ownershipDescription || ''
  if (agentPanelUsers) {
    const users = Array.isArray(agent.assignedUsers) ? agent.assignedUsers : []
    agentPanelUsers.innerHTML = users.map(renderAgentUserPill).join(' ')
  }
  if (agentPanelDeactivate) {
    agentPanelDeactivate.classList.toggle('slds-hide', agent.status !== 'active')
  }
}

function openAgentPanelForRow (row) {
  if (!row) return
  const idx = Number(row.getAttribute('data-agent-index'))
  const agent = (window.__agents || [])[idx] || { name: row.getAttribute('data-agent-name') || '—', status: row.getAttribute('data-agent-status') }
  fillAgentPanel(agent)
  if (prospectPanel) setPanelDisplay(prospectPanel, false)
  if (agentPanel) setPanelDisplay(agentPanel, true, 'flex')
  if (prospectListArticle) prospectListArticle.classList.add('slds-card-uplift-panel-is-open')
  document.querySelectorAll('#agents_table .js-agent-row.slds-is-selected').forEach((r) => {
    r.classList.remove('slds-is-selected')
    r.setAttribute('aria-selected', 'false')
  })
  row.classList.add('slds-is-selected')
  row.setAttribute('aria-selected', 'true')
}

function closeAgentPanel () {
  if (agentPanel) setPanelDisplay(agentPanel, false)
  if (prospectListArticle) prospectListArticle.classList.remove('slds-card-uplift-panel-is-open')
  document.querySelectorAll('#agents_table .js-agent-row.slds-is-selected').forEach((r) => {
    r.classList.remove('slds-is-selected')
    r.setAttribute('aria-selected', 'false')
  })
}

document.addEventListener('click', (e) => {
  const agentLink = e.target.closest('.js-agent-row-link')
  if (agentLink) {
    e.preventDefault()
    const row = agentLink.closest('tr.js-agent-row')
    if (row) openAgentPanelForRow(row)
    return
  }
  if (e.target.closest('.js-agent-panel-close')) {
    closeAgentPanel()
  }
}, false)

/**
 * Cadence modal — open / close
 */
function openCadenceModal () {
  var modal = document.getElementById('cadence-modal')
  var backdrop = document.getElementById('cadence-modal-backdrop')
  if (modal) {
    modal.classList.remove('slds-hide')
    modal.classList.add('slds-fade-in-open')
  }
  if (backdrop) {
    backdrop.classList.remove('slds-hide')
    backdrop.classList.add('slds-backdrop_open')
  }
}

function closeCadenceModal () {
  var modal = document.getElementById('cadence-modal')
  var backdrop = document.getElementById('cadence-modal-backdrop')
  if (modal) {
    modal.classList.add('slds-hide')
    modal.classList.remove('slds-fade-in-open')
  }
  if (backdrop) {
    backdrop.classList.add('slds-hide')
    backdrop.classList.remove('slds-backdrop_open')
  }
}

if (typeof window !== 'undefined') {
  window.openCadenceModal = openCadenceModal
  window.closeCadenceModal = closeCadenceModal
}

// Open modal when "Cadence" is selected from the Assign To picklist
document.addEventListener('click', function (e) {
  if (e.target.closest('#cadence_option')) {
    // Close the dropdown first
    var trigger = e.target.closest('.slds-dropdown-trigger_click')
    if (trigger) {
      trigger.classList.remove('slds-is-open')
      var input = trigger.querySelector('.slds-combobox__input')
      if (input) input.setAttribute('aria-expanded', 'false')
    }
    openCadenceModal()
    return
  }
  // Close modal on backdrop click or close/cancel buttons
  if (e.target.closest('.js-cadence-modal-close') || e.target.id === 'cadence-modal-backdrop') {
    closeCadenceModal()
  }
}, false)

// --- Approval required table: mousedown shows feedback hint on press (only when feedback is empty) ---

document.addEventListener('mousedown', function (e) {
  var btn = e.target.closest
    ? e.target.closest('.js-approval-required-table button[title="Accept"], .js-approval-required-table button[title="Reject"]')
    : null
  if (!btn) return
  var row = btn.closest('tr.js-prospect-row')
  if (!row || row.classList.contains('is-accepted') || row.classList.contains('is-rejected')) return
  if (hasFeedback(row)) return
  var isAccept = btn.getAttribute('title') === 'Accept'
  var display = row.querySelector('.js-feedback-display')
  var editBtn = row.querySelector('.js-feedback-edit-btn')
  if (!display || !editBtn) return
  if (display.classList.contains('feedback-hint')) return

  var hintText = isAccept ? 'Why is this a good prospect?' : 'Why is this a bad prospect?'
  var iconHtml = isAccept
    ? '<span class="slds-icon_container slds-icon-custom-custom6 slds-m-bottom_xx-small" title="feedback">' +
        '<svg class="slds-icon slds-icon_small slds-p-around_xx-small" aria-hidden="true">' +
          '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#like"></use>' +
        '</svg>' +
        '<span class="slds-assistive-text">Feedback</span>' +
      '</span>'
    : '<span class="slds-icon_container slds-icon-custom-custom13 slds-m-bottom_xx-small" title="feedback">' +
        '<svg class="slds-icon slds-icon_small slds-p-around_xx-small" aria-hidden="true">' +
          '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#dislike"></use>' +
        '</svg>' +
        '<span class="slds-assistive-text">Feedback</span>' +
      '</span>'

  display.dataset.originalFeedback = display.textContent
  display.innerHTML =
    '<div class="feedback-hint__cell">' +
      '<div class="slds-grid slds-grid_vertical slds-grid_vertical-align-center slds-line-clamp_small slds-truncate">' +
        iconHtml +
        '<p class="slds-truncate slds-line-clamp_small">' + hintText + '</p>' +
      '</div>' +
      '<div class="feedback-hint__button">' +
        '<button class="slds-button js-feedback-edit-btn">Add Feedback</button>' +
        '<div class="feedback-hint__progress"></div>' +
      '</div>' +
    '</div>'
  display.classList.add('feedback-hint')
  editBtn.style.display = 'none'
}, true)

// --- Approval required table: clear timer when user starts typing in feedback popover ---

document.addEventListener('input', function (e) {
  var textarea = e.target.closest ? e.target.closest('.js-approval-required-table .js-feedback-textarea') : null
  if (!textarea) return
  var popover = textarea.closest('.js-feedback-popover')
  var td = popover && popover.closest('td.slds-cell-edit')
  var row = td && td.closest('tr.js-prospect-row')
  if (!row) return
  if (row.classList.contains('is-rejected') && rejectTimers.has(row)) {
    clearTimeout(rejectTimers.get(row))
    rejectTimers.delete(row)
    stopFeedbackProgress(row)
  }
  if (row.classList.contains('is-accepted') && acceptTimers.has(row)) {
    clearTimeout(acceptTimers.get(row))
    acceptTimers.delete(row)
    stopFeedbackProgress(row)
  }
}, true)

/**
 * Action button tooltips: show SLDS tooltip above buttons on hover
 */
document.addEventListener('mouseenter', function (e) {
  var btn = e.target.closest('[data-tooltip]')
  if (!btn) return
  var tooltipId = 'tooltip-' + btn.getAttribute('data-tooltip')
  var tooltip = document.getElementById(tooltipId)
  if (!tooltip) return

  tooltip.classList.remove('slds-hide')
  var btnRect = btn.getBoundingClientRect()
  var tipRect = tooltip.getBoundingClientRect()
  var left = btnRect.left + (btnRect.width / 2) - (tipRect.width / 2)
  var top = btnRect.top - tipRect.height - 8
  tooltip.style.left = left + 'px'
  tooltip.style.top = top + 'px'
}, true)

document.addEventListener('mouseleave', function (e) {
  var btn = e.target.closest('[data-tooltip]')
  if (!btn) return
  var tooltipId = 'tooltip-' + btn.getAttribute('data-tooltip')
  var tooltip = document.getElementById(tooltipId)
  if (tooltip) tooltip.classList.add('slds-hide')
}, true)

// --- Column resize ---
;(function () {
  document.addEventListener('mousedown', function (e) {
    var divider = e.target.closest('.slds-resizable__divider')
    if (!divider) return
    e.preventDefault()

    var th = divider.closest('th')
    if (!th) return

    var rangeInput = th.querySelector('.slds-resizable__input')
    var minW = rangeInput ? parseInt(rangeInput.min, 10) || 20 : 20
    var maxW = rangeInput ? parseInt(rangeInput.max, 10) || 1000 : 1000
    var startX = e.clientX
    var startWidth = th.offsetWidth

    th.classList.add('slds-is-resizing')
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    function onMove (evt) {
      var delta = evt.clientX - startX
      var newWidth = Math.max(minW, Math.min(maxW, startWidth + delta))
      th.style.width = newWidth + 'px'
      if (rangeInput) rangeInput.value = newWidth
    }

    function onUp () {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      th.classList.remove('slds-is-resizing')
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  })
})()

})()
