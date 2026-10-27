(function () {
  'use strict';

  // Per-step Feedback form wiring (textarea + Regenerate).
  // - StepFeedback.init(container) wires every .step inside `container`.
  // - StepFeedback.wireStep(stepRoot) wires a single step (used after a
  //   renderStepAt() swap puts a fresh, unwired step root in the DOM).
  // - StepFeedback.activateAndFocus(stepRoot, placeholder?) is used by the
  //   popover "No" handoff in milestone 3 (exported now so the contract is
  //   stable). It switches the step to the Feedback tab, optionally rewrites
  //   the textarea placeholder, and focuses the textarea.

  var idCounter = 0;
  var REGEN_DELAY_MS = 5000;
  var LOADING_LABEL = 'Generating based on your feedback\u2026';
  var SUCCESS_LABEL = "Here's the updated message";

  function getStepsContainer(stepRoot) {
    return stepRoot && stepRoot.closest && stepRoot.closest('#wm-steps-container');
  }

  function findFeedbackEls(stepRoot) {
    return {
      textarea: stepRoot.querySelector('[data-feedback-textarea]'),
      label: stepRoot.querySelector('[data-feedback-label]'),
      button: stepRoot.querySelector('[data-feedback-regenerate]')
    };
  }

  // Look up the loading-banner DOM (and the email container + content card
  // it lives inside) for a given step. Returns nulls for any missing pieces
  // so callers can defensively skip if a step variant doesn't have them.
  function findBannerEls(stepRoot) {
    return {
      emailContainer: stepRoot.querySelector('.email-container'),
      contentCard: stepRoot.querySelector('.email-container-left-side-content-card'),
      banner: stepRoot.querySelector('.we-loading-banner'),
      bannerLabel: stepRoot.querySelector('.we-loading-banner__label'),
      bannerDismiss: stepRoot.querySelector('[data-banner-dismiss]')
    };
  }

  function setBannerState(banner, label, state /* 'loading' | 'success' */) {
    if (!banner) return;
    banner.classList.toggle('we-loading-banner--loading', state === 'loading');
    banner.classList.toggle('we-loading-banner--success', state === 'success');
    if (label) label.textContent = state === 'success' ? SUCCESS_LABEL : LOADING_LABEL;
  }

  function showBanner(banner, label, state) {
    if (!banner) return;
    setBannerState(banner, label, state);
    banner.removeAttribute('hidden');
  }

  function hideBanner(banner, label) {
    if (!banner) return;
    banner.setAttribute('hidden', '');
    // Reset to loading state so the next regen cycle starts clean.
    setBannerState(banner, label, 'loading');
  }

  // Regenerate is only meaningful with feedback in the textarea, so gate
  // the button on non-empty (trimmed) content. Skip while regen is
  // in-flight — onRegenerate manages disabled state explicitly during
  // that window so we don't fight it on every keystroke.
  function syncRegenButton(stepRoot, els) {
    var emailContainer = stepRoot.querySelector('.email-container');
    if (emailContainer && emailContainer.classList.contains('is-regenerating')) return;
    var hasFeedback = !!(els.textarea && els.textarea.value.trim().length);
    els.button.disabled = !hasFeedback;
  }

  function wireBanner(stepRoot) {
    var bannerEls = findBannerEls(stepRoot);
    if (!bannerEls.banner || !bannerEls.bannerDismiss) return;
    bannerEls.bannerDismiss.addEventListener('click', function () {
      hideBanner(bannerEls.banner, bannerEls.bannerLabel);
    });
  }

  function wireStep(stepRoot) {
    if (!stepRoot || stepRoot.dataset.feedbackWired === 'true') return;
    var els = findFeedbackEls(stepRoot);
    if (!els.textarea || !els.button) return;

    // Mint a unique id so the SLDS label/for relationship survives template cloning.
    var inputId = 'we-feedback-textarea-' + (++idCounter);
    els.textarea.id = inputId;
    if (els.label) els.label.setAttribute('for', inputId);

    els.button.addEventListener('click', function () {
      onRegenerate(stepRoot, els);
    });

    els.textarea.addEventListener('input', function () {
      syncRegenButton(stepRoot, els);
    });

    wireBanner(stepRoot);

    // Initial gate — empty textarea on a freshly-rendered step means the
    // Regenerate button starts disabled until the user types feedback.
    syncRegenButton(stepRoot, els);

    stepRoot.dataset.feedbackWired = 'true';
  }

  function init(container) {
    if (!container) return;
    container.querySelectorAll('.step').forEach(wireStep);
  }

  function onRegenerate(stepRoot, els) {
    var container = getStepsContainer(stepRoot);
    if (!container || !window.CadenceSequence) return;

    var steps = container._stepsData || [];
    var index = parseInt(stepRoot.getAttribute('data-step-index'), 10);
    if (isNaN(index)) return;

    var bannerEls = findBannerEls(stepRoot);
    var defaultBtnLabel = els.button.textContent;

    // Enter loading state on the OLD step root:
    //   1. Pin the white content card's height so the swap from real
    //      subject/body to stencil doesn't reflow it (and the row stays
    //      stable since slds-grid stretches columns to the tallest).
    //   2. Add .is-regenerating to .email-container which hides real
    //      content and reveals the stencil (per SCSS rules).
    //   3. Unhide the banner in --loading state with the loading label.
    //   4. Disable button (label flips to "Regenerating…", aria-busy)
    //      and textarea so the user can't queue another regen mid-flight.
    if (bannerEls.contentCard) {
      bannerEls.contentCard.style.height = bannerEls.contentCard.offsetHeight + 'px';
    }
    if (bannerEls.emailContainer) {
      bannerEls.emailContainer.classList.add('is-regenerating');
    }
    showBanner(bannerEls.banner, bannerEls.bannerLabel, 'loading');

    els.button.disabled = true;
    els.button.setAttribute('aria-busy', 'true');
    els.button.textContent = 'Regenerating\u2026';
    els.textarea.disabled = true;

    setTimeout(function () {
      var newStepRoot = window.CadenceSequence.renderStepAt(container, steps, index);
      if (!newStepRoot) {
        // Roll back UI on the still-mounted OLD step if the swap failed.
        if (bannerEls.emailContainer) {
          bannerEls.emailContainer.classList.remove('is-regenerating');
        }
        if (bannerEls.contentCard) {
          bannerEls.contentCard.style.height = '';
        }
        hideBanner(bannerEls.banner, bannerEls.bannerLabel);
        els.button.removeAttribute('aria-busy');
        els.button.textContent = defaultBtnLabel;
        els.textarea.disabled = false;
        // Re-evaluate gating since the textarea wasn't cleared on rollback.
        syncRegenButton(stepRoot, els);
        return;
      }

      // The OLD step root (with .is-regenerating + locked height) was
      // detached by replaceWith() inside renderStepAt — no cleanup needed
      // on it. The NEW step root has a template-default banner [hidden]
      // and an empty textarea. Wire it (which also gates the button to
      // disabled since the new textarea is empty, and binds the dismiss
      // button), then surface the success banner on it.
      wireStep(newStepRoot);

      var newBannerEls = findBannerEls(newStepRoot);
      showBanner(newBannerEls.banner, newBannerEls.bannerLabel, 'success');

      // Return focus to Details so the meta for the regenerated content is
      // visible (the preview itself is on the left and visible regardless).
      window.CadenceSequence.activateTab(newStepRoot, 'details');
    }, REGEN_DELAY_MS);
  }

  // Switch the step's right column to Feedback, optionally seed the textarea
  // placeholder with a contextual prompt, then focus the textarea. Used by
  // the popover "No" handoff (milestone 3).
  function activateAndFocus(stepRoot, placeholder) {
    if (!stepRoot || !window.CadenceSequence) return;
    window.CadenceSequence.activateTab(stepRoot, 'feedback');
    var els = findFeedbackEls(stepRoot);
    if (!els.textarea) return;
    if (typeof placeholder === 'string' && placeholder) {
      els.textarea.setAttribute('placeholder', placeholder);
    }
    // Defer focus so the tab show transition completes first.
    setTimeout(function () { els.textarea.focus(); }, 0);
  }

  window.StepFeedback = {
    init: init,
    wireStep: wireStep,
    activateAndFocus: activateAndFocus
  };
})();
