// ─────────────────────────────────────────────────────────────────────────
// Hunter Builder — client-side controller.
//
// Owns three concerns:
//   1. Panel collapse/expand for the left + right rails
//      (persisted per-side to localStorage; ARIA labels stay in sync).
//   2. Left-nav active-state UX. Items with a real `href` navigate
//      normally; items marked `data-hb-nav-noroute` (i.e. still linked
//      to "#" because a target page doesn't exist yet) just flip the
//      active class locally so the prototype feels responsive.
//   3. Kebab (⋮) actions dropdown on the Agents table. There is a
//      SINGLE shared menu element (`#hunter-agents-actions-menu`) that
//      gets positioned next to whichever row's kebab was clicked. This
//      avoids duplicating N menus in the DOM at build time.
//
// All handlers are delegated at the `#hunter-builder` root so future
// re-renders (e.g. a nav item swap or a re-rendered table) don't need
// to re-bind.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  var root = document.getElementById('hunter-builder');
  if (!root) return;

  // ═══════════════════════════════════════════════════════════════════
  // 1. Panel collapse/expand
  // ═══════════════════════════════════════════════════════════════════
  var STORAGE_KEYS = {
    left: 'hunterBuilder.leftCollapsed',
    right: 'hunterBuilder.rightCollapsed'
  };

  var COLLAPSED_CLASS = {
    left: 'hunter-builder--left-collapsed',
    right: 'hunter-builder--right-collapsed'
  };

  function readCollapsed(side) {
    try { return localStorage.getItem(STORAGE_KEYS[side]) === 'true'; }
    catch (_) { return false; }
  }

  function writeCollapsed(side, isCollapsed) {
    try { localStorage.setItem(STORAGE_KEYS[side], String(isCollapsed)); }
    catch (_) { /* noop */ }
  }

  function applyState(side, isCollapsed) {
    root.classList.toggle(COLLAPSED_CLASS[side], isCollapsed);

    // Sync aria-expanded + aria-label so screen readers announce the
    // ACTION the toggle will take next (Collapse vs Expand).
    var btn = root.querySelector('[data-hb-toggle="' + side + '"]');
    if (btn) {
      btn.setAttribute('aria-expanded', String(!isCollapsed));
      var noun = side === 'left' ? 'configuration navigation' : 'preview panel';
      btn.setAttribute('aria-label',
        (isCollapsed ? 'Expand ' : 'Collapse ') + noun);
    }
  }

  ['left', 'right'].forEach(function (side) {
    applyState(side, readCollapsed(side));
  });

  // ═══════════════════════════════════════════════════════════════════
  // 2. Kebab actions menu (shared for the Agents table)
  // ═══════════════════════════════════════════════════════════════════
  var actionsMenu = document.getElementById('hunter-agents-actions-menu');
  var openTrigger = null; // currently-open kebab button, if any

  function closeActionsMenu() {
    if (!actionsMenu) return;
    actionsMenu.classList.remove('is-open');
    actionsMenu.hidden = true;
    if (openTrigger) {
      openTrigger.setAttribute('aria-expanded', 'false');
      openTrigger.classList.remove('is-open');
      openTrigger = null;
    }
  }

  // Position the fixed-positioned menu just below (and right-aligned to)
  // the clicked kebab trigger. Uses viewport coordinates because the
  // menu is `position: fixed` — that also means we don't have to worry
  // about ancestor overflow/transform contexts clipping the menu.
  function positionMenuFor(triggerEl) {
    if (!actionsMenu || !triggerEl) return;
    var rect = triggerEl.getBoundingClientRect();
    var menuWidth = actionsMenu.offsetWidth || 200;

    // Right-align the menu to the trigger. Clamp to the viewport so a
    // trigger near the right edge doesn't push the menu off-screen.
    var left = Math.max(8, rect.right - menuWidth);
    var top = rect.bottom + 4;

    // If the menu would fall off the bottom of the viewport, flip it
    // above the trigger.
    var estimatedHeight = actionsMenu.offsetHeight || 240;
    if (top + estimatedHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - estimatedHeight - 4);
    }

    actionsMenu.style.left = left + 'px';
    actionsMenu.style.top = top + 'px';
  }

  function openActionsMenuFor(triggerEl) {
    if (!actionsMenu || !triggerEl) return;
    // If the same trigger was open, toggle closed.
    if (openTrigger === triggerEl) { closeActionsMenu(); return; }

    // Close any prior menu first, then open fresh.
    closeActionsMenu();
    actionsMenu.hidden = false;
    actionsMenu.classList.add('is-open');
    triggerEl.setAttribute('aria-expanded', 'true');
    triggerEl.classList.add('is-open');
    openTrigger = triggerEl;

    // Give the browser a tick so offsetWidth/offsetHeight settle
    // before we measure + position.
    positionMenuFor(triggerEl);
  }

  // Close the actions menu on ESC, outside clicks, scroll, and resize.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') closeActionsMenu();
  });

  document.addEventListener('click', function (e) {
    if (!openTrigger) return;
    var t = e.target;
    if (openTrigger.contains && openTrigger.contains(t)) return;
    if (actionsMenu && actionsMenu.contains(t)) return;
    closeActionsMenu();
  });

  window.addEventListener('scroll', closeActionsMenu, true);
  window.addEventListener('resize', closeActionsMenu);

  // ═══════════════════════════════════════════════════════════════════
  // 3. Agents table — search filter
  // ═══════════════════════════════════════════════════════════════════
  //
  // Live client-side filter across every row's visible text (name +
  // type + status + user record + last modified + created by). Query
  // is case-insensitive substring; empty query shows all rows.
  //
  // Row visibility toggles via a modifier class (`.is-filtered-out`)
  // instead of the `hidden` attribute so we don't stomp any row-level
  // ARIA state the SLDS table shell relies on.
  //
  // Result count + empty banner + clear button visibility all keep in
  // sync with the same `applyFilter()` call so a single write path
  // updates every dependent UI bit.
  var searchInput  = document.querySelector('[data-hunter-agents-search]');
  var searchClear  = document.querySelector('[data-hunter-agents-search-clear]');
  var resultCount  = document.querySelector('[data-hunter-agents-result-count]');
  var emptyBanner  = document.querySelector('[data-hunter-agents-empty]');
  var agentRows    = Array.prototype.slice.call(
    document.querySelectorAll('.hunter-agents__row')
  );

  // Pre-index each row's searchable text once so we're not walking DOM
  // subtrees on every keystroke. `textContent` collapses whitespace
  // enough for substring matching; the extra `.replace(/\s+/g, ' ')`
  // normalizes multi-line cell content to a single space run.
  var rowText = agentRows.map(function (row) {
    return (row.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  });

  function pluralizeAgents(n) {
    return n + ' agent' + (n === 1 ? '' : 's');
  }

  function applyFilter(query) {
    var q = (query || '').trim().toLowerCase();
    var visible = 0;
    for (var i = 0; i < agentRows.length; i++) {
      var isMatch = !q || rowText[i].indexOf(q) !== -1;
      agentRows[i].classList.toggle('is-filtered-out', !isMatch);
      if (isMatch) visible++;
    }

    if (resultCount) resultCount.textContent = pluralizeAgents(visible);
    if (emptyBanner) emptyBanner.hidden = visible > 0;
    if (searchClear) searchClear.hidden = q.length === 0;
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      applyFilter(searchInput.value);
      // Close any open kebab menu so it doesn't stick to a now-hidden row.
      closeActionsMenu();
    });

    // Escape while the search input is focused clears the query
    // (matches the pattern SLDS's search inputs use elsewhere).
    searchInput.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && searchInput.value) {
        e.stopPropagation();
        searchInput.value = '';
        applyFilter('');
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', function () {
      if (!searchInput) return;
      searchInput.value = '';
      applyFilter('');
      searchInput.focus();
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. Agent Detail — hydrate from `?agent=<name>` query param
  // ═══════════════════════════════════════════════════════════════════
  //
  // Runs only on hunter_agent_configuration.html (guarded by the presence of
  // `[data-hunter-detail]` in the DOM + the inline `window.__hunterAgents`
  // payload emitted by that template). Reads the `?agent=` param,
  // finds the matching record, and populates:
  //   • The last breadcrumb text (`#hunter-detail-agent-crumb`)
  //   • The center-panel title (`[data-hunter-detail-title]`)
  //   • The hero name + type/status badges
  //   • Each `[data-hunter-detail-field="<key>"]` element
  //   • `document.title` (browser tab)
  //
  // If the param is missing or doesn't match any record, we flip the
  // section into a "not found" state (via `.is-notfound` on the
  // container + the `[data-hunter-detail-notfound]` banner) so the
  // page still reads as a sensible landing instead of showing
  // "Loading…" indefinitely.
  var detailRoot = document.querySelector('[data-hunter-detail]');
  if (detailRoot && Array.isArray(window.__hunterAgents)) {
    var params = new URLSearchParams(window.location.search);
    var requestedName = params.get('agent');

    var found = null;
    if (requestedName) {
      for (var i = 0; i < window.__hunterAgents.length; i++) {
        if (window.__hunterAgents[i] && window.__hunterAgents[i].name === requestedName) {
          found = window.__hunterAgents[i];
          break;
        }
      }
    }

    var titleEl    = document.querySelector('[data-hunter-detail-title]');
    var nameEl     = detailRoot.querySelector('[data-hunter-detail-name]');
    var crumbEl    = document.getElementById('hunter-detail-agent-crumb');
    var typeBadge  = detailRoot.querySelector('[data-hunter-detail-type-badge]');
    var statusBadg = detailRoot.querySelector('[data-hunter-detail-status-badge]');
    var fieldEls   = detailRoot.querySelectorAll('[data-hunter-detail-field]');
    var notFoundEl = detailRoot.querySelector('[data-hunter-detail-notfound]');

    function setText(el, value) {
      if (el) el.textContent = value;
    }

    function statusLabel(s) {
      if (s === 'active') return 'Active';
      if (s === 'inactive') return 'Inactive';
      return s || '—';
    }

    if (found) {
      var displayName = found.name || 'Agent';
      setText(titleEl, displayName);
      setText(nameEl, displayName);
      setText(crumbEl, displayName);
      document.title = displayName + ' · Hunter Builder';

      // Type badge — reuses the same 3-way palette as the list page's
      // type pill (Prospecting → blue tint, Lead Nurturing → violet,
      // fallback → neutral gray). Rebuilds the className each time
      // rather than toggling so navigating between agents with
      // different types cleanly swaps the modifier.
      if (typeBadge) {
        typeBadge.textContent = found.type || '';
        typeBadge.className = 'hunter-agent-detail__type-badge';
        if (found.type === 'Prospecting') {
          typeBadge.classList.add('hunter-agent-detail__type-badge--prospecting');
        } else if (found.type === 'Lead Nurturing') {
          typeBadge.classList.add('hunter-agent-detail__type-badge--nurturing');
        }
      }

      // Status badge — mirrors the SLDS theme classes the table uses.
      if (statusBadg) {
        statusBadg.className = 'slds-badge';
        if (found.status === 'active') {
          statusBadg.textContent = 'Active';
          statusBadg.classList.add('slds-theme_success');
        } else if (found.status === 'inactive') {
          statusBadg.textContent = 'Inactive';
          statusBadg.classList.add('slds-theme_shade');
        } else {
          statusBadg.textContent = found.status || '—';
        }
      }

      for (var j = 0; j < fieldEls.length; j++) {
        var key = fieldEls[j].getAttribute('data-hunter-detail-field');
        if (key === 'status') {
          setText(fieldEls[j], statusLabel(found.status));
        } else {
          setText(fieldEls[j], found[key] || '—');
        }
      }
    } else {
      // No match — swap into the not-found state. Keep the crumb + title
      // useful so the user can tell what happened without a hard error.
      detailRoot.classList.add('is-notfound');
      if (notFoundEl) notFoundEl.hidden = false;
      var fallbackLabel = requestedName || 'Agent not found';
      setText(titleEl, fallbackLabel);
      setText(crumbEl, fallbackLabel);
      document.title = 'Agent not found · Hunter Builder';
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. Delegated click handler at the shell root
  // ═══════════════════════════════════════════════════════════════════
  root.addEventListener('click', function (e) {
    // ── Panel toggle ─────────────────────────────────────────────
    var toggle = e.target.closest && e.target.closest('[data-hb-toggle]');
    if (toggle) {
      var side = toggle.getAttribute('data-hb-toggle');
      if (side !== 'left' && side !== 'right') return;
      var isCollapsed = !root.classList.contains(COLLAPSED_CLASS[side]);
      applyState(side, isCollapsed);
      writeCollapsed(side, isCollapsed);
      return;
    }

    // ── Kebab action trigger ─────────────────────────────────────
    var kebab = e.target.closest && e.target.closest('[data-hunter-agents-action-trigger]');
    if (kebab) {
      e.preventDefault();
      e.stopPropagation();
      openActionsMenuFor(kebab);
      return;
    }

    // ── Actions menu item click ──────────────────────────────────
    // No real handlers wired yet; just close the menu so the UX feels
    // responsive. Action id is available via `data-hunter-agents-action`
    // for future wiring.
    var actionItem = e.target.closest && e.target.closest('[data-hunter-agents-action]');
    if (actionItem) {
      closeActionsMenu();
      return;
    }

    // ── Left nav item click ──────────────────────────────────────
    // Items with a real href let the browser handle navigation. Items
    // marked `data-hb-nav-noroute` (href="#") just flip active state
    // locally so the prototype behaves visually.
    var navItem = e.target.closest && e.target.closest('[data-hb-nav]');
    if (navItem) {
      if (navItem.hasAttribute('data-hb-nav-noroute')) {
        e.preventDefault();
        var list = navItem.parentElement;
        if (!list) return;
        list.querySelectorAll('[data-hb-nav]').forEach(function (el) {
          el.classList.remove('is-active');
          el.removeAttribute('aria-current');
        });
        navItem.classList.add('is-active');
        navItem.setAttribute('aria-current', 'page');
      }
      // Otherwise the browser navigates normally to `item.href`.
    }
  });
})();
