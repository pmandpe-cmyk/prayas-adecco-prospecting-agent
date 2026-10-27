(function() {
  var DURATION = 6000;
  var tabs = document.querySelectorAll('.promo-tab-bar [data-tab]');
  var panels = document.querySelectorAll('.promo-gallery__panel');
  var descriptionEl = document.querySelector('.promo-description');
  var current = 0;
  var timer = null;

  if (!tabs.length || !panels.length) return;

  function scheduleNext() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      activate((current + 1) % tabs.length);
    }, DURATION);
  }

  function activate(index) {
    tabs.forEach(function(tab) {
      var btn = tab.querySelector('.promo-tab-button');
      var prog = tab.querySelector('.promo-tab-prog');
      btn.classList.remove('is-active');
      prog.classList.remove('is-running');
    });

    panels.forEach(function(panel) {
      panel.classList.remove('is-visible');
      panel.style.transform = '';
    });

    var activeTab = tabs[index];
    activeTab.querySelector('.promo-tab-button').classList.add('is-active');

    var panel = panels[index];
    panel.style.transform = 'translate3d(0, 48px, 0)';
    void panel.offsetWidth;
    panel.classList.add('is-visible');
    panel.style.transform = '';

    var prog = activeTab.querySelector('.promo-tab-prog');
    void prog.offsetWidth;
    prog.classList.add('is-running');

    if (descriptionEl) {
      var desc = activeTab.getAttribute('data-description');
      if (desc) descriptionEl.textContent = desc;
    }

    current = index;
    scheduleNext();
  }

  tabs.forEach(function(tab, i) {
    tab.addEventListener('click', function() {
      activate(i);
    });
  });

  activate(0);
})();
