(function () {
  'use strict';

  // Reusable progress widget extracted from progress-indicator.html.
  // Builds the SVG step list inside `rootEl`, runs an RAF-driven progress arc
  // through each step, and calls `onComplete` after the last step finishes.
  //
  // Usage:
  //   var run = CadenceProgress.mount(rootEl, progressSteps, { onComplete: fn });
  //   run.start();
  //
  // progressSteps shape (one entry per step):
  //   { before: { title, subtitle }, after: { title, subtitle } }

  var CIRCUMFERENCE = 62.83;
  var PROGRESS_STEP = 0.00925;
  var WAIT_MS = 750;

  var SPRITE_HTML =
    '<svg width="0" height="0" aria-hidden="true" style="position:absolute;">' +
      '<symbol id="pi-check-circle" viewBox="0 0 16 16">' +
        '<circle fill="currentcolor" cx="8" cy="8" r="8"></circle>' +
        '<polyline fill="none" stroke="var(--bg)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" points="4 8,7 11,12 5"></polyline>' +
      '</symbol>' +
      '<symbol id="pi-checkmark" viewBox="0 0 16 16">' +
        '<polyline fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="2 7,7 11,15 2"></polyline>' +
      '</symbol>' +
    '</svg>';

  function ensureSprite(rootEl) {
    if (document.getElementById('pi-check-circle')) return;
    var holder = document.createElement('div');
    holder.innerHTML = SPRITE_HTML;
    rootEl.appendChild(holder.firstChild);
  }

  function buildStep(progressStep, stepsRootEl) {
    var stepRoot = document.createElement('div');
    stepRoot.className = 'onboarding__finish-step onboarding__finish-step--waiting';

    var phase1 = document.createElement('div');
    phase1.className = 'onboarding__finish-step-phase';
    phase1.innerHTML =
      '<svg class="onboarding__progress" viewBox="0 0 24 24" aria-hidden="true">' +
        '<g fill="transparent" stroke-linecap="round" stroke-width="3" transform="rotate(-90,12,12)">' +
          '<circle class="onboarding__progress-track" cx="12" cy="12" r="10"></circle>' +
          '<circle stroke="currentcolor" cx="12" cy="12" r="10"' +
            ' stroke-dasharray="' + CIRCUMFERENCE + ' ' + CIRCUMFERENCE + '"' +
            ' stroke-dashoffset="' + CIRCUMFERENCE + '"></circle>' +
        '</g>' +
      '</svg>' +
      '<div class="onboarding__finish-step-text">' +
        '<h2 class="onboarding__finish-step-title"></h2>' +
        '<p class="onboarding__finish-step-subtitle"></p>' +
      '</div>';
    phase1.querySelector('.onboarding__finish-step-title').textContent = progressStep.before.title;
    phase1.querySelector('.onboarding__finish-step-subtitle').textContent = progressStep.before.subtitle;

    var phase2 = document.createElement('div');
    phase2.className = 'onboarding__finish-step-phase';
    phase2.innerHTML =
      '<svg class="onboarding__icon onboarding__icon--success" aria-hidden="true">' +
        '<use href="#pi-checkmark"></use>' +
      '</svg>' +
      '<div class="onboarding__finish-step-text">' +
        '<h2 class="onboarding__finish-step-title"></h2>' +
        '<p class="onboarding__finish-step-subtitle"></p>' +
      '</div>';
    phase2.querySelector('.onboarding__finish-step-title').textContent = progressStep.after.title;
    phase2.querySelector('.onboarding__finish-step-subtitle').textContent = progressStep.after.subtitle;

    stepRoot.appendChild(phase1);
    stepRoot.appendChild(phase2);
    stepsRootEl.appendChild(stepRoot);

    var arc = phase1.querySelectorAll('circle')[1];
    return { root: stepRoot, circle: arc };
  }

  function mount(rootEl, progressSteps, options) {
    if (!rootEl || !Array.isArray(progressSteps) || progressSteps.length === 0) {
      return { start: function () {}, reset: function () {} };
    }
    var opts = options || {};
    var onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : function () {};

    while (rootEl.firstChild) rootEl.removeChild(rootEl.firstChild);
    ensureSprite(rootEl);

    var onboarding = document.createElement('div');
    onboarding.className = 'onboarding';

    var stepsRootEl = document.createElement('div');
    stepsRootEl.className = 'onboarding__finish-steps';

    onboarding.appendChild(stepsRootEl);
    rootEl.appendChild(onboarding);

    var stepEls = progressSteps.map(function (s) { return buildStep(s, stepsRootEl); });

    var currentStep = -1;
    var currentProgress = 0;
    var rafId = 0;
    var waitTimer = 0;
    var completed = false;

    function render() {
      for (var i = 0; i < stepEls.length; i++) {
        var el = stepEls[i];
        var phase = 'waiting';
        if (i < currentStep || (i === currentStep && currentProgress >= 1)) {
          phase = 'done';
        } else if (i === currentStep) {
          phase = 'current';
        }
        el.root.className = 'onboarding__finish-step onboarding__finish-step--' + phase;

        if (i === currentStep) {
          el.circle.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * (1 - currentProgress)));
        } else if (phase === 'done') {
          el.circle.setAttribute('stroke-dashoffset', '0');
        } else {
          el.circle.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE));
        }
      }
    }

    function runProgress() {
      cancelAnimationFrame(rafId);
      if (currentStep < 0 || currentStep >= progressSteps.length) return;

      function tick() {
        var next = currentProgress + PROGRESS_STEP;
        currentProgress = next >= 1 ? 1 : next;
        render();
        if (currentProgress >= 1) {
          advanceToNextStep();
        } else {
          rafId = requestAnimationFrame(tick);
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function advanceToNextStep() {
      cancelAnimationFrame(rafId);
      clearTimeout(waitTimer);
      render();

      waitTimer = setTimeout(function () {
        if (currentStep + 1 >= progressSteps.length) {
          if (!completed) {
            completed = true;
            onComplete();
          }
          return;
        }
        currentProgress = 0;
        currentStep += 1;
        render();
        runProgress();
      }, WAIT_MS);
    }

    function start() {
      cancelAnimationFrame(rafId);
      clearTimeout(waitTimer);
      completed = false;
      currentStep = -1;
      currentProgress = 1;
      render();
      advanceToNextStep();
    }

    function reset() {
      cancelAnimationFrame(rafId);
      clearTimeout(waitTimer);
      completed = false;
      currentStep = -1;
      currentProgress = 0;
      render();
    }

    render();

    return { start: start, reset: reset };
  }

  window.CadenceProgress = { mount: mount };
})();
