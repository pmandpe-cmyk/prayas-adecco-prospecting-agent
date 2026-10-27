// Copyright (c) 2017-present, Salesforce.com, Inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

'use strict'

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
 * Open / Close an element
 * @param {Node} element
 */
const toggle = (element) => element.classList.toggle('slds-is-open')

/**
 * Open / Close an element's parent
 * @param {Node} element
 */
const toggleParent = (element) => toggle(element.parentNode)

/**
 * Dropdown menus
 * https://www.lightningdesignsystem.com/components/menus/
 *
 * `data-slds-dropdown-manual` opts a trigger OUT of this blanket
 * binder. Some pages ship a dropdown that needs more than an
 * open/close class flip — focus management, filtering, arrow-key
 * roving — and wire their own handler on the same button. Without
 * the opt-out both handlers fire on one click and cancel each
 * other out, leaving the menu permanently shut.
 */
const dropdownButtons = document.querySelectorAll(
  '.slds-dropdown-trigger_click:not([data-slds-dropdown-manual]) > .slds-button'
)

Array.from(dropdownButtons)
  .forEach((button) =>
    button.addEventListener('click', (event) => toggleParent(event.currentTarget), false)
  )

/**
 * SLDS Lookup Combobox
 * https://www.lightningdesignsystem.com/components/combobox/
 *
 * Generic, reusable lookup component. Add to any page by including:
 *   data-slds-lookup="WINDOW_VAR"  – the global array of records
 *   data-lookup-icon="standard-account" – SLDS icon key
 *   data-lookup-entity="Account" – entity label shown in meta text
 */
