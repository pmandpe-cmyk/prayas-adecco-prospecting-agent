// ──────────────────────────────────────────────────────────────────────
// Conversation Mock Responder
// =======================================================================
// Isolated stand-in for a live conversational service. Consumers call
//
//     SellerHomeConvMock.respond(query, context)
//
// and receive a Promise that resolves to a `{ text }` object once a
// short mock delay elapses. Nothing in this file touches the DOM — the
// module represents the exact API boundary a real backend or streaming
// service will replace, so `home_conversation.js` can be swapped from
// `SellerHomeConvMock.respond` to `apiClient.respond` without any DOM
// changes.
//
// Contract:
//   respond(query, context) → Promise<{
//     text: String,       // assistant reply, plain text
//     latencyMs: Number   // simulated round-trip latency
//   }>
//
// `context.conversationId` — active conversation id (informational).
// `context.snapshots`      — array of seeded run-snapshot payloads for
//                            the active conversation, newest first.
//                            Enables the picker to name specific
//                            attention items / opportunities so canned
//                            replies feel grounded rather than generic.
//   Shape:
//     [ { dateLabel, summary, attention:{items:[…]}, changes:{rows:[…]},
//         actions:{items:[…]} }, … ]
//
// Failure model: never rejects in the prototype. Live implementations
// can and should reject with an Error so the caller's error path
// (already wired in `bindComposer`) surfaces a retry.
//
// Extension: `respond` is currently keyword-driven. A real service will
// take over the picker function; the outer shape stays stable.
// ──────────────────────────────────────────────────────────────────────

