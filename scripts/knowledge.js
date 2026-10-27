/**
 * Knowledge tab + Knowledge document editor.
 *
 * This one file powers two surfaces:
 *
 *   1. The Knowledge tab inside prospect_list.html (table view). Handles:
 *      • search filter (Search knowledge documents...)
 *      • sortable columns (Last Updated defaults to descending)
 *      • row-click → dedicated editor page (Option A, not inline expand)
 *      • row kebab menu open/close (opens sibling `.slds-dropdown` and
 *        delegates outside-click close to the shared handler already
 *        wired in prospect-list.js)
 *      • empty-state row when the filter zeroes visible rows
 *
 *   2. The standalone editor page at /knowledge_document.html. Handles:
 *      • URL `?id=kd-N` hydration from window.__knowledgeDocs (mirrored
 *        into the DOM by _knowledge_tab.html)
 *      • banner show/hide (source-change warning) + dismiss
 *      • Regenerate (page header + banner both dispatch the same action)
 *      • Import Custom Knowledge (file picker → swap body + flip type
 *        badge to Custom Uploaded)
 *      • Hunter/Custom type picker (combobox)
 *      • Notion-style toolbar → `document.execCommand` formatting
 *      • Saved-state indicator (debounced idle-typing → "✓ Saved")
 *      • Sidebar nav → scroll into the corresponding section
 *
 * Both surfaces coexist because the same JS bundle is loaded on both
 * pages; each block guards on the presence of its own root element
 * (`document.getElementById('knowledge_table')` / `#kdoc-editor`) so
 * nothing runs on pages where the elements don't exist.
 *
 * Style: this codebase uses plain scripts (no bundler) — DO NOT add
 * ES modules, imports, or top-level await. The wrapping IIFE keeps
 * helpers off `window` and avoids clobbering shell-level names like
 * `tabs` and `assignTabEvents` from prospect-list.js.
 */

