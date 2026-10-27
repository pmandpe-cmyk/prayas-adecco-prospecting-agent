// ──────────────────────────────────────────────────────────────────────
// Left-nav Recents augment — client-side splice for draft conversations
// =====================================================================
// The Seller Home nav's Recents list is SSR'd from `home.json`, which
// is a static build-time asset. Draft conversations (Schedule flow,
// New chat, etc.) are created at runtime and can't live there without
// a server round-trip.
//
// This script consumes `sh:convDrafts:list:v1` from localStorage and
// prepends one `<a class="seller-home__nav-recent seller-home__nav-recent--linked">`
// per draft above the SSR'd list. Deduped against the SSR rows by
// `data-sh-recent-conv` so a completed schedule that later gets
// baked into `home.json` doesn't render twice.
//
// Loaded from `_home_left_nav.html` so it runs on EVERY page that
// shows the nav (Skill detail, Home, Home Conversation, Scheduled,
// Knowledge, …). No dependency on any other script — reads
// localStorage directly so the splice happens before
// `home_conversation.js` walks the Recents list looking for an
// active highlight.
// ──────────────────────────────────────────────────────────────────────

(function () {
  'use strict'

  var KEY_DRAFT_LIST   = 'sh:convDrafts:list:v1'
  var RECENTS_SELECTOR = '[data-sh-recents-list]'
  var LINK_CLASS       = 'seller-home__nav-recent seller-home__nav-recent--linked'
  var LABEL_CLASS      = 'seller-home__nav-recent-label'

  function safeParse (raw) {
    if (raw == null) return null
    try { return JSON.parse(raw) } catch (_e) { return null }
  }

  function readList () {
    try {
      if (!window.localStorage) return []
    } catch (_e) { return [] }
    var parsed = safeParse(window.localStorage.getItem(KEY_DRAFT_LIST))
    return Array.isArray(parsed) ? parsed : []
  }

  function existingConvIds (container) {
    var out = {}
    var nodes = container.querySelectorAll('[data-sh-recent-conv]')
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].getAttribute('data-sh-recent-conv')
      if (id) out[id] = true
    }
    return out
  }

  // Look up the current conversation id from the conv-root (present
  // on `/home_conversation.html`) so an augmented Recent can carry
  // the SLDS active-highlight when it matches the visible thread.
  // Returns `null` on every other page — augmented rows just render
  // in their default state.
  function currentConversationId () {
    var root = document.querySelector('[data-sh-conv-root]')
    if (!root) return null
    return root.getAttribute('data-sh-conversation-id')
      || root.getAttribute('data-sh-conv-initial-id')
      || null
  }

  function buildLink (entry, activeConvId) {
    var a = document.createElement('a')
    a.href = '/home_conversation.html?id=' + encodeURIComponent(entry.conversationId)
    a.className = LINK_CLASS
    a.setAttribute('role', 'listitem')
    a.setAttribute('data-sh-recent', 'draft-' + entry.conversationId)
    a.setAttribute('data-sh-recent-conv', entry.conversationId)
    a.setAttribute('data-sh-recent-source', entry.sourceType || 'draft')
    a.setAttribute('title', entry.label || 'Untitled')
    // Preserve the URL-derived selection when a `refresh()` swap
    // rebuilds the node — otherwise the active highlight would be
    // lost right after a schedule confirmation.
    if (activeConvId && activeConvId === entry.conversationId) {
      a.classList.add('is-active')
      a.setAttribute('aria-current', 'page')
    }

    var span = document.createElement('span')
    span.className = LABEL_CLASS
    span.textContent = entry.label || 'Untitled'
    a.appendChild(span)
    return a
  }

  function splice () {
    var container = document.querySelector(RECENTS_SELECTOR)
    if (!container) return

    var list = readList()
    if (!list.length) return

    var activeId = currentConversationId()
    var seen = existingConvIds(container)
    var fragment = document.createDocumentFragment()
    for (var i = 0; i < list.length; i++) {
      var it = list[i]
      if (!it || !it.conversationId) continue
      if (seen[it.conversationId]) continue
      seen[it.conversationId] = true
      fragment.appendChild(buildLink(it, activeId))
    }
    if (fragment.childNodes.length) {
      container.insertBefore(fragment, container.firstChild)
    }
  }

  // Refresh on demand — schedule confirmation renames a Recent from
  // "Schedule <skill>" to just "<skill>", and other cross-page
  // events (e.g. draft removal) may need to re-emit the list.
  function refresh () {
    var container = document.querySelector(RECENTS_SELECTOR)
    if (!container) return
    // Remove existing draft-augmented links, then re-splice.
    var stale = container.querySelectorAll('[data-sh-recent-source="skill-scheduling"], [data-sh-recent-source="draft"]')
    for (var i = 0; i < stale.length; i++) {
      var n = stale[i]
      if (n && n.parentNode) n.parentNode.removeChild(n)
    }
    splice()
  }

  // Splice as soon as the nav DOM is available. The script is
  // included at the bottom of `_home_left_nav.html`, so the target
  // container has already been parsed by the time this runs.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', splice)
  } else {
    splice()
  }

  // React to schedule confirmations from schedule_conversation.js
  // so the Recent row updates from "Schedule Foo" → "Foo" without
  // a page reload.
  document.addEventListener('sh:schedule-confirmed', refresh)

  // Public hook for future callers (e.g. an in-page "Delete draft"
  // affordance that needs to hide a stale Recent immediately).
  window.SellerHomeLeftNavAugment = {
    refresh: refresh
  }
}())
