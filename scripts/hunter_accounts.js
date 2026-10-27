// ─────────────────────────────────────────────────────────────────────────
// Hunter Accounts — shared "does the agent have at least one Account
// source configured?" state, hoisted out of the Accounts step's DOM
// so every page in the flow can read it without walking the source-
// card list on `_step_01_body.html`.
//
// Why this module exists:
//   The Accounts source list lives inside a DOM subtree that only
//   exists on `hunter_step_01_select_accounts.html`. Any other page
//   that needs to gate behaviour on "did the user configure at least
//   one Account source?" (today: the Preview panel on Account Research
//   + Find Prospects; potentially more surfaces later) can't reach in
//   because the source-of-truth DOM isn't rendered. This module
//   persists a scalar count to `localStorage` so downstream pages can
//   answer synchronously on load without depending on the Accounts
//   page being mounted, and dispatches a `hunter:accounts-changed`
//   window event whenever the count changes so live surfaces re-
//   evaluate immediately.
//
// Storage choice — `localStorage` (not sessionStorage):
//   • Matches the pattern hunter_builder.js already uses for the
//     left/right panel collapse state (see STORAGE_KEYS in that file).
//   • Survives reopening the tab, so a demo session that walks through
//     step_01 → close tab → open step_02 in a new tab still shows the
//     ungated Preview. sessionStorage would drop the count on the tab
//     boundary and gate the Preview even though the user did the work.
//   • The value is a single small integer; no PII, no security surface.
//
// API surface (attached to `window.HunterAccounts` so any inline
// consumer can call it without an ES-module import graph):
//   • getCount()        → number (0 when unset / non-numeric / storage
//                                  is unavailable, e.g. Safari private mode)
//   • hasSource()       → boolean (`getCount() > 0`)
//   • setCount(n)       → writes the value, dispatches `hunter:accounts-changed`
//                         (also no-ops silently when storage is unavailable
//                          so pages don't crash in that case)
//   • subscribe(fn)     → registers `fn({count, hasSource})` to be
//                         called on every change; returns an unsubscribe
//                         function. Wraps the underlying custom event
//                         so consumers don't have to wire addEventListener
//                         themselves.
//
// Loaded globally from `_template.html` before `preview-unified.js`
// so the gate controller in that file can consume the API on init.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  var STORAGE_KEY = 'hunter.accountSourceCount';
  var CHANGE_EVENT = 'hunter:accounts-changed';

  // Safe accessors — Safari's Private Browsing throws on any
  // localStorage read/write, and some embedded contexts disable
  // storage entirely. We swallow those errors and treat them as
  // "the state doesn't exist yet" so surfaces stay ungated by
  // default in the absence of any signal (rather than gating
  // aggressively based on a storage failure).
  function readRaw() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch (_) { return null; }
  }

  function writeRaw(value) {
    try { localStorage.setItem(STORAGE_KEY, String(value)); }
    catch (_) { /* noop */ }
  }

  function getCount() {
    var raw = readRaw();
    if (raw === null || raw === '') return 0;
    var n = parseInt(raw, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function hasSource() {
    return getCount() > 0;
  }

  function setCount(n) {
    var clamped = Math.max(0, parseInt(n, 10) || 0);
    var prev = getCount();
    // Skip the write + event dispatch when nothing changed. This keeps
    // `_step_01_body.html`'s syncPreviewDropdown() cheap to call on
    // every keystroke — most invocations don't change the count.
    if (clamped === prev) return;
    writeRaw(clamped);
    dispatchChange(clamped);
  }

  function dispatchChange(count) {
    try {
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, {
        detail: { count: count, hasSource: count > 0 }
      }));
    } catch (_) {
      // IE / very old Edge without CustomEvent constructor. The
      // prototype doesn't officially target those, so we just
      // swallow — subscribers on modern browsers still fire.
    }
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return function () {};
    var handler = function (e) {
      var detail = (e && e.detail) || { count: getCount(), hasSource: hasSource() };
      fn(detail);
    };
    window.addEventListener(CHANGE_EVENT, handler);
    return function () {
      window.removeEventListener(CHANGE_EVENT, handler);
    };
  }

  window.HunterAccounts = {
    getCount: getCount,
    hasSource: hasSource,
    setCount: setCount,
    subscribe: subscribe,
    STORAGE_KEY: STORAGE_KEY,
    CHANGE_EVENT: CHANGE_EVENT
  };
})();