(function () {
  'use strict'

  // ==========================================================================
  //  1. Knowledge tab: table search, sort, row nav, kebab menu
  // ==========================================================================

  const knowledgeTable = document.getElementById('knowledge_table')
  if (knowledgeTable) initKnowledgeTable()

  function initKnowledgeTable () {
    const searchInput = document.getElementById('knowledge-search')
    const searchClear = document.getElementById('knowledge-search-clear')
    const emptyState = document.getElementById('knowledge-empty')
    const rows = Array.from(knowledgeTable.querySelectorAll('tbody tr.js-knowledge-row'))

    // --- Search filter ----------------------------------------------------
    // Simple substring match across doc name, agent, status, updatedBy.
    // Row visibility toggled via `slds-hide` so the sortable-column logic
    // can still reorder them without needing to re-query the DOM.
    function applyFilter () {
      const q = (searchInput.value || '').trim().toLowerCase()
      searchClear.classList.toggle('slds-hide', q.length === 0)

      let visibleCount = 0
      rows.forEach((row) => {
        if (!q) {
          row.classList.remove('slds-hide')
          visibleCount++
          return
        }
        const haystack = [
          row.getAttribute('data-doc-name') || '',
          row.getAttribute('data-doc-agent') || '',
          row.getAttribute('data-doc-status') || '',
          row.getAttribute('data-sort-updatedby') || ''
        ].join(' ').toLowerCase()
        const match = haystack.includes(q)
        row.classList.toggle('slds-hide', !match)
        if (match) visibleCount++
      })

      if (emptyState) emptyState.classList.toggle('slds-hide', visibleCount > 0)
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter, false)
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchInput.value) {
          searchInput.value = ''
          applyFilter()
        }
      }, false)
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = ''
        applyFilter()
        searchInput.focus()
      }, false)
    }

    // --- Sortable columns -------------------------------------------------
    // Uses the shared `data-sort-*` pattern (rows carry `data-sort-<key>`
    // attributes; header `<th>` carries `data-sort-key`). 3-state cycle
    // matches agent-log.js: none → descending → ascending → none.
    //
    // The `js-knowledge-default-sort` th is primed with `aria-sort="descending"`
    // + `slds-is-sorted` at render time so the initial paint is
    // newest-first. On page load we still call `sortBy` once so the DOM
    // order matches the aria state.
    const sortHeaders = knowledgeTable.querySelectorAll('th.slds-is-sortable')

    sortHeaders.forEach((th) => {
      // The clickable target is the inner anchor; delegating on `<a>` keeps
      // resize handles (a sibling `.slds-resizable`) from stealing the
      // click. See _knowledge_tab.html for the shared header shape.
      const link = th.querySelector('.slds-th__action')
      if (!link) return
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const currentSort = th.getAttribute('aria-sort') || 'none'
        const nextSort = currentSort === 'none' ? 'descending' :
                         currentSort === 'descending' ? 'ascending' : 'none'
        sortHeaders.forEach((other) => {
          other.setAttribute('aria-sort', 'none')
          other.classList.remove('slds-is-sorted', 'slds-is-sorted_desc', 'slds-is-sorted_asc')
        })
        th.setAttribute('aria-sort', nextSort)
        if (nextSort !== 'none') {
          th.classList.add('slds-is-sorted')
          th.classList.add(nextSort === 'descending' ? 'slds-is-sorted_desc' : 'slds-is-sorted_asc')
        }
        applySort()
      }, false)
    })

    function applySort () {
      const sortedTh = knowledgeTable.querySelector('th.slds-is-sortable[aria-sort="ascending"], th.slds-is-sortable[aria-sort="descending"]')
      if (!sortedTh) return
      const key = sortedTh.getAttribute('data-sort-key') || inferKeyFromHeader(sortedTh)
      const dir = sortedTh.getAttribute('aria-sort') === 'ascending' ? 1 : -1
      const tbody = knowledgeTable.querySelector('tbody')
      const sortAttr = 'data-sort-' + key.toLowerCase()

      // Detect numeric vs string columns. Size + Sources ship as numbers
      // in `data-sort-*`; everything else is a lowercased string. ISO
      // dates compare correctly as strings (lexical == chronological).
      const sample = rows.length ? rows[0].getAttribute(sortAttr) : ''
      const isNumeric = !isNaN(parseFloat(sample)) && isFinite(sample)

      const sorted = rows.slice().sort((a, b) => {
        const av = a.getAttribute(sortAttr) || ''
        const bv = b.getAttribute(sortAttr) || ''
        if (isNumeric) return (parseFloat(av) - parseFloat(bv)) * dir
        return av.localeCompare(bv) * dir
      })
      sorted.forEach((row) => tbody.appendChild(row))
    }

    // Fallback for older thead cells that don't have data-sort-key; derive
    // the key from the header label (e.g. "Updated By" → "updatedby").
    function inferKeyFromHeader (th) {
      const label = (th.textContent || '').trim().split(/\s+/).slice(0, 3).join('').toLowerCase()
      return label.replace(/[^a-z]/g, '')
    }

    // Prime the sort so the initial paint respects the default `aria-sort="descending"`.
    applySort()

    // --- Row-click navigation --------------------------------------------
    // The doc-name link is a real <a href> already, so browsers handle
    // Cmd/Ctrl+click, middle-click, drag-to-new-tab natively. We only
    // need to intercept plain clicks *elsewhere on the row* to widen the
    // click target — but not on the row kebab or its dropdown items,
    // which have their own actions.
    knowledgeTable.addEventListener('click', (e) => {
      // Ignore clicks inside the kebab menu / its dropdown.
      if (e.target.closest('.knowledge-table__row-menu')) return
      // If the user actually clicked the link, let the browser handle it.
      if (e.target.closest('.knowledge-table__doc-name')) return

      const row = e.target.closest('tr.js-knowledge-row')
      if (!row) return
      // Some cells (like the source pill) should NOT navigate — they can
      // grow their own popover behavior later. Restrict "widened target"
      // to the first two columns (doc + agent) and the status/date/size
      // cells. Skip the Sources cell so a future click-to-popover works.
      const cell = e.target.closest('td, th')
      if (cell && cell.classList.contains('knowledge-table__sources-cell')) return

      const link = row.querySelector('.knowledge-table__doc-name')
      if (link) {
        // Bail if the click was inside the sources column so we don't
        // steal the click from a future in-cell popover.
        if (e.target.closest('.source-multi')) return
        window.location.href = link.href
      }
    }, false)

    // --- Row kebab menu ---------------------------------------------------
    // NOTE: the kebab button itself is toggled open/closed by the shell's
    // `toggleParent` handler in app.js:47 (it binds to every
    // `.slds-dropdown-trigger_click > .slds-button` at DOM-ready) plus
    // the outside-click closer in prospect-list.js:163. If we bind our
    // own toggle here it double-fires and cancels out. So this listener
    // only handles the menu-item click (close-on-select + row-scoped
    // "close siblings before mine opens" hygiene).
    knowledgeTable.addEventListener('click', (e) => {
      // When one kebab opens, close any others on the table so only one
      // menu is visible at a time. This must run BEFORE app.js's toggle
      // fires — but since app.js's handler is on the button itself and
      // ours is a delegated handler that fires during bubbling, we let
      // app.js flip the open state first, then sweep the others closed.
      const btn = e.target.closest('.js-knowledge-row-menu')
      if (btn) {
        const trigger = btn.closest('.slds-dropdown-trigger_click')
        if (!trigger) return
        knowledgeTable.querySelectorAll('.slds-dropdown-trigger_click.slds-is-open').forEach((other) => {
          if (other !== trigger) other.classList.remove('slds-is-open')
        })
        btn.setAttribute('aria-expanded', trigger.classList.contains('slds-is-open') ? 'true' : 'false')
        return
      }

      // Menu item click → close the menu, then optionally intercept the
      // action. For anchors that are real `href`s (Open editor) we let
      // the browser navigate natively (no preventDefault). Delete /
      // Regenerate / Download are `href="#"` placeholders in the
      // prototype.
      const menuItem = e.target.closest('.knowledge-table__row-menu [role="menuitem"]')
      if (menuItem) {
        const trigger = menuItem.closest('.slds-dropdown-trigger_click')
        if (trigger) trigger.classList.remove('slds-is-open')
        const action = menuItem.getAttribute('data-action')
        if (action === 'delete') {
          e.preventDefault()
          const row = menuItem.closest('tr')
          if (row) row.remove()
        } else if (action === 'regenerate' || action === 'download') {
          e.preventDefault()
          // No-op in the prototype; hook these to real actions later.
        }
      }
    }, false)

    // --- Refresh button ---------------------------------------------------
    // Cosmetic-only in the prototype: spin the icon for 400ms so the user
    // sees a response. Real integration would refetch the doc list.
    const refreshBtn = document.getElementById('knowledge-refresh')
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('.slds-button__icon')
        if (icon) {
          icon.style.transition = 'transform 400ms ease'
          icon.style.transform = 'rotate(360deg)'
          setTimeout(() => {
            icon.style.transition = ''
            icon.style.transform = ''
          }, 420)
        }
      }, false)
    }

    // --- Deep link: /prospect_list.html#tab=knowledge ---------------------
    // If the user arrived from the editor breadcrumb, flip the outer tab
    // bar to Knowledge before the first paint of a scroll position.
    if (window.location.hash === '#tab=knowledge') {
      const knowledgeTab = document.getElementById('tab-default-4__item')
      if (knowledgeTab) {
        // Emit a synthetic click; the generic tab handler in
        // prospect-list.js:207 does the panel show/hide + aria toggles.
        knowledgeTab.click()
        // Strip the hash so a reload doesn't keep forcing the tab.
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
  }

  // ==========================================================================
  //  2. Knowledge document editor page
  // ==========================================================================

  const editorRoot = document.getElementById('kdoc-editor')
  if (editorRoot) initKnowledgeEditor()

  function initKnowledgeEditor () {
    // --- Hydrate from ?id ------------------------------------------------
    // `window.__knowledgeDocs` is only present when the editor is opened
    // from a page that includes _knowledge_tab.html (i.e. the Knowledge
    // tab). Direct navigations without that mirror still render — with
    // the default demo doc from knowledge_document.json.
    const params = new URLSearchParams(window.location.search)
    const docId = params.get('id')
    const docs = Array.isArray(window.__knowledgeDocs) ? window.__knowledgeDocs : []
    const doc = docId ? docs.find((d) => d.id === docId) : null

    const state = {
      id: doc ? doc.id : 'kd-demo',
      name: doc ? doc.name : 'company-knowledge.md',
      agent: doc ? doc.agentName : 'Prospecting agent',
      // Prototype heuristic: docs flagged with regenerate-available on the
      // table land with the banner shown so the user sees the affordance
      // that led them here.
      sourceChangesDetected: doc ? doc.status === 'regenerate-available' : true,
      type: doc ? doc.type : 'hunter',
      status: doc ? doc.status : 'up-to-date'
    }

    // Fill breadcrumb + title.
    const breadcrumbName = document.getElementById('kdoc-breadcrumb-name')
    const titleEl = document.getElementById('kdoc-title')
    if (breadcrumbName) breadcrumbName.textContent = state.name
    if (titleEl) {
      titleEl.textContent = state.name
      titleEl.setAttribute('title', state.name)
    }
    document.title = state.name + ' · Knowledge'

    // Cache DOM refs used by hydrate helpers UP FRONT so the helpers can
    // read them at call time. Earlier revisions put these `const`s after
    // the initial hydrate call (`setBannerVisible(state.sourceChangesDetected)`),
    // which throws because `const` declarations are in the temporal dead
    // zone until the declaration executes — the function declaration is
    // hoisted, but the variable it closes over is not.
    const banner = document.getElementById('kdoc-banner')
    const progressBanner = document.getElementById('kdoc-banner-progress')
    const progressItems = progressBanner
      ? Array.prototype.slice.call(progressBanner.querySelectorAll('.learning-step'))
      : []

    // Sync the badge + dropdown label to `state.type`.
    applyTypeToUi(state.type)

    // Reveal the banner if the doc landed with source changes detected.
    setBannerVisible(state.sourceChangesDetected)

    // --- Type badge + dropdown -------------------------------------------
    // `applyTypeToUi` runs on hydrate AND whenever the type flips (via the
    // combobox picker, the file-import path, or the Regenerate action).
    function applyTypeToUi (type) {
      state.type = type

      const badge = document.getElementById('kdoc-type-badge')
      const badgeLabel = document.getElementById('kdoc-type-badge-label')
      const typeLabel = document.getElementById('kdoc-type-label')
      const isHunter = type === 'hunter'

      if (badge) {
        badge.setAttribute('data-type', type)
        badge.classList.toggle('kdoc-type-badge_hunter', isHunter)
        badge.classList.toggle('kdoc-type-badge_custom', !isHunter)
      }
      if (badgeLabel) badgeLabel.textContent = isHunter ? 'Hunter Generated' : 'Custom Uploaded'
      if (typeLabel) typeLabel.textContent = isHunter ? 'Hunter Generated' : 'Custom Uploaded'

      // Reflect the selected state in the listbox so the shell's combobox
      // handler in prospect-list.js:107 sees the right initial option.
      const listbox = document.getElementById('kdoc-type-listbox')
      if (listbox) {
        listbox.querySelectorAll('[role="option"]').forEach((opt) => {
          const isSelected = opt.getAttribute('data-type') === type
          opt.setAttribute('aria-selected', String(isSelected))
          opt.classList.toggle('slds-is-selected', isSelected)
        })
      }
    }

    // Wire the Hunter/Custom picker. The shell combobox handler updates
    // the label text on click, so this listener only enforces mutually-
    // exclusive selected state + drives `applyTypeToUi`.
    const typeOptions = document.querySelectorAll('#kdoc-type-listbox [role="option"]')
    typeOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        const type = opt.getAttribute('data-type')
        if (!type || type === state.type) return
        applyTypeToUi(type)
        // Flipping to custom via the picker (no file uploaded) is a bit
        // ambiguous; we treat it as "mark this doc as custom-authored"
        // and clear the source-changes banner if it was showing.
        if (type === 'custom') setBannerVisible(false)
      }, false)
    })

    // The `.slds-combobox.slds-dropdown-trigger_click` open/close is
    // fully handled by `initPicklists()` in app.js:562 — it binds click
    // + keyboard toggles on the .slds-input_faux[role="combobox"],
    // manages the selected option label + icon, and installs an
    // outside-click close listener. We only need the option-click
    // side-effects wired above (applyTypeToUi + banner clear); the
    // toggle itself is not our concern.

    // --- Banner show/hide + dismiss --------------------------------------
    // `banner` is captured up top (before the hydrate call) so setBannerVisible
    // can reference it without hitting the TDZ.

    function setBannerVisible (visible) {
      if (!banner) return
      banner.classList.toggle('slds-hide', !visible)
      state.sourceChangesDetected = visible
    }

    document.querySelectorAll('.js-kdoc-banner-dismiss').forEach((btn) => {
      btn.addEventListener('click', () => setBannerVisible(false), false)
    })

    // --- Regenerate (header + banner) ------------------------------------
    // Both entry points map to the same handler: hide the warning banner,
    // run the progress-banner animation (tick each step in sequence), and
    // when the last step completes swap the body content, flip the type
    // back to "hunter", and pulse the Saved indicator.
    //
    // `isRegenerating` guards against double-clicks (button doesn't
    // disable itself while the animation runs); further clicks are ignored
    // until the current run finishes.
    let isRegenerating = false
    document.querySelectorAll('#kdoc-regenerate, .js-kdoc-banner-regenerate').forEach((btn) => {
      btn.addEventListener('click', () => regenerate(), false)
    })

    // Progress-banner animation timings — mirrors the /hunter_scanning.html
    // onboarding page (see promo.css `.learning-step`). Each step is
    // revealed one per `SLOT_MS`, spins for `SPINNER_MS`, then flips
    // to `.is-complete` (spinner fades out, check pops + draws in).
    // Total run time = SLOT_MS * items + SETTLE_MS.
    //   • SLOT_MS 1300: time between successive item reveals
    //   • SPINNER_MS 900: how long each item stays spinning
    //   • SETTLE_MS 900: pause after the last check draws before the
    //     banner hides so users see all four complete states
    const PROGRESS_SLOT_MS = 1300
    const PROGRESS_SPINNER_MS = 900
    const PROGRESS_SETTLE_MS = 900

    // Cache of active timers so `hideProgressBanner` can cancel an
    // in-flight animation (e.g. user adds a new source mid-regenerate)
    // without leaving orphan setTimeouts that could flip state on a
    // banner that's already been dismissed.
    let progressTimers = []

    function clearProgressTimers () {
      progressTimers.forEach((t) => window.clearTimeout(t))
      progressTimers = []
    }

    function resetProgressItems () {
      progressItems.forEach((item) => {
        item.classList.remove('is-visible')
        item.classList.remove('is-complete')
      })
    }

    function hideProgressBanner () {
      if (!progressBanner) return
      clearProgressTimers()
      progressBanner.classList.add('slds-hide')
      resetProgressItems()
    }

    function showProgressBanner () {
      if (!progressBanner) return
      clearProgressTimers()
      resetProgressItems()
      progressBanner.classList.remove('slds-hide')
    }

    function runProgressAnimation (onDone) {
      if (!progressItems.length) {
        if (typeof onDone === 'function') onDone()
        return
      }
      progressItems.forEach((item, i) => {
        const revealAt = PROGRESS_SLOT_MS * i
        progressTimers.push(window.setTimeout(() => {
          item.classList.add('is-visible')
          progressTimers.push(window.setTimeout(() => {
            item.classList.add('is-complete')
          }, PROGRESS_SPINNER_MS))
        }, revealAt))
      })
      progressTimers.push(window.setTimeout(() => {
        if (typeof onDone === 'function') onDone()
      }, PROGRESS_SLOT_MS * progressItems.length + PROGRESS_SETTLE_MS))
    }

    // The regenerated body deliberately mirrors the default demo layout
    // so the prototype's "before/after" reads clearly. In production this
    // would call Hunter's generation API and render the returned markdown.
    function regenerate () {
      if (isRegenerating) return
      isRegenerating = true
      // Hand off from the warning banner to the progress banner — the two
      // are mutually exclusive UI states of "sources are out of sync".
      setBannerVisible(false)
      showProgressBanner()
      runProgressAnimation(() => {
        const body = document.getElementById('kdoc-body')
        if (body) {
          body.innerHTML = [
            '<h1>Company knowledge</h1>',
            '<p>Hunter re-generated this knowledge document from your latest sources. Review the sections below and edit anything Hunter got wrong.</p>',
            '<h2>What we sell</h2>',
            '<ul>',
            '<li>Sales Cloud — deal + pipeline management</li>',
            '<li>Service Cloud — case + agent workflows</li>',
            '<li>Agentforce — autonomous action-taking agents</li>',
            '</ul>',
            '<h2>Ideal customer profile</h2>',
            '<ul>',
            '<li>Mid-market and enterprise revenue teams (250+ FTE)</li>',
            '<li>Cloud-native product companies with recent growth signals</li>',
            '<li>Existing Sales Cloud footprint with room to expand</li>',
            '</ul>',
            '<h3>Primary use cases</h3>',
            '<p>Lead with Agentforce when the account has active Salesforce usage. Position Data Cloud when there\u2019s evidence of a data-fragmentation problem across CRM + support + marketing.</p>'
          ].join('')
        }
        applyTypeToUi('hunter')
        // `runProgressAnimation` already bakes in the settle delay after
        // the last check draws, so we can hide the banner + finalize
        // state immediately here.
        hideProgressBanner()
        state.status = 'up-to-date'
        pulseSavedIndicator()
        isRegenerating = false
      })
    }

    // --- Import Custom Knowledge -----------------------------------------
    // Opens the hidden file input, reads the selected file as text, drops
    // it into the editor body as either markdown-ish HTML or plain text.
    // Flips the type to "custom" — the app assumes one markdown file per
    // agent, so imports replace the Hunter body.
    const importBtn = document.getElementById('kdoc-import')
    const importFile = document.getElementById('kdoc-import-file')

    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click(), false)
      importFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
          const raw = String(reader.result || '')
          const body = document.getElementById('kdoc-body')
          if (body) body.innerHTML = markdownToHtml(raw)
          applyTypeToUi('custom')
          setBannerVisible(false)
          state.status = 'custom'
          pulseSavedIndicator()
        }
        reader.readAsText(file)
        // Reset the input so re-uploading the same file re-fires 'change'.
        importFile.value = ''
      }, false)
    }

    // Ultra-lightweight markdown → HTML converter. Covers the subset that
    // a knowledge doc actually uses: h1/h2/h3 headings, unordered lists,
    // paragraphs, inline bold + italic + links. Anything more elaborate
    // is preserved as an escaped paragraph. If the prototype needs to
    // support full CommonMark, swap this for a real parser (markdown-it).
    function markdownToHtml (md) {
      const lines = md.split(/\r?\n/)
      const out = []
      let inList = false

      lines.forEach((line) => {
        const trimmed = line.trim()
        // Close an open list when we hit a non-list line.
        if (inList && !trimmed.startsWith('- ') && !trimmed.startsWith('* ')) {
          out.push('</ul>')
          inList = false
        }
        if (!trimmed) return

        if (trimmed.startsWith('### ')) {
          out.push('<h3>' + inline(trimmed.slice(4)) + '</h3>')
        } else if (trimmed.startsWith('## ')) {
          out.push('<h2>' + inline(trimmed.slice(3)) + '</h2>')
        } else if (trimmed.startsWith('# ')) {
          out.push('<h1>' + inline(trimmed.slice(2)) + '</h1>')
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          if (!inList) {
            out.push('<ul>')
            inList = true
          }
          out.push('<li>' + inline(trimmed.slice(2)) + '</li>')
        } else {
          out.push('<p>' + inline(trimmed) + '</p>')
        }
      })
      if (inList) out.push('</ul>')
      return out.join('')

      function inline (text) {
        // Escape angle brackets before pattern-matching so user-supplied
        // HTML doesn't leak in via the imported file.
        const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return escaped
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      }
    }

    // --- Product chips + Source chips ------------------------------------
    // Removal is delegated at document level so runtime-added chips (via
    // future "Add Product" / "Add Knowledge Source" prompts) get the same
    // behavior without re-binding.
    document.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.js-kdoc-chip-remove')
      if (!removeBtn) return
      const chip = removeBtn.closest('.kdoc-chip')
      if (chip) chip.remove()
    }, false)

    // Add Product / Add Knowledge Source — prototype uses `prompt()` to
    // keep the interaction minimal. Swap for a real modal or inline input
    // when the pattern promotes to a real design.
    const addProductBtn = document.querySelector('.js-kdoc-add-product')
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => {
        const name = window.prompt('Add a product Hunter should focus on:')
        if (name && name.trim()) appendChip('#kdoc-products', name.trim(), false)
      }, false)
    }

    // --- Add Knowledge Source side panel ---------------------------------
    // Opens the `#kdoc-add-source-panel` inspector-style side panel (built
    // on the same `.inspector-side-panel` shell prospect_list.html uses for
    // Contact and Agent inspectors — see prospect_list.scss). The panel
    // stacks a Website URL input above a PDF Document uploader; on submit
    // each field that has a value funnels into `appendChip` (so users can
    // add a URL, a PDF, or both in a single interaction).
    //
    // Display is driven by `window.setPanelDisplay` (declared in
    // prospect-list.js:806, which is loaded first per the
    // knowledge_document.html scripts_extra block). Falls back to a plain
    // display toggle if the global isn't present so this file stays
    // resilient if the script order ever flips.
    const addSourceBtn = document.querySelector('.js-kdoc-add-source')
    const addSourcePanel = document.getElementById('kdoc-add-source-panel')
    const kdocMain = document.querySelector('.kdoc-main')
    const addSourceUrlInput = document.getElementById('kdoc-add-source-url-input')
    const addSourcePdfName = document.getElementById('kdoc-add-source-pdf-name')
    const addSourcePdfInput = document.getElementById('kdoc-add-source-file')
    const addSourceSubmitBtn = addSourcePanel && addSourcePanel.querySelector('.js-kdoc-add-source-submit')

    function togglePanel (show) {
      if (!addSourcePanel) return
      if (typeof window.setPanelDisplay === 'function') {
        window.setPanelDisplay(addSourcePanel, show, 'flex')
      } else {
        addSourcePanel.style.display = show ? 'flex' : 'none'
      }
      // Square off `.kdoc-main`'s right-side corners while the panel is
      // open so the card and panel butt flush together as a single joined
      // surface. Same modifier pattern prospect-list.js uses with
      // `.slds-card-uplift-panel-is-open` on the prospect list article.
      if (kdocMain) kdocMain.classList.toggle('kdoc-main_panel-is-open', show)
    }

    function hasUrlValue () {
      return !!(addSourceUrlInput && addSourceUrlInput.value.trim())
    }

    function hasPdfValue () {
      return !!(addSourcePdfInput && addSourcePdfInput.files && addSourcePdfInput.files.length > 0)
    }

    // Enable the Add Source button as soon as EITHER field has a value —
    // both fields are optional individually, but at least one has to be
    // present for the submit to do anything meaningful.
    function updateAddSourceSubmitState () {
      if (!addSourceSubmitBtn) return
      addSourceSubmitBtn.disabled = !(hasUrlValue() || hasPdfValue())
    }

    function resetAddSourceForm () {
      if (addSourceUrlInput) addSourceUrlInput.value = ''
      if (addSourcePdfInput) addSourcePdfInput.value = ''
      if (addSourcePdfName) {
        addSourcePdfName.textContent = ''
        addSourcePdfName.classList.add('slds-hide')
      }
      updateAddSourceSubmitState()
    }

    if (addSourceBtn && addSourcePanel) {
      addSourceBtn.addEventListener('click', () => {
        resetAddSourceForm()
        togglePanel(true)
        // Focus the URL field on open so users can start typing right away.
        if (addSourceUrlInput) addSourceUrlInput.focus()
      }, false)

      addSourcePanel.querySelectorAll('.js-kdoc-add-source-close, .js-kdoc-add-source-cancel').forEach((btn) => {
        btn.addEventListener('click', () => togglePanel(false), false)
      })

      if (addSourceUrlInput) {
        addSourceUrlInput.addEventListener('input', updateAddSourceSubmitState, false)
      }

      const uploadBtn = addSourcePanel.querySelector('.js-kdoc-add-source-upload')
      if (uploadBtn && addSourcePdfInput) {
        uploadBtn.addEventListener('click', () => addSourcePdfInput.click(), false)
        addSourcePdfInput.addEventListener('change', () => {
          const file = addSourcePdfInput.files && addSourcePdfInput.files[0]
          if (file && addSourcePdfName) {
            addSourcePdfName.textContent = file.name
            addSourcePdfName.classList.remove('slds-hide')
          }
          updateAddSourceSubmitState()
        }, false)
      }

      if (addSourceSubmitBtn) {
        addSourceSubmitBtn.addEventListener('click', () => {
          // Add whichever fields the user filled in — order matters so the
          // URL chip appears before the PDF chip when both are submitted.
          const url = addSourceUrlInput && addSourceUrlInput.value.trim()
          if (url) appendChip('#kdoc-sources-urls', url, 'url')
          const file = addSourcePdfInput && addSourcePdfInput.files && addSourcePdfInput.files[0]
          if (file) appendChip('#kdoc-sources-urls', file.name, 'pdf')
          if (url || file) {
            togglePanel(false)
            // Newly-added sources put the document into "sources changed"
            // state — reveal the warning banner (and hide any leftover
            // progress banner from a previous regenerate) so the user
            // sees the affordance to regenerate the markdown.
            setBannerVisible(true)
            hideProgressBanner()
          }
        }, false)
      }
    }

    // Chip kinds:
    //   'url'     — external link chip; renders link icon + <a target=_blank>
    //   'pdf'     — attached-file chip; renders attach icon + plain filename
    //   'product' — plain label chip (default; used for product tags)
    // Also accepts the legacy boolean signature: `true` → 'url', anything
    // falsy → 'product', so older call sites keep working during refactors.
    function appendChip (containerSelector, value, kind) {
      const container = document.querySelector(containerSelector)
      if (!container) return
      // Normalize the third arg. Booleans map to url/product; strings pass
      // through; anything else falls back to 'product'.
      let chipKind = kind
      if (chipKind === true) chipKind = 'url'
      else if (chipKind === false || chipKind == null) chipKind = 'product'
      if (chipKind !== 'url' && chipKind !== 'pdf' && chipKind !== 'product') chipKind = 'product'

      const chip = document.createElement('span')
      chip.className = 'kdoc-chip' + (chipKind === 'url' ? ' kdoc-chip_url' : chipKind === 'pdf' ? ' kdoc-chip_pdf' : '')

      if (chipKind === 'url') {
        chip.dataset.url = value
        chip.innerHTML =
          '<svg class="kdoc-chip__icon slds-icon slds-icon_x-small" aria-hidden="true">' +
          '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#link"></use></svg>' +
          '<a href="' + escapeAttr(value) + '" target="_blank" rel="noopener" class="kdoc-chip__url">' +
          escapeText(value) + '</a>' +
          removeButtonHtml(value)
      } else if (chipKind === 'pdf') {
        chip.dataset.pdf = value
        chip.innerHTML =
          '<svg class="kdoc-chip__icon slds-icon slds-icon_x-small" aria-hidden="true">' +
          '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#attach"></use></svg>' +
          '<span class="kdoc-chip__label">' + escapeText(value) + '</span>' +
          removeButtonHtml(value)
      } else {
        chip.dataset.product = value
        chip.innerHTML =
          '<span class="kdoc-chip__label">' + escapeText(value) + '</span>' +
          removeButtonHtml(value)
      }
      // Insert BEFORE the "Add" button so it stays trailing (product row
      // still hosts its Add button inline; the source row's Add button
      // lives in the section header, so this falls through to appendChild).
      const addBtn = container.querySelector('.js-kdoc-add-product') || container.querySelector('.js-kdoc-add-source')
      if (addBtn) container.insertBefore(chip, addBtn)
      else container.appendChild(chip)
    }

    function removeButtonHtml (labelForA11y) {
      return '<button type="button" class="kdoc-chip__remove js-kdoc-chip-remove" aria-label="Remove ' + escapeAttr(labelForA11y) + '">' +
        '<svg class="slds-button__icon" aria-hidden="true">' +
        '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#close"></use></svg></button>'
    }

    function escapeAttr (s) {
      return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
    function escapeText (s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    // --- Markdown editor toolbar -----------------------------------------
    // Toolbar buttons dispatch `document.execCommand` (deprecated but the
    // pragmatic choice for a lightweight contenteditable — every evergreen
    // browser still implements it). Heading buttons use `formatBlock`
    // instead of the raw `heading` command name.
    const toolbar = editorRoot.querySelector('.kdoc-editor__toolbar')
    const body = document.getElementById('kdoc-body')

    if (toolbar && body) {
      toolbar.addEventListener('click', (e) => {
        const btn = e.target.closest('.js-kdoc-format')
        if (!btn) return
        e.preventDefault()
        const cmd = btn.getAttribute('data-cmd')
        const val = btn.getAttribute('data-value')

        // Restore focus into the editor before running the command so
        // `execCommand` targets the doc body's selection, not the toolbar.
        body.focus()

        if (cmd === 'heading') {
          document.execCommand('formatBlock', false, 'h' + (val || '1'))
        } else if (cmd === 'createLink') {
          const url = window.prompt('Link URL:')
          if (url) document.execCommand('createLink', false, url)
        } else if (cmd === 'insertTable') {
          insertTableAtCaret(body)
        } else {
          document.execCommand(cmd, false, null)
        }

        updateToolbarState()
      }, false)

      // Highlight the toolbar button that matches the current caret state.
      // `queryCommandState` returns true when the cursor is inside a matching
      // format (bold / italic / list) — used for the `.is-active` visual.
      function updateToolbarState () {
        const boldBtn = toolbar.querySelector('[data-cmd="bold"]')
        const italicBtn = toolbar.querySelector('[data-cmd="italic"]')
        const listBtn = toolbar.querySelector('[data-cmd="insertUnorderedList"]')
        if (boldBtn) boldBtn.classList.toggle('is-active', document.queryCommandState('bold'))
        if (italicBtn) italicBtn.classList.toggle('is-active', document.queryCommandState('italic'))
        if (listBtn) listBtn.classList.toggle('is-active', document.queryCommandState('insertUnorderedList'))
      }

      body.addEventListener('keyup', updateToolbarState, false)
      body.addEventListener('mouseup', updateToolbarState, false)

      // Saved-state indicator: switch to "Saving…" on input, then debounce
      // back to "✓ Saved" after 500ms of idle. Purely visual — no real
      // persistence in the prototype (refresh reverts local edits).
      body.addEventListener('input', () => pulseSavedIndicator(), false)
    }

    // Saved-state helper (shared by regenerate + import + input events).
    let savedTimer = null
    function pulseSavedIndicator () {
      const el = document.getElementById('kdoc-saved-state')
      if (!el) return
      el.classList.add('is-saving')
      el.querySelector('span').textContent = 'Saving…'
      clearTimeout(savedTimer)
      savedTimer = setTimeout(() => {
        el.classList.remove('is-saving')
        el.querySelector('span').textContent = 'Saved'
      }, 500)
    }

    // The trailing "more actions" dropdown (`.js-kdoc-actions-toggle`)
    // is toggled open by the shell's `toggleParent` handler in
    // app.js:47 — it picks up every `.slds-dropdown-trigger_click >
    // .slds-button` at DOM-ready. We only sync `aria-expanded` here
    // since the shared handler doesn't touch aria state.
    const actionsToggle = document.querySelector('.js-kdoc-actions-toggle')
    if (actionsToggle) {
      actionsToggle.addEventListener('click', () => {
        const trigger = actionsToggle.closest('.slds-dropdown-trigger_click')
        if (!trigger) return
        actionsToggle.setAttribute('aria-expanded', trigger.classList.contains('slds-is-open') ? 'true' : 'false')
      }, false)
    }

    // Download + Clone were promoted out of the "Actions" dropdown into
    // the top-level button group when we adopted the Figma page-header
    // spec. Both are prototype no-ops today — hooking them into real
    // backend actions is future work. `data-action` on the button
    // matches the same attribute on the moved-into-dropdown items so a
    // future dispatcher can treat inline + dropdown entries uniformly.
    document.querySelectorAll('.js-kdoc-download, .js-kdoc-clone').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        // Placeholder: flash the Saved state so the user sees a response.
        pulseSavedIndicator()
      }, false)
    })
  }

  /**
   * Insert an HTML table at the current caret position inside the given
   * contenteditable root. Prompts the user for row / column counts (with
   * sane defaults of 3×3) and clamps them to a range that keeps the
   * editor usable — very large tables inside a contenteditable get
   * hairy fast (Firefox in particular).
   *
   * Uses `document.execCommand('insertHTML')` so the insert lands in
   * the undo stack alongside the rest of the toolbar formatting (Ctrl+Z
   * removes it). Wraps the table in a `<div class="kdoc-editor__table-wrap">`
   * so we can overflow-scroll wide tables without breaking editor layout,
   * and appends an empty `<p>` after the table so the caret has somewhere
   * to land — otherwise the caret gets trapped in the last cell with no
   * way to exit via arrow keys.
   */
  function insertTableAtCaret (body) {
    const rowsRaw = window.prompt('Rows:', '3')
    if (rowsRaw === null) return
    const colsRaw = window.prompt('Columns:', '3')
    if (colsRaw === null) return

    const rows = Math.max(1, Math.min(20, parseInt(rowsRaw, 10) || 3))
    const cols = Math.max(1, Math.min(10, parseInt(colsRaw, 10) || 3))

    let html = '<div class="kdoc-editor__table-wrap"><table class="kdoc-editor__table">'
    html += '<thead><tr>'
    for (let c = 0; c < cols; c++) {
      html += '<th>Header ' + (c + 1) + '</th>'
    }
    html += '</tr></thead>'
    html += '<tbody>'
    for (let r = 0; r < rows; r++) {
      html += '<tr>'
      for (let c = 0; c < cols; c++) {
        html += '<td>&nbsp;</td>'
      }
      html += '</tr>'
    }
    html += '</tbody></table></div><p>&nbsp;</p>'

    body.focus()
    document.execCommand('insertHTML', false, html)
  }
})()
