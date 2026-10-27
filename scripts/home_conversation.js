// ──────────────────────────────────────────────────────────────────────
// Seller Home — Conversation drill-in behavior
// =====================================================================
// Owned by /home_conversation.html. Loaded from that page's
// {% block scripts_extra %} AFTER home.js so the left-nav collapse
// toggle is already wired by the time this file runs.
//
// Responsibilities
// ----------------
//   • URL + header: read `?id=<conversationId>` from `location.search`,
//     hydrate the header title from the embedded conversations
//     registry, and highlight the matching recent in the left nav
//     (URL is the sole source of truth for that selection).
//   • Prospect table: wire single-select + keyboard nav
//     (roving-tabindex, Enter/Space, Arrow keys, Home/End). Kept
//     independent so the table works as a standalone list even
//     without a review controller attached.
//   • Outreach review: create a SelectionManager per review section
//     that owns the shared `selectedProspectId` + per-prospect
//     `reviews` state + `completed` flag. Populates the review
//     panel on selection change and toggles the table row's
//     `.is-selected` + `data-sh-review-status`.
//   • Approve-all dialog: SLDS 2 modal with focus trap +
//     Escape/backdrop close + focus restore.
//
// Communication model
// -------------------
// Table <-> review sync flows through the DOM event
// `sh:conv-row-select` (payload: { rowId, source: 'table'|'review' }).
// The table dispatches on click / keyboard-activation; the review
// dispatches on Prev/Next. Every listener treats the event as
// authoritative — no direct calls between the two views, so a
// future third consumer (analytics, detail pane) can subscribe
// without needing a reference to either module.
//
// Review-decision changes flow through `sh:review-decision`
// (payload: { rowId?, decision: 'approve'|'request_changes'|
// 'approve_all', feedback? }). Kept as a separate event name so a
// listener that only cares about selection changes doesn't get
// spammed on approval churn.
//
// What this file INTENTIONALLY does NOT do yet:
//   • Bind composer submit / autosize — the shell renders visuals
//     only; interaction wiring lands with a follow-up phase.
//   • Fetch data — the conversations map is inlined as JSON by
//     Nunjucks at build time and read from `[data-sh-conversations]`.
//   • Manage history / scroll restoration — the drill-in uses
//     native `<a href>` navigation, so the browser handles
//     back-button + scroll-restoration for free.
// ──────────────────────────────────────────────────────────────────────