(function () {
  'use strict'

  // Simulated round-trip. Long enough for the typing indicator to be
  // visible (not a flash), short enough that the prototype still feels
  // responsive. 500 ms base + up to 300 ms jitter keeps repeated
  // responses from feeling machine-timed.
  var BASE_DELAY_MS  = 500
  var JITTER_DELAY_MS = 300

  function respond (query, context) {
    var q = String(query || '').trim()
    var ctx = context || {}
    var latency = BASE_DELAY_MS + Math.floor(Math.random() * JITTER_DELAY_MS)
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve({ text: pickReply(q, ctx), latencyMs: latency })
      }, latency)
    })
  }

  // ── Picker ──────────────────────────────────────────────────────
  // Keyword-driven canned reply set. Case-insensitive; multiple
  // matches fall through to the longest specific handler first, so
  // "why is Acme at risk?" hits the risk-explanation branch before
  // the generic "acme" fallback. Every branch pulls freeform snippets
  // out of `ctx.snapshots` where available so replies name actual
  // seeded data — grounded, not free-invention.
  function pickReply (query, ctx) {
    var q = query.toLowerCase()
    var latest = latestSnapshot(ctx)
    var attentionByAccount = indexAttentionByAccount(latest)

    // "why is X at risk?" — pull the matching attention item's detail
    // + recommendation from the current snapshot.
    var riskMatch = q.match(/why\s+is\s+([a-z0-9][\w\s'&-]*?)\s+(?:at\s+risk|slipping|not\s+going|off\s+track)/i)
    if (riskMatch) {
      var name = riskMatch[1].trim()
      var hit = matchAttentionItem(attentionByAccount, name)
      if (hit) {
        return (
          hit.title + ' is flagged because ' + lowerFirst(hit.detail) +
          (hit.recommendation ? ' ' + hit.recommendation : '')
        )
      }
      return 'I don\u2019t have a specific risk signal on "' + name + '" in this snapshot.'
    }

    // "draft a follow-up to <person or account>" — reference the
    // matching attention item + a canned outreach outline.
    if (/\bdraft\b.*(follow[\s-]?up|email|outreach|message)/i.test(q) || /\bwrite\b.*(email|note|reply)/i.test(q)) {
      var target = extractName(q)
      var refItem = target ? matchAttentionItem(attentionByAccount, target) : firstAttentionItem(latest)
      if (refItem) {
        return (
          'Here\u2019s a draft you can send to the ' + refItem.title + ' champion:\n\n' +
          'Subject: Following up on ' + refItem.title + '\n\n' +
          'Hi \u2014 I noticed ' + lowerFirst(refItem.detail) + ' ' +
          'Could we set up 20 minutes this week to align on next steps? ' +
          'Happy to work around your calendar.\n\n' +
          'Thanks,\nYour AE'
        )
      }
      return 'I can draft a follow-up once you tell me which account or opportunity you want to reach out to.'
    }

    // "compare … yesterday" — diff the two most-recent snapshots'
    // headline numbers.
    if (/\bcompare\b.*\byesterday\b/i.test(q) || /\byesterday\b.*\bcompare\b/i.test(q) || /\bvs\.?\s*yesterday\b/i.test(q)) {
      return buildComparisonReply(ctx)
    }

    // "which deals … slip" — pull the current snapshot's high +
    // warning attention items.
    if (/\b(most\s+likely\s+to\s+slip|at\s+risk\s+of\s+slipping|which\s+deals?\s+.*(slip|risk))\b/i.test(q)) {
      return buildRiskiestReply(latest)
    }

    // Fallback — acknowledge + steer.
    return (
      'I can help with follow-up drafts, risk explanations, or a comparison '
      + 'to yesterday\u2019s snapshot. Ask something like "Why is Acme at risk?" '
      + 'or "Draft a follow-up to the Acme champion."'
    )
  }

  // ── Snapshot helpers (pure) ─────────────────────────────────────
  function latestSnapshot (ctx) {
    var snaps = (ctx && ctx.snapshots) || []
    return snaps.length > 0 ? snaps[0] : null
  }

  function indexAttentionByAccount (snapshot) {
    var out = {}
    if (!snapshot || !snapshot.attention || !snapshot.attention.items) return out
    snapshot.attention.items.forEach(function (item) {
      // Index by both full title AND first word so "Acme" matches
      // "Acme Expansion".
      out[item.title.toLowerCase()] = item
      var firstWord = item.title.toLowerCase().split(/\s+/)[0]
      if (firstWord && !out[firstWord]) out[firstWord] = item
    })
    return out
  }

  function matchAttentionItem (index, name) {
    if (!name) return null
    var n = name.toLowerCase().trim()
    if (index[n]) return index[n]
    var firstWord = n.split(/\s+/)[0]
    if (firstWord && index[firstWord]) return index[firstWord]
    // Fuzzier: any indexed title that contains the query as a
    // substring.
    var keys = Object.keys(index)
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf(n) !== -1) return index[keys[i]]
    }
    return null
  }

  function firstAttentionItem (snapshot) {
    if (!snapshot || !snapshot.attention || !snapshot.attention.items) return null
    return snapshot.attention.items[0] || null
  }

  function extractName (q) {
    // Grab the noun after "to" — e.g. "draft a follow-up to the
    // Acme champion" → "Acme". Strips leading determiners + a
    // trailing role noun so the matcher can hit the attention index
    // on a bare account name.
    var m = q.match(/\bto\s+(?:the\s+|a\s+|an\s+)?([a-z0-9][\w\s'&-]*?)(?:\s+(?:champion|team|buyer|customer|contact|stakeholder)|[?.!,;]|$)/i)
    return m ? m[1].trim() : null
  }

  function buildComparisonReply (ctx) {
    var snaps = (ctx && ctx.snapshots) || []
    if (snaps.length < 2) {
      return 'I only have one snapshot loaded right now — nothing to compare against yet.'
    }
    var today = snaps[0]
    var prior = snaps[1]
    var todayOpen = readMetric(today, 'open')
    var priorOpen = readMetric(prior, 'open')
    var todayCov  = readMetric(today, 'coverage')
    var priorCov  = readMetric(prior, 'coverage')
    var deltaSentence = readMetric(today, 'change_yesterday')
    return (
      'Comparing ' + today.dateLabel + ' with ' + prior.dateLabel + ':\n\n'
      + '\u2022 Open pipeline moved from ' + (priorOpen || 'n/a') + ' to ' + (todayOpen || 'n/a') + '.\n'
      + '\u2022 Coverage moved from ' + (priorCov || 'n/a') + ' to ' + (todayCov || 'n/a') + '.\n'
      + (deltaSentence ? '\u2022 Today\u2019s delta: ' + deltaSentence + '.\n' : '')
      + '\nThe headline change today is: ' + lowerFirst(today.summary)
    )
  }

  function buildRiskiestReply (snapshot) {
    if (!snapshot || !snapshot.attention || !snapshot.attention.items || !snapshot.attention.items.length) {
      return 'Nothing is flagged in the current snapshot.'
    }
    var lines = snapshot.attention.items
      .filter(function (it) { return it.severity === 'high' || it.severity === 'warning' })
      .map(function (it) {
        return '\u2022 ' + it.title + ' \u2014 ' + it.subtitle
      })
    if (lines.length === 0) {
      return 'Nothing in the current snapshot is at high or warning severity.'
    }
    return (
      'Highest slip risk in the ' + snapshot.dateLabel + ' snapshot:\n\n' +
      lines.join('\n')
    )
  }

  function readMetric (snapshot, id) {
    if (!snapshot || !snapshot.metrics || !snapshot.metrics.items) return null
    for (var i = 0; i < snapshot.metrics.items.length; i++) {
      if (snapshot.metrics.items[i].id === id) return snapshot.metrics.items[i].value
    }
    return null
  }

  function lowerFirst (s) {
    if (!s) return ''
    return s.charAt(0).toLowerCase() + s.slice(1)
  }

  // ── Public API ──────────────────────────────────────────────────
  window.SellerHomeConvMock = {
    respond: respond,
    // Exposed for tests only — the picker is otherwise called
    // through `respond`. Named `_pickReplySync` so the underscore
    // marks it as non-public.
    _pickReplySync: pickReply
  }
})()