const initLookups = () => {
  document.querySelectorAll('[data-slds-lookup]').forEach((el) => {
    const dataKey = el.dataset.sldsLookup
    const fullData = window[dataKey] || []
    // Optional whitelist of record names. When `data-lookup-filter-names` is
    // set on the wrapper (comma-separated), the lookup only shows records
    // whose `name` matches one of the listed values. Used by the Step 4
    // prospect lookup to surface just the 4 prospects with authored
    // cadence data.
    const filterNames = (el.dataset.lookupFilterNames || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const data = filterNames.length
      ? fullData.filter((item) => filterNames.indexOf(item.name) > -1)
      : fullData
    const iconKey = el.dataset.lookupIcon || 'standard-account'
    const entityLabel = el.dataset.lookupEntity || 'Record'
    const metaMode = el.dataset.lookupMeta || 'account'

    const dashIdx = iconKey.indexOf('-')
    const iconType = iconKey.substring(0, dashIdx)
    const iconName = iconKey.substring(dashIdx + 1)
    const iconSymbol = el.dataset.lookupIconSymbol || iconName
    const iconContainerClass = 'slds-icon-' + iconKey
    const iconSpritePath = '/assets/icons/' + iconType + '-sprite/svg/symbols.svg#' + iconSymbol

    const container = el.querySelector('.slds-combobox_container')
    const trigger = el.querySelector('.slds-dropdown-trigger_click')
    const formElement = el.querySelector('.slds-combobox__form-element')
    const list = el.querySelector('.slds-listbox_vertical')
    const labelEl = el.querySelector('.slds-form-element__label')
    // Popover-mode wrappers (e.g. the cadence popover) intentionally
    // omit role="listbox" on the .slds-dropdown wrapper because the
    // contents aren't a listbox. Fall back to the .slds-dropdown div
    // itself so initLookups still has an id to wire aria-controls to.
    const listboxEl = el.querySelector('[role="listbox"]') || el.querySelector('.slds-dropdown')
    const inputId = el.querySelector('.slds-combobox__input').id
    const listboxId = listboxEl.id
    const labelId = labelEl.id
    let focusedOptionIndex = -1

    const isMulti = el.dataset.lookupMulti === 'true'
    const selectedItems = []
    const pillList = isMulti ? el.querySelector('.slds-listbox_horizontal') : null

    // Optional "agent actions" group rendered alongside the regular options
    // (e.g. "Suggest Cadence" / "Generate Cadence" on the Cadence lookup).
    // When data-lookup-actions is set on the wrapper, renderOptions switches
    // into a two-section layout with group headers, an empty-state message
    // for the filtered-options side, a divider, and the always-visible
    // actions side. Lookups without these attributes render as a flat list
    // exactly like before.
    const actionsKey = el.dataset.lookupActions
    const actions = (actionsKey && window[actionsKey]) || []
    const optionsHeading = el.dataset.lookupOptionsHeading || ('Existing ' + entityLabel + 's')
    const actionsHeading = el.dataset.lookupActionsHeading || 'Agent Actions'
    const emptyMessage = el.dataset.lookupEmptyMessage || 'No matches found'
    const hasActions = actions.length > 0

    // Hardcoded agent-action icon. `sparkles` exists in BOTH the utility
    // and standard sprites; we use the standard one so the symbol's
    // viewBox/proportions match what the slds-icon-standard-avatar
    // container expects (the utility variant renders visibly larger
    // inside the standard container).
    const ACTION_ICON_CLASS = 'slds-icon-standard-avatar'
    const ACTION_ICON_HREF = '/assets/icons/standard-sprite/svg/symbols.svg#sparkles'

    // When a wrapper opts into popover mode (data-lookup-popover="true"),
    // the slds-dropdown content is a hand-authored popover (e.g. the
    // cadence mode-switching popover on step 4) instead of the standard
    // SLDS option list. We skip option rendering / typeahead / row-action
    // wiring entirely and let an external module drive selection via the
    // helpers we expose on the wrapper (el._lookupSelect / Action / Close).
    const isPopover = el.dataset.lookupPopover === 'true'

    const open = () => {
      trigger.classList.add('slds-is-open')
      const cb = formElement.querySelector('[role="combobox"]')
      if (cb) cb.setAttribute('aria-expanded', 'true')
    }

    const close = () => {
      trigger.classList.remove('slds-is-open')
      focusedOptionIndex = -1
      const cb = formElement.querySelector('[role="combobox"]')
      if (cb) {
        cb.setAttribute('aria-expanded', 'false')
        cb.removeAttribute('aria-activedescendant')
      }
    }

    const getVisibleOptions = () => Array.from(list.querySelectorAll('[role="option"]'))

    const highlightOption = (index) => {
      const options = getVisibleOptions()
      options.forEach((opt) => opt.classList.remove('slds-has-focus'))
      const cb = formElement.querySelector('[role="combobox"]')

      if (index >= 0 && index < options.length) {
        focusedOptionIndex = index
        options[index].classList.add('slds-has-focus')
        if (cb) cb.setAttribute('aria-activedescendant', options[index].id)
        options[index].scrollIntoView({ block: 'nearest' })
      } else {
        focusedOptionIndex = -1
        if (cb) cb.removeAttribute('aria-activedescendant')
      }
    }

    const metaTextFor = (item) => {
      if (metaMode === 'prospect') {
        const title = item.title || ''
        const account = item.account || ''
        const tail = [title, account].filter(Boolean).join(' &bull; ')
        return entityLabel + (tail ? ' &bull; ' + tail : '')
      }
      if (metaMode === 'cadence') {
        const type = item.type || ''
        const steps = (item.steps != null) ? (item.steps + ' steps') : ''
        const tail = [type, steps].filter(Boolean).join(' &bull; ')
        return entityLabel + (tail ? ' &bull; ' + tail : '')
      }
      const city = item.city || ''
      const state = item.state || ''
      return entityLabel + ' &bull; ' + city + (city && state ? ', ' : '') + state
    }

    const matchesQuery = (item, q) => {
      if (metaMode === 'prospect') {
        return (
          (item.name || '').toLowerCase().indexOf(q) > -1 ||
          (item.title || '').toLowerCase().indexOf(q) > -1 ||
          (item.account || '').toLowerCase().indexOf(q) > -1
        )
      }
      if (metaMode === 'cadence') {
        return (
          (item.name || '').toLowerCase().indexOf(q) > -1 ||
          (item.type || '').toLowerCase().indexOf(q) > -1 ||
          (item.owner || '').toLowerCase().indexOf(q) > -1
        )
      }
      return (
        (item.name || '').toLowerCase().indexOf(q) > -1 ||
        (item.city || '').toLowerCase().indexOf(q) > -1 ||
        (item.state || '').toLowerCase().indexOf(q) > -1 ||
        (item.industry || '').toLowerCase().indexOf(q) > -1
      )
    }

    // ── Listbox <li> builders ───────────────────────────────────────
    // Two-group layout matches the design in blank.html: each section is
    // wrapped in <ul role="group" aria-labelledby="..."> with a
    // .slds-dropdown__header <li> at the top (role="presentation" so
    // keyboard nav skips it) followed by the option <li>s. A separator
    // <li> sits BETWEEN the two inner <ul>s. (Nested <ul> in <ul> is
    // technically non-standard markup but matches the locked design;
    // role="presentation" on the inner <ul>s neutralises the implicit
    // list semantics.)
    const headerLi = (id, text) =>
      '<li class="slds-dropdown__header" title="' + text + '" role="presentation" id="' + id + '">' +
        '<span>' + text + '</span>' +
      '</li>'

    const optionLi = (item, i) =>
      '<li role="presentation" class="slds-listbox__item">' +
        '<div id="' + listboxId + '-option-' + i + '" class="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option" data-idx="' + item._idx + '">' +
          '<span class="slds-media__figure slds-listbox__option-icon">' +
            '<span class="slds-icon_container ' + iconContainerClass + '">' +
              '<svg class="slds-icon slds-icon_small" aria-hidden="true">' +
                '<use xlink:href="' + iconSpritePath + '"></use>' +
              '</svg>' +
            '</span>' +
          '</span>' +
          '<span class="slds-media__body">' +
            '<span class="slds-listbox__option-text slds-listbox__option-text_entity">' + item.name + '</span>' +
            '<span class="slds-listbox__option-meta slds-listbox__option-meta_entity">' + metaTextFor(item) + '</span>' +
          '</span>' +
        '</div>' +
      '</li>'

    const emptyLi = () =>
      '<li role="presentation" class="slds-listbox__item">' +
        '<div class="slds-media slds-listbox__option slds-listbox__option_plain slds-text-align_center" role="presentation">' +
          '<span class="slds-listbox__option-text">' + emptyMessage + '</span>' +
        '</div>' +
      '</li>'

    const dividerLi = () =>
      '<li class="slds-has-divider_top-space" role="separator"></li>'

    const actionLi = (action, i) =>
      '<li role="presentation" class="slds-listbox__item">' +
        '<div id="' + listboxId + '-action-' + i + '" class="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option" data-action-idx="' + i + '">' +
          '<span class="slds-media__figure slds-listbox__option-icon">' +
            '<span class="slds-icon_container ' + ACTION_ICON_CLASS + '">' +
              '<svg class="slds-icon slds-icon_small" aria-hidden="true">' +
                '<use xlink:href="' + ACTION_ICON_HREF + '"></use>' +
              '</svg>' +
            '</span>' +
          '</span>' +
          '<span class="slds-media__body">' +
            '<span class="slds-listbox__option-text slds-listbox__option-text_entity">' + action.name + '</span>' +
            '<span class="slds-listbox__option-meta slds-listbox__option-meta_entity">' + action.meta + '</span>' +
          '</span>' +
        '</div>' +
      '</li>'

    const renderOptions = (items) => {
      let html = ''
      if (hasActions) {
        const optionsGroupId = listboxId + '-options-group'
        const actionsGroupId = listboxId + '-actions-group'
        // "Existing X" group: header + filtered items (or empty-state).
        html +=
          '<ul role="group" aria-labelledby="' + optionsGroupId + '">' +
            headerLi(optionsGroupId, optionsHeading) +
            (items.length ? items.map(optionLi).join('') : emptyLi()) +
          '</ul>'
        html += dividerLi()
        // "Agent Decide" group: header + always-visible action items.
        html +=
          '<ul role="group" aria-labelledby="' + actionsGroupId + '">' +
            headerLi(actionsGroupId, actionsHeading) +
            actions.map(actionLi).join('') +
          '</ul>'
      } else {
        // Backward-compat: lookups without actions render flat as today.
        // Empty state: when typeahead yields zero matches, render the
        // centered "No matches found" message instead of an empty list.
        html = items.length ? items.map(optionLi).join('') : emptyLi()
      }
      list.innerHTML = html

      list.querySelectorAll('[role="option"][data-idx]').forEach((opt) => {
        opt.addEventListener('click', () => {
          select(data[parseInt(opt.dataset.idx)])
        })
      })
      list.querySelectorAll('[data-action-idx]').forEach((opt) => {
        opt.addEventListener('click', () => {
          selectAction(actions[parseInt(opt.dataset.actionIdx)])
        })
      })
    }

    const filter = (query) => {
      const q = (query || '').toLowerCase().trim()
      let results = data.map((item, i) => Object.assign({}, item, { _idx: i }))
      if (isMulti) {
        const selectedNames = selectedItems.map((s) => s.name)
        results = results.filter((item) => selectedNames.indexOf(item.name) === -1)
      }
      if (q) {
        results = results.filter((item) => matchesQuery(item, q))
      } else if (metaMode !== 'prospect' && metaMode !== 'cadence') {
        results.sort((a, b) => (b.aopCriteria ? 1 : 0) - (a.aopCriteria ? 1 : 0))
      }
      renderOptions(results.slice(0, q ? 5 : 4))
      focusedOptionIndex = -1
    }

    const wireInput = (inputEl) => {
      // Popover-mode lookups don't render an SLDS option list — there's
      // no <ul> inside the dropdown to filter into. Just wire open/close
      // on the input; keyboard navigation and typeahead live inside the
      // popover (see src/scripts/cadence-popover.js). Escape still closes.
      if (isPopover) {
        inputEl.addEventListener('click', open)
        inputEl.addEventListener('focus', open)
        inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') close()
        })
        return
      }
      inputEl.addEventListener('click', () => { filter(inputEl.value); open() })
      inputEl.addEventListener('focus', () => { filter(inputEl.value); open() })
      inputEl.addEventListener('input', () => { filter(inputEl.value); open() })
      inputEl.addEventListener('keydown', (e) => {
        const options = getVisibleOptions()
        const count = options.length

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            if (!trigger.classList.contains('slds-is-open')) {
              filter(inputEl.value)
              open()
            }
            highlightOption(focusedOptionIndex < count - 1 ? focusedOptionIndex + 1 : 0)
            break
          case 'ArrowUp':
            e.preventDefault()
            highlightOption(focusedOptionIndex > 0 ? focusedOptionIndex - 1 : count - 1)
            break
          case 'Enter':
            e.preventDefault()
            if (focusedOptionIndex >= 0 && focusedOptionIndex < count) {
              const opt = options[focusedOptionIndex]
              if (opt.dataset.actionIdx != null) {
                selectAction(actions[parseInt(opt.dataset.actionIdx)])
              } else {
                select(data[parseInt(opt.dataset.idx)])
              }
            }
            break
          case 'Escape':
            close()
            break
        }
      })
    }

    const renderPills = () => {
      if (!pillList) return
      pillList.innerHTML = selectedItems.map((item, i) =>
        '<li class="slds-listbox-item">' +
          '<span class="slds-pill">' +
            '<span class="slds-pill__label" title="' + item.name + '">' + item.name + '</span>' +
            '<span class="slds-icon_container slds-pill__remove" title="Remove">' +
              '<button class="slds-button slds-button_icon slds-pill__remove" title="Remove" data-pill-idx="' + i + '">' +
                '<svg class="slds-button__icon" aria-hidden="true">' +
                  '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#close"></use>' +
                '</svg>' +
                '<span class="slds-assistive-text">Remove</span>' +
              '</button>' +
            '</span>' +
          '</span>' +
        '</li>'
      ).join('')
      pillList.querySelectorAll('[data-pill-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedItems.splice(parseInt(btn.dataset.pillIdx), 1)
          renderPills()
        })
      })
      document.dispatchEvent(new CustomEvent('lookup-selection-change', {
        detail: { selected: selectedItems.length > 0, multi: true, count: selectedItems.length, el: el }
      }))
    }

    const select = (account) => {
      if (isMulti) {
        if (selectedItems.some((s) => s.name === account.name)) { close(); return }
        selectedItems.push(account)
        renderPills()
        close()
        const inputEl = formElement.querySelector('.slds-combobox__input')
        if (inputEl) { inputEl.value = ''; inputEl.focus() }
        return
      }

      close()
      container.classList.add('slds-has-selection')
      formElement.classList.remove('slds-input-has-icon_right')
      formElement.classList.add('slds-input-has-icon_left-right')

      formElement.innerHTML =
        '<span class="slds-icon_container ' + iconContainerClass + ' slds-combobox__input-entity-icon" title="' + entityLabel + '">' +
          '<svg class="slds-icon slds-icon_small" aria-hidden="true">' +
            '<use xlink:href="' + iconSpritePath + '"></use>' +
          '</svg>' +
          '<span class="slds-assistive-text">' + entityLabel + '</span>' +
        '</span>' +
        '<div role="combobox" tabindex="0" class="slds-input_faux slds-combobox__input slds-combobox__input-value" ' +
          'aria-labelledby="' + labelId + '" id="' + inputId + '-selected-value" ' +
          'aria-controls="' + listboxId + '" aria-expanded="false" aria-haspopup="listbox">' +
          '<span class="slds-truncate">' + account.name + '</span>' +
        '</div>' +
        '<button class="slds-button slds-button_icon slds-input__icon slds-input__icon_right" title="Remove selected option">' +
          '<svg class="slds-button__icon" aria-hidden="true">' +
            '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#close"></use>' +
          '</svg>' +
          '<span class="slds-assistive-text">Remove selected option</span>' +
        '</button>'

      // Stop propagation so the document-level click handler below doesn't
      // see a click on the (now-replaced) x-button, mistake it for an
      // outside click, and immediately close the listbox we just opened
      // in clearSelection().
      formElement.querySelector('.slds-button_icon').addEventListener('click', (e) => {
        e.stopPropagation()
        clearSelection()
      })

      document.dispatchEvent(new CustomEvent('lookup-selection-change', {
        detail: { selected: true, account, el }
      }))
    }

    // Mirror of `select()` for agent-action items: renders the same chip
    // shape but uses the action's sparkles icon (instead of the lookup's
    // entity icon) and emits a `{ action }`-shaped event so consumers can
    // route to agent behavior. clearSelection() works for both branches
    // unchanged (it always restores the generic search input).
    const selectAction = (action) => {
      close()
      container.classList.add('slds-has-selection')
      formElement.classList.remove('slds-input-has-icon_right')
      formElement.classList.add('slds-input-has-icon_left-right')

      formElement.innerHTML =
        '<span class="slds-icon_container ' + ACTION_ICON_CLASS + ' slds-combobox__input-entity-icon" title="' + actionsHeading + '">' +
          '<svg class="slds-icon slds-icon_small" aria-hidden="true">' +
            '<use xlink:href="' + ACTION_ICON_HREF + '"></use>' +
          '</svg>' +
          '<span class="slds-assistive-text">' + actionsHeading + '</span>' +
        '</span>' +
        '<div role="combobox" tabindex="0" class="slds-input_faux slds-combobox__input slds-combobox__input-value" ' +
          'aria-labelledby="' + labelId + '" id="' + inputId + '-selected-value" ' +
          'aria-controls="' + listboxId + '" aria-expanded="false" aria-haspopup="listbox">' +
          '<span class="slds-truncate">' + action.name + '</span>' +
        '</div>' +
        '<button class="slds-button slds-button_icon slds-input__icon slds-input__icon_right" title="Remove selected option">' +
          '<svg class="slds-button__icon" aria-hidden="true">' +
            '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#close"></use>' +
          '</svg>' +
          '<span class="slds-assistive-text">Remove selected option</span>' +
        '</button>'

      formElement.querySelector('.slds-button_icon').addEventListener('click', (e) => {
        e.stopPropagation()
        clearSelection()
      })

      document.dispatchEvent(new CustomEvent('lookup-selection-change', {
        detail: { selected: true, action, el }
      }))
    }

    const clearSelection = () => {
      container.classList.remove('slds-has-selection')
      formElement.classList.remove('slds-input-has-icon_left-right')
      formElement.classList.add('slds-input-has-icon_right')
      delete el.dataset.lookupActionVariant

      formElement.innerHTML =
        '<input type="text" class="slds-input slds-combobox__input" id="' + inputId + '" ' +
          'aria-autocomplete="list" aria-controls="' + listboxId + '" aria-expanded="false" ' +
          'aria-haspopup="listbox" autocomplete="off" role="combobox" placeholder="Search ' + entityLabel + 's..." />' +
        '<span class="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_right">' +
          '<svg class="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">' +
            '<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#search"></use>' +
          '</svg>' +
        '</span>'

      const newInput = formElement.querySelector('.slds-combobox__input')
      wireInput(newInput)
      newInput.focus()
      if (!isPopover) filter('')
      open()

      document.dispatchEvent(new CustomEvent('lookup-selection-change', {
        detail: { selected: false, el }
      }))
    }

    wireInput(el.querySelector('.slds-combobox__input'))
    if (!isPopover) filter('')

    // Expose chip-render + close helpers on the wrapper so external
    // popover modules (e.g. src/scripts/cadence-popover.js) can drive
    // selection without duplicating the chip markup. select() handles
    // the entity chip path; selectAction() handles the sparkle/blue
    // agent chip path; close() removes slds-is-open on the trigger.
    if (isPopover) {
      el._lookupSelect = select
      el._lookupSelectAction = selectAction
      el._lookupClose = close

      // Single delegated click handler covers ANY click in the input
      // region — original input, post-select chip, the entity icon, the
      // search icon, and the blank space around them. The X clear
      // button calls e.stopPropagation() in its own handler, so this
      // listener never fires for that path (which would otherwise
      // re-open the popover the moment the chip is cleared). Attached
      // once at init since formElement itself is never replaced (only
      // its innerHTML).
      formElement.addEventListener('click', () => open())
    }

    const defaultName = el.dataset.lookupDefault
    if (defaultName) {
      const match = data.find((item) => item.name.toLowerCase() === defaultName.toLowerCase())
      if (match) select(match)
    }

    document.addEventListener('click', (e) => {
      if (!el.contains(e.target)) close()
    })
  })
}