(function () {
  'use strict'

  // ── Config ──────────────────────────────────────────────────────
  var SELECTORS = {
    root:         '[data-sh-conv-root]',
    title:        '[data-sh-conv-title]',
    recentLinks:  '[data-sh-recent-conv]',
    // Prospect table (embedded in an agent message):
    //   `convTable` — the wrapper carrying `data-sh-conv-table`.
    //   `convRow`   — the <tr> elements that support selection.
    convTable:    '[data-sh-conv-table]',
    convRow:      '[data-sh-conv-row]',
    // Outreach review (rendered by _home_outreach_review.html):
    reviewRoot:   '[data-sh-review-root]',
    // Confirmation dialog for "Approve all" (sibling of the review):
    reviewDialog:    '[data-sh-review-dialog]',
    reviewBackdrop:  '[data-sh-review-dialog-backdrop]'
  }
  // Class + ARIA the table row toggles on selection. `.is-selected`
  // is the visual state; `aria-selected` is the AT-facing state.
  var SELECTED_CLASS = 'is-selected'
  // Class the review section toggles when the confirmation dialog
  // opens (mirrors SLDS `slds-fade-in-open` semantically).
  var DIALOG_OPEN_CLASS = 'is-open'
  // Custom-event names. Kept as string constants so future
  // consumers can subscribe without importing this module.
  var EVT_ROW_SELECT = 'sh:conv-row-select'
  var EVT_DECISION   = 'sh:review-decision'
  // Class + ARIA attributes applied to the recent whose
  // `data-sh-recent-conv` matches the URL's `?id=`. Same class name
  // `.is-active` used by the primary nav so styling stays in one
  // place (`.seller-home__nav-recent.is-active` in home.scss).
  var ACTIVE_CLASS = 'is-active'
  var ARIA_CURRENT = 'aria-current'
  // Attribute on `[data-sh-conv-root]` holding the entity-encoded
  // JSON blob of conversation entries.
  var ATTR_CONVERSATIONS = 'data-sh-conversations'

  // ── Utilities ───────────────────────────────────────────────────
  // Parse the `?id=<value>` from the current URL. Wrapped in
  // try/catch because URLSearchParams throws on malformed input in
  // some legacy browsers we still support on the demo surface;
  // returning null lets the caller fall back to `defaultConversationId`.
  function readConversationIdFromUrl () {
    try {
      var params = new URLSearchParams(window.location.search)
      var raw = params.get('id')
      if (!raw) return null
      var trimmed = String(raw).trim()
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return null
      return trimmed
    } catch (e) {
      return null
    }
  }

  // Parse the inlined conversations JSON blob. Empty object return
  // on any failure so the caller can safely `map[id]` without a
  // guard.
  function readConversationsMap (root) {
    if (!root) return {}
    var raw = root.getAttribute(ATTR_CONVERSATIONS)
    if (!raw) return {}
    try {
      return JSON.parse(raw)
    } catch (e) {
      return {}
    }
  }

  // Dispatch a bubbling CustomEvent from `sourceEl`. Wrapped so
  // legacy browsers that lack `new CustomEvent(...)` (very few
  // remain) fail silently instead of throwing.
  function dispatch (sourceEl, name, detail) {
    try {
      var evt = new CustomEvent(name, { bubbles: true, detail: detail || {} })
      sourceEl.dispatchEvent(evt)
    } catch (e) { /* legacy browser: no-op */ }
  }

  // ── Boot ────────────────────────────────────────────────────────
  function init () {
    var root = document.querySelector(SELECTORS.root)
    if (!root) return

    var id = readConversationIdFromUrl()
    var map = readConversationsMap(root)
    var entry = id && map && Object.prototype.hasOwnProperty.call(map, id)
      ? map[id]
      : null

    // ── Draft-conversation fallback ─────────────────────────────
    // When `?id=` doesn't select a seeded conversation, check for a
    // runtime-only draft envelope (Schedule flow, and future
    // client-side "new chat" surfaces). Draft envelopes carry the
    // title + prefilled composer text + source metadata so the
    // conversation renders as a fresh conversation, not a broken
    // deep-link. See schedule_conversation.js for the schema.
    //
    // `draftEnvelope` is null when the id belongs to a seeded
    // conversation (already resolved above) OR when the id is
    // simply not in localStorage — the second case falls back to
    // the SSR default just like a bad direct link.
    var draftEnvelope = null
    if (!entry && id && window.SellerHomeScheduling
        && typeof window.SellerHomeScheduling.readDraft === 'function') {
      draftEnvelope = window.SellerHomeScheduling.readDraft(id)
    }

    // Resolve the effective conversation id: URL `?id=` wins when
    // it selects a seeded conversation OR a runtime draft;
    // otherwise fall back to whichever conversation the SSR
    // default already rendered.
    var initialConvId = root.getAttribute('data-sh-conv-initial-id') || null
    var resolvedId = entry ? id
      : (draftEnvelope ? draftEnvelope.id : initialConvId)

    if (resolvedId) root.setAttribute('data-sh-conversation-id', resolvedId)

    // For a draft conversation we also stamp the source metadata on
    // the root so the composer binder can route submissions through
    // the scheduling responder without re-reading the envelope.
    if (draftEnvelope) {
      if (draftEnvelope.sourceType) {
        root.setAttribute('data-sh-conv-source-type', draftEnvelope.sourceType)
      }
      if (draftEnvelope.sourceSkillId) {
        root.setAttribute('data-sh-conv-source-skill-id', draftEnvelope.sourceSkillId)
      }
      // Materialise a `<ol>` for the draft's thread so `switchThread`
      // finds it. The SSR loop only emits threads for seeded
      // conversations — a draft has no server-rendered thread, so we
      // add one here before the visibility toggle runs. Empty by
      // default; the composer append flow fills it as the seller
      // interacts.
      ensureDraftThread(draftEnvelope.id)
    }

    var titleEl = root.querySelector(SELECTORS.title)
    if (entry && titleEl) {
      titleEl.textContent = entry.title
      titleEl.setAttribute('title', entry.title)
    } else if (draftEnvelope && titleEl) {
      titleEl.textContent = draftEnvelope.title
      titleEl.setAttribute('title', draftEnvelope.title)
      try { document.title = draftEnvelope.title } catch (_e) { /* noop */ }
    }

    // Reveal the matching thread + hide the others. Every seeded
    // conversation is rendered at SSR time as a hidden `<ol>`
    // sibling under `.seller-home__conv-thread`. This walker is
    // idempotent — calling it again with the same id (or with a
    // future in-app navigation) toggles the visibility without
    // touching message content.
    switchThread(resolvedId)

    // Reveal the matching side panel (if the resolved conversation
    // carries a workflowContext block) and toggle the layout
    // wrapper's `is-panel-collapsed` accordingly.
    switchPanel(resolvedId, entry || map[initialConvId])

    // URL-derived recent highlight + intercept redundant clicks.
    applyActiveRecent(resolvedId)
    bindRecentClicks(resolvedId)

    // Wire each prospect table for standalone single-select.
    var tables = document.querySelectorAll(SELECTORS.convTable)
    for (var t = 0; t < tables.length; t++) bindProspectTable(tables[t])

    // Wire each outreach review. The review controller subscribes
    // to `sh:conv-row-select` + owns per-prospect review state.
    // Prospect data is looked up from the inlined conversations
    // map (already parsed above) rather than a separate fetch.
    var reviews = document.querySelectorAll(SELECTORS.reviewRoot)
    for (var r = 0; r < reviews.length; r++) {
      bindOutreachReview(reviews[r], map)
    }

    // Wire every workflow-details side panel — one per workflow-
    // backed conversation. Each panel is self-contained; the
    // controller no-ops on hidden panels until they become the
    // active surface.
    var panels = document.querySelectorAll('[data-sh-workflow-panel]')
    for (var p = 0; p < panels.length; p++) bindWorkflowSidePanel(panels[p])

    // Wire the header's reopen-panel button. Bound once at boot
    // because the button lives in the shared conversation header
    // (not inside a specific panel), so its handler needs to
    // operate against whichever workflow panel is currently
    // visible.
    bindReopenPanel()

    // Wire the follow-up composer. Uses the currently active
    // conversation id (resolved above) to decide where new user +
    // agent messages should be appended and which localStorage
    // bucket to persist them to. `map` is passed through so the
    // mock responder can read the seeded snapshots for grounded
    // canned replies without a second parse of the JSON blob.
    // `draftEnvelope` (when present) drives the composer prefill +
    // scheduling-responder branch inside `bindComposer`.
    var composerForm = document.querySelector('[data-sh-conv-composer]')
    if (composerForm) bindComposer(composerForm, resolvedId, map, draftEnvelope)
  }

  // ── Draft-thread scaffold ────────────────────────────────────────
  // A runtime draft conversation has no SSR `<ol>` — the Nunjucks
  // loop only iterates `home.conversations`. This helper injects
  // one so `switchThread(id)` can reveal it and the composer's
  // `appendMessage(msg, convId, opts)` can find `[data-sh-conv-
  // thread-for="<id>"]` without a null guard on every append.
  //
  // Idempotent: subsequent calls with the same id are no-ops so
  // the empty-thread placeholder isn't re-appended if init() runs
  // twice (e.g. Turbo-style page swap in a future refactor).
  function ensureDraftThread (convId) {
    if (!convId) return null
    var existing = document.querySelector('[data-sh-conv-thread-for="' + convId + '"]')
    if (existing) return existing
    var host = document.querySelector('.seller-home__conv-thread[data-sh-conv-thread]')
      || document.querySelector('[data-sh-conv-thread]')
    if (!host) return null

    var ol = document.createElement('ol')
    ol.className = 'seller-home__conv-thread-inner'
    ol.setAttribute('data-sh-conv-thread-inner', '')
    ol.setAttribute('data-sh-conv-thread-for', convId)
    // Initial state — hidden until `switchThread(convId)` reveals
    // it. The switcher applies the live-region role, so we can
    // start as a plain list.
    ol.setAttribute('role', 'list')
    ol.setAttribute('aria-hidden', 'true')
    ol.setAttribute('hidden', '')

    // Deliberately DO NOT append the "Messages will appear here."
    // placeholder here. A draft conversation opens with the
    // composer already prefilled + focused, so the empty thread
    // is a beat, not a state — the placeholder would compete with
    // the composer for the seller's first read.

    host.appendChild(ol)
    return ol
  }

  // ── Thread visibility toggle ────────────────────────────────────
  // Every conversation renders its own `<ol>` inside the thread
  // region. This function makes exactly one visible (the one whose
  // `data-sh-conv-thread-for` matches `activeConvId`) and hides the
  // rest with both `hidden` and `aria-hidden="true"` so screen
  // readers don't hear the other threads. The live-region role is
  // moved onto the active thread so announcements only fire once.
  function switchThread (activeConvId) {
    if (!activeConvId) return
    var threads = document.querySelectorAll('[data-sh-conv-thread-for]')
    for (var i = 0; i < threads.length; i++) {
      var t = threads[i]
      var mine = t.getAttribute('data-sh-conv-thread-for') === activeConvId
      if (mine) {
        t.removeAttribute('hidden')
        t.removeAttribute('aria-hidden')
        t.setAttribute('role', 'log')
        t.setAttribute('aria-live', 'polite')
        t.setAttribute('aria-relevant', 'additions')
      } else {
        t.setAttribute('hidden', '')
        t.setAttribute('aria-hidden', 'true')
        t.setAttribute('role', 'list')
        t.removeAttribute('aria-live')
        t.removeAttribute('aria-relevant')
      }
    }
  }

  // ── Panel visibility toggle ─────────────────────────────────────
  // Every workflow-backed conversation renders its own side panel
  // inside the layout wrapper. Reveal the one whose
  // `data-sh-workflow-panel-conversation-id` matches `activeConvId`
  // and hide the rest. When no panel matches (the conversation has
  // no `workflowContext`), collapse the layout so the thread takes
  // the full row width.
  function switchPanel (activeConvId, activeEntry) {
    var layout = document.querySelector('[data-sh-conv-layout]')
    var panels = document.querySelectorAll('[data-sh-workflow-panel]')
    var visiblePanel = null
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i]
      var mine = p.getAttribute('data-sh-workflow-panel-conversation-id') === activeConvId
      if (mine) {
        p.removeAttribute('hidden')
        p.removeAttribute('aria-hidden')
        visiblePanel = p
      } else {
        p.setAttribute('hidden', '')
        p.setAttribute('aria-hidden', 'true')
      }
    }
    if (!layout) return
    if (visiblePanel && activeEntry && activeEntry.workflowContext) {
      // Panel to show — respect the per-workflow localStorage
      // preference (if the user previously closed the panel for
      // this workflow, keep it collapsed).
      var wfId = visiblePanel.getAttribute('data-sh-workflow-panel-id') || ''
      var pref = null
      try {
        pref = window.localStorage && window.localStorage.getItem('sh:convPanel:' + wfId)
      } catch (e) { /* no-op */ }
      if (pref === 'collapsed') layout.classList.add('is-panel-collapsed')
      else layout.classList.remove('is-panel-collapsed')
      layout.setAttribute('data-sh-conv-workflow-id', wfId)
    } else {
      // No panel to show — always collapse.
      layout.classList.add('is-panel-collapsed')
      layout.setAttribute('data-sh-conv-workflow-id', '')
    }
  }

  // ── Recent-links highlight (unchanged from prior phase) ─────────
  function applyActiveRecent (id) {
    var links = document.querySelectorAll(SELECTORS.recentLinks)
    for (var i = 0; i < links.length; i++) {
      var link = links[i]
      var isMatch = !!id && link.getAttribute('data-sh-recent-conv') === id
      if (isMatch) {
        link.classList.add(ACTIVE_CLASS)
        link.setAttribute(ARIA_CURRENT, 'page')
      } else {
        link.classList.remove(ACTIVE_CLASS)
        link.removeAttribute(ARIA_CURRENT)
      }
    }
  }

  function bindRecentClicks (activeId) {
    if (!activeId) return
    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest
        ? event.target.closest(SELECTORS.recentLinks)
        : null
      if (!link) return
      var linkId = link.getAttribute('data-sh-recent-conv')
      if (linkId === activeId) event.preventDefault()
    })
  }

  // ──────────────────────────────────────────────────────────────
  // Prospect table binder
  // ──────────────────────────────────────────────────────────────
  // Owns:
  //   • Roving-tabindex keyboard nav (Arrow / Home / End).
  //   • Single-select visual state (`.is-selected`, aria-selected).
  //   • Reflecting review status onto the row (approved /
  //     changes_requested) via `data-sh-review-status`.
  //   • Dispatching `sh:conv-row-select` on user interaction so a
  //     review controller (or any other subscriber) can react.
  //
  // Also subscribes to `sh:conv-row-select` — external senders
  // (the review's Prev/Next buttons) can drive selection through
  // the same event, and the table updates its own DOM in response.
  function bindProspectTable (table) {
    if (!table) return
    var rows = table.querySelectorAll(SELECTORS.convRow)
    if (!rows.length) return

    // NodeList → array for readable index math.
    var rowList = []
    for (var i = 0; i < rows.length; i++) rowList.push(rows[i])

    // Roving tabindex — the first row is the initial tab stop.
    setRovingFocus(rowList, 0)

    // Direct interaction (click / keyboard) dispatches the event.
    table.addEventListener('click', function (event) {
      var row = event.target && event.target.closest
        ? event.target.closest(SELECTORS.convRow)
        : null
      if (!row || !table.contains(row)) return
      selectRow(rowList, row, { source: 'table' })
    })

    table.addEventListener('keydown', function (event) {
      var row = event.target && event.target.closest
        ? event.target.closest(SELECTORS.convRow)
        : null
      if (!row || !table.contains(row)) return
      var currentIndex = rowList.indexOf(row)
      if (currentIndex < 0) return

      switch (event.key) {
        case 'Enter':
        case ' ':
        case 'Spacebar':
          event.preventDefault()
          selectRow(rowList, row, { source: 'table' })
          break
        case 'ArrowDown':
          event.preventDefault()
          moveFocus(rowList, currentIndex + 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          moveFocus(rowList, currentIndex - 1)
          break
        case 'Home':
          event.preventDefault()
          moveFocus(rowList, 0)
          break
        case 'End':
          event.preventDefault()
          moveFocus(rowList, rowList.length - 1)
          break
      }
    })

    // External sync — a review's Prev/Next fires the same event.
    // If the target is a row of THIS table, update our DOM without
    // re-dispatching (`silent: true` prevents an event loop).
    document.addEventListener(EVT_ROW_SELECT, function (event) {
      var d = event.detail || {}
      if (!d.rowId) return
      var targetRow = table.querySelector('[data-sh-conv-row][data-sh-conv-row-id="' + d.rowId + '"]')
      if (!targetRow) return
      // Skip a re-application when the row is already selected —
      // avoids gratuitous focus + `.is-selected` toggles.
      if (targetRow.classList.contains(SELECTED_CLASS)) return
      selectRow(rowList, targetRow, { silent: true })
    })

    // React to per-prospect decisions by updating the row's
    // `data-sh-review-status` — the SCSS `[data-sh-review-status]`
    // rules paint the leading stripe from there.
    document.addEventListener(EVT_DECISION, function (event) {
      var d = event.detail || {}
      if (d.decision === 'approve_all') {
        // Mark every row as approved.
        for (var i = 0; i < rowList.length; i++) {
          rowList[i].setAttribute('data-sh-review-status', 'approved')
        }
        return
      }
      if (!d.rowId) return
      var row = table.querySelector('[data-sh-conv-row][data-sh-conv-row-id="' + d.rowId + '"]')
      if (!row) return
      if (d.decision === 'approve') row.setAttribute('data-sh-review-status', 'approved')
      else if (d.decision === 'request_changes') row.setAttribute('data-sh-review-status', 'changes_requested')
    })
  }

  function moveFocus (rowList, nextIndex) {
    var clamped = Math.max(0, Math.min(rowList.length - 1, nextIndex))
    setRovingFocus(rowList, clamped)
    var target = rowList[clamped]
    if (target && typeof target.focus === 'function') target.focus()
  }

  function setRovingFocus (rowList, focusIndex) {
    for (var i = 0; i < rowList.length; i++) {
      rowList[i].setAttribute('tabindex', i === focusIndex ? '0' : '-1')
    }
  }

  // Apply single-select DOM state. Dispatches `sh:conv-row-select`
  // unless `opts.silent` is set (used when the selection is being
  // driven by an already-dispatched external event, to prevent a
  // ping-pong loop).
  function selectRow (rowList, targetRow, opts) {
    opts = opts || {}
    for (var i = 0; i < rowList.length; i++) {
      var row = rowList[i]
      var isTarget = row === targetRow
      if (isTarget) {
        row.classList.add(SELECTED_CLASS)
        row.setAttribute('aria-selected', 'true')
      } else {
        row.classList.remove(SELECTED_CLASS)
        row.setAttribute('aria-selected', 'false')
      }
    }
    var idx = rowList.indexOf(targetRow)
    if (idx >= 0) setRovingFocus(rowList, idx)

    if (!opts.silent) {
      var table = targetRow.closest(SELECTORS.convTable)
      dispatch(targetRow, EVT_ROW_SELECT, {
        rowId:   targetRow.getAttribute('data-sh-conv-row-id') || null,
        tableId: table ? table.getAttribute('data-sh-conv-table') : null,
        source:  opts.source || 'table',
        row:     targetRow
      })
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Outreach review controller
  // ──────────────────────────────────────────────────────────────
  // Owns:
  //   • `selectedId`  — currently displayed prospect id.
  //   • `reviews`     — per-prospect review state:
  //                     { [id]: { status, feedback? } }.
  //   • `completed`   — true after "Approve all" confirms.
  //   • Rendering the prospect-detail panel on state change.
  //   • Toggling action-button labels + disabled state per status.
  //   • Confirmation-dialog open/close + focus trap.
  //
  // Prospect data comes from the inlined conversations map (already
  // parsed by `readConversationsMap`). Ordered ids come from the
  // review root's `data-sh-review-prospect-ids` attribute — same
  // order as the table, so Prev/Next moves in list order.
  function bindOutreachReview (reviewRoot, convMap) {
    if (!reviewRoot) return

    var reviewId = reviewRoot.getAttribute('data-sh-review-id')
    var idsAttr  = reviewRoot.getAttribute('data-sh-review-prospect-ids') || ''
    var ids      = idsAttr.split(',').filter(Boolean)
    if (!ids.length) return

    // Look up the full prospect roster in the conversations map.
    // The review lives inside an agent message with a `table.rows`
    // array; walk every conversation's messages and pick the row
    // set whose ids match `ids` (positional, so a partial mismatch
    // still resolves as long as the ids exist somewhere).
    var prospectsById = buildProspectIndex(convMap, ids)

    // Read the status label/modifier map serialized alongside the
    // review shell (`<script type="application/json" data-sh-review-statuses>`).
    // Kept as a JSON blob so adding a new status only needs a
    // change in _home_outreach_review.html.
    var statuses = readStatusMap(reviewId)

    // ── State ────────────────────────────────────────────────
    var state = {
      selectedId: ids[0],
      // reviews map: { id: { status, feedback? } }. Keyed by
      // prospect id so switching between prospects preserves both
      // status AND any feedback the seller typed.
      reviews: Object.create(null),
      completed: false
    }

    // ── DOM refs ─────────────────────────────────────────────
    // Cached upfront so render() doesn't re-query on every notify.
    var els = {
      current:       reviewRoot.querySelector('[data-sh-review-current]'),
      reviewedCount: reviewRoot.querySelector('[data-sh-review-reviewed-count]'),
      name:          reviewRoot.querySelector('[data-sh-review-name]'),
      role:          reviewRoot.querySelector('[data-sh-review-role]'),
      company:       reviewRoot.querySelector('[data-sh-review-company]'),
      signalRow:     reviewRoot.querySelector('[data-sh-review-signal-row]'),
      signal:        reviewRoot.querySelector('[data-sh-review-signal]'),
      channelLabel:  reviewRoot.querySelector('[data-sh-review-channel-label]'),
      subject:       reviewRoot.querySelector('[data-sh-review-subject]'),
      bodyText:      reviewRoot.querySelector('[data-sh-review-body-text]'),
      statusPill:    reviewRoot.querySelector('[data-sh-review-status]'),
      statusLabel:   reviewRoot.querySelector('[data-sh-review-status-label]'),
      approveBtn:    reviewRoot.querySelector('[data-sh-review-approve]'),
      requestBtn:    reviewRoot.querySelector('[data-sh-review-request-changes]'),
      prevBtn:       reviewRoot.querySelector('[data-sh-review-prev]'),
      nextBtn:       reviewRoot.querySelector('[data-sh-review-next]'),
      approveAllBtn: reviewRoot.querySelector('[data-sh-review-approve-all]'),
      body:          reviewRoot.querySelector('[data-sh-review-body]'),
      actionsRow:    reviewRoot.querySelector('.seller-home__conv-review-actions'),
      batchRow:      reviewRoot.querySelector('.seller-home__conv-review-batch'),
      completed:     reviewRoot.querySelector('[data-sh-review-completed]'),
      feedback:      reviewRoot.querySelector('[data-sh-review-feedback]'),
      feedbackInput: reviewRoot.querySelector('[data-sh-review-feedback-input]'),
      feedbackSave:  reviewRoot.querySelector('[data-sh-review-feedback-save]'),
      feedbackCancel:reviewRoot.querySelector('[data-sh-review-feedback-cancel]')
    }

    // Dialog + backdrop live at the end of the section (peers of
    // the review root, not descendants). Cache them via document
    // scope so a re-render doesn't reach into the review's DOM
    // scope for their references.
    var dialogEls = {
      dialog:   document.querySelector(SELECTORS.reviewDialog),
      backdrop: document.querySelector(SELECTORS.reviewBackdrop)
    }
    if (dialogEls.dialog) {
      dialogEls.confirm = dialogEls.dialog.querySelector('[data-sh-review-dialog-confirm]')
      dialogEls.cancel  = dialogEls.dialog.querySelector('[data-sh-review-dialog-cancel]')
      dialogEls.close   = dialogEls.dialog.querySelector('[data-sh-review-dialog-close]')
    }

    // ── State mutators ───────────────────────────────────────
    function setSelected (id, source) {
      if (ids.indexOf(id) < 0) return
      if (id === state.selectedId) return
      state.selectedId = id
      render()
      // If the user drove selection from the table, scroll the
      // review into view so they don't have to hunt for the panel
      // on a long thread. If they drove it from Prev/Next inside
      // the review, the review is already visible — skip the
      // scroll so we don't jump the page.
      if (source === 'table') scrollReviewIntoView()
    }

    function setReview (id, patch) {
      if (ids.indexOf(id) < 0) return
      var current = state.reviews[id] || { status: 'not_reviewed' }
      var merged = {}
      // Manual copy to avoid Object.assign dependency on ancient browsers.
      for (var k in current) merged[k] = current[k]
      for (var k2 in patch)   merged[k2] = patch[k2]
      state.reviews[id] = merged
      render()
      dispatch(reviewRoot, EVT_DECISION, {
        rowId: id,
        decision: patch.status === 'approved' ? 'approve'
          : patch.status === 'changes_requested' ? 'request_changes'
          : 'update'
      })
    }

    function approveAll () {
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i]
        var current = state.reviews[id] || {}
        // Force status → approved; preserve any prior feedback
        // for future audit / undo.
        state.reviews[id] = {
          status: 'approved',
          feedback: current.feedback
        }
      }
      state.completed = true
      render()
      dispatch(reviewRoot, EVT_DECISION, { decision: 'approve_all' })
    }

    // Count non-`not_reviewed` entries. `not_reviewed` is the
    // default when a prospect has never been touched.
    function reviewedCount () {
      var count = 0
      for (var id in state.reviews) {
        var r = state.reviews[id]
        if (r && r.status && r.status !== 'not_reviewed') count++
      }
      return count
    }

    // Compute the id at offset +/- from the current selection.
    // Wraps at either end so the seller can loop through all 12
    // without hitting a dead-end at row 12.
    function neighborId (direction) {
      var idx = ids.indexOf(state.selectedId)
      if (idx < 0) return ids[0]
      var next = idx + direction
      if (next < 0) next = ids.length - 1
      if (next >= ids.length) next = 0
      return ids[next]
    }

    // Render — single function called on every state change.
    // Idempotent: calling with unchanged state produces the same
    // DOM. Keeps the mental model simple (state → view) even
    // though vanilla JS forces us to touch the DOM imperatively.
    function render () {
      var prospect = prospectsById[state.selectedId]
      if (!prospect) return
      var review = state.reviews[state.selectedId] || { status: 'not_reviewed' }
      var currentIdx = ids.indexOf(state.selectedId)

      // Progress counters.
      if (els.current)       els.current.textContent       = String(currentIdx + 1)
      if (els.reviewedCount) els.reviewedCount.textContent = String(reviewedCount())

      // Prospect metadata.
      if (els.name)    els.name.textContent    = prospect.prospect || ''
      if (els.role)    els.role.textContent    = prospect.role || ''
      if (els.company) els.company.textContent = prospect.company || ''

      // Signal row: hide when empty, show otherwise.
      if (els.signalRow) {
        if (prospect.signal) {
          els.signalRow.removeAttribute('hidden')
          if (els.signal) els.signal.textContent = prospect.signal
        } else {
          els.signalRow.setAttribute('hidden', '')
        }
      }

      // Draft.
      if (els.channelLabel) els.channelLabel.textContent = channelLabel(prospect.channel)
      if (els.subject)      els.subject.textContent      = prospect.subject || '(No subject)'
      if (els.bodyText)     els.bodyText.textContent     = prospect.body || ''

      // Status pill.
      applyStatusPill(review.status)

      // Action-button state per current review status.
      applyActionState(review.status)

      // Completed override — replaces the body / actions / batch
      // with the "All N drafts approved" block.
      applyCompletedState(state.completed)

      // Table sync: fire `sh:conv-row-select` so the table's
      // subscriber highlights the corresponding row. Fired on
      // EVERY render (cheap: the table listener bails when the
      // row is already selected). Marked `source: 'review'` so
      // the table doesn't rebound-fire the same event.
      dispatch(reviewRoot, EVT_ROW_SELECT, {
        rowId: state.selectedId,
        source: 'review'
      })

      // Sync feedback textarea with the selected prospect's saved
      // feedback (idle-state; only visible if the seller opened
      // the feedback form for this prospect).
      if (els.feedbackInput) {
        var saved = review && review.feedback ? review.feedback : ''
        // Only overwrite if not currently in a mid-edit state —
        // detect by whether the feedback panel is hidden.
        if (els.feedback && els.feedback.hasAttribute('hidden')) {
          els.feedbackInput.value = saved
        }
      }
    }

    // ── Sub-render helpers ───────────────────────────────────
    function applyStatusPill (statusKey) {
      if (!els.statusPill || !els.statusLabel) return
      var info = statuses[statusKey] || statuses.not_reviewed
      els.statusLabel.textContent = info ? info.label : statusKey
      // Reset any previous modifier, then apply the current one.
      for (var s in statuses) {
        els.statusPill.classList.remove('seller-home__conv-review-status--' + statuses[s].modifier)
      }
      if (info) {
        els.statusPill.classList.add('seller-home__conv-review-status--' + info.modifier)
      }
    }

    // Per-status action-button configuration. Kept as data so a
    // future status only needs a new key here.
    var ACTION_STATE_BY_STATUS = {
      not_reviewed: {
        approveDisabled: false, approveLabel: 'Approve',
        requestDisabled: false, requestLabel: 'Edit'
      },
      approved: {
        // Approved: disable Approve (idempotent + prevents
        // accidental re-approval clicks). Edit stays enabled so
        // the seller can course-correct.
        approveDisabled: true,  approveLabel: 'Approved',
        requestDisabled: false, requestLabel: 'Edit'
      },
      changes_requested: {
        // Changes requested: approve stays enabled so the seller
        // can flip to approved after re-reading the draft; the
        // request button relabels to "Update feedback" to signal
        // that clicking again edits the existing note rather
        // than starting a fresh request.
        approveDisabled: false, approveLabel: 'Approve',
        requestDisabled: false, requestLabel: 'Update feedback'
      }
    }

    function applyActionState (statusKey) {
      var conf = ACTION_STATE_BY_STATUS[statusKey] || ACTION_STATE_BY_STATUS.not_reviewed
      if (els.approveBtn) {
        els.approveBtn.disabled   = conf.approveDisabled
        els.approveBtn.textContent = conf.approveLabel
      }
      if (els.requestBtn) {
        els.requestBtn.disabled   = conf.requestDisabled
        els.requestBtn.textContent = conf.requestLabel
      }
    }

    function applyCompletedState (isComplete) {
      // Toggle visibility of the whole "review this draft" surface
      // vs. the "all done" summary. Hide the confirmation trigger
      // too — after Approve all, there's nothing more to batch.
      toggleHidden(els.body,       isComplete)
      toggleHidden(els.actionsRow, isComplete)
      toggleHidden(els.batchRow,   isComplete)
      toggleHidden(els.completed, !isComplete)
    }

    function toggleHidden (el, shouldHide) {
      if (!el) return
      if (shouldHide) el.setAttribute('hidden', '')
      else            el.removeAttribute('hidden')
    }

    function scrollReviewIntoView () {
      if (typeof reviewRoot.scrollIntoView !== 'function') return
      try {
        reviewRoot.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      } catch (e) {
        // Older browsers: scrollIntoView doesn't accept options.
        reviewRoot.scrollIntoView()
      }
    }

    // ── Event wiring ─────────────────────────────────────────
    // Prev / Next.
    if (els.prevBtn) els.prevBtn.addEventListener('click', function () {
      setSelected(neighborId(-1), 'review')
    })
    if (els.nextBtn) els.nextBtn.addEventListener('click', function () {
      setSelected(neighborId(1), 'review')
    })

    // Approve.
    if (els.approveBtn) els.approveBtn.addEventListener('click', function () {
      if (els.approveBtn.disabled) return
      setReview(state.selectedId, { status: 'approved' })
    })

    // Request changes → open inline feedback form.
    if (els.requestBtn) els.requestBtn.addEventListener('click', function () {
      openFeedbackForm()
    })

    // Feedback form save / cancel.
    if (els.feedbackSave) els.feedbackSave.addEventListener('click', function () {
      var val = els.feedbackInput ? els.feedbackInput.value : ''
      setReview(state.selectedId, {
        status: 'changes_requested',
        feedback: (val || '').trim() || undefined
      })
      closeFeedbackForm()
    })
    if (els.feedbackCancel) els.feedbackCancel.addEventListener('click', function () {
      closeFeedbackForm()
    })

    function openFeedbackForm () {
      if (!els.feedback) return
      // Pre-fill with any saved feedback for THIS prospect so the
      // seller can edit instead of retyping.
      var existing = state.reviews[state.selectedId] && state.reviews[state.selectedId].feedback
      if (els.feedbackInput) els.feedbackInput.value = existing || ''
      els.feedback.removeAttribute('hidden')
      if (els.feedbackInput) els.feedbackInput.focus()
    }
    function closeFeedbackForm () {
      if (!els.feedback) return
      els.feedback.setAttribute('hidden', '')
      // Return focus to the trigger for keyboard users.
      if (els.requestBtn) els.requestBtn.focus()
    }

    // Approve all → dialog.
    if (els.approveAllBtn) els.approveAllBtn.addEventListener('click', function () {
      openDialog(els.approveAllBtn)
    })

    // ── Confirmation dialog ─────────────────────────────────
    // Focus-trap keyboard handler is created per-open so the
    // listener can be cleanly removed on close (avoiding stale
    // handlers if the dialog is opened / closed repeatedly).
    var lastFocused = null
    var trapHandler = null

    function openDialog (returnFocusTo) {
      if (!dialogEls.dialog || !dialogEls.backdrop) return
      lastFocused = returnFocusTo || document.activeElement
      dialogEls.dialog.removeAttribute('hidden')
      dialogEls.dialog.classList.add(DIALOG_OPEN_CLASS)
      dialogEls.backdrop.removeAttribute('hidden')
      dialogEls.backdrop.classList.add(DIALOG_OPEN_CLASS)
      // Default focus lands on the confirm button (primary action).
      // Wrapped in setTimeout(0) so the browser's own default-focus
      // logic doesn't compete on the same tick.
      setTimeout(function () {
        if (dialogEls.confirm) dialogEls.confirm.focus()
      }, 0)
      trapHandler = createTrapHandler(dialogEls.dialog, closeDialog)
      document.addEventListener('keydown', trapHandler)
    }

    function closeDialog () {
      if (!dialogEls.dialog || !dialogEls.backdrop) return
      dialogEls.dialog.setAttribute('hidden', '')
      dialogEls.dialog.classList.remove(DIALOG_OPEN_CLASS)
      dialogEls.backdrop.setAttribute('hidden', '')
      dialogEls.backdrop.classList.remove(DIALOG_OPEN_CLASS)
      if (trapHandler) {
        document.removeEventListener('keydown', trapHandler)
        trapHandler = null
      }
      // Restore focus to whatever triggered the open (spec:
      // "focus returns to Approve all when closed").
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus()
      lastFocused = null
    }

    if (dialogEls.confirm) dialogEls.confirm.addEventListener('click', function () {
      approveAll()
      closeDialog()
    })
    if (dialogEls.cancel) dialogEls.cancel.addEventListener('click', closeDialog)
    if (dialogEls.close)  dialogEls.close.addEventListener('click', closeDialog)
    if (dialogEls.backdrop) dialogEls.backdrop.addEventListener('click', closeDialog)

    // Subscribe to selection events from the table.
    document.addEventListener(EVT_ROW_SELECT, function (event) {
      var d = event.detail || {}
      if (!d.rowId) return
      // Ignore self-fired events (source: 'review') — the mutation
      // that produced them has already updated internal state.
      if (d.source === 'review') return
      setSelected(d.rowId, 'table')
    })

    // Initial render — populates the SSR panel with the same
    // prospect the shell already rendered, but ALSO wires up
    // status / action-button state / progress counters that
    // depend on JS-owned review state.
    render()
  }

  // Build a { id: prospectRecord } index by scanning every
  // conversation's messages for a `table.rows` array. Returns
  // records only for ids in the `wantedIds` set — a light guard
  // that keeps the index bounded to the review's roster.
  function buildProspectIndex (convMap, wantedIds) {
    var index = Object.create(null)
    var wanted = Object.create(null)
    for (var i = 0; i < wantedIds.length; i++) wanted[wantedIds[i]] = true
    if (!convMap) return index
    for (var convId in convMap) {
      var conv = convMap[convId]
      var messages = (conv && conv.messages) || []
      for (var m = 0; m < messages.length; m++) {
        var msg = messages[m]
        var rows = msg && msg.table && msg.table.rows
        if (!rows || !rows.length) continue
        for (var r = 0; r < rows.length; r++) {
          var row = rows[r]
          if (row && row.id && wanted[row.id]) index[row.id] = row
        }
      }
    }
    return index
  }

  // Read the status-label/modifier map serialized alongside the
  // review shell. Falls back to a sensible built-in default so the
  // review still renders if the script tag is missing (e.g. a
  // future template regression).
  function readStatusMap (reviewId) {
    var fallback = {
      not_reviewed:        { label: 'Not reviewed',      modifier: 'not-reviewed' },
      approved:            { label: 'Approved',          modifier: 'approved' },
      changes_requested:   { label: 'Changes requested', modifier: 'changes-requested' }
    }
    var selector = '[data-sh-review-statuses="' + reviewId + '"]'
    var node = document.querySelector(selector)
    if (!node) return fallback
    try {
      return JSON.parse(node.textContent) || fallback
    } catch (e) {
      return fallback
    }
  }

  // Human-readable channel labels. Kept in JS (not the JSON) so
  // localization can hook in centrally later.
  function channelLabel (channel) {
    switch (channel) {
      case 'linkedin': return 'LinkedIn'
      case 'phone':    return 'Phone'
      case 'sms':      return 'SMS'
      default:         return 'Email'
    }
  }

  // Focus-trap keydown handler. Cycles Tab focus between the
  // dialog's focusable descendants; Escape closes.
  function createTrapHandler (container, onEscape) {
    return function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault()
        onEscape()
        return
      }
      if (e.key !== 'Tab') return
      var focusables = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return
      var first = focusables[0]
      var last  = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Workflow-details side panel
  // ──────────────────────────────────────────────────────────────
  // Owns:
  //   • Close / re-open + `localStorage` persistence of the
  //     collapsed state per workflow.
  //   • Activity-item click → smooth scroll to the run's message
  //     in the feed, transient `.is-highlighted` pulse on the
  //     target article, and programmatic focus so screen-reader
  //     users hear the right context.
  //   • Client-side filtering of the activity list by status +
  //     date range (mock-level; a live implementation would
  //     replace this with a backend query).
  //   • Retry button on failed runs → dispatches
  //     `sh:workflow-action { action:'retry', workflowId, runId }`
  //     — same event contract the Scheduled row overflow menu
  //     uses so a single listener can handle both surfaces.
  //   • Dedicated dropdown for the panel's own overflow menu
  //     (kept independent from the Scheduled list's controller,
  //     which scopes to a different DOM subtree).
  //
  // NOT owned:
  //   • Message content — the thread renders itself. The panel
  //     just anchors into it.
  //   • Recents highlight — already handled by `applyActiveRecent`
  //     upstream via `?id=`.
  function bindWorkflowSidePanel (panel) {
    if (!panel) return

    var workflowId = panel.getAttribute('data-sh-workflow-panel-id') || ''
    var layout = panel.closest('[data-sh-conv-layout]')
    var storageKey = 'sh:convPanel:' + workflowId
    var HIGHLIGHT_MS = 1800

    // ── Collapse / re-open ───────────────────────────────────
    // Persisted collapsed state is read by `switchPanel` at boot
    // (it knows which panel is the ACTIVE one for the current
    // conversation) — this binder only owns the Close-button
    // toggle + Escape-key dismiss.

    var closeBtn = panel.querySelector('[data-sh-workflow-panel-close]')
    if (closeBtn && layout) {
      closeBtn.addEventListener('click', function () {
        layout.classList.add('is-panel-collapsed')
        try {
          if (window.localStorage) window.localStorage.setItem(storageKey, 'collapsed')
        } catch (e) { /* no-op */ }
        // Focus falls back to the conversation main region so
        // keyboard users don't get stranded on a hidden control.
        var main = document.querySelector('.seller-home__conv')
        if (main && typeof main.focus === 'function') main.focus()
      })
    }

    // Escape while focus is inside the panel collapses it — same
    // affordance the SLDS docked panels use. Focus lands on the
    // conversation main region after collapse.
    panel.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' && event.key !== 'Esc') return
      // If a menu is open, let its own handler take Escape first.
      var openMenu = panel.querySelector('[data-sh-workflow-panel-menu-list]:not([hidden])')
      if (openMenu) return
      if (!layout || layout.classList.contains('is-panel-collapsed')) return
      event.preventDefault()
      layout.classList.add('is-panel-collapsed')
      try {
        if (window.localStorage) window.localStorage.setItem(storageKey, 'collapsed')
      } catch (e) { /* no-op */ }
      var main = document.querySelector('.seller-home__conv')
      if (main && typeof main.focus === 'function') main.focus()
    })

    // ── Overflow menu ────────────────────────────────────────
    // Self-contained dropdown. Toggles `hidden` on the menu list
    // and `aria-expanded` on the trigger; closes on outside
    // click / Escape.
    var menuTrigger = panel.querySelector('[data-sh-workflow-panel-menu-trigger]')
    var menuList = panel.querySelector('[data-sh-workflow-panel-menu-list]')
    if (menuTrigger && menuList) {
      var setMenuOpen = function (open) {
        menuList.hidden = !open
        menuTrigger.setAttribute('aria-expanded', open ? 'true' : 'false')
      }

      menuTrigger.addEventListener('click', function (event) {
        event.stopPropagation()
        var currentlyOpen = menuTrigger.getAttribute('aria-expanded') === 'true'
        setMenuOpen(!currentlyOpen)
        if (!currentlyOpen) {
          // Move focus to the first menu item so keyboard users
          // can immediately Arrow through the actions.
          var firstItem = menuList.querySelector('[data-sh-workflow-panel-action]')
          if (firstItem && typeof firstItem.focus === 'function') {
            setTimeout(function () { firstItem.focus() }, 0)
          }
        }
      })

      // Outside-click dismiss.
      document.addEventListener('click', function (event) {
        if (menuList.hidden) return
        if (event.target && menuTrigger.parentNode && menuTrigger.parentNode.contains(event.target)) return
        setMenuOpen(false)
      })

      // Escape closes the menu specifically (before the panel's
      // own Escape handler collapses the whole panel).
      menuList.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape' && event.key !== 'Esc') return
        event.stopPropagation()
        setMenuOpen(false)
        menuTrigger.focus()
      })

      // Menu items dispatch `sh:workflow-action` so listeners
      // wired for the Scheduled overflow (or a future consumer)
      // can react without needing a reference to this controller.
      var menuItems = menuList.querySelectorAll('[data-sh-workflow-panel-action]')
      for (var m = 0; m < menuItems.length; m++) {
        menuItems[m].addEventListener('click', function (event) {
          var actionId = event.currentTarget.getAttribute('data-sh-workflow-panel-action')
          dispatch(panel, 'sh:workflow-action', {
            action: actionId,
            workflowId: workflowId,
            source: 'panel-overflow'
          })
          setMenuOpen(false)
          menuTrigger.focus()
        })
      }
    }

    // ── Assistive announce + inline error slots ──────────────
    // The panel carries a single `role="status" aria-live="polite"`
    // region for AT announcements (e.g., "Loaded August 7 output")
    // and a `role="alert"` slot for non-destructive failures.
    // Both are addressed only through the helpers below so future
    // callers don't have to know the DOM shape.
    var announceEl = panel.querySelector('[data-sh-workflow-panel-announce]')
    var errorEl = panel.querySelector('[data-sh-workflow-panel-error]')
    var errorTextEl = panel.querySelector('[data-sh-workflow-panel-error-text]')
    var errorDismissEl = panel.querySelector('[data-sh-workflow-panel-error-dismiss]')
    var errorTimeoutId = 0
    var highlightTimeoutId = 0
    var highlightTargetEl = null
    var ERROR_TIMEOUT_MS = 6000

    function announce (text) {
      if (!announceEl) return
      // Blank + set on the next frame retriggers the live region
      // for repeat announcements (SR readers won't re-read a
      // region that's assigned the same string twice in a row).
      announceEl.textContent = ''
      requestAnimationFrame(function () { announceEl.textContent = text })
    }

    function showError (text) {
      if (!errorEl || !errorTextEl) return
      errorTextEl.textContent = text
      errorEl.hidden = false
      if (errorTimeoutId) window.clearTimeout(errorTimeoutId)
      errorTimeoutId = window.setTimeout(hideError, ERROR_TIMEOUT_MS)
    }

    function hideError () {
      if (errorEl) errorEl.hidden = true
      if (errorTimeoutId) {
        window.clearTimeout(errorTimeoutId)
        errorTimeoutId = 0
      }
    }

    if (errorDismissEl) errorDismissEl.addEventListener('click', hideError)

    // ── Activity-item click → scroll-to-message ─────────────
    // Each completed run tile is an `<a href="#msg-…">`. Native
    // anchor semantics stay intact (Cmd/middle-click still opens
    // in a new tab; keyboard Enter fires this handler + follows
    // the link). The controller intercepts pointer activation to
    // run smooth-scroll + highlight + announcement.
    //
    // Behavior split across three helpers:
    //   • `scrollToTarget(el)` — smooth or reduced-motion scroll,
    //     honors `scroll-margin-block-start` from CSS.
    //   • `highlightTarget(el)` — transient `.is-highlighted`;
    //     retriggerable on repeated selection by clearing the
    //     pending removal timeout.
    //   • `selectAnchor(anchor)` — updates `.is-selected` on the
    //     matching Activity tile; clears any previously selected
    //     tile so only one is ever "current".
    //
    // `selectRun(anchor, options)` orchestrates all three plus
    // the announcement and URL-hash bookkeeping so both the
    // click path and the initial-hash path share one code path.
    var runAnchors = panel.querySelectorAll('a[data-sh-workflow-panel-run-target]')
    for (var a = 0; a < runAnchors.length; a++) {
      runAnchors[a].addEventListener('click', function (event) {
        // Respect open-in-new-tab intent — let the browser handle
        // modified clicks natively.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        if (event.button !== 0) return
        event.preventDefault()
        selectRun(event.currentTarget, { updateHash: true })
      })
    }

    // ── Initial selected state ──────────────────────────────
    // `.is-selected` on the first completed tile is baked in by
    // Nunjucks (`loop.first`), but if the URL loads with a
    // specific `#msg-…` hash, promote the matching tile instead
    // so the panel + feed agree on what "current" means.
    var hashId = window.location.hash ? window.location.hash.slice(1) : ''
    if (hashId) {
      var matchAnchor = panel.querySelector('a[data-sh-workflow-panel-run-target="' + hashId + '"]')
      if (matchAnchor) {
        // Delay one frame so the browser's own scroll restoration
        // finishes before we override it. Skip the URL-hash push
        // — the hash is already correct.
        requestAnimationFrame(function () {
          selectRun(matchAnchor, { updateHash: false, silent: false })
        })
      }
    }

    function selectRun (anchor, options) {
      options = options || {}
      var targetId = anchor.getAttribute('data-sh-workflow-panel-run-target')
      var runId = anchor.getAttribute('data-sh-workflow-panel-run')
      var runLabel = anchor.querySelector('.seller-home__conv-side-run-timestamp')
      var runLabelText = runLabel ? runLabel.textContent.trim() : (runId || 'run')

      // Always update selection + hash + hide any prior error
      // regardless of whether the target message resolves —
      // otherwise a stale selection lingers on a broken tile.
      selectAnchor(anchor)
      hideError()

      var targetEl = targetId ? document.getElementById(targetId) : null

      // ── Target present ──
      if (targetEl) {
        // Update URL hash so Back returns to the previous run.
        // `replaceState` for the same-hash case avoids growing
        // the history stack on repeated clicks of the current
        // selection; `pushState` otherwise so Back is meaningful.
        if (options.updateHash) {
          var currentHash = window.location.hash
          var nextHash = '#' + targetId
          if (currentHash === nextHash) {
            window.history.replaceState({}, '', nextHash)
          } else {
            window.history.pushState({}, '', nextHash)
          }
        }
        scrollToTarget(targetEl)
        highlightTarget(targetEl)
        if (!options.silent) {
          announce('Loaded ' + runLabelText + ' output.')
        }
        return
      }

      // ── Target missing ──
      // Prototype note: in this project every seeded run's
      // messageId maps to a rendered `<article>`; this branch
      // exists so a real backend that fetches messages
      // asynchronously can flip to "load required range, then
      // retry" without changing the caller.
      showError('That output isn\u2019t available right now. Try again in a moment.')
      announce('Output for ' + runLabelText + ' isn\u2019t available.')
    }

    function scrollToTarget (el) {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      try {
        el.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'start'
        })
      } catch (e) {
        el.scrollIntoView()
      }
      // Move focus programmatically so keyboard + SR users get a
      // clear anchor. `tabindex="-1"` on the article makes it a
      // valid focus target without adding a natural tab stop.
      // `preventScroll: true` stops the browser from re-scrolling
      // on focus (double-jump avoidance).
      if (typeof el.focus === 'function') {
        // Delay one tick so the smooth scroll starts before focus
        // fires — some browsers still schedule an implicit scroll
        // on focus in the same frame as scrollIntoView.
        setTimeout(function () {
          try { el.focus({ preventScroll: true }) }
          catch (e) { el.focus() }
        }, 0)
      }
    }

    function highlightTarget (el) {
      // Repeated selection support: if a prior highlight is still
      // pending, clear its removal timeout and any lingering
      // class on a DIFFERENT article so only the current target
      // is highlighted at any moment.
      if (highlightTimeoutId) {
        window.clearTimeout(highlightTimeoutId)
        highlightTimeoutId = 0
      }
      if (highlightTargetEl && highlightTargetEl !== el) {
        highlightTargetEl.classList.remove('is-highlighted')
      }
      // Retrigger the transition even if the same target is
      // clicked twice: remove, force a reflow, then re-add. The
      // reflow read (`offsetWidth`) makes the browser flush the
      // "class removed" state before the next class-add so the
      // background transition replays.
      el.classList.remove('is-highlighted')
      /* eslint-disable-next-line no-unused-expressions */
      el.offsetWidth
      el.classList.add('is-highlighted')
      highlightTargetEl = el
      highlightTimeoutId = window.setTimeout(function () {
        el.classList.remove('is-highlighted')
        highlightTimeoutId = 0
        highlightTargetEl = null
      }, HIGHLIGHT_MS)
    }

    function selectAnchor (anchor) {
      var selected = panel.querySelectorAll('[data-sh-workflow-panel-run].is-selected')
      for (var i = 0; i < selected.length; i++) selected[i].classList.remove('is-selected')
      anchor.classList.add('is-selected')
      anchor.setAttribute('aria-current', 'true')
    }

    // ── Retry button ────────────────────────────────────────
    // Failed-run tile action. Prevents duplicate retries while a
    // request is pending (per-run gate). Dispatches
    // `sh:workflow-action { action:'retry', ... }` as a
    // *cancelable* CustomEvent — a live backend can call
    // `event.preventDefault()` on its listener and drive the real
    // retry itself. If no listener cancels (prototype path), the
    // controller runs a local mock: swap the button text to
    // "Retrying\u2026", wait 2 s, restore, and announce completion.
    // The announcement + button text both make the local-mock
    // status explicit so nothing implies remote persistence.
    var retryPending = {}
    var RETRY_MOCK_MS = 2000

    var retryBtns = panel.querySelectorAll('[data-sh-workflow-panel-run-retry]')
    for (var rb = 0; rb < retryBtns.length; rb++) {
      retryBtns[rb].addEventListener('click', function (event) {
        var btn = event.currentTarget
        var runId = btn.getAttribute('data-sh-workflow-panel-run-retry') || ''
        if (retryPending[runId]) return   // duplicate-click guard
        retryPending[runId] = true

        var originalLabel = btn.textContent
        btn.disabled = true
        btn.setAttribute('aria-busy', 'true')
        btn.textContent = 'Retrying\u2026'

        // Cancelable so a live implementation can opt out of the
        // local mock. Built inline (instead of via `dispatch()`)
        // because that helper doesn't expose the created event.
        var evt = null
        try {
          evt = new CustomEvent('sh:workflow-action', {
            bubbles: true,
            cancelable: true,
            detail: {
              action: 'retry',
              workflowId: workflowId,
              runId: runId,
              source: 'panel-retry'
            }
          })
          panel.dispatchEvent(evt)
        } catch (e) { /* legacy browser: no-op */ }

        var handledLive = evt && evt.defaultPrevented
        if (handledLive) {
          // Live handler took ownership — clear the pending
          // guard immediately; the real backend will drive
          // completion via its own UI updates.
          retryPending[runId] = false
          btn.disabled = false
          btn.removeAttribute('aria-busy')
          btn.textContent = originalLabel
          return
        }

        // Local mock path.
        announce('Retry started for ' + runId + ' (local prototype).')
        window.setTimeout(function () {
          retryPending[runId] = false
          btn.disabled = false
          btn.removeAttribute('aria-busy')
          btn.textContent = originalLabel
          announce('Retry finished (local prototype).')
        }, RETRY_MOCK_MS)
      })
    }

    // ── Filters ─────────────────────────────────────────────
    // Client-side filtering. Reads the two select values, walks
    // each run item, and toggles `hidden` based on the run's
    // `data-sh-workflow-panel-run-status` (against Status filter)
    // and `data-sh-workflow-panel-run-started-at` (against Date
    // range filter).
    var statusFilter = panel.querySelector('[data-sh-workflow-panel-filter="status"]')
    var rangeFilter  = panel.querySelector('[data-sh-workflow-panel-filter="range"]')
    var runItems = panel.querySelectorAll('[data-sh-workflow-panel-run-item]')

    function applyFilters () {
      var statusVal = statusFilter ? statusFilter.value : 'all'
      var rangeVal  = rangeFilter  ? rangeFilter.value  : 'last_30_days'
      var now = Date.now()
      var msPerDay = 24 * 60 * 60 * 1000
      var rangeMs = rangeVal === 'today' ? msPerDay
        : rangeVal === 'last_7_days' ? 7 * msPerDay
        : rangeVal === 'last_30_days' ? 30 * msPerDay
        : Infinity

      for (var i = 0; i < runItems.length; i++) {
        var item = runItems[i]
        var status = item.getAttribute('data-sh-workflow-panel-run-status') || ''
        var startedAtRaw = item.getAttribute('data-sh-workflow-panel-run-started-at') || ''
        var startedAt = startedAtRaw ? Date.parse(startedAtRaw) : NaN

        var statusMatch = statusVal === 'all' || status === statusVal
        var rangeMatch = !isFinite(rangeMs) || isNaN(startedAt) || (now - startedAt) <= rangeMs

        if (statusMatch && rangeMatch) item.removeAttribute('hidden')
        else item.setAttribute('hidden', '')
      }
    }

    if (statusFilter) statusFilter.addEventListener('change', applyFilters)
    if (rangeFilter)  rangeFilter.addEventListener('change', applyFilters)
  }

  // ── Reopen-panel button (conversation header) ────────────────────
  // The workflow side panel is closable from its own header's ✕
  // button, but once closed there's no obvious way to bring it
  // back. This handler wires the right-side icon button in the
  // conversation header to reopen the currently-active workflow
  // panel.
  //
  // Behaviour:
  //   1. Removes `is-panel-collapsed` from the layout so the panel
  //      slides back in via the same transition used to close it.
  //   2. Clears the per-workflow localStorage preference so the
  //      panel stays open on subsequent visits — the user
  //      explicitly asked to see it, so the "collapsed by default"
  //      preference has been superseded.
  //   3. Moves focus to a natural target inside the panel — the
  //      Close (✕) button — so keyboard users can immediately
  //      close it again, and screen readers hear a labelled
  //      control inside the newly-visible region.
  //
  // The button's visibility is CSS-controlled (see
  // `home_conversation.scss`) — the JS never has to hide/show it
  // manually. It only reacts when the user activates it.
  function bindReopenPanel () {
    var btn = document.querySelector('[data-sh-conv-header-reopen]')
    if (!btn) return
    btn.addEventListener('click', function () {
      var layout = document.querySelector('[data-sh-conv-layout]')
      if (!layout) return
      var wfId = layout.getAttribute('data-sh-conv-workflow-id') || ''
      if (!wfId) return   // defensive — CSS should have hidden the button

      layout.classList.remove('is-panel-collapsed')

      // The panel controller (`bindWorkflowSidePanel`) persists
      // `collapsed` when the user closes the panel; clear that so
      // reopening sticks across reloads.
      try {
        if (window.localStorage) window.localStorage.removeItem('sh:convPanel:' + wfId)
      } catch (e) { /* no-op */ }

      // Focus the visible panel's Close button — it's the first
      // labelled control inside the newly-shown region.
      var panel = document.querySelector('[data-sh-workflow-panel]:not([hidden])')
      var close = panel && panel.querySelector('[data-sh-workflow-panel-close]')
      if (close && typeof close.focus === 'function') {
        // Delay one tick so any layout-transition class change
        // above doesn't intercept the focus move.
        setTimeout(function () { close.focus() }, 0)
      }
    })
  }

  // ── Follow-up composer ──────────────────────────────────────────
  // Reuses the existing composer chrome (border, icons, submit
  // button) from the Prospect Outreach Review conversation — the
  // wiring here just adds submit + autosize + persistence.
  //
  // Responsibilities:
  //   1. Autosize the textarea as the user types (bounded max).
  //   2. Enable / disable the send button based on trimmed input.
  //   3. Handle submit (form event + Enter without Shift) — append
  //      a user message to the ACTIVE thread, show a transient
  //      "thinking" placeholder, call the mock responder, and swap
  //      the placeholder for an agent message when it resolves.
  //   4. Persist follow-ups to `localStorage["sh:convFollowups:<id>"]`
  //      so a page refresh keeps the thread continuous inside the
  //      same conversation (prototype-only; a real service will
  //      persist server-side).
  //   5. Hydrate persisted follow-ups on boot so the seeded feed
  //      grows across sessions.
  //   6. Show inline error + Retry on responder failure. The mock
  //      never fails in the prototype, but the pattern is wired so
  //      a live service swap needs no UI change.
  //
  // Explicitly NOT owned:
  //   • Activity list — follow-ups are conversation turns, not
  //     scheduled runs. They never touch the workflow side panel.
  //   • Response content — the mock responder is the isolated
  //     source; this binder only knows how to render a `{ text }`
  //     into an agent-message article.
  function bindComposer (form, activeConvId, conversationsMap, draftEnvelope) {
    if (!form) return
    // Contenteditable div (was <textarea>). Keeping the variable
    // name `textarea` would be misleading — `input` reads correctly
    // regardless of the underlying element type.
    var input   = form.querySelector('[data-sh-conv-composer-input]')
                  || form.querySelector('.seller-home__conv-composer-textarea')
    var sendBtn = form.querySelector('.seller-home__conv-composer-send')
    if (!input || !sendBtn) return

    var STORAGE_PREFIX = 'sh:convFollowups:'
    var PENDING_CLASS = 'is-pending'
    var pendingSubmit = false       // guards against double-submit while a
                                    // mock response is in flight

    // Scheduling draft? Presence of a draft envelope with a
    // recognised sourceType flips the responder branch inside the
    // submit handler so scheduling turns don't route through the
    // generic mock. `sourceSkillId` is stamped on the root by init
    // and passed to the responder for context.
    var draftSourceType = draftEnvelope
      ? String(draftEnvelope.sourceType || '') : ''
    var isSchedulingDraft = draftSourceType === 'skill-scheduling'

    // ── Autosize ─────────────────────────────────────────────────
    // Legacy hook. Contenteditable grows naturally (CSS max-height
    // + overflow-y handles the cap), so this is now a no-op. Kept
    // for callers below that were written against the <textarea>
    // era — removing the calls would clutter the diff without
    // changing behaviour.
    function autosize () { /* no-op: contenteditable auto-grows */ }

    // ── Value read / write / clear ───────────────────────────────
    // `getFreeText()` returns just the seller's typed text — pill
    // chips are extracted separately by `getPillRefs()`. Splitting
    // the two lets us send free-text to the responder while still
    // rendering the pill(s) in the seller's outgoing message.
    function isPillEl (node) {
      return node
        && node.nodeType === 1
        && node.classList
        && node.classList.contains('seller-home__conv-composer-pill')
    }

    function getFreeText () {
      // Walk children in order and concatenate text nodes; skip
      // pill wrappers so their labels don't leak into the free
      // text. `<br>` becomes '\n' (matches how a textarea would
      // serialize Shift+Enter breaks).
      var out = ''
      for (var i = 0; i < input.childNodes.length; i++) {
        var n = input.childNodes[i]
        if (n.nodeType === 3) {
          out += n.nodeValue
        } else if (n.nodeType === 1) {
          if (isPillEl(n)) continue
          if (n.tagName === 'BR') { out += '\n'; continue }
          // Any other inline formatting (bold, italics, etc.) that
          // browsers occasionally inject on paste — grab the text
          // content and treat it as plain text.
          out += n.textContent || ''
        }
      }
      return out.replace(/\u00A0/g, ' ').replace(/\r/g, '')
    }

    function getPillRefs () {
      var out = []
      var pills = input.querySelectorAll('.seller-home__conv-composer-pill')
      for (var i = 0; i < pills.length; i++) {
        out.push({
          skillId: pills[i].getAttribute('data-skill-id') || '',
          name:    pills[i].getAttribute('data-skill-name') || (pills[i].querySelector('.seller-home__conv-composer-pill-label') || {}).textContent || ''
        })
      }
      return out
    }

    // Ordered serialisation of the composer contents into
    // `[{ type: 'text' | 'pill', ... }]`. Preserves the seller's
    // arrangement — a pill mid-sentence renders mid-sentence in the
    // outgoing message. `getFreeText` / `getPillRefs` above stay as
    // convenience accessors for callers that only need one half.
    function getComposerSegments () {
      var out = []
      for (var i = 0; i < input.childNodes.length; i++) {
        var n = input.childNodes[i]
        if (n.nodeType === 3 /* text */) {
          if (n.nodeValue) out.push({ type: 'text', value: n.nodeValue })
        } else if (n.nodeType === 1 /* element */) {
          if (isPillEl(n)) {
            out.push({
              type:    'pill',
              skillId: n.getAttribute('data-skill-id') || '',
              name:    n.getAttribute('data-skill-name') || ''
            })
          } else if (n.tagName === 'BR') {
            out.push({ type: 'text', value: '\n' })
          } else {
            var t = n.textContent || ''
            if (t) out.push({ type: 'text', value: t })
          }
        }
      }
      return out
    }

    function clearComposerContent () {
      // innerHTML is the fastest way to drop pills + text +
      // any browser-injected <br>s in a single teardown.
      input.innerHTML = ''
      refreshEmptyState()
    }

    function refreshEmptyState () {
      // Treat "no pills AND no non-whitespace text" as empty. A
      // stray browser-injected <br> is caught by getFreeText's
      // trim below.
      var hasPill = !!input.querySelector('.seller-home__conv-composer-pill')
      var hasText = getFreeText().trim().length > 0
      if (hasPill || hasText) input.classList.remove('is-empty')
      else input.classList.add('is-empty')
    }

    function updateSendState () {
      var hasPill = !!input.querySelector('.seller-home__conv-composer-pill')
      var hasText = getFreeText().trim().length > 0
      // Enable Send if there's either free text OR a pill. A
      // pill-only submit is legal — it says "please schedule this"
      // without additional commentary — and the responder happily
      // treats empty text as the opener.
      sendBtn.disabled = pendingSubmit || !(hasPill || hasText)
    }

    input.addEventListener('input', function () {
      refreshEmptyState()
      updateSendState()
    })

    // ── Keyboard submission ─────────────────────────────────────
    // Enter (no modifiers) fires submit; Shift+Enter inserts a
    // newline. Preserves the composer pattern used elsewhere in
    // the app.
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        if (!sendBtn.disabled) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }))
        return
      }
      if (event.key === 'Enter' && event.shiftKey) {
        // Insert a real newline (contenteditable's default would
        // wrap the caret in a <div>, which trashes the visual
        // rhythm and breaks getFreeText's <br> → '\n' pass).
        event.preventDefault()
        insertPlainText('\n')
        refreshEmptyState()
        updateSendState()
        return
      }

      // ── Pill removal via keyboard ──────────────────────────────
      // Backspace / Delete on a caret adjacent to a pill removes
      // the pill in one press. Browsers handle contenteditable=false
      // deletion inconsistently (Chromium removes on first press,
      // Firefox / Safari sometimes select-first-then-delete), so we
      // intercept to guarantee predictable behaviour.
      var isBackspace = event.key === 'Backspace' && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey
      var isDelete    = event.key === 'Delete'    && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey
      if (isBackspace || isDelete) {
        var pill = findAdjacentPill(isBackspace ? -1 : 1)
        if (pill) {
          event.preventDefault()
          removePillPreserveCaret(pill)
          refreshEmptyState()
          updateSendState()
        }
      }
    })

    // Force plaintext paste so a copy from a rich source (Notion,
    // Google Docs) doesn't inject styled markup into the composer.
    input.addEventListener('paste', function (event) {
      if (!event.clipboardData) return
      event.preventDefault()
      var text = event.clipboardData.getData('text/plain') || ''
      insertPlainText(text)
      refreshEmptyState()
      updateSendState()
    })

    // ── Cursor / range helpers ───────────────────────────────────
    function insertPlainText (text) {
      var sel = window.getSelection ? window.getSelection() : null
      if (!sel || !sel.rangeCount) {
        input.appendChild(document.createTextNode(text))
        caretToEnd()
        return
      }
      var range = sel.getRangeAt(0)
      if (!input.contains(range.commonAncestorContainer)) {
        input.appendChild(document.createTextNode(text))
        caretToEnd()
        return
      }
      range.deleteContents()
      var node = document.createTextNode(text)
      range.insertNode(node)
      range.setStartAfter(node)
      range.setEndAfter(node)
      sel.removeAllRanges()
      sel.addRange(range)
    }

    function caretToEnd () {
      try {
        input.focus()
        var sel = window.getSelection()
        var range = document.createRange()
        range.selectNodeContents(input)
        range.collapse(false)  // false = collapse to END
        sel.removeAllRanges()
        sel.addRange(range)
      } catch (_e) { /* older browsers: focus-only fallback */ }
    }

    // ── Pill construction / insertion ────────────────────────────
    // Inline SVG geometry re-uses the exact same paths as the skill
    // chip icon so the composer's pill glyph and the on-page skill
    // chips stay visually identical (single source of truth for the
    // "skills" iconography).
    var PILL_ICON_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" class="seller-home__conv-composer-pill-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">' +
        '<g transform="translate(0.616 0.9232)">' +
          '<path fill-rule="evenodd" clip-rule="evenodd" d="M11.4591 0C12.434 0 13.2409 0.758083 13.3017 1.73107L13.8242 10.0922H13.8462C14.3702 10.0922 14.7692 10.5235 14.7692 11.0231V12.277C14.7692 13.2992 13.9569 14.1538 12.9231 14.1538H5.23077V14.153C5.21938 14.1532 5.20797 14.1538 5.19652 14.1538C4.19111 14.1538 3.39997 13.3304 3.38523 12.3402L2.92969 4.61538H0.923077C0.413277 4.61538 0 4.20212 0 3.69231V1.84615C0 0.826551 0.826551 0 1.84615 0H11.4591ZM7.0084 12.3119C7.0084 12.5253 6.97191 12.731 6.90535 12.9231H12.9231C13.2487 12.9231 13.5384 12.6482 13.5385 12.277V11.323H7.0084V12.3119ZM3.88643 1.23077C3.95646 1.42473 3.99597 1.63301 3.99911 1.84916L4.61418 12.2758L4.61538 12.2939V12.3119C4.61538 12.6638 4.88978 12.923 5.19652 12.9231C5.50326 12.9231 5.77763 12.6638 5.77763 12.3119V11.0231C5.77763 10.5235 6.17674 10.0923 6.70071 10.0922H12.591L12.0733 1.80769C12.053 1.4834 11.7841 1.23077 11.4591 1.23077H3.88643ZM1.84615 1.23077C1.50629 1.23077 1.23077 1.50629 1.23077 1.84615V3.38462H2.85726L2.77043 1.91316L2.76923 1.89513V1.8768C2.76917 1.50559 2.47945 1.23077 2.15385 1.23077H1.84615Z"/>' +
        '</g>' +
        '<g transform="translate(5.8464 3.6928)">' +
          '<path d="M2.80839 0.135688C2.89334 -0.0416965 3.14762 -0.0461579 3.23867 0.128181L3.8826 1.36166C4.07491 1.73298 4.3835 2.03049 4.76153 2.2096L6.01722 2.80997C6.19473 2.89483 6.1991 3.14889 6.02473 3.23993L4.79067 3.88387C4.41913 4.07609 4.12131 4.38437 3.94211 4.76218L3.34143 6.01729C3.25651 6.1947 3.00223 6.19917 2.91116 6.0248L2.26691 4.79132C2.07463 4.42006 1.7663 4.12249 1.38833 3.94338L0.135619 3.3427C-0.0416732 3.25778 -0.046135 3.00409 0.128111 2.91304L1.36217 2.2691C1.73371 2.07689 2.03147 1.76535 2.21073 1.3908L2.80839 0.135688Z"/>' +
        '</g>' +
      '</svg>'

    function buildPillNode (ref) {
      // Contenteditable=false makes the entire pill an atomic
      // caret target: arrow keys / selection / Backspace / Delete
      // treat it as one glyph. Removal is driven by keyboard
      // (Backspace / Delete adjacent to the pill) rather than a
      // per-pill × button — matches the mention pattern used by
      // Slack, Notion, and other rich composers.
      var pill = document.createElement('span')
      pill.className = 'seller-home__conv-composer-pill'
      pill.setAttribute('contenteditable', 'false')
      pill.setAttribute('data-sh-conv-pill', '')
      pill.setAttribute('data-skill-id', ref && ref.skillId ? String(ref.skillId) : '')
      pill.setAttribute('data-skill-name', ref && ref.name ? String(ref.name) : '')
      pill.setAttribute('role', 'group')
      pill.setAttribute('aria-label', 'Skill: ' + (ref && ref.name ? String(ref.name) : ''))

      pill.insertAdjacentHTML('beforeend', PILL_ICON_SVG)

      var label = document.createElement('span')
      label.className = 'seller-home__conv-composer-pill-label'
      label.textContent = (ref && ref.name) ? String(ref.name) : ''
      pill.appendChild(label)

      return pill
    }

    // ── Keyboard-driven pill removal ────────────────────────────
    // `findAdjacentPill` walks the caret's neighbourhood: for
    // Backspace (direction=-1) it looks at whatever sits BEFORE
    // the caret; for Delete (direction=+1) it looks AFTER. Handles
    // both "caret inside the input container" (offset = child index)
    // and "caret inside a text node" (offset = char index) cases.
    function findAdjacentPill (direction) {
      var sel = window.getSelection ? window.getSelection() : null
      if (!sel || !sel.rangeCount) return null
      var range = sel.getRangeAt(0)
      if (!range.collapsed) return null
      if (!input.contains(range.startContainer)) return null

      var container = range.startContainer
      var offset = range.startOffset
      var target = null

      if (container === input) {
        var childIdx = direction < 0 ? offset - 1 : offset
        target = input.childNodes[childIdx] || null
      } else if (container.nodeType === 3 /* text */) {
        if (direction < 0 && offset === 0) {
          target = container.previousSibling
        } else if (direction > 0 && offset === container.length) {
          target = container.nextSibling
        }
      }
      return (target && isPillEl(target)) ? target : null
    }

    // Remove the pill and drop the caret back into the position the
    // pill used to occupy. Without an explicit range update the
    // browser can strand the selection inside the detached node.
    function removePillPreserveCaret (pill) {
      var parent = pill.parentNode
      if (!parent) return
      var refNode = pill.previousSibling
      parent.removeChild(pill)
      try {
        var sel = window.getSelection()
        var newRange = document.createRange()
        if (refNode && refNode.nodeType === 3 /* text */) {
          var end = refNode.nodeValue ? refNode.nodeValue.length : 0
          newRange.setStart(refNode, end)
          newRange.setEnd(refNode, end)
        } else if (refNode) {
          newRange.setStartAfter(refNode)
          newRange.setEndAfter(refNode)
        } else {
          newRange.setStart(input, 0)
          newRange.setEnd(input, 0)
        }
        sel.removeAllRanges()
        sel.addRange(newRange)
        input.focus()
      } catch (_e) { /* best-effort caret restore */ }
    }

    function seedComposer (prefix, pills, suffix) {
      // Wipe first so a stale ("stuck") prefill from a prior draft
      // (e.g. a refresh mid-edit) doesn't stack with the new one.
      input.innerHTML = ''
      if (prefix) {
        input.appendChild(document.createTextNode(String(prefix)))
      }
      if (Array.isArray(pills)) {
        for (var i = 0; i < pills.length; i++) {
          input.appendChild(buildPillNode(pills[i]))
        }
      }
      if (suffix) {
        // Suffix sits directly after the pill; the pill's own
        // `margin-right` supplies the visual gap so we don't need
        // an additional space text node (which would stack with
        // the margin and read as a double-space).
        input.appendChild(document.createTextNode(String(suffix)))
      }
      refreshEmptyState()
      updateSendState()
    }

    // ── Hydrate persisted follow-ups ────────────────────────────
    // Read the localStorage bucket for the ACTIVE conversation and
    // append each stored message onto the visible thread. Runs
    // once at boot; the seeded SSR content is untouched.
    if (activeConvId) {
      var stored = readStored(activeConvId)
      for (var i = 0; i < stored.length; i++) {
        appendMessage(stored[i], activeConvId, { persist: false, scroll: false })
      }
    }

    // ── Submit ──────────────────────────────────────────────────
    form.addEventListener('submit', function (event) {
      event.preventDefault()
      if (pendingSubmit) return
      var freeText = getFreeText().trim()
      var pillRefs = getPillRefs()
      // Legal submissions:
      //   • free-text only          — plain follow-up
      //   • pills + free-text       — the Schedule prefill shape
      //   • pills only              — pill-as-message ("run this")
      if (!freeText && pillRefs.length === 0) return

      // Re-read the active conversation id at submit time — if a
      // future in-app nav changes it after boot, submissions still
      // target the current thread.
      var convId = document.querySelector('[data-sh-conv-root]')
      convId = convId ? convId.getAttribute('data-sh-conversation-id') : activeConvId
      if (!convId) return

      pendingSubmit = true
      updateSendState()

      // 1) User message
      // Persist ordered segments (text and pills interleaved) so a
      // re-render on page reload (via `readStored → appendMessage`)
      // rebuilds the seller's exact "text-pill-text-pill" layout —
      // otherwise a mid-sentence mention would collapse or reorder.
      // `text` is kept alongside for accessibility fallbacks + text
      // consumers (announcers, copy-to-clipboard, etc.).
      var segments = getComposerSegments()
      var userMsg = {
        id:       'msg-user-' + Date.now(),
        type:     'user',
        text:     freeText,
        pills:    pillRefs.length ? pillRefs.slice() : null,
        segments: segments.length ? segments : null
      }
      appendMessage(userMsg, convId, { persist: true, scroll: true })

      // Responder input: for scheduling drafts, only the free-text
      // portion matters (the skill is already identified by
      // `sourceSkillId` on the envelope). For the generic mock
      // responder, fall back to text + pill labels so a pure-pill
      // submit still carries context.
      var responderText = freeText
      if (!isSchedulingDraft && !responderText && pillRefs.length) {
        var pillLabels = []
        for (var pi = 0; pi < pillRefs.length; pi++) {
          if (pillRefs[pi].name) pillLabels.push(pillRefs[pi].name)
        }
        responderText = pillLabels.join(' ')
      }

      // Once ANY user turn has been committed, the composer
      // prefill has served its purpose — clear it so a reload of
      // this conversation later doesn't re-inject the opening
      // prompt on top of the actual reply history. Only applies
      // to scheduling drafts (seeded conversations don't carry a
      // composerDraft to begin with).
      if (isSchedulingDraft
          && window.SellerHomeScheduling
          && typeof window.SellerHomeScheduling.clearComposerDraft === 'function') {
        window.SellerHomeScheduling.clearComposerDraft(convId)
      }

      // 2) Clear + reset composer. Focus stays inside the input so
      //    the seller can keep typing without a click.
      clearComposerContent()

      // 3) Show a "thinking" placeholder + call the mock
      //    responder. When it resolves, swap the placeholder for
      //    an agent message. On rejection, mark the placeholder
      //    as an error with a Retry button.
      var pendingId = 'msg-pending-' + Date.now()
      var pendingArticle = appendPending(pendingId, convId)

      var context = buildResponderContext(convId, conversationsMap)
      var promise

      if (isSchedulingDraft
          && window.SellerHomeScheduling
          && typeof window.SellerHomeScheduling.advanceScheduling === 'function') {
        // Scheduling flow: route through the state-machine
        // responder. Wrapped in a Promise so the rest of this
        // pipeline (pending placeholder swap, error fallback,
        // pendingSubmit reset) is oblivious to the branch. Short
        // artificial delay so the "thinking" placeholder renders
        // for at least a frame — matches the live-service feel
        // without an actual round-trip.
        promise = new Promise(function (resolve) {
          setTimeout(function () {
            try {
              resolve(window.SellerHomeScheduling.advanceScheduling(convId, responderText))
            } catch (err) {
              resolve({ text: 'Something went wrong preparing the schedule.' })
            }
          }, 240)
        })
      } else {
        var respond = window.SellerHomeConvMock && window.SellerHomeConvMock.respond
        promise = respond
          ? respond(responderText, context)
          : Promise.reject(new Error('mock responder unavailable'))
      }

      promise.then(function (result) {
        var agentMsg = {
          id:      'msg-agent-' + Date.now(),
          type:    'agent',
          text:    result && result.text ? String(result.text) : '',
          // Scheduling responder returns optional `chips[]` (chip
          // labels) and `summary` (Skill / cadence / time / tz)
          // — attach them so `buildAgentArticle` renders the
          // extras. Ignored by the generic responder path.
          chips:   result && Array.isArray(result.chips) ? result.chips.slice() : null,
          summary: result && result.summary ? result.summary : null
        }
        replacePendingWithMessage(pendingArticle, agentMsg, convId, { persist: true, scroll: true })
      }).catch(function (err) {
        showPendingError(pendingArticle, err, text, convId)
      }).then(function () {
        pendingSubmit = false
        updateSendState()
      })
    })

    // ── Message rendering ───────────────────────────────────────
    // Vanilla DOM construction that mirrors what the `userMessage`
    // and `agentMessage` Nunjucks macros in
    // `_home_conversation_messages.html` emit. Kept in sync with
    // that partial's structure — a change there needs a matching
    // change here.
    function appendMessage (msg, convId, opts) {
      opts = opts || {}
      var thread = threadFor(convId)
      if (!thread) return null
      var li = document.createElement('li')
      li.className = 'seller-home__conv-thread-item'
      var article = buildArticle(msg)
      li.appendChild(article)
      thread.appendChild(li)
      if (opts.persist) writeStoredAppend(convId, msg)
      if (opts.scroll) scrollThreadToBottom(thread)
      return article
    }

    function buildArticle (msg) {
      if (msg.type === 'user') return buildUserArticle(msg)
      if (msg.type === 'agent') return buildAgentArticle(msg)
      return document.createComment('unknown-message-type:' + msg.type)
    }

    function buildUserArticle (msg) {
      var article = document.createElement('article')
      article.className = 'seller-home__conv-msg seller-home__conv-msg--user'
      article.setAttribute('data-sh-conv-msg', msg.id)
      article.setAttribute('data-sh-conv-msg-type', 'user')
      article.setAttribute('aria-label', 'Your message')
      var p = document.createElement('p')
      p.className = 'seller-home__conv-msg-user-pill'

      if (msg.segments && msg.segments.length) {
        // Ordered replay of the composer contents — a pill placed
        // mid-sentence renders mid-sentence, matching what the
        // seller saw before hitting Send.
        for (var i = 0; i < msg.segments.length; i++) {
          var seg = msg.segments[i]
          if (!seg) continue
          if (seg.type === 'text' && seg.value) {
            p.appendChild(document.createTextNode(seg.value))
          } else if (seg.type === 'pill' && seg.name) {
            p.appendChild(buildStaticPillNode(seg))
          }
        }
      } else if (msg.pills && msg.pills.length) {
        // Legacy fallback for pre-segments messages that persisted
        // pills separately. Preserves the older "pills first, then
        // text" layout so historical transcripts stay readable.
        for (var j = 0; j < msg.pills.length; j++) {
          var ref = msg.pills[j]
          if (!ref || !ref.name) continue
          p.appendChild(buildStaticPillNode(ref))
          p.appendChild(document.createTextNode(' '))
        }
        if (msg.text) p.appendChild(document.createTextNode(msg.text))
      } else if (msg.text) {
        p.appendChild(document.createTextNode(msg.text))
      }

      article.appendChild(p)
      return article
    }

    // Non-interactive rendering of a mention pill for the sent
    // message bubble. Shares SCSS with the composer pill so the
    // seller sees the same shape they typed; drops the × button
    // + contenteditable=false since neither applies once the
    // message is out the door.
    function buildStaticPillNode (ref) {
      var pill = document.createElement('span')
      pill.className = 'seller-home__conv-composer-pill seller-home__conv-composer-pill--static'
      pill.setAttribute('data-skill-id', ref && ref.skillId ? String(ref.skillId) : '')
      pill.setAttribute('data-skill-name', ref && ref.name ? String(ref.name) : '')
      pill.setAttribute('role', 'text')
      pill.setAttribute('aria-label', 'Skill: ' + ((ref && ref.name) || ''))
      pill.insertAdjacentHTML('beforeend', PILL_ICON_SVG)
      var label = document.createElement('span')
      label.className = 'seller-home__conv-composer-pill-label'
      label.textContent = (ref && ref.name) ? String(ref.name) : ''
      pill.appendChild(label)
      return pill
    }

    function buildAgentArticle (msg) {
      var article = document.createElement('article')
      article.className = 'seller-home__conv-msg seller-home__conv-msg--agent'
      article.setAttribute('data-sh-conv-msg', msg.id)
      article.setAttribute('data-sh-conv-msg-type', 'agent')
      article.setAttribute('tabindex', '-1')
      article.setAttribute('aria-label', 'Agent response')
      if (msg.text) {
        var p = document.createElement('p')
        p.className = 'seller-home__conv-msg-agent-text'
        // `textContent` preserves the mock responder's `\n`
        // separators when they land — `white-space: pre-wrap` on
        // the paragraph handles the line breaks.
        p.textContent = msg.text
        article.appendChild(p)
      }
      // Optional schedule-summary card (Skill / cadence / time /
      // timezone). Rendered as a definition list so screen readers
      // read "Skill: Daily Pipeline Snapshot" etc. — no visual
      // affordance implies action; the confirm/change chips below
      // do the action.
      if (msg.summary) {
        article.appendChild(buildSummaryCard(msg.summary))
      }
      // Optional suggestion chips. Chips ONLY appear on agent
      // messages; a chip click behaves exactly like typing the
      // chip's label and hitting Send — same responder branch, same
      // pendingSubmit guard, same accessibility. This is the
      // conversational surface's first suggested-response pattern;
      // scoped narrowly so it can grow into a shared macro without
      // touching the generic conv path.
      if (msg.chips && msg.chips.length) {
        article.appendChild(buildChipStrip(msg.chips))
      }
      return article
    }

    // ── Suggestion-chip strip ───────────────────────────────────
    // Rendered as a horizontal row of `<button>` pills below an
    // agent message. Buttons carry `data-sh-conv-chip="<label>"`
    // so a delegated click listener on the thread container can
    // resolve the label without maintaining refs. Chips remain
    // visible after use (in case the seller wants to backtrack)
    // but are individually greyed once selected.
    function buildChipStrip (chips) {
      var strip = document.createElement('div')
      strip.className = 'seller-home__conv-msg-chips'
      strip.setAttribute('role', 'group')
      strip.setAttribute('aria-label', 'Suggested responses')
      for (var i = 0; i < chips.length; i++) {
        var label = chips[i] == null ? '' : String(chips[i])
        if (!label) continue
        var btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'slds-button seller-home__conv-msg-chip'
        btn.setAttribute('data-sh-conv-chip', label)
        btn.textContent = label
        strip.appendChild(btn)
      }
      return strip
    }

    // ── Schedule-summary card ───────────────────────────────────
    // Minimal card showing what the seller is about to confirm.
    // Uses a `<dl>` so terms and values are semantically paired;
    // CSS lays it out as two-column key/value rows.
    function buildSummaryCard (summary) {
      var card = document.createElement('div')
      card.className = 'seller-home__conv-msg-summary'
      card.setAttribute('data-sh-conv-summary', '')
      card.setAttribute('role', 'group')
      card.setAttribute('aria-label', 'Schedule summary')

      var dl = document.createElement('dl')
      dl.className = 'seller-home__conv-msg-summary-list'
      var pairs = [
        ['Skill',    summary.skill    || ''],
        ['Cadence',  summary.cadence  || ''],
        ['Time',     summary.time     || ''],
        ['Timezone', summary.timezone || '']
      ]
      for (var i = 0; i < pairs.length; i++) {
        var termText  = pairs[i][0]
        var valueText = pairs[i][1]
        if (!valueText) continue
        var dt = document.createElement('dt')
        dt.className = 'seller-home__conv-msg-summary-term'
        dt.textContent = termText
        var dd = document.createElement('dd')
        dd.className = 'seller-home__conv-msg-summary-value'
        dd.textContent = valueText
        dl.appendChild(dt)
        dl.appendChild(dd)
      }
      card.appendChild(dl)
      return card
    }

    // ── Chip-click delegation ──────────────────────────────────
    // Single listener on the composer form's owning conv-root so
    // one binding covers every chip regardless of which agent
    // message rendered it. A chip click stuffs the label into the
    // composer + submits — same code path as typing.
    var convRoot = document.querySelector('[data-sh-conv-root]')
    if (convRoot) {
      convRoot.addEventListener('click', function (e) {
        var chip = e.target && e.target.closest
          ? e.target.closest('[data-sh-conv-chip]')
          : null
        if (!chip) return
        e.preventDefault()
        if (pendingSubmit) return
        var label = chip.getAttribute('data-sh-conv-chip') || ''
        if (!label) return
        // Grey the chip immediately so a rapid double-click doesn't
        // fire twice; the `pendingSubmit` guard covers the primary
        // race, but visual feedback is nicer than a dead click.
        chip.classList.add('is-consumed')
        chip.disabled = true
        clearComposerContent()
        input.appendChild(document.createTextNode(label))
        refreshEmptyState()
        updateSendState()
        caretToEnd()
        if (form.requestSubmit) form.requestSubmit()
        else form.dispatchEvent(new Event('submit', { cancelable: true }))
      })
    }

    // ── Pending "thinking" placeholder ──────────────────────────
    // Rendered as an agent-shell article with a live-region status
    // + animated dots. Kept as a first-class DOM element so it can
    // be replaced in-place (preserving scroll position) when the
    // responder resolves — no re-render of the whole thread.
    function appendPending (pendingId, convId) {
      var thread = threadFor(convId)
      if (!thread) return null
      var li = document.createElement('li')
      li.className = 'seller-home__conv-thread-item'
      var article = document.createElement('article')
      article.className = 'seller-home__conv-msg seller-home__conv-msg--agent ' + PENDING_CLASS
      article.setAttribute('data-sh-conv-msg', pendingId)
      article.setAttribute('data-sh-conv-msg-type', 'agent-pending')
      article.setAttribute('role', 'status')
      article.setAttribute('aria-live', 'polite')
      article.setAttribute('aria-label', 'Assistant is preparing a response')

      var dots = document.createElement('span')
      dots.className = 'seller-home__conv-msg-typing'
      dots.setAttribute('aria-hidden', 'true')
      for (var d = 0; d < 3; d++) {
        var dot = document.createElement('span')
        dot.className = 'seller-home__conv-msg-typing-dot'
        dots.appendChild(dot)
      }
      article.appendChild(dots)

      var sr = document.createElement('span')
      sr.className = 'slds-assistive-text'
      sr.textContent = 'Thinking\u2026'
      article.appendChild(sr)

      li.appendChild(article)
      thread.appendChild(li)
      scrollThreadToBottom(thread)
      return article
    }

    function replacePendingWithMessage (pendingArticle, msg, convId, opts) {
      opts = opts || {}
      if (!pendingArticle || !pendingArticle.parentNode) {
        appendMessage(msg, convId, opts)
        return
      }
      var replacement = buildArticle(msg)
      pendingArticle.parentNode.replaceChild(replacement, pendingArticle)
      if (opts.persist) writeStoredAppend(convId, msg)
      if (opts.scroll) scrollThreadToBottom(threadFor(convId))
    }

    function showPendingError (pendingArticle, err, originalQuery, convId) {
      if (!pendingArticle) return
      pendingArticle.classList.remove(PENDING_CLASS)
      pendingArticle.classList.add('is-error')
      pendingArticle.setAttribute('aria-label', 'Response failed')
      // Empty the typing dots + assistive text.
      while (pendingArticle.firstChild) pendingArticle.removeChild(pendingArticle.firstChild)

      var msg = document.createElement('p')
      msg.className = 'seller-home__conv-msg-agent-text seller-home__conv-msg-error-text'
      msg.textContent = (err && err.message)
        ? 'Something went wrong: ' + err.message
        : 'That didn\u2019t send. Try again.'
      pendingArticle.appendChild(msg)

      var retry = document.createElement('button')
      retry.type = 'button'
      retry.className = 'slds-button slds-button_neutral seller-home__conv-msg-error-retry'
      retry.textContent = 'Retry'
      retry.addEventListener('click', function () {
        // Remove the errored article and resubmit the original
        // query as a fresh follow-up. The pending guard was
        // released in the submit-tail; a click here starts a new
        // round-trip.
        var host = pendingArticle.parentNode   // the <li>
        if (host && host.parentNode) host.parentNode.removeChild(host)
        clearComposerContent()
        input.appendChild(document.createTextNode(originalQuery))
        refreshEmptyState()
        updateSendState()
        caretToEnd()
        form.dispatchEvent(new Event('submit', { cancelable: true }))
      })
      pendingArticle.appendChild(retry)
    }

    // ── Thread helpers ──────────────────────────────────────────
    function threadFor (convId) {
      return document.querySelector('[data-sh-conv-thread-for="' + convId + '"]')
    }

    function scrollThreadToBottom (thread) {
      if (!thread) return
      var container = thread.closest('.seller-home__conv-thread')
      if (!container) return
      // requestAnimationFrame gives the layout engine a chance to
      // paint the new message before we compute scrollHeight.
      requestAnimationFrame(function () {
        container.scrollTop = container.scrollHeight
      })
    }

    // ── Persistence (localStorage) ──────────────────────────────
    function storageKey (convId) { return STORAGE_PREFIX + convId }

    function readStored (convId) {
      try {
        var raw = window.localStorage && window.localStorage.getItem(storageKey(convId))
        if (!raw) return []
        var parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) { return [] }
    }

    function writeStoredAppend (convId, msg) {
      try {
        if (!window.localStorage) return
        var list = readStored(convId)
        list.push(msg)
        window.localStorage.setItem(storageKey(convId), JSON.stringify(list))
      } catch (e) { /* quota / private-mode: no-op */ }
    }

    // ── Responder context ───────────────────────────────────────
    // Extracts snapshot data from the seeded conversations map so
    // the mock responder can name specific attention items /
    // opportunities in its canned replies. Newest-first order
    // matches how `buildComparisonReply` reads snapshots.
    function buildResponderContext (convId, map) {
      var entry = (map && map[convId]) || null
      var messages = (entry && entry.messages) || []
      var snapshots = []
      for (var i = messages.length - 1; i >= 0; i--) {
        var m = messages[i]
        if (m.type === 'agent' && m.snapshot) snapshots.push(m.snapshot)
      }
      return {
        conversationId: convId,
        snapshots: snapshots
      }
    }

    // ── Init ────────────────────────────────────────────────────
    refreshEmptyState()
    updateSendState()

    // ── Composer prefill (draft conversations only) ─────────────
    // A draft envelope may carry `{ text, pills }` — the prefilled
    // prompt the Schedule button hands off (skill mention pill +
    // "Set up a recurring schedule for this."). We READ (idempotent)
    // and only CLEAR the draft after the FIRST user submit so a
    // page refresh before the seller sends anything restores the
    // prompt in-place.
    //
    // Focus + caret-to-end is applied after the DOM settles so
    // the browser doesn't compete with autofocus heuristics from
    // other page bindings (e.g. `role="main"` grabbing focus for
    // the AT announcement).
    //
    // Only applied when the composer is still empty — an in-flight
    // paste or a browser autofill takes precedence over the
    // prefill so we don't overwrite what the seller has typed.
    var isComposerEmpty = !input.querySelector('.seller-home__conv-composer-pill')
      && getFreeText().trim().length === 0

    if (isSchedulingDraft
        && window.SellerHomeScheduling
        && typeof window.SellerHomeScheduling.readComposerDraft === 'function'
        && isComposerEmpty) {
      var prefill = window.SellerHomeScheduling.readComposerDraft(activeConvId)
      if (prefill) {
        seedComposer(prefill.prefix || '', prefill.pills || [], prefill.text || '')
        requestAnimationFrame(function () { caretToEnd() })
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}())
