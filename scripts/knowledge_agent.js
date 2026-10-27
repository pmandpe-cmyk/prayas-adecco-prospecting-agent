// ─────────────────────────────────────────────────────────────────────────
// Hunter Agent Knowledge — page controller for
// `hunter_agent_knowledge.html`.
//
// This file used to own the full markdown parser, TOC builder, syntax
// highlighter, editor, and view-swap logic. All of that has moved to
// `knowledge_document_view.js` so the Seller Home document-detail page
// can reuse the exact same behavior. This file is now a thin caller
// that hands the module the Agent Configuration-specific DOM nodes +
// scroll-spy root and does nothing else.
//
// Behavior on /hunter_agent_knowledge.html is byte-for-byte identical
// to the pre-refactor version — the module is a straight extraction,
// not a rewrite. If a regression surfaces here, look at the module,
// not this file.
//
// Scope: this file runs ONLY on `/hunter_agent_knowledge.html` (the
// page template loads it via `{% block hunter_scripts_extra %}`).
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  if (!window.KnowledgeDocumentView || typeof window.KnowledgeDocumentView.create !== 'function') {
    // Defensive guard — `knowledge_document_view.js` must load before
    // this file. The page template loads it directly (no script order
    // magic), so this branch only fires if a downstream consumer drops
    // one of the two script tags.
    // eslint-disable-next-line no-console
    console.warn('[hunter-agent-knowledge] KnowledgeDocumentView module not loaded; skipping init.');
    return;
  }

  function init() {
    var scope = document.querySelector('.hunter-agent-knowledge');
    if (!scope) return;

    window.KnowledgeDocumentView.create({
      root:         scope,
      sourceScript: document.getElementById('hunter-agent-knowledge-source-markdown'),

      // Preview surface.
      preview:       scope.querySelector('[data-knowledge-preview]'),
      article:       scope.querySelector('[data-knowledge-article]'),
      toc:           scope.querySelector('[data-knowledge-toc]'),
      tocList:       scope.querySelector('[data-knowledge-toc-list]'),
      tocBody:       scope.querySelector('[data-knowledge-toc-body]'),
      railIndicator: scope.querySelector('[data-knowledge-toc-rail-indicator]'),

      // Edit surface.
      edit:         scope.querySelector('[data-knowledge-edit]'),
      editorRoot:   scope.querySelector('[data-knowledge-editor-root]'),
      textarea:     scope.querySelector('[data-knowledge-editor-textarea]'),
      highlight:    scope.querySelector('[data-knowledge-editor-highlight]'),
      gutter:       scope.querySelector('[data-knowledge-editor-gutter]'),
      code:         scope.querySelector('[data-knowledge-editor-code]'),
      currentLine:  scope.querySelector('[data-knowledge-editor-current-line]'),

      // View toggle + toolbar. The view-toggle buttons live in the
      // panel header (outside `scope`), so they're looked up on the
      // document.
      toggleButtons:         document.querySelectorAll('.hunter-agent-knowledge__view-btn'),
      toolbarFormatButtons:  scope.querySelectorAll('[data-knowledge-format]'),
      toolbarHistoryButtons: scope.querySelectorAll('[data-knowledge-history]'),
      toolbarMenus:          scope.querySelectorAll('[data-knowledge-toolbar-menu]'),

      // Scroll-spy root. The Hunter Builder panel body is the actual
      // scroller; without this the IntersectionObserver would key off
      // the viewport and mis-fire while the panel scrolls internally.
      scrollRoot: '.hunter-builder__panel--center .hunter-builder__panel-body'

      // No onDirtyChange / onSave / onCancel — Agent Configuration
      // has no save/cancel UI in this prototype; edits round-trip
      // through the textarea for the lifetime of the tab and revert
      // on refresh, matching the pre-refactor behavior.
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