initLookups()

/**
 * Picklist (read-only combobox)
 * https://www.lightningdesignsystem.com/components/combobox/
 *
 * Auto-wires every slds-input_faux combobox that is NOT already handled
 * by initLookups (i.e. no data-slds-lookup ancestor).
 */
const initPicklists = () => {
  const triggers = document.querySelectorAll(
    '.slds-combobox.slds-dropdown-trigger_click'
  )

  triggers.forEach((trigger) => {
    if (trigger.closest('[data-slds-lookup]')) return

    const combobox = trigger.querySelector('.slds-input_faux[role="combobox"]')
    if (!combobox) return

    const listbox = trigger.querySelector('[role="listbox"]')
    if (!listbox) return

    const open = () => {
      trigger.classList.add('slds-is-open')
      combobox.setAttribute('aria-expanded', 'true')
    }

    const close = () => {
      trigger.classList.remove('slds-is-open')
      combobox.setAttribute('aria-expanded', 'false')
      combobox.removeAttribute('aria-activedescendant')
    }

    combobox.addEventListener('click', () => {
      trigger.classList.contains('slds-is-open') ? close() : open()
    })

    combobox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        trigger.classList.contains('slds-is-open') ? close() : open()
      } else if (e.key === 'Escape') {
        close()
      }
    })

    const formElement = combobox.closest('.slds-combobox__form-element')

    const selectOption = (option) => {
      const labelEl = option.querySelector('.slds-listbox__option-text') || option.querySelector('[title]')
      const text = labelEl
        ? (labelEl.getAttribute('title') || labelEl.textContent.trim())
        : option.textContent.trim()

      const valueSpan = combobox.querySelector('.slds-truncate')
      if (valueSpan) valueSpan.textContent = text

      listbox.querySelectorAll('[role="option"]').forEach((o) =>
        o.classList.remove('slds-is-selected')
      )
      option.classList.add('slds-is-selected')

      if (formElement) {
        const existingIcon = formElement.querySelector('.slds-combobox__input-entity-icon')
        if (existingIcon) existingIcon.remove()

        const figureIcon = option.querySelector('.slds-media__figure .slds-icon_container')
        if (figureIcon) {
          const clone = figureIcon.cloneNode(true)
          clone.classList.add('slds-combobox__input-entity-icon')
          formElement.insertBefore(clone, formElement.firstChild)
          formElement.classList.remove('slds-input-has-icon_right')
          formElement.classList.add('slds-input-has-icon_left-right')
        } else {
          formElement.classList.remove('slds-input-has-icon_left-right')
          formElement.classList.add('slds-input-has-icon_right')
        }
      }
    }

    listbox.querySelectorAll('[role="option"]').forEach((option) => {
      option.addEventListener('click', () => {
        selectOption(option)
        close()
      })
    })

    const firstOption = listbox.querySelector('[role="option"]')
    if (firstOption) selectOption(firstOption)

    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target)) close()
    })
  })
}

