if (typeof initLookups === 'function') initLookups()

;(function () {
  // Save enables once Steps 1, 2, and 3 are confirmed. Step 4
  // (Follow-up Automation) and step 5 (Automated Assignments) are
  // BOTH treated as optional peers that don't gate Save — confirming
  // either just collapses that section into its own gray banner.
  // Step 4/5 also use the SAME reveal trigger: showStep3Confirmed
  // reveals #follow-up-content AND #step-4-content simultaneously,
  // matching the "these are independent post-approval configuration
  // sections" story the sections themselves tell.
  //
  // Data-attribute contract for the two post-step-3 sections:
  //   • Follow-up Automation → `data-step="follow-up"` on the Confirm
  //     wrapper, DOM ids `#follow-up-content` / `#follow-up-banner`,
  //     `[data-followup-*]` on every hook inside the section.
  //   • Automated Assignments → LEGACY `data-step="4"` on the Confirm
  //     wrapper preserved even though the visible section-number
  //     was renumbered to "5". Keeping `data-step="4"` avoids
  //     rewiring every existing selector in this file (`step4*`,
  //     `[data-aa-*]`, `#step-4-content` / `#step-4-banner`).
  var REQUIRED_STEPS = 3
  var confirmedSteps = new Set()

  // NOTE: `pa-continue-btn` is intentionally NOT in this list. Continue is
  // pure navigation across the whole flow (see step_01-04, knowledge_data,
  // channel_settings — none of those gate Continue), so wiring it into the
  // sub-step gating here meant clicking Continue on Automated Assignments
  // silently no-op'd until the user discovered the buried Confirm buttons.
  // Save still gates on confirms because it's a commit-of-data semantic.
  var saveContinueBtns = [
    document.getElementById('pa-save-btn'),
    document.getElementById('save-continue-btn')
  ].filter(Boolean)

  var radioCards = document.querySelectorAll('#step-1-content .radio-card[data-value]')
  var configCards = document.querySelectorAll('.volume-config-card[data-config]')
  var confirmButtons = document.querySelectorAll('[data-step] .slds-button_brand')

  var step1Content = document.getElementById('step-1-content')
  var step1Banner = document.getElementById('step-1-banner')
  var step2Content = document.getElementById('step-2-content')
  var step2Banner = document.getElementById('step-2-banner')
  var step3Content = document.getElementById('step-3-content')
  var step3Banner = document.getElementById('step-3-banner')
  var followupContent = document.getElementById('follow-up-content')
  var followupBanner = document.getElementById('follow-up-banner')
  var step4Content = document.getElementById('step-4-content')
  var step4Banner = document.getElementById('step-4-banner')

  function bannerEditBtn(banner) {
    return banner ? banner.querySelector('.slds-button:not(.slds-button_brand)') : null
  }
  var step1EditBtn = bannerEditBtn(step1Banner)
  var step2EditBtn = bannerEditBtn(step2Banner)
  var step3EditBtn = bannerEditBtn(step3Banner)
  var followupEditBtn = bannerEditBtn(followupBanner)
  var step4EditBtn = bannerEditBtn(step4Banner)

  var routingCards = document.querySelectorAll('.radio-card-full')
  var step3ConfirmBtn = document.querySelector('[data-step="3"] .slds-button_brand')
  var followupConfirmBtn = document.querySelector('[data-step="follow-up"] .slds-button_brand')
  var step4ConfirmBtn = document.querySelector('[data-step="4"] .slds-button_brand')
  var step3RadioCards = step3Content ? step3Content.querySelectorAll('.radio-card[data-value]') : []
  var step4RadioCards = step4Content ? step4Content.querySelectorAll('.radio-card[data-value]') : []

  // Step 3 now has ONE configuration panel (the "Assign Unowned
  // Prospects" pill picker) shared by both remaining ownership modes
  // (`followExisting` and `redistribute`). The previous panel-swap
  // machinery (`data-step3-panel="lookup" | "downstream"`) collapsed
  // when the downstream mode moved to the Follow-up Automation
  // section below.
  var step3UserLookup = step3Content
    ? step3Content.querySelector('[data-step3-panel="lookup"] [data-lookup-multi="true"]')
    : null
  var step3ClearBtn = step3Content ? step3Content.querySelector('[data-step3-clear-btn]') : null
  var step3BannerDesc = step3Banner
    ? step3Banner.querySelector('.confirmed-banner-description')
    : null

  // ── Follow-up Automation (new step 4) — element refs ─────────────
  // Everything below moved out of `#step-3-content` into
  // `#follow-up-content`. IDs (`#downstream-agent-select`,
  // `#handoff-wait-value`, etc.) were preserved on the moved
  // elements so any downstream label `<label for="…">` bindings
  // still resolve after the DOM shuffle.
  var followupAccordionTrigger = followupContent
    ? followupContent.querySelector('[data-followup-accordion-trigger]')
    : null
  var followupToggle = followupContent ? followupContent.querySelector('[data-followup-toggle]') : null
  var followupConfig = followupContent ? followupContent.querySelector('[data-followup-config]') : null
  var followupClearBtn = followupContent
    ? followupContent.querySelector('[data-followup-clear-btn]')
    : null
  var followupDownstreamSelect = followupContent
    ? followupContent.querySelector('[data-downstream-agent]')
    : null
  var followupHandoffWaitValue = followupContent
    ? followupContent.querySelector('[data-handoff-wait-value]')
    : null
  var followupHandoffWaitDec = followupContent
    ? followupContent.querySelector('[data-handoff-wait-dec]')
    : null
  var followupHandoffWaitInc = followupContent
    ? followupContent.querySelector('[data-handoff-wait-inc]')
    : null
  var followupHandoffUnitInputs = followupContent
    ? followupContent.querySelectorAll('[data-handoff-unit]')
    : []
  var followupAgentDetailsToggle = followupContent
    ? followupContent.querySelector('[data-agent-details-toggle]')
    : null
  var followupAgentDetailsPanel = followupContent
    ? followupContent.querySelector('[data-agent-details-panel]')
    : null
  var followupAgentDetailsControls = followupContent
    ? followupContent.querySelector('[data-agent-details-controls]')
    : null
  var followupBannerDesc = followupBanner
    ? followupBanner.querySelector('[data-followup-banner-desc]')
    : null

  // ── Follow-up: unavailable-state hooks ──────────────────────────────
  // Scoped notification surfaced when zero eligible downstream agents
  // exist (empty state) or when a saved handoff config references an
  // agent that has since been deactivated (Scenario 7A in the spec).
  var followupUnavailableNotice = followupContent
    ? followupContent.querySelector('[data-handoff-unavailable-notice]')
    : null
  var followupUnavailableNoticeInvalid = followupContent
    ? followupContent.querySelector('[data-handoff-unavailable-notice-invalid]')
    : null

  // Progressive-disclosure state for "View Agent Details". Kept as
  // a module-level flag so the panel STAYS open as the user
  // switches between agents (only the values re-hydrate, not the
  // visibility) — matching the same UX contract the previous
  // step-3 downstream panel had.
  var followupAgentDetailsExpanded = false

  // Mock catalog for the three prototype agents. In a live build these
  // would come from the same API that hydrates the <option>s above; the
  // shape is intentionally kept flat so `data-agent-detail="key"` in the
  // markup maps 1:1 to the string that renders in each row.
  var AGENT_DETAILS = {
    buyerEngagement: {
      agentName: 'Buyer Engagement Agent',
      selectedAgent: "Priya's Agent",
      template: 'Buyer Engagement',
      userRecord: 'Welo Sales Agent',
      createdDate: 'Feb 4, 2026'
    },
    leadNurturing: {
      agentName: 'Lead Nurturing Agent',
      selectedAgent: "Tina's Agent",
      template: 'Lead Nurturing',
      userRecord: 'Welo Sales Agent',
      createdDate: 'Mar 13, 2026'
    },
    sdrOutreach: {
      agentName: 'SDR Outreach Agent',
      selectedAgent: "Marcus's Agent",
      template: 'SDR Outreach',
      userRecord: 'Welo Sales Agent',
      createdDate: 'May 22, 2026'
    }
  }

  // ── Follow-up: downstream-agent availability ────────────────────────
  // The "Hand Off to Agent" section supports two states per spec:
  //   1. hasAvailableDownstreamAgents === true  → normal toggle-gated
  //      configuration surface (existing behavior).
  //   2. hasAvailableDownstreamAgents === false → scoped notification
  //      + disabled toggle + hidden config fields + disabled Confirm.
  //
  // The availability boolean is DERIVED from the current eligible
  // options in the Select Agent dropdown (`data-downstream-agent`).
  // That keeps the check tied to the actual data source and honors
  // the spec: "Do not hardcode the empty state directly into the UI."
  // A live build would replace `<option>` seeding with an API call —
  // the same helpers below would still produce the right boolean.
  //
  // Prototype demo hooks: two URL query params (`?downstreamAgents=…`)
  // let a designer / PM demo either state without touching code:
  //   • `?downstreamAgents=none`         — empty-state notice + disabled
  //     toggle + hidden config (Sections 2–5 of the spec).
  //   • `?downstreamAgents=noneWithInvalidSaved` — Scenario 7A: no
  //     eligible agents AND a saved config points at a deactivated
  //     agent. Primary notice + secondary "previously selected agent
  //     is no longer available" copy.
  //
  // These params only mutate the `<option>` list + toggle state on
  // load — every downstream helper reads from those DOM sources, so
  // the same code paths run whether the state came from a URL flag or
  // from a live API. Anything not covered by a flag defaults to the
  // "available" scenario with the toggle Off.
  function getFollowupAgentsModeParam() {
    try {
      var url = new URL(window.location.href)
      return url.searchParams.get('downstreamAgents') || ''
    } catch (e) {
      return ''
    }
  }

  function getEligibleDownstreamAgentOptions() {
    // Eligible = has a truthy value (excludes the "Select an agent…"
    // placeholder) and is not marked disabled. Live builds would filter
    // on an `isActive` / `isEligible` flag from the API response; the
    // <option>.disabled parity keeps the mock aligned with that shape.
    if (!followupDownstreamSelect) return []
    return Array.prototype.filter.call(
      followupDownstreamSelect.options,
      function (opt) { return !!opt.value && !opt.disabled }
    )
  }

  function hasAvailableDownstreamAgents() {
    return getEligibleDownstreamAgentOptions().length > 0
  }

  // Track whether the current saved handoff config references an agent
  // that's no longer eligible. Flipped by the URL-param seed below
  // (Scenario 7A). Live builds would set this after reconciling the
  // saved `HandoffConfig.downstreamAgentId` against the eligible list.
  var followupSavedAgentInvalid = false

  function applyFollowupAgentsPrototypeState() {
    // Called once on init. Simulates the two "missing prerequisite"
    // scenarios from the spec by mutating the dropdown's option list
    // and (for Scenario 7) seeding the toggle to look "previously
    // enabled". All downstream state derives from the resulting DOM,
    // so nothing else needs to know how the state was seeded.
    var mode = getFollowupAgentsModeParam()
    if (!followupDownstreamSelect) return

    if (mode === 'none' || mode === 'noneWithInvalidSaved') {
      // Zero eligible agents — strip every real option and leave only
      // the "Select an agent…" placeholder so the count is 0. The
      // section will render the scoped notification + disabled toggle.
      Array.prototype.slice.call(followupDownstreamSelect.options).forEach(function (opt) {
        if (opt.value) followupDownstreamSelect.removeChild(opt)
      })
      followupDownstreamSelect.value = ''
      if (mode === 'noneWithInvalidSaved') {
        // Scenario 7A — the config was saved ON with a downstream
        // agent that's since been deactivated. Flip the toggle to
        // match the persisted state; `applyFollowupAvailabilityState`
        // will render the secondary "previously selected" copy on the
        // notification and keep the toggle disabled.
        followupSavedAgentInvalid = true
        if (followupToggle) followupToggle.checked = true
      }
    }
    // Any other value (or none at all) → default "available" state.
  }

  // ── Step 3: ownership-mode helpers ────────────────────────────────
  function getActiveStep3Mode() {
    if (!step3Content) return 'redistribute'
    var checked = step3Content.querySelector('input[name="assignmentMode"]:checked')
    return checked ? checked.value : 'redistribute'
  }

  function refreshStep3Confirm() {
    if (!step3ConfirmBtn) return
    // Both remaining ownership modes (`followExisting`, `redistribute`)
    // share the same "Assign Unowned Prospects" pill picker; Confirm
    // is gated purely on that picker having at least one selection.
    var count = step3UserLookup ? step3UserLookup.querySelectorAll('.slds-pill').length : 0
    if (count > 0) step3ConfirmBtn.removeAttribute('disabled')
    else step3ConfirmBtn.setAttribute('disabled', '')
  }

  // ── Step 3 + Follow-up: accordion toggle behavior ─────────────────
  // Shared toggle for both sections' accordion chrome. Trigger stays
  // a <button> for A11y semantics; the click handler flips the
  // `slds-is-open` class + aria-expanded, and CSS hides the
  // description + `.slds-accordion__conten` body when the section
  // loses `slds-is-open`. Space/Enter keyboard toggling comes for
  // free from the <button> element.
  function toggleAccordion(trigger, syncFooter) {
    var section = trigger.closest('.slds-accordion__section')
    if (!section) return
    var willOpen = !section.classList.contains('slds-is-open')
    section.classList.toggle('slds-is-open', willOpen)
    trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false')
    if (typeof syncFooter === 'function') syncFooter()
  }

  function syncStep3FooterVisibility() {
    if (!step3Content) return
    var footer = step3Content.querySelector('[data-step3-footer]')
    if (!footer) return
    // Only one accordion left inside step 3; footer follows its
    // open/closed state.
    var section = step3Content.querySelector('.slds-accordion__section')
    var isOpen = !!(section && section.classList.contains('slds-is-open'))
    footer.hidden = !isOpen
  }

  function setupStep3Accordions() {
    if (!step3Content) return
    var triggers = step3Content.querySelectorAll('[data-step3-accordion-trigger]')
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault()
        toggleAccordion(trigger, syncStep3FooterVisibility)
      })
    })
  }

  // ── Follow-up: toggle-gated reveal + confirm gating ──────────────
  function getFollowupToggleEnabled() {
    return !!(followupToggle && followupToggle.checked)
  }

  // Effective handoff-enabled — bakes in the availability gate so the
  // rest of the code can treat "toggle checked" AND "eligible agents
  // exist" as a single boolean. Mirrors the spec's suggested contract:
  //   const effectiveHandoffEnabled =
  //     hasAvailableDownstreamAgents && handoffConfig.enabled;
  function getFollowupEffectiveEnabled() {
    return hasAvailableDownstreamAgents() && getFollowupToggleEnabled()
  }

  function getFollowupDownstreamValue() {
    return followupDownstreamSelect ? followupDownstreamSelect.value : ''
  }

  function getFollowupHandoffWaitValue() {
    if (!followupHandoffWaitValue) return ''
    return followupHandoffWaitValue.value
  }

  function getFollowupHandoffUnit() {
    if (!followupHandoffUnitInputs || !followupHandoffUnitInputs.length) return ''
    for (var i = 0; i < followupHandoffUnitInputs.length; i++) {
      if (followupHandoffUnitInputs[i].checked) return followupHandoffUnitInputs[i].value
    }
    return ''
  }

  // ── Follow-up: availability state (unavailable-agents gating) ─────
  // Coordinates every affordance the section shows/hides based on
  // `hasAvailableDownstreamAgents()` + the "saved config references a
  // deactivated agent" flag (`followupSavedAgentInvalid`). Called any
  // time either input changes (init + toggle-change + agent-change).
  //
  //   Available branch: toggle enabled, no notice.
  //   Unavailable branch (0 eligible agents): notice shown, toggle
  //     disabled in OFF state, config fields hidden, Confirm disabled.
  //   Scenario 7A (0 eligible + saved-invalid): unavailable branch +
  //     secondary notice copy revealed.
  //
  // Kept idempotent so re-invocations never leave a stale attribute
  // behind — each branch explicitly removes the attributes/classes the
  // other branch may have added.
  function applyFollowupAvailabilityState() {
    var available = hasAvailableDownstreamAgents()

    // 1) Scoped notification — reveal for unavailable, keep the
    //    secondary "previously selected agent" line under
    //    Scenario 7A only. Left in DOM (with `hidden`) so aria-
    //    describedby on the toggle keeps pointing at a real node.
    if (followupUnavailableNotice) {
      if (!available) followupUnavailableNotice.removeAttribute('hidden')
      else followupUnavailableNotice.setAttribute('hidden', '')
    }
    if (followupUnavailableNoticeInvalid) {
      if (!available && followupSavedAgentInvalid) {
        followupUnavailableNoticeInvalid.removeAttribute('hidden')
      } else {
        followupUnavailableNoticeInvalid.setAttribute('hidden', '')
      }
    }

    // 2) Toggle — visible in both states so the capability stays
    //    discoverable; disabled when unavailable so the user can't
    //    flip it on into a broken config. Force it to OFF when
    //    disabling so effectiveHandoffEnabled === false regardless
    //    of any persisted state.
    if (followupToggle) {
      if (!available) {
        followupToggle.checked = false
        followupToggle.setAttribute('disabled', '')
        followupToggle.setAttribute('aria-disabled', 'true')
      } else {
        followupToggle.removeAttribute('disabled')
        followupToggle.removeAttribute('aria-disabled')
      }
    }

    // 3) Configuration fields — hide the whole `.followup-config`
    //    wrapper in the unavailable branch so Select Agent, Time to
    //    wait, unit radios, and View Agent Details all leave the tab
    //    order in one shot. The available branch defers to
    //    `syncFollowupConfig()` for the standard toggle-gated reveal.
    if (!available && followupConfig) {
      followupConfig.setAttribute('hidden', '')
      followupAgentDetailsExpanded = false
      if (followupAgentDetailsControls) {
        followupAgentDetailsControls.setAttribute('hidden', '')
      }
      if (followupAgentDetailsPanel) {
        followupAgentDetailsPanel.setAttribute('hidden', '')
      }
    }

    // 4) Clear All — spec: keep available only if there IS existing
    //    saved handoff configuration that can be cleared. In the
    //    unavailable branch we treat the saved-invalid flag as the
    //    signal that a clearable state exists; otherwise disable so
    //    the action doesn't dangle over an empty state.
    if (followupClearBtn) {
      var canClear = available || followupSavedAgentInvalid
      if (canClear) {
        followupClearBtn.removeAttribute('disabled')
        followupClearBtn.setAttribute('aria-disabled', 'false')
      } else {
        followupClearBtn.setAttribute('disabled', '')
        followupClearBtn.setAttribute('aria-disabled', 'true')
      }
    }
  }

  // Confirm gating — mirrors the Guided Config pattern shared with
  // steps 1/2/3: every step ends with an explicit Confirm, and a
  // disabled feature ("No downstream handoff") is treated as a valid,
  // intentional configuration rather than an incomplete state.
  //
  //   • No eligible downstream agents → Confirm disabled. The section
  //     is gated by the scoped "No downstream agents available"
  //     notice; there's nothing meaningful for Confirm to save until
  //     the org has at least one active downstream agent.
  //   • Toggle OFF → Confirm ENABLED. Confirming here saves the
  //     "No handoff" configuration and collapses the section into
  //     the standard gray summary row, exactly like the confirmed
  //     state of the ownership section above.
  //   • Toggle ON  → Confirm requires agent + valid wait value +
  //     unit. Wait value must parse to a non-negative integer >= 1
  //     (0 hours/days would be a no-op handoff, which is a bug not
  //     a valid config).
  function refreshFollowupConfirm() {
    if (!followupConfirmBtn) return
    if (!hasAvailableDownstreamAgents()) {
      followupConfirmBtn.setAttribute('disabled', '')
      return
    }
    if (!getFollowupToggleEnabled()) {
      followupConfirmBtn.removeAttribute('disabled')
      return
    }
    var agent = getFollowupDownstreamValue()
    var waitRaw = getFollowupHandoffWaitValue()
    var waitN = parseInt(waitRaw, 10)
    var unit = getFollowupHandoffUnit()
    var valid = !!agent && !isNaN(waitN) && waitN >= 1 && !!unit
    if (valid) followupConfirmBtn.removeAttribute('disabled')
    else followupConfirmBtn.setAttribute('disabled', '')
  }

  function syncFollowupConfig() {
    if (!followupConfig) return
    // Availability gate short-circuits the reveal — no eligible agents
    // means the config surface stays hidden regardless of any residual
    // toggle state. `applyFollowupAvailabilityState()` will already
    // have forced the toggle to OFF in that branch, but we guard here
    // too so this helper is safe to call in isolation.
    if (!hasAvailableDownstreamAgents()) {
      followupConfig.setAttribute('hidden', '')
      followupAgentDetailsExpanded = false
      syncFollowupAgentDetails()
      return
    }
    // Keep the accordion open/closed state coupled to the toggle so
    // the section reads as a single unit — one primary control that
    // reveals/hides the whole configuration surface. This satisfies
    // the Guided Config default ("Toggle OFF ⇒ configuration panel
    // remains collapsed") and its inverse ("Toggle ON ⇒ expand the
    // configuration panel") without leaving the accordion in an
    // orphaned state where the header is open but the fields inside
    // are `hidden` because the toggle is OFF.
    var section = followupContent
      ? followupContent.querySelector('.slds-accordion__section')
      : null
    if (getFollowupToggleEnabled()) {
      followupConfig.removeAttribute('hidden')
      if (section && !section.classList.contains('slds-is-open')) {
        section.classList.add('slds-is-open')
        if (followupAccordionTrigger) {
          followupAccordionTrigger.setAttribute('aria-expanded', 'true')
        }
      }
    } else {
      followupConfig.setAttribute('hidden', '')
      if (section && section.classList.contains('slds-is-open')) {
        section.classList.remove('slds-is-open')
        if (followupAccordionTrigger) {
          followupAccordionTrigger.setAttribute('aria-expanded', 'false')
        }
      }
    }
    // Ensure the details panel visibility is re-derived after any
    // config-visibility change; specifically, when the toggle flips
    // OFF we want to collapse "View Agent Details" too so it doesn't
    // reappear stale the next time the toggle flips back on.
    if (!getFollowupToggleEnabled()) {
      followupAgentDetailsExpanded = false
    }
    syncFollowupAgentDetails()
  }

  function resetFollowupToDefaults() {
    // Spec: Clear All should clear the selected agent, reset wait to
    // 3 hours, collapse expanded agent details, and LEAVE THE TOGGLE
    // ENABLED (spec: "Leave the toggle enabled unless the existing
    // prototype pattern indicates otherwise"). Existing prototype
    // doesn't have a competing pattern, so we honor the spec default.
    if (followupDownstreamSelect) {
      // Restore the disabled "Select an agent..." placeholder by
      // clearing the value; the placeholder <option> is
      // `disabled selected` in markup so value='' snaps back to it.
      followupDownstreamSelect.value = ''
    }
    if (followupHandoffWaitValue) {
      followupHandoffWaitValue.value =
        followupHandoffWaitValue.dataset.handoffWaitDefaultValue || '3'
    }
    if (followupHandoffUnitInputs && followupHandoffUnitInputs.length) {
      Array.prototype.forEach.call(followupHandoffUnitInputs, function (r) {
        r.checked = r.hasAttribute('data-handoff-unit-default-checked')
      })
    }
    // Clearing wipes the "saved config referenced a deactivated agent"
    // signal — after Clear All the section has no persisted state to
    // reconcile against, so the Scenario-7A secondary notice copy
    // should dismiss on the next `applyFollowupAvailabilityState()`
    // pass.
    followupSavedAgentInvalid = false
    followupAgentDetailsExpanded = false
    syncFollowupAgentDetails()
  }

  // ── Follow-up: Time to wait before handoff stepper ────────────────
  function clampFollowupHandoffWait(value) {
    var n = parseInt(value, 10)
    if (isNaN(n) || n < 0) n = 0
    return String(n)
  }

  function stepFollowupHandoffWait(delta) {
    if (!followupHandoffWaitValue) return
    var current = parseInt(followupHandoffWaitValue.value, 10)
    if (isNaN(current))
      current = parseInt(followupHandoffWaitValue.dataset.handoffWaitDefaultValue || '3', 10)
    followupHandoffWaitValue.value = clampFollowupHandoffWait(current + delta)
  }

  // ── Follow-up: Agent details progressive disclosure ──────────────
  function updateFollowupAgentDetailsContent() {
    if (!followupAgentDetailsPanel) return
    var value = getFollowupDownstreamValue()
    var detail = AGENT_DETAILS[value]
    if (!detail) return
    Object.keys(detail).forEach(function (key) {
      var cell = followupAgentDetailsPanel.querySelector('[data-agent-detail="' + key + '"]')
      if (cell) cell.textContent = detail[key]
    })
  }

  function syncFollowupAgentDetails() {
    var hasValue = !!getFollowupDownstreamValue() && getFollowupToggleEnabled()
    if (!hasValue) followupAgentDetailsExpanded = false

    if (followupAgentDetailsControls) {
      if (hasValue) followupAgentDetailsControls.removeAttribute('hidden')
      else followupAgentDetailsControls.setAttribute('hidden', '')
    }
    if (followupAgentDetailsToggle) {
      followupAgentDetailsToggle.textContent = followupAgentDetailsExpanded
        ? 'Hide Agent Details'
        : 'View Agent Details'
      followupAgentDetailsToggle.setAttribute(
        'aria-expanded',
        followupAgentDetailsExpanded ? 'true' : 'false'
      )
    }
    if (followupAgentDetailsPanel) {
      if (followupAgentDetailsExpanded && hasValue) {
        updateFollowupAgentDetailsContent()
        followupAgentDetailsPanel.removeAttribute('hidden')
      } else {
        followupAgentDetailsPanel.setAttribute('hidden', '')
      }
    }
  }

  document.addEventListener('lookup-selection-change', function (e) {
    if (!step3ConfirmBtn || !e.detail.multi) return
    if (!e.detail.el || !step3Content || !step3Content.contains(e.detail.el)) return
    if (e.detail.el !== step3UserLookup) return
    if (e.detail.count > 0) {
      step3ConfirmBtn.removeAttribute('disabled')
    } else {
      step3ConfirmBtn.setAttribute('disabled', '')
    }
  })

  // ── Step 5 (legacy `data-step="4"`): Automated Assignments ────────
  // The Yes/No radio cards toggle the gray expression-builder card.
  // Confirm uses `data-step="4"` so it routes through the same
  // confirmButtons listener as steps 1/3/follow-up; the `stepId === '4'`
  // branch below drives the banner-transition.
  var step4Expression = step4Content ? step4Content.querySelector('[data-aa-expression]') : null
  var step4ConditionList = step4Content ? step4Content.querySelector('[data-aa-condition-list]') : null
  var step4AddConditionBtn = step4Content ? step4Content.querySelector('[data-aa-add-condition]') : null
  var step4ClearBtn = step4Content ? step4Content.querySelector('[data-aa-clear-btn]') : null
  var step4RowTemplate = document.getElementById('aa-condition-row-template')
  var step4BannerDesc = step4Banner ? step4Banner.querySelector('[data-step4-banner-desc]') : null

  function getStep4Choice() {
    if (!step4Content) return null
    var checked = step4Content.querySelector('input[name="aaEnabled"]:checked')
    return checked ? checked.value : null
  }

  function refreshStep4Confirm() {
    if (!step4ConfirmBtn) return
    var choice = getStep4Choice()
    if (choice) step4ConfirmBtn.removeAttribute('disabled')
    else step4ConfirmBtn.setAttribute('disabled', '')
  }

  function syncStep4Expression() {
    if (!step4Expression) return
    var choice = getStep4Choice()
    if (choice === 'yes') {
      step4Expression.removeAttribute('hidden')
      if (step4ConditionList && !step4ConditionList.querySelector('[data-aa-condition-row]')) {
        addStep4ConditionRow()
      }
    } else {
      step4Expression.setAttribute('hidden', '')
    }
  }

  function syncStep4OnceLabels() {
    if (!step4ConditionList) return
    var rows = step4ConditionList.querySelectorAll('[data-aa-condition-row]')
    rows.forEach(function (row, idx) {
      var labels = row.querySelectorAll('.aa-condition-row__label-once')
      labels.forEach(function (label) {
        if (idx === 0) label.classList.remove('is-empty')
        else label.classList.add('is-empty')
      })
    })
  }

  function wireStep4ConditionRow(row) {
    var deleteBtn = row.querySelector('[data-aa-delete-condition]')
    if (!deleteBtn) return
    deleteBtn.addEventListener('click', function () {
      var rows = step4ConditionList.querySelectorAll('[data-aa-condition-row]')
      if (rows.length <= 1) return
      row.remove()
      syncStep4OnceLabels()
    })
  }

  function addStep4ConditionRow() {
    if (!step4ConditionList || !step4RowTemplate) return null
    var clone = document.importNode(step4RowTemplate.content, true)
    var row = clone.querySelector('[data-aa-condition-row]')
    step4ConditionList.appendChild(clone)
    wireStep4ConditionRow(row)
    syncStep4OnceLabels()
    return row
  }

  function resetStep4ToDefaults() {
    if (!step4Content) return
    step4RadioCards.forEach(function (rc) {
      rc.dataset.selected = 'false'
      var input = rc.querySelector('input[type="radio"]')
      if (input) input.checked = false
      rc.classList.remove('radio-card--selected')
    })
    step4Content.querySelectorAll('input[name="aaTrigger"]').forEach(function (r) {
      r.checked = !!r.dataset.aaDefaultChecked
    })
    step4Content.querySelectorAll('select[data-aa-default-value]').forEach(function (sel) {
      var def = sel.dataset.aaDefaultValue
      var matched = false
      Array.prototype.forEach.call(sel.options, function (opt) {
        if (opt.text === def || opt.value === def) {
          opt.selected = true
          matched = true
        }
      })
      if (!matched && sel.options.length) sel.options[0].selected = true
    })
    if (step4ConditionList) step4ConditionList.innerHTML = ''
    syncStep4Expression()
    refreshStep4Confirm()
  }

  // ── Save-button gating ────────────────────────────────────────────
  function checkSaveContinue() {
    if (!saveContinueBtns.length) return
    // Only steps 1/2/3 gate Save. Step 4 (Follow-up Automation) and
    // step 5 (Automated Assignments) are optional — they never block
    // Save from enabling.
    var ready = ['1', '2', '3'].every(function (id) { return confirmedSteps.has(id) })
    saveContinueBtns.forEach(function (btn) {
      if (ready) btn.removeAttribute('disabled')
      else       btn.setAttribute('disabled', '')
    })
  }

  // ── Step transitions (1 → 2 → 3 → 4/5) ────────────────────────────
  function showStep1Confirmed() {
    if (step1Content) step1Content.style.display = 'none'
    if (step1Banner) step1Banner.style.display = ''
    if (step2Content) step2Content.style.display = ''
  }

  function showStep1Edit() {
    if (step1Content) step1Content.style.display = ''
    if (step1Banner) step1Banner.style.display = 'none'
    if (step2Content) step2Content.style.display = 'none'
    if (step2Banner) step2Banner.style.display = 'none'
    if (step3Content) step3Content.style.display = 'none'
    if (step3Banner) step3Banner.style.display = 'none'
    if (followupContent) followupContent.style.display = 'none'
    if (followupBanner) followupBanner.style.display = 'none'
    if (step4Content) step4Content.style.display = 'none'
    if (step4Banner) step4Banner.style.display = 'none'
    confirmedSteps.delete('2')
    confirmedSteps.delete('3')
    confirmedSteps.delete('follow-up')
    confirmedSteps.delete('4')
    checkSaveContinue()
  }

  function showStep2Confirmed() {
    if (step2Content) step2Content.style.display = 'none'
    if (step2Banner) step2Banner.style.display = ''
    if (step3Content) step3Content.style.display = ''
  }

  function showStep2Edit() {
    if (step2Content) step2Content.style.display = ''
    if (step2Banner) step2Banner.style.display = 'none'
    if (step3Content) step3Content.style.display = 'none'
    if (step3Banner) step3Banner.style.display = 'none'
    if (followupContent) followupContent.style.display = 'none'
    if (followupBanner) followupBanner.style.display = 'none'
    if (step4Content) step4Content.style.display = 'none'
    if (step4Banner) step4Banner.style.display = 'none'
    confirmedSteps.delete('3')
    confirmedSteps.delete('follow-up')
    confirmedSteps.delete('4')
    checkSaveContinue()
  }

  function showStep3Confirmed() {
    // Ownership modes: swap the description text based on which
    // remaining mode the user confirmed with. The `assignDownstream`
    // branch was removed with the downstream-agent extraction (that
    // config now lives in the Follow-up Automation section, which
    // has its own banner + description).
    if (step3BannerDesc) {
      var mode = getActiveStep3Mode()
      if (mode === 'followExisting') {
        step3BannerDesc.textContent = 'Prospects stay with their current CRM owners; unowned prospects are assigned to selected licensed users.'
      } else {
        step3BannerDesc.textContent = 'The agent redistributes ownership evenly across selected licensed users.'
      }
    }
    if (step3Content) step3Content.style.display = 'none'
    if (step3Banner) step3Banner.style.display = ''
    // Reveal BOTH post-approval sections at once: Follow-up
    // Automation (step 4, optional) and Automated Assignments
    // (step 5, optional). Since neither gates Save, they don't
    // need to gate each other — showing them together lets the
    // user decide the order in which to address them.
    if (followupContent) followupContent.style.display = ''
    if (step4Content) step4Content.style.display = ''
  }

  function showStep3Edit() {
    if (step3Content) step3Content.style.display = ''
    if (step3Banner) step3Banner.style.display = 'none'
    if (followupContent) followupContent.style.display = 'none'
    if (followupBanner) followupBanner.style.display = 'none'
    if (step4Content) step4Content.style.display = 'none'
    if (step4Banner) step4Banner.style.display = 'none'
    confirmedSteps.delete('follow-up')
    confirmedSteps.delete('4')
    checkSaveContinue()
  }

  function showFollowupConfirmed() {
    if (followupBannerDesc) {
      if (getFollowupToggleEnabled()) {
        // Banner copy for the ON branch mirrors the other Guided
        // Config summary rows: a concise "{Agent} • After N unit"
        // phrase that names what was configured. Layout:
        //   "Buyer Engagement Agent • After 3 hours"
        //   "Lead Nurturing Agent • After 2 days"
        //   "Buyer Engagement Agent • After 1 hour"
        // The unit is pluralized against the wait value so "1 hour"
        // and "3 hours" both read naturally; the source unit label
        // ("Hours" / "Days") is normalized to lowercase and stripped
        // of a trailing 's' so we can reapply the pluralization from
        // a single base.
        var opt = followupDownstreamSelect
          ? followupDownstreamSelect.options[followupDownstreamSelect.selectedIndex]
          : null
        var agentLabel = opt && opt.value ? opt.text : 'the selected agent'
        var waitRaw = getFollowupHandoffWaitValue() || '3'
        var waitN = parseInt(waitRaw, 10)
        if (isNaN(waitN)) waitN = 3
        var unitRaw = (getFollowupHandoffUnit() || 'Hours').toLowerCase()
        var unitBase = unitRaw.replace(/s$/, '')
        var unitDisplay = waitN === 1 ? unitBase : unitBase + 's'
        followupBannerDesc.textContent =
          agentLabel + ' \u2022 After ' + waitN + ' ' + unitDisplay
      } else {
        // OFF branch — a Confirm on the OFF state is an explicit
        // "no handoff" decision; the summary reads it as such rather
        // than as a warning ("...not configured"). Matches the
        // "disabled feature = valid, intentional configuration"
        // rule in the Guided Config interaction spec.
        followupBannerDesc.textContent = 'No downstream handoff'
      }
    }
    if (followupContent) followupContent.style.display = 'none'
    if (followupBanner) followupBanner.style.display = ''
  }

  function showFollowupEdit() {
    if (followupContent) followupContent.style.display = ''
    if (followupBanner) followupBanner.style.display = 'none'
  }

  function showStep4Confirmed() {
    if (step4BannerDesc) {
      var choice = getStep4Choice()
      step4BannerDesc.textContent = choice === 'yes'
        ? 'Leads matching your criteria are automatically assigned to Jarvis Rocket.'
        : 'Automated assignments are off.'
    }
    if (step4Content) step4Content.style.display = 'none'
    if (step4Banner) step4Banner.style.display = ''
  }

  function showStep4Edit() {
    if (step4Content) step4Content.style.display = ''
    if (step4Banner) step4Banner.style.display = 'none'
  }

  function resetStep(stepId) {
    confirmedSteps.delete(stepId)
    document.querySelectorAll('[data-step="' + stepId + '"]').forEach(function (wrapper) {
      var btn = wrapper.querySelector('.slds-button_brand')
      if (btn) {
        btn.textContent = 'Confirm'
        btn.removeAttribute('disabled')
      }
    })
    if (stepId === '3' && step3ConfirmBtn) refreshStep3Confirm()
    if (stepId === 'follow-up' && followupConfirmBtn) refreshFollowupConfirm()
    if (stepId === '4' && step4ConfirmBtn) refreshStep4Confirm()
    checkSaveContinue()
  }

  // ── Step 1 radio-card / config-card behavior ──────────────────────
  function selectRadioCard(card) {
    var value = card.dataset.value

    radioCards.forEach(function (rc) {
      rc.dataset.selected = 'false'
      rc.querySelector('input[type="radio"]').checked = false
      rc.classList.remove('radio-card--selected')
    })

    card.dataset.selected = 'true'
    card.querySelector('input[type="radio"]').checked = true
    card.classList.add('radio-card--selected')

    configCards.forEach(function (cc) {
      cc.parentElement.style.display = cc.dataset.config === value ? '' : 'none'
    })

    resetStep('1')
  }

  radioCards.forEach(function (card) {
    card.addEventListener('click', function () {
      selectRadioCard(card)
    })
  })

  // ── Step 3 radio-card behavior ────────────────────────────────────
  // Two cards now (followExisting / redistribute) — click just
  // records the selection; the shared "Assign Unowned Prospects"
  // pill picker doesn't need panel-swapping since both modes reuse
  // the same picker.
  step3RadioCards.forEach(function (card) {
    card.addEventListener('click', function () {
      step3RadioCards.forEach(function (rc) {
        rc.dataset.selected = 'false'
        rc.querySelector('input[type="radio"]').checked = false
        rc.classList.remove('radio-card--selected')
      })
      card.dataset.selected = 'true'
      card.querySelector('input[type="radio"]').checked = true
      card.classList.add('radio-card--selected')
      refreshStep3Confirm()
    })
  })

  if (step3ClearBtn) {
    step3ClearBtn.addEventListener('click', function (e) {
      e.preventDefault()
      // Nothing to reset here — the pill picker inside the "Assign
      // Unowned Prospects" panel clears itself via the existing
      // lookup script + its own Selected Options list. We keep the
      // handler wired anyway so Clear All feels responsive.
      refreshStep3Confirm()
    })
  }

  setupStep3Accordions()
  refreshStep3Confirm()
  syncStep3FooterVisibility()

  // ── Follow-up Automation wiring ───────────────────────────────────
  if (followupAccordionTrigger) {
    followupAccordionTrigger.addEventListener('click', function (e) {
      e.preventDefault()
      toggleAccordion(followupAccordionTrigger)
    })
  }

  if (followupToggle) {
    followupToggle.addEventListener('change', function () {
      syncFollowupConfig()
      refreshFollowupConfirm()
    })
  }

  if (followupDownstreamSelect) {
    followupDownstreamSelect.addEventListener('change', function () {
      refreshFollowupConfirm()
      syncFollowupAgentDetails()
    })
  }

  if (followupAgentDetailsToggle) {
    followupAgentDetailsToggle.addEventListener('click', function (e) {
      e.preventDefault()
      if (followupAgentDetailsToggle.hasAttribute('disabled')) return
      if (!getFollowupDownstreamValue()) return
      followupAgentDetailsExpanded = !followupAgentDetailsExpanded
      syncFollowupAgentDetails()
    })
  }

  if (followupHandoffWaitDec) {
    followupHandoffWaitDec.addEventListener('click', function (e) {
      e.preventDefault()
      stepFollowupHandoffWait(-1)
      refreshFollowupConfirm()
    })
  }
  if (followupHandoffWaitInc) {
    followupHandoffWaitInc.addEventListener('click', function (e) {
      e.preventDefault()
      stepFollowupHandoffWait(1)
      refreshFollowupConfirm()
    })
  }
  if (followupHandoffWaitValue) {
    // Clamp on `change` (blur/enter) rather than `input` so users
    // can still type multi-digit values without the field snapping
    // back mid-keystroke. Empty input rehydrates to the markup
    // default (typically 3) rather than being coerced to 0.
    followupHandoffWaitValue.addEventListener('change', function () {
      if (followupHandoffWaitValue.value === '') {
        followupHandoffWaitValue.value =
          followupHandoffWaitValue.dataset.handoffWaitDefaultValue || '3'
      } else {
        followupHandoffWaitValue.value = clampFollowupHandoffWait(followupHandoffWaitValue.value)
      }
      refreshFollowupConfirm()
    })
  }
  if (followupHandoffUnitInputs && followupHandoffUnitInputs.length) {
    Array.prototype.forEach.call(followupHandoffUnitInputs, function (r) {
      r.addEventListener('change', refreshFollowupConfirm)
    })
  }

  if (followupClearBtn) {
    followupClearBtn.addEventListener('click', function (e) {
      e.preventDefault()
      // Guard: `applyFollowupAvailabilityState()` disables the button
      // when there is nothing meaningful to clear (unavailable state
      // with no saved-invalid config). Clicks on a disabled button
      // still fire in some browsers, so we short-circuit here to
      // match the visual affordance.
      if (followupClearBtn.hasAttribute('disabled')) return
      resetFollowupToDefaults()
      applyFollowupAvailabilityState()
      refreshFollowupConfirm()
    })
  }

  // Initial state — toggle starts OFF so config stays hidden and
  // Confirm stays disabled. Called after all refs are captured so
  // the sync sees the real DOM state.
  //
  // Order matters:
  //   1. `applyFollowupAgentsPrototypeState()` — reads the URL flag
  //      and mutates the <option> list / toggle checked-state to
  //      match the requested scenario. Must run BEFORE any state
  //      sync so all subsequent reads see the intended DOM.
  //   2. `applyFollowupAvailabilityState()` — reads the (now-seeded)
  //      DOM and toggles the scoped notification, disabled-toggle
  //      state, config visibility, inline field error, and Clear All.
  //   3. `syncFollowupConfig()` — standard toggle-gated reveal for
  //      the available branch (idempotent no-op in unavailable).
  //   4. `refreshFollowupConfirm()` — final gate on the Confirm button.
  applyFollowupAgentsPrototypeState()
  applyFollowupAvailabilityState()
  syncFollowupConfig()
  refreshFollowupConfirm()

  // ── Step 5 (legacy `data-step="4"`) Yes/No radio-card behavior ────
  step4RadioCards.forEach(function (card) {
    card.addEventListener('click', function () {
      step4RadioCards.forEach(function (rc) {
        rc.dataset.selected = 'false'
        var input = rc.querySelector('input[type="radio"]')
        if (input) input.checked = false
        rc.classList.remove('radio-card--selected')
      })
      card.dataset.selected = 'true'
      var checked = card.querySelector('input[type="radio"]')
      if (checked) checked.checked = true
      card.classList.add('radio-card--selected')
      syncStep4Expression()
      refreshStep4Confirm()
    })
  })

  if (step4AddConditionBtn) {
    step4AddConditionBtn.addEventListener('click', function (e) {
      e.preventDefault()
      addStep4ConditionRow()
    })
  }

  if (step4ClearBtn) {
    step4ClearBtn.addEventListener('click', function (e) {
      e.preventDefault()
      resetStep4ToDefaults()
    })
  }

  syncStep4Expression()
  refreshStep4Confirm()

  // ── Confirm-button shared listener (steps 1, 3, follow-up, 4) ─────
  confirmButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrapper = btn.closest('[data-step]')
      if (!wrapper) return
      var stepId = wrapper.dataset.step
      confirmedSteps.add(stepId)
      btn.textContent = 'Confirmed'
      btn.setAttribute('disabled', '')
      checkSaveContinue()
      if (stepId === '1') showStep1Confirmed()
      else if (stepId === '3') showStep3Confirmed()
      else if (stepId === 'follow-up') showFollowupConfirmed()
      else if (stepId === '4') showStep4Confirmed()
    })
  })

  // ── Step 2 (routing card) — single-click confirms ─────────────────
  routingCards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.dataset.selected = 'true'
      card.querySelector('input[type="radio"]').checked = true
      confirmedSteps.add('2')
      checkSaveContinue()
      showStep2Confirmed()
    })
  })

  // ── Edit cascades (banner Edit buttons) ───────────────────────────
  if (step1EditBtn) {
    step1EditBtn.addEventListener('click', function () {
      resetStep('1')
      showStep1Edit()
    })
  }

  if (step2EditBtn) {
    step2EditBtn.addEventListener('click', function () {
      resetStep('2')
      showStep2Edit()
    })
  }

  if (step3EditBtn) {
    step3EditBtn.addEventListener('click', function () {
      resetStep('3')
      showStep3Edit()
    })
  }

  if (followupEditBtn) {
    followupEditBtn.addEventListener('click', function () {
      resetStep('follow-up')
      showFollowupEdit()
    })
  }

  if (step4EditBtn) {
    step4EditBtn.addEventListener('click', function () {
      resetStep('4')
      showStep4Edit()
    })
  }
})()
