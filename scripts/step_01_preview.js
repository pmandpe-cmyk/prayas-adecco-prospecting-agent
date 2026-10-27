(function () {
  'use strict';

  // Scoped Data-Source preview engine. Originally an IIFE bound to
  // global IDs (`#preview-btn`, `#combobox-id-1-selected-value`, the
  // notification banners…), now wrapped in `initDataSourcePreview(scope)`
  // so multiple Data-Source modes can coexist on the same page (the
  // unified panel renders all four modes' live variants on every step).
  //
  // The engine queries every DOM hook through `scope.querySelector`
  // instead of `document.getElementById`, with the markup carrying the
  // legacy IDs as classes-or-data-attributes. We keep the legacy IDs in
  // the markup too for backward-compat with any inline JS that still
  // refers to them, but the engine itself never touches them.
  //
  // Public API (set on the scope element):
  //   • scope._resetPreview()   — flips back to the empty state
  //   • scope._refreshPreviewDropdown(items) — replaces the dropdown
  //                                            options + auto-selects
  //                                            the first configured one
  //
  // Page-level callers (e.g. step_01_select_accounts.html's body) can
  // also use the global `window.refreshPreviewDropdown(items)` shim,
  // which fans out to every booted Data-Source scope.

  var ALL_ACCOUNTS = [
    { name: 'Alpine', logo: 'Alpine.png', employees: '1,200', industry: 'Outdoor Recreation', location: 'Denver, CO' },
    { name: 'Veridian', logo: 'Veridian.png', employees: '850', industry: 'Consulting', location: 'Boston, MA' },
    { name: 'Canva', logo: 'canva.png', employees: '4,000', industry: 'Technology', location: 'Sydney, Australia' },
    { name: 'Cirrus', logo: 'cirrus.png', employees: '620', industry: 'Cloud Computing', location: 'Seattle, WA' },
    { name: 'Confluent', logo: 'confluent.png', employees: '3,200', industry: 'Data Infrastructure', location: 'Mountain View, CA' },
    { name: 'Datadog', logo: 'datadog.png', employees: '5,500', industry: 'Monitoring & Analytics', location: 'New York, NY' },
    { name: 'Dialpad', logo: 'dialpad.png', employees: '1,800', industry: 'Communications', location: 'San Ramon, CA' },
    { name: 'Electra', logo: 'electra.png', employees: '340', industry: 'Clean Energy', location: 'Austin, TX' },
    { name: 'Hilti', logo: 'hilti.png', employees: '33,000', industry: 'Construction', location: 'Schaan, Liechtenstein' },
    { name: 'Home Depot', logo: 'homedepot.png', employees: '475,000', industry: 'Retail', location: 'Atlanta, GA' },
    { name: 'Intuit', logo: 'intuit.png', employees: '17,300', industry: 'Financial Software', location: 'Mountain View, CA' },
    { name: 'Kenton Energy', logo: 'kenton_energy.png', employees: '950', industry: 'Utilities', location: 'Houston, TX' },
    { name: 'New Relic', logo: 'new_relic.png', employees: '2,800', industry: 'Observability', location: 'San Francisco, CA' },
    { name: 'Northern Trail', logo: 'northerntrail.png', employees: '1,500', industry: 'Outdoor Apparel', location: 'Portland, OR' },
    { name: 'Pacifica', logo: 'pacifica.png', employees: '720', industry: 'Healthcare', location: 'San Diego, CA' },
    { name: 'PagerDuty', logo: 'pagerduty.png', employees: '1,100', industry: 'Incident Management', location: 'San Francisco, CA' },
    { name: 'Quadstar', logo: 'quadstar.png', employees: '480', industry: 'Logistics', location: 'Chicago, IL' },
    { name: 'Siemens', logo: 'siemens.png', employees: '320,000', industry: 'Industrial Manufacturing', location: 'Munich, Germany' },
    { name: 'Stellar', logo: 'stellar.png', employees: '560', industry: 'Fintech', location: 'San Francisco, CA' },
    { name: 'Uber', logo: 'uber.png', employees: '32,800', industry: 'Transportation', location: 'San Francisco, CA' },
    { name: 'UserTesting', logo: 'usertesting.png', employees: '1,000', industry: 'UX Research', location: 'San Francisco, CA' },
    { name: 'Welo', logo: 'welo.png', employees: '250', industry: 'Collaboration Software', location: 'Salt Lake City, UT' },
    { name: 'ATS', logo: 'ATS.png', employees: '1,450', industry: 'HR Technology', location: 'Austin, TX' },
    { name: 'Astral Link', logo: 'Astral Link.png', employees: '2,100', industry: 'Satellite Communications', location: 'Denver, CO' },
    { name: 'Burst Inc', logo: 'Burst Inc.png', employees: '3,400', industry: 'Digital Streaming', location: 'Los Angeles, CA' },
    { name: 'Central Railroad', logo: 'Central Railroad.png', employees: '18,000', industry: 'Rail Transportation', location: 'Chicago, IL' },
    { name: 'Copper Line', logo: 'Copper Line.png', employees: '4,200', industry: 'Telecommunications', location: 'Dallas, TX' },
    { name: 'Core Sentry', logo: 'Core Sentry.png', employees: '1,800', industry: 'Cybersecurity', location: 'Washington, DC' },
    { name: 'Crystal Flake', logo: 'Crystal Flake.png', employees: '2,600', industry: 'Data Analytics', location: 'San Francisco, CA' },
    { name: 'Drift Logic', logo: 'Drift Logic.png', employees: '900', industry: 'Conversational Marketing', location: 'Boston, MA' },
    { name: 'Engima Soft', logo: 'Engima Soft.png', employees: '1,300', industry: 'Enterprise Software', location: 'Austin, TX' },
    { name: 'Flux Media', logo: 'Flux Media.png', employees: '750', industry: 'Digital Marketing', location: 'New York, NY' },
    { name: 'Forge Point', logo: 'Forge Point.png', employees: '2,900', industry: 'Manufacturing Technology', location: 'Detroit, MI' },
    { name: 'Fox Night Inc', logo: 'Fox Night Inc.png', employees: '1,100', industry: 'Entertainment Technology', location: 'Los Angeles, CA' },
    { name: 'Glitch Lab', logo: 'Glitch Lab.png', employees: '480', industry: 'Developer Tools', location: 'San Francisco, CA' },
    { name: 'Gravity Labs', logo: 'Gravity Labs.png', employees: '670', industry: 'AI Research', location: 'Cambridge, MA' },
    { name: 'Green Castle', logo: 'Green Castle.png', employees: '1,600', industry: 'Sustainable Real Estate', location: 'Portland, OR' },
    { name: 'Guard Central', logo: 'Guard Central.png', employees: '5,200', industry: 'Physical Security', location: 'Dallas, TX' },
    { name: 'Kinetic Labs', logo: 'Kinetic Labs.png', employees: '1,200', industry: 'Clean Energy', location: 'Houston, TX' },
    { name: 'Laser Logic', logo: 'Laser Logic.png', employees: '840', industry: 'Photonics Technology', location: 'San Jose, CA' },
    { name: 'Micro Tech Inc', logo: 'Micro Tech Inc.png', employees: '7,500', industry: 'Semiconductor Manufacturing', location: 'Santa Clara, CA' },
    { name: 'Modularity IT', logo: 'Modularity IT.png', employees: '2,300', industry: 'IT Infrastructure', location: 'Atlanta, GA' },
    { name: 'MysticGeo', logo: 'MysticGeo.png', employees: '560', industry: 'Geospatial Analytics', location: 'Boulder, CO' },
    { name: 'N7', logo: 'N7.png', employees: '3,100', industry: 'Aerospace Engineering', location: 'Huntsville, AL' },
    { name: 'Neon Pulse', logo: 'Neon Pulse.png', employees: '420', industry: 'Digital Advertising', location: 'New York, NY' },
    { name: 'Ocean Sync', logo: 'Ocean Sync.png', employees: '780', industry: 'Maritime Technology', location: 'Seattle, WA' },
    { name: 'Orbital', logo: 'Orbital.png', employees: '2,400', industry: 'Space Technology', location: 'Hawthorne, CA' },
    { name: 'Orion Base', logo: 'Orion Base.png', employees: '1,950', industry: 'Cloud Infrastructure', location: 'Austin, TX' },
    { name: 'Outer Drop', logo: 'Outer Drop.png', employees: '6,800', industry: 'Last-Mile Delivery', location: 'Phoenix, AZ' },
    { name: 'Pigment', logo: 'Pigment.png', employees: '630', industry: 'Financial Planning Software', location: 'Paris, France' },
    { name: 'Plus Health', logo: 'Plus Health.png', employees: '1,400', industry: 'Digital Health', location: 'Boston, MA' },
    { name: 'Polarity Partners', logo: 'Polarity Partners.png', employees: '3,600', industry: 'Management Consulting', location: 'New York, NY' },
    { name: 'Rapid Scale', logo: 'Rapid Scale.png', employees: '1,050', industry: 'Cloud Scalability', location: 'Seattle, WA' },
    { name: 'Red Sync Inc', logo: 'Red Sync Inc.png', employees: '720', industry: 'Data Synchronization', location: 'Denver, CO' },
    { name: 'Shattered Glass Corp', logo: 'Shattered Glass Corp.png', employees: '890', industry: 'Media Production', location: 'Los Angeles, CA' },
    { name: 'Silver Peak', logo: 'Silver Peak.png', employees: '1,700', industry: 'Network Optimization', location: 'Santa Clara, CA' },
    { name: 'Sky Bound', logo: 'Sky Bound.png', employees: '4,500', industry: 'Aviation Technology', location: 'Seattle, WA' },
    { name: 'Sparklines and More', logo: 'Sparklines and More.png', employees: '310', industry: 'Data Visualization', location: 'San Francisco, CA' },
    { name: 'Spectra Industries', logo: 'Spectra Industries.png', employees: '9,200', industry: 'Advanced Manufacturing', location: 'Pittsburgh, PA' },
    { name: 'Three Plus Moon', logo: 'Three Plus Moon.png', employees: '240', industry: 'Creative Technology', location: 'Austin, TX' },
    { name: 'Titan Form', logo: 'Titan Form.png', employees: '12,000', industry: 'Industrial Manufacturing', location: 'Cleveland, OH' },
    { name: 'Twisted Mountain', logo: 'Twisted Mountain.png', employees: '580', industry: 'Outdoor Technology', location: 'Salt Lake City, UT' },
    { name: 'Unity Point', logo: 'Unity Point.png', employees: '28,000', industry: 'Healthcare Systems', location: 'West Des Moines, IA' },
    { name: 'Vault', logo: 'Vault.png', employees: '1,350', industry: 'Fintech Security', location: 'New York, NY' }
  ];

  function randomIndices(total, count) {
    var pool = Array.from({ length: total }, function (_, i) { return i; });
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    return pool.slice(0, count);
  }

  var ICON_MAP = {
    account: { sprite: '/assets/icons/standard-sprite/svg/symbols.svg#account', cssClass: 'slds-icon-standard-account' },
    report:  { sprite: '/assets/icons/standard-sprite/svg/symbols.svg#report',  cssClass: 'slds-icon-standard-report' },
    zoominfo: { sprite: '/assets/images/source_icons/source_zoominfo.svg', cssClass: '' }
  };

  function getConfigForIndex(index) {
    var isEven = index % 2 === 0;
    return { total: isEven ? '8,346' : '5', count: isEven ? 50 : 5 };
  }

  // First alphanumeric character of the company name, uppercased — used
  // for the logo fallback placeholder (e.g. "Drift Logic" → "D").
  function getInitial(name) {
    var match = (name || '').match(/[A-Za-z0-9]/);
    return match ? match[0].toUpperCase() : '?';
  }

  // HTML-escape a string for safe interpolation into the row markup
  // (company names flow into both `alt`/`title` attributes and the
  // fallback initial's `title`).
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderAccountRow(account) {
    var safeName = esc(account.name);
    return '<div class="slds-grid slds-grid_align-spread account-preview-row slds-p-vertical_medium">' +
      '<div class="slds-grid slds-col ">' +
        '<div class="slds-col">' +
          '<div class="slds-media slds-media_responsive">' +
            '<div class="slds-media__figure">' +
              '<span class="slds-avatar slds-avatar_medium">' +
                '<img alt="' + safeName + '" src="/assets/images/company-logos/' + esc(account.logo) + '" title="' + safeName + '" ' +
                  'data-logo-fallback-initial="' + esc(getInitial(account.name)) + '" />' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="slds-col slds-grid slds-grid_vertical">' +
          '<p class="account-preview-record-name"><a>' + safeName + '</a></p>' +
          '<p class="account-preview-description">' + esc(account.employees) + ' employees</p>' +
          '<ul class="slds-list_horizontal slds-has-dividers_right">' +
            '<li class="slds-item account-preview-description">' + esc(account.industry) + '</li>' +
            '<li class="slds-item account-preview-description">' + esc(account.location) + '</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // Replace a logo <img> with an initials placeholder avatar. Used when
  // the company logo fails to load (some mock-logo filenames contain
  // spaces, which the Salesforce static-resource server doesn't serve
  // reliably — so rather than show a broken-image glyph that reads as a
  // load error, we drop in a neutral initial badge).
  function replaceWithInitial(img) {
    if (!img || !img.parentNode) return;
    var initial = img.getAttribute('data-logo-fallback-initial') || '?';
    var title = img.getAttribute('title') || img.getAttribute('alt') || '';
    var abbr = document.createElement('abbr');
    abbr.className = 'slds-avatar__initials account-preview-logo-fallback';
    abbr.setAttribute('title', title);
    abbr.setAttribute('aria-hidden', 'true');
    abbr.textContent = initial;
    img.parentNode.replaceChild(abbr, img);
  }

  // Wire logo fallbacks within a freshly-rendered account list. We use a
  // JS `error` listener rather than an inline `onerror` attribute because
  // the prototype runs inside a Salesforce VF iframe whose CSP blocks
  // inline event handlers. Images that already failed before the listener
  // attached (cached 404s) report `complete && naturalWidth === 0`, so we
  // catch those synchronously too.
  function wireLogoFallbacks(container) {
    if (!container) return;
    var imgs = container.querySelectorAll('img[data-logo-fallback-initial]');
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) {
        replaceWithInitial(img);
        return;
      }
      img.addEventListener('error', function () { replaceWithInitial(img); });
    });
  }

  function initDataSourcePreview(scope) {
    if (!scope || scope.dataset.dataSourcePreviewWired === 'true') return;
    scope.dataset.dataSourcePreviewWired = 'true';

    // Scope-rooted query helpers. Markup carries both the legacy global
    // IDs (so existing tooling / inline code that still references them
    // continues to find them on a single-instance page) AND
    // data-attributes used here, so the engine works whether the scope
    // is the only Data-Source mode on the page or one of several.
    var q = function (sel) { return scope.querySelector(sel); };

    var previewContent          = q('[data-ds-content]');
    var previewAccountList      = q('[data-ds-account-list]');
    var emptyState              = q('[data-ds-empty-state]');
    var loadingState            = q('[data-ds-loading]');
    var previewBtn              = q('[data-ds-preview-btn]');
    var notificationSuccess     = q('[data-ds-notify-success]');
    var notificationError       = q('[data-ds-notify-error]');
    var notificationSuccessCount = q('[data-ds-notify-success-count]');
    var notificationSuccessTotal = q('[data-ds-notify-success-total]');
    var notificationErrorCount  = q('[data-ds-notify-error-count]');
    var notificationErrorTotal  = q('[data-ds-notify-error-total]');

    var combobox                = q('[data-ds-combobox]');
    var comboboxLabel           = q('[data-ds-combobox-label]');
    var comboboxSelectedIcon    = q('[data-ds-combobox-icon]');
    var comboboxSelectedIconUse = q('[data-ds-combobox-icon-use]');
    var dropdown                = q('[data-ds-listbox]');
    var dropdownList            = dropdown ? dropdown.querySelector('ul') : null;

    if (!previewContent || !previewBtn) return;

    var comboboxContainer       = combobox ? combobox.closest('.slds-combobox_container') : null;
    var comboboxDropdownTrigger = combobox ? combobox.closest('.slds-dropdown-trigger_click') : null;

    var SOURCE_CONFIGS = {};
    var selectedSource = null;
    var selectedIndex = 0;
    var hasPreviewedOnce = false;

    function renderAccounts(sourceName, sourceIndex) {
      var config = SOURCE_CONFIGS[sourceName];
      if (!config) return;
      var accounts = config.indices.map(function (i) { return ALL_ACCOUNTS[i]; });
      var html = accounts.map(renderAccountRow).join('');
      previewAccountList.innerHTML = html;
      wireLogoFallbacks(previewAccountList);
      var isGood = sourceIndex % 2 === 0;
      if (isGood) {
        if (notificationSuccessCount) notificationSuccessCount.textContent = accounts.length;
        if (notificationSuccessTotal) notificationSuccessTotal.textContent = config.total;
        if (notificationSuccess) notificationSuccess.style.display = '';
        if (notificationError) notificationError.style.display = 'none';
      } else {
        if (notificationErrorCount) notificationErrorCount.textContent = accounts.length;
        if (notificationErrorTotal) notificationErrorTotal.textContent = config.total;
        if (notificationError) notificationError.style.display = '';
        if (notificationSuccess) notificationSuccess.style.display = 'none';
      }
    }

    function updateSelectedIcon(type) {
      var icon = ICON_MAP[type] || ICON_MAP.account;
      if (comboboxSelectedIcon) {
        comboboxSelectedIcon.className = 'slds-icon_container slds-combobox__input-entity-icon ' + icon.cssClass;
      }
      if (comboboxSelectedIconUse) {
        comboboxSelectedIconUse.setAttribute('xlink:href', icon.sprite);
      }
      enableCombobox();
    }

    function showDefaultIcon() {
      if (comboboxSelectedIcon) {
        comboboxSelectedIcon.className = 'slds-icon_container slds-combobox__input-entity-icon slds-icon-standard-default';
      }
      if (comboboxSelectedIconUse) {
        comboboxSelectedIconUse.setAttribute('xlink:href', '/assets/icons/standard-sprite/svg/symbols.svg#default');
      }
      if (combobox) combobox.setAttribute('aria-disabled', 'true');
    }

    function enableCombobox() {
      if (combobox) combobox.removeAttribute('aria-disabled');
    }

    function closeCombobox() {
      if (comboboxContainer) comboboxContainer.classList.remove('slds-is-open');
      if (comboboxDropdownTrigger) comboboxDropdownTrigger.classList.remove('slds-is-open');
      if (combobox) combobox.setAttribute('aria-expanded', 'false');
    }

    function wireDropdownOptions() {
      if (!dropdownList) return;
      var options = dropdownList.querySelectorAll('[role="option"]');
      options.forEach(function (opt) {
        opt.addEventListener('click', function (e) {
          e.stopPropagation();
          var label = opt.querySelector('.slds-listbox__option-text_entity');
          var idx = parseInt(opt.getAttribute('data-source-index'), 10);
          var type = opt.getAttribute('data-source-type');
          if (label && comboboxLabel) {
            selectedSource = label.textContent.trim();
            selectedIndex = idx;
            comboboxLabel.textContent = selectedSource;
            updateSelectedIcon(type);
          }
          closeCombobox();
          if (hasPreviewedOnce) runPreview();
        });
      });
    }

    if (combobox) {
      combobox.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = comboboxContainer && comboboxContainer.classList.contains('slds-is-open');
        if (comboboxContainer) comboboxContainer.classList.toggle('slds-is-open', !isOpen);
        if (comboboxDropdownTrigger) comboboxDropdownTrigger.classList.toggle('slds-is-open', !isOpen);
        combobox.setAttribute('aria-expanded', String(!isOpen));
      });

      // Outside click closes the dropdown. Scoped to clicks NOT inside
      // the engine's combobox container — taps elsewhere on the page
      // (including other scoped Data-Source modes) shouldn't keep this
      // one open.
      document.addEventListener('click', function (e) {
        if (comboboxContainer && !comboboxContainer.contains(e.target)) {
          closeCombobox();
        }
      });
    }

    var loadingTimer = null;

    function runPreview() {
      if (!selectedSource) return;

      previewBtn.disabled = true;
      if (emptyState) emptyState.style.display = 'none';
      if (previewAccountList) previewAccountList.style.display = 'none';
      if (notificationSuccess) notificationSuccess.style.display = 'none';
      if (notificationError) notificationError.style.display = 'none';
      if (loadingState) loadingState.style.display = '';

      var config = SOURCE_CONFIGS[selectedSource];
      if (config) {
        config.indices = randomIndices(ALL_ACCOUNTS.length, config.count);
      }

      clearTimeout(loadingTimer);
      loadingTimer = setTimeout(function () {
        if (loadingState) loadingState.style.display = 'none';
        renderAccounts(selectedSource, selectedIndex);
        if (previewAccountList) previewAccountList.style.display = '';
        previewBtn.disabled = false;
      }, 3000);
    }

    previewBtn.addEventListener('click', function () {
      hasPreviewedOnce = true;
      sessionStorage.setItem('aop_previewed_step2', 'true');
      runPreview();
    });

    function refreshPreviewDropdown(items) {
      SOURCE_CONFIGS = {};
      items.forEach(function (item) {
        SOURCE_CONFIGS[item.name] = getConfigForIndex(item.index);
      });

      if (dropdownList) {
        dropdownList.innerHTML = items.map(function (item) {
          var icon = ICON_MAP[item.type] || ICON_MAP.account;
          var disabledClass = item.configured ? '' : ' slds-dropdown__item_disabled';
          var meta = item.configured ? '' : '<span class="slds-listbox__option-meta slds-listbox__option-meta_entity">Not configured</span>';
          return '<li role="presentation" class="slds-listbox__item' + disabledClass + '">' +
            '<div class="slds-media slds-listbox__option slds-listbox__option_entity slds-media_center" role="option" data-source-index="' + item.index + '" data-source-type="' + item.type + '">' +
              '<span class="slds-media__figure slds-listbox__option-icon">' +
                '<span class="slds-icon_container ' + icon.cssClass + '">' +
                  '<svg class="slds-icon slds-icon_small" aria-hidden="true">' +
                    '<use xlink:href="' + icon.sprite + '"></use>' +
                  '</svg>' +
                '</span>' +
              '</span>' +
              '<span class="slds-media__body">' +
                '<span class="slds-listbox__option-text slds-listbox__option-text_entity">' + item.name + '</span>' +
                meta +
              '</span>' +
            '</div>' +
          '</li>';
        }).join('');
        wireDropdownOptions();
      }

      var firstConfigured = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].configured) { firstConfigured = items[i]; break; }
      }

      if (firstConfigured) {
        selectedSource = firstConfigured.name;
        selectedIndex = firstConfigured.index;
        if (comboboxLabel) comboboxLabel.textContent = firstConfigured.name;
        updateSelectedIcon(firstConfigured.type);
        previewBtn.disabled = false;
      } else {
        selectedSource = null;
        selectedIndex = 0;
        if (comboboxLabel) comboboxLabel.textContent = 'Select a source';
        showDefaultIcon();
        previewBtn.disabled = true;
      }
    }

    scope._refreshPreviewDropdown = refreshPreviewDropdown;

    // Reset hook for the unified panel — flips back to the empty state.
    // Cancels any in-flight loading timer, hides the account list +
    // notifications, and re-shows the empty state. Selection state on
    // the combobox is preserved (the user already picked a source —
    // they shouldn't have to pick again every time they switch the
    // preview dropdown). Generate stays enabled if there's still a
    // valid selection.
    scope._resetPreview = function () {
      clearTimeout(loadingTimer);
      hasPreviewedOnce = false;
      if (loadingState) loadingState.style.display = 'none';
      if (previewAccountList) {
        previewAccountList.style.display = 'none';
        previewAccountList.innerHTML = '';
      }
      if (notificationSuccess) notificationSuccess.style.display = 'none';
      if (notificationError) notificationError.style.display = 'none';
      if (emptyState) emptyState.style.display = '';
      previewBtn.disabled = !selectedSource;
    };
  }

  function autoInit() {
    document.querySelectorAll('.preview-panel--unified .pu-mode--live[data-mode="data_source"]').forEach(initDataSourcePreview);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // Backward-compat shim. The page-level body (e.g. step_01's source-list
  // Add buttons in `_step_01_body.html`) calls this with the picked
  // source items. Fan out to every booted Data-Source scope so
  // multi-instance pages stay in sync.
  window.refreshPreviewDropdown = function (items) {
    document.querySelectorAll('.preview-panel--unified .pu-mode--live[data-mode="data_source"]').forEach(function (scope) {
      if (typeof scope._refreshPreviewDropdown === 'function') {
        scope._refreshPreviewDropdown(items);
      }
    });
  };

  window.initDataSourcePreview = initDataSourcePreview;
})();