initPicklists()

/**
 * Tabs
 * https://www.lightningdesignsystem.com/components/tabs/
 */

const tabs = (variant) => document.querySelectorAll(`.slds-tabs_${variant} [role=tablist] [role=tab]`)
const tabActiveReset = (tab) => Array.from(tab.parentNode.parentNode.querySelectorAll('li'))
  .forEach((element) => element.classList.remove('slds-is-active'))
const tabActiveSet = (tab) => tab.parentNode.classList.add('slds-is-active')
const tabPanelsReset = (tab) => Array.from(tab.parentNode.parentNode.parentNode.querySelectorAll('[role="tabpanel"]'))
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
const verticalTabs = document.querySelectorAll('.slds-vertical-tabs [role=tablist] [role=tab]')

const assignTabEvents = (event) => {
  tabActiveReset(event.currentTarget)
  tabActiveSet(event.currentTarget)
  tabPanelsReset(event.currentTarget)
  tabPanelShow(event.currentTarget)
}

Array.from(defaultTabs).forEach((tab) => {
  tab.addEventListener('click', assignTabEvents, false)
})
Array.from(scopedTabs).forEach((tab) => {
  tab.addEventListener('click', assignTabEvents, false)
})
Array.from(verticalTabs).forEach((tab) => {
  tab.addEventListener('click', assignTabEvents, false)
})

/**
 * Vertical Nav Tabs (radio-based)
 * Any radio inside .slds-nav-vertical with a data-panel attribute
 * will show/hide the referenced panel on change.
 */
document.querySelectorAll('.slds-nav-vertical input[type="radio"][data-panel]').forEach((radio) => {
  radio.addEventListener('change', () => {
    const group = radio.closest('.slds-nav-vertical')
    group.querySelectorAll('input[type="radio"][data-panel]').forEach((r) => {
      const panel = document.getElementById(r.dataset.panel)
      if (!panel) return
      panel.classList.remove('slds-show', 'slds-hide')
      panel.classList.add(r.checked ? 'slds-show' : 'slds-hide')
    })
  })
})

/**
 * Tab Nav
 * Clickable slds-item-active toggle for #tab-nav items
 */
const tabNav = document.getElementById('tab-nav')
if (tabNav) {
  const tabNavItems = tabNav.querySelectorAll('.slds-item > div')
  tabNavItems.forEach((tabDiv) => {
    tabDiv.addEventListener('click', () => {
      const current = tabNav.querySelector('.slds-item-active')
      if (current) current.classList.remove('slds-item-active')
      tabDiv.classList.add('slds-item-active')
    })
  })
}
