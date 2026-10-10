/* Statistics Reference — static, offline site.
 * Content: ../content/{study,general}/... markdown + _index.json, loaded with fetch.
 * When opened from file:// (fetch blocked), falls back to content-bundle.js.
 */
(function () {
  'use strict';

  const CONTENT_BASE = '../content/';
  const BUNDLE_SRC = 'content-bundle.js';

  /* ------------------------------------------------------------------ *
   * Markdown rendering (subset used by the content files)
   * ------------------------------------------------------------------ */

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slugify(s) {
    return s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function tex(src, display) {
    if (typeof katex === 'undefined') return esc(display ? '$$' + src + '$$' : '$' + src + '$');
    try {
      return katex.renderToString(src, { displayMode: display, throwOnError: false, strict: 'ignore' });
    } catch (e) {
      return '<code>' + esc(src) + '</code>';
    }
  }

  function inline(text) {
    const store = [];
    const hold = (html) => '\u0000' + (store.push(html) - 1) + '\u0000';
    let s = text;
    s = s.replace(/`([^`]+)`/g, (_, c) => hold('<code>' + esc(c) + '</code>'));
    s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => hold(tex(t.trim(), true)));
    s = s.replace(/(^|[^\\])\$([^$\n]+?)\$/g, (_, pre, t) => pre + hold(tex(t, false)));
    s = s.replace(/\\\$/g, '$');
    s = esc(s);
    s = s.replace(/(^|[^*])\*\*(?![\s*])([^*]+?)(?<![\s*])\*\*(?!\*)/g, '$1<strong>$2</strong>');
    s = s.replace(/(^|[^\w*])\*([A-Za-z0-9][^*\n]*?[^\s*])\*(?![\w*])/g, '$1<em>$2</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => /^https?:\/\//.test(u)
      ? '<a class="ext" href="' + u + '" target="_blank" rel="noopener noreferrer">' + t + '</a>'
      : '<a href="' + u + '">' + t + '</a>');
    s = s.replace(/\n/g, ' ');
    return s.replace(/\u0000(\d+)\u0000/g, (_, n) => store[+n]);
  }

  // Split a table row on "|" that are not inside $math$ or `code`.
  function splitRow(line) {
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|') && s[s.length - 2] !== '\\') s = s.slice(0, -1);
    const cells = [];
    let cur = '', math = false, code = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '$' && s[i - 1] !== '\\' && !code) math = !math;
      else if (c === '`' && !math) code = !code;
      if (c === '|' && !math && !code) { cells.push(cur.trim()); cur = ''; } else cur += c;
    }
    cells.push(cur.trim());
    return cells;
  }

  const LIST_RE = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;
  const isBlank = (l) => /^\s*$/.test(l);
  const isTableStart = (lines, i) =>
    /^\s*\|/.test(lines[i]) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1]);

  function buildList(items) {
    let html = '';
    const stack = [];
    const tag = (it) => (it.ordered ? 'ol' : 'ul');
    for (const it of items) {
      while (stack.length && it.indent < stack[stack.length - 1].indent) {
        html += '</li></' + tag(stack.pop()) + '>';
      }
      if (!stack.length || it.indent > stack[stack.length - 1].indent) {
        stack.push(it);
        html += '<' + tag(it) + '><li>';
      } else {
        html += '</li><li>';
      }
      html += inline(it.text);
    }
    while (stack.length) html += '</li></' + tag(stack.pop()) + '>';
    return html;
  }

  function renderMarkdown(src, opts) {
    opts = opts || {};
    const lines = src.replace(/\r\n?/g, '\n').split('\n');
    let html = '';
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      let m;
      if (isBlank(line)) { i++; continue; }

      if ((m = line.match(/^```(\w*)\s*$/))) {
        const buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
        i++;
        html += codeBlock([{ lang: m[1] || '', code: buf.join('\n') }]);
        continue;
      }

      if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        const lvl = Math.min(6, m[1].length + (opts.shiftHeadings || 0));
        html += '<h' + lvl + ' id="' + slugify(m[2]) + '">' + inline(m[2]) + '</h' + lvl + '>';
        i++;
        continue;
      }

      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
        html += '<blockquote>' + renderMarkdown(buf.join('\n')) + '</blockquote>';
        continue;
      }

      if (isTableStart(lines, i)) {
        const head = splitRow(lines[i]);
        i += 2;
        let body = '';
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          body += '<tr>' + splitRow(lines[i]).map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>';
          i++;
        }
        html += '<div class="table-wrap"><table><thead><tr>' +
          head.map((c) => '<th>' + inline(c) + '</th>').join('') +
          '</tr></thead><tbody>' + body + '</tbody></table></div>';
        continue;
      }

      if (LIST_RE.test(line)) {
        const items = [];
        while (i < lines.length) {
          const l = lines[i];
          const lm = l.match(LIST_RE);
          if (lm) {
            items.push({ indent: lm[1].length, ordered: /\d/.test(lm[2]), text: lm[3] });
            i++;
          } else if (isBlank(l)) {
            let j = i + 1;
            while (j < lines.length && isBlank(lines[j])) j++;
            if (j < lines.length && (LIST_RE.test(lines[j]) || /^\s+\S/.test(lines[j]))) { i = j; continue; }
            break;
          } else if (/^\s+\S/.test(l)) {
            items[items.length - 1].text += '\n' + l.trim();
            i++;
          } else {
            break;
          }
        }
        html += buildList(items);
        continue;
      }

      if (/^\s*\$\$/.test(line)) {
        const buf = [line];
        i++;
        if (!(line.trim().length > 4 && line.trim().endsWith('$$'))) {
          while (i < lines.length) {
            buf.push(lines[i]);
            if (lines[i++].trim().endsWith('$$')) break;
          }
        }
        html += '<div class="math-block">' + inline(buf.join('\n')) + '</div>';
        continue;
      }

      const buf = [];
      while (i < lines.length && !isBlank(lines[i]) && !/^(#{1,6}\s|```|>)/.test(lines[i]) &&
             !LIST_RE.test(lines[i]) && !isTableStart(lines, i) && !/^\s*\$\$/.test(lines[i])) {
        buf.push(lines[i++]);
      }
      if (!buf.length) { buf.push(lines[i++]); }
      html += '<p>' + inline(buf.join('\n')) + '</p>';
    }
    return html;
  }

  /* ------------------------------------------------------------------ *
   * Code blocks: R / Python tabs, highlighting, copy button
   * ------------------------------------------------------------------ */

  const LANG_LABEL = { r: 'R', python: 'Python' };

  function highlight(code, lang) {
    if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
      try { return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value; } catch (e) { /* plain */ }
    }
    return esc(code);
  }

  function codeBlock(variants) {
    const pref = getPrefLang();
    let active = variants.findIndex((v) => v.lang === pref);
    if (active < 0) active = 0;
    const tabs = variants.length > 1
      ? variants.map((v, k) =>
          '<button type="button" class="tab" role="tab" data-lang="' + esc(v.lang) + '" aria-selected="' +
          (k === active) + '">' + esc(LANG_LABEL[v.lang] || v.lang || 'Code') + '</button>').join('')
      : '<span class="tab-label">' + esc(LANG_LABEL[variants[0].lang] || variants[0].lang || 'Code') + '</span>';
    const panels = variants.map((v, k) =>
      '<pre class="panel" data-lang="' + esc(v.lang) + '"' + (k === active ? '' : ' hidden') +
      '><code class="hljs">' + highlight(v.code, v.lang) + '</code></pre>').join('');
    return '<div class="code-block"><div class="code-bar" role="tablist">' + tabs +
      '<button type="button" class="copy" aria-label="Copy code">Copy</button></div>' + panels + '</div>';
  }

  function getPrefLang() {
    try { return localStorage.getItem('stats-ref-lang') || 'r'; } catch (e) { return 'r'; }
  }

  function setPrefLang(lang) {
    try { localStorage.setItem('stats-ref-lang', lang); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ *
   * Topic document assembly
   * ------------------------------------------------------------------ */

  function parseTopic(md) {
    const lines = md.replace(/\r\n?/g, '\n').split('\n');
    let title = '';
    const intro = [];
    const sections = [];
    let cur = null;
    for (const line of lines) {
      let m;
      if (!title && (m = line.match(/^#\s+(.*)$/))) { title = m[1].trim(); continue; }
      if ((m = line.match(/^##\s+(.*)$/))) { cur = { name: m[1].trim(), body: [] }; sections.push(cur); continue; }
      (cur ? cur.body : intro).push(line);
    }
    sections.forEach((s) => { s.body = s.body.join('\n').trim(); });
    return { title, intro: intro.join('\n').trim(), sections };
  }

  function firstFence(body) {
    const m = body.match(/```(\w*)\n([\s\S]*?)```/);
    return m ? { lang: m[1], code: m[2].replace(/\n$/, '') } : null;
  }

  function renderTopicBody(topic) {
    let html = '';
    const byName = {};
    topic.sections.forEach((s) => { byName[s.name] = s; });
    for (const s of topic.sections) {
      if (s.name === 'Python Code' && byName['R Code']) continue;
      if (s.name === 'R Code' || s.name === 'Python Code') {
        const variants = [];
        const r = byName['R Code'] && firstFence(byName['R Code'].body);
        const py = byName['Python Code'] && firstFence(byName['Python Code'].body);
        if (r) variants.push({ lang: 'r', code: r.code });
        if (py) variants.push({ lang: 'python', code: py.code });
        if (!variants.length) continue;
        html += '<section><h2 id="code">Code</h2>' + codeBlock(variants) + '</section>';
        continue;
      }
      if (!s.body) continue;
      const id = slugify(s.name);
      if (s.name === 'Solutions') {
        if (/^none/i.test(s.body)) {
          html += '<section><h2 id="' + id + '">Solutions</h2><p class="muted">' + esc(s.body) + '</p></section>';
        } else {
          html += '<section><h2 id="' + id + '">Solutions</h2><details class="solutions"><summary>Show solutions</summary>' +
            renderMarkdown(s.body, { shiftHeadings: 1 }) + '</details></section>';
        }
        continue;
      }
      if (s.name === 'Practice Questions' && /^none/i.test(s.body)) {
        html += '<section><h2 id="' + id + '">Practice Questions</h2><p class="muted">' + esc(s.body) + '</p></section>';
        continue;
      }
      html += '<section><h2 id="' + id + '">' + inline(s.name) + '</h2>' + renderMarkdown(s.body) + '</section>';
    }
    return html;
  }

  /* ------------------------------------------------------------------ *
   * Content loading (fetch, with file:// bundle fallback)
   * ------------------------------------------------------------------ */

  const cache = new Map();
  let bundlePromise = null;

  function loadBundle() {
    if (window.CONTENT_BUNDLE) return Promise.resolve(window.CONTENT_BUNDLE);
    if (!bundlePromise) {
      bundlePromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = BUNDLE_SRC;
        s.onload = () => (window.CONTENT_BUNDLE ? resolve(window.CONTENT_BUNDLE) : reject(new Error('empty bundle')));
        s.onerror = () => reject(new Error('bundle missing'));
        document.head.appendChild(s);
      });
    }
    return bundlePromise;
  }

  async function loadText(path) {
    if (cache.has(path)) return cache.get(path);
    const p = (async () => {
      if (!window.CONTENT_BUNDLE && location.protocol !== 'file:') {
        try {
          const r = await fetch(CONTENT_BASE + path);
          if (r.ok) return await r.text();
        } catch (e) { /* fall through to bundle */ }
      }
      const b = await loadBundle();
      if (!(path in b)) throw new Error('Not found: ' + path);
      return b[path];
    })();
    cache.set(path, p);
    p.catch(() => cache.delete(path));
    return p;
  }

  /* ------------------------------------------------------------------ *
   * Site model
   * ------------------------------------------------------------------ */

  const site = {
    study: null,          // study/_index.json
    general: null,        // general/_index.json
    order: { study: [], general: [] },   // flat ordered topic refs
    byKey: {},            // "study/stats1/median" -> ref
    leadsTo: {},          // study key -> [keys]
    relatedStudy: {},     // general key -> [study keys]
  };

  function buildModel() {
    for (const [part, p] of Object.entries(site.study)) {
      for (const u of p.units) {
        for (const t of u.topics) {
          const key = 'study/' + part + '/' + t.slug;
          const ref = { key, mode: 'study', group: part, groupTitle: p.title, unit: u.title, slug: t.slug,
            title: t.title, practice: t.practice, buildsOn: t.builds_on.map((b) => 'study/' + b),
            general: t.general ? 'general/' + t.general : null, path: 'study/' + part + '/' + t.slug + '.md' };
          site.byKey[key] = ref;
          site.order.study.push(ref);
        }
      }
    }
    for (const [tier, g] of Object.entries(site.general)) {
      for (const t of g.topics) {
        const key = 'general/' + tier + '/' + t.slug;
        const ref = { key, mode: 'general', group: tier, groupTitle: g.title, slug: t.slug, title: t.title,
          description: t.description, path: 'general/' + tier + '/' + t.slug + '.md' };
        site.byKey[key] = ref;
        site.order.general.push(ref);
      }
    }
    for (const ref of site.order.study) {
      for (const b of ref.buildsOn) (site.leadsTo[b] = site.leadsTo[b] || []).push(ref.key);
      if (ref.general) (site.relatedStudy[ref.general] = site.relatedStudy[ref.general] || []).push(ref.key);
    }
  }

  /* ------------------------------------------------------------------ *
   * UI
   * ------------------------------------------------------------------ */

  const $ = (sel) => document.querySelector(sel);
  const state = { mode: 'study', group: 'stats1', key: null, lastRoute: { study: null, general: null } };
  const expanded = new Set();   // expanded unit ids "stats1::unit title"

  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    const mode = parts[0] === 'general' ? 'general' : 'study';
    const groups = Object.keys(mode === 'study' ? site.study : site.general);
    const group = groups.includes(parts[1]) ? parts[1] : groups[0];
    const key = parts[2] ? mode + '/' + group + '/' + parts[2] : null;
    return { mode, group, key: key && site.byKey[key] ? key : null };
  }

  function href(key) { return '#/' + key; }

  function renderSwitches() {
    document.querySelectorAll('#mode-switch a').forEach((a) => {
      a.classList.toggle('active', a.dataset.mode === state.mode);
      a.setAttribute('aria-current', a.dataset.mode === state.mode ? 'page' : 'false');
      const last = state.lastRoute[a.dataset.mode];
      a.href = last || '#/' + a.dataset.mode;
    });
    const groups = state.mode === 'study' ? site.study : site.general;
    $('#group-switch').setAttribute('aria-label', state.mode === 'study' ? 'Course part' : 'Tier');
    $('#group-switch').innerHTML = Object.entries(groups).map(([k, g]) =>
      '<a href="#/' + state.mode + '/' + k + '" class="' + (k === state.group ? 'active' : '') + '"' +
      (k === state.group ? ' aria-current="page"' : '') + '>' + esc(g.title) + '</a>').join('');
  }

  function renderNav() {
    const nav = $('#nav');
    if ($('#search').value.trim()) return;   // search results own the nav area
    let html = '';
    if (state.mode === 'study') {
      const part = site.study[state.group];
      html += '<a class="nav-overview' + (state.key ? '' : ' current') + '" href="#/study/' + state.group + '">' +
        esc(part.title) + ' overview</a>';
      part.units.forEach((u, ui) => {
        const uid = state.group + '::' + u.title;
        const containsCurrent = u.topics.some((t) => 'study/' + state.group + '/' + t.slug === state.key);
        if (containsCurrent) expanded.add(uid);
        const open = expanded.has(uid);
        html += '<div class="unit' + (open ? ' open' : '') + '">' +
          '<button type="button" class="unit-toggle" aria-expanded="' + open + '" data-unit="' + esc(uid) + '">' +
          '<span class="unit-num">' + (ui + 1) + '</span>' + esc(u.title) + '</button>' +
          '<div class="unit-body"><ul>' + u.topics.map((t) => {
            const key = 'study/' + state.group + '/' + t.slug;
            return '<li><a href="' + href(key) + '"' + (key === state.key ? ' class="current" aria-current="page"' : '') +
              '>' + esc(t.title) + (t.practice && !/^Practice/.test(t.title) ? ' <span class="muted">(exercises)</span>' : '') +
              '</a></li>';
          }).join('') + '</ul></div></div>';
      });
    } else {
      const tier = site.general[state.group];
      html += '<a class="nav-overview' + (state.key ? '' : ' current') + '" href="#/general/' + state.group + '">' +
        esc(tier.title) + ' overview</a><ol class="tier-list">' + tier.topics.map((t) => {
          const key = 'general/' + state.group + '/' + t.slug;
          return '<li><a href="' + href(key) + '"' + (key === state.key ? ' class="current" aria-current="page"' : '') +
            '>' + esc(t.title) + '</a></li>';
        }).join('') + '</ol>';
    }
    nav.innerHTML = html;
  }

  function linkList(keys) {
    return keys.filter((k) => site.byKey[k]).map((k) => {
      const r = site.byKey[k];
      const where = r.mode === 'study' ? r.groupTitle : 'General · ' + r.groupTitle;
      return '<li><a href="' + href(k) + '">' + esc(r.title) + '</a> <span class="muted">' + esc(where) + '</span></li>';
    }).join('');
  }

  function renderConnections(ref) {
    let html = '';
    if (ref.mode === 'study') {
      const leads = site.leadsTo[ref.key] || [];
      if (ref.buildsOn.length) html += '<h3>Builds on</h3><ul class="links">' + linkList(ref.buildsOn) + '</ul>';
      if (leads.length) html += '<h3>Leads to</h3><ul class="links">' + linkList(leads) + '</ul>';
      if (ref.general) html += '<h3>Broader reference</h3><ul class="links">' + linkList([ref.general]) + '</ul>';
    } else {
      const rel = site.relatedStudy[ref.key] || [];
      if (rel.length) html += '<h3>In your course</h3><ul class="links">' + linkList(rel) + '</ul>';
    }
    return html ? '<section class="connections"><h2 id="connections">Connections</h2>' + html + '</section>' : '';
  }

  function renderPrevNext(ref) {
    const list = site.order[ref.mode].filter((r) => r.group === ref.group);
    const i = list.findIndex((r) => r.key === ref.key);
    const prev = list[i - 1], next = list[i + 1];
    return '<nav class="prevnext" aria-label="Previous and next topic">' +
      (prev ? '<a class="prev" href="' + href(prev.key) + '"><span class="muted">Previous</span>' + esc(prev.title) + '</a>' : '<span></span>') +
      (next ? '<a class="next" href="' + href(next.key) + '"><span class="muted">Next</span>' + esc(next.title) + '</a>' : '<span></span>') +
      '</nav>';
  }

  async function renderTopic(ref) {
    const doc = $('#doc');
    doc.innerHTML = '<p class="muted">Loading…</p>';
    let md;
    try {
      md = await loadText(ref.path);
    } catch (e) {
      showLoadError(e);
      return;
    }
    if (state.key !== ref.key) return;    // navigated away while loading
    const topic = parseTopic(md);
    const crumb = ref.mode === 'study'
      ? 'Study · ' + ref.groupTitle + ' · ' + ref.unit
      : 'General · ' + ref.groupTitle;
    let source = '';
    if (topic.intro) source = '<div class="source">' + renderMarkdown(topic.intro.replace(/^>\s?/gm, '')) + '</div>';
    doc.innerHTML = '<p class="crumb">' + esc(crumb) + '</p><h1>' + inline(topic.title || ref.title) + '</h1>' +
      source + renderTopicBody(topic) + renderConnections(ref) + renderPrevNext(ref);
    document.title = (topic.title || ref.title).replace(/\$[^$]*\$/g, '').trim() + ' — Statistics Reference';
  }

  const WIKI_NOTE = '<p class="muted">Terms marked with a small arrow link to Wikipedia (they open in a new tab and need an internet connection). In practice sections, <span class="q-original">◆</span> marks a question from the original course material and ✎ marks a question added for this site.</p>';

  function renderOverview() {
    const doc = $('#doc');
    let html;
    if (state.mode === 'study') {
      const part = site.study[state.group];
      html = '<p class="crumb">Study</p><h1>' + esc(part.title) + '</h1><p class="lead">' + esc(part.subtitle) +
        '. Topics are grouped into units in study order; each topic lists what it builds on and what it leads to.</p>' + WIKI_NOTE;
      part.units.forEach((u, ui) => {
        html += '<section><h2>' + (ui + 1) + '. ' + esc(u.title) + '</h2><ol class="overview-list">' +
          u.topics.map((t) => '<li><a href="' + href('study/' + state.group + '/' + t.slug) + '">' + esc(t.title) + '</a>' +
            (t.practice ? ' <span class="muted">— includes practice questions</span>' : '') + '</li>').join('') +
          '</ol></section>';
      });
    } else {
      const tier = site.general[state.group];
      html = '<p class="crumb">General</p><h1>' + esc(tier.title) + '</h1><p class="lead">' + esc(tier.subtitle) +
        '. Read the topics in order; each builds on the previous ones.</p>' + WIKI_NOTE + '<ol class="overview-list described">' +
        tier.topics.map((t) => '<li><a href="' + href('general/' + state.group + '/' + t.slug) + '">' + esc(t.title) +
          '</a><p>' + esc(t.description) + '</p></li>').join('') + '</ol>';
    }
    doc.innerHTML = html;
    const g = state.mode === 'study' ? site.study[state.group] : site.general[state.group];
    document.title = g.title + ' — Statistics Reference';
  }

  function showLoadError(e) {
    $('#doc').innerHTML = '<h1>Content could not be loaded</h1><p class="error">' + esc(String(e.message || e)) + '</p>' +
      '<p>Serve the site from the <code>stats-website</code> folder:</p>' +
      '<pre class="plain"><code>cd stats-website\npython -m http.server 8000</code></pre>' +
      '<p>then open <code>http://localhost:8000/src/</code>. To open <code>src/index.html</code> directly from disk, ' +
      'first run <code>python tools/bundle_content.py</code> once to create <code>src/content-bundle.js</code>.</p>';
  }

  async function route() {
    const r = parseRoute();
    state.mode = r.mode;
    state.group = r.group;
    state.key = r.key;
    state.lastRoute[r.mode] = location.hash || null;
    renderSwitches();
    renderNav();
    closeMenu();
    if (r.key) await renderTopic(site.byKey[r.key]);
    else renderOverview();
    window.scrollTo(0, 0);
    $('#main').focus({ preventScroll: true });
  }

  /* ------------------------------ search ------------------------------ */

  const searchIndex = { study: null, general: null };

  function plainText(md) {
    return md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .replace(/\$[^$\n]*\$/g, ' ')
      .replace(/[#>*`|_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async function ensureSearchIndex(mode) {
    if (searchIndex[mode]) return searchIndex[mode];
    const refs = site.order[mode];
    const texts = await Promise.all(refs.map((r) => loadText(r.path).catch(() => '')));
    searchIndex[mode] = refs.map((r, i) => ({ ref: r, title: r.title.toLowerCase(), text: plainText(texts[i]) }));
    return searchIndex[mode];
  }

  function snippet(text, term) {
    const i = text.toLowerCase().indexOf(term);
    if (i < 0) return '';
    const start = Math.max(0, i - 50);
    const raw = (start > 0 ? '…' : '') + text.slice(start, i + term.length + 70) + '…';
    const re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return esc(raw).replace(re, '<mark>$1</mark>');
  }

  let searchSeq = 0;
  async function runSearch() {
    const q = $('#search').value.trim().toLowerCase();
    if (!q) { renderNav(); return; }
    const seq = ++searchSeq;
    $('#nav').innerHTML = '<p class="muted nav-note">Searching…</p>';
    let index;
    try { index = await ensureSearchIndex(state.mode); } catch (e) { return; }
    if (seq !== searchSeq) return;
    const terms = q.split(/\s+/).filter(Boolean);
    const results = [];
    for (const item of index) {
      const lowText = item.text.toLowerCase();
      if (!terms.every((t) => item.title.includes(t) || lowText.includes(t))) continue;
      let score = 0;
      for (const t of terms) {
        if (item.title.includes(t)) score += 10;
        score += Math.min(5, lowText.split(t).length - 1);
      }
      results.push({ item, score });
    }
    results.sort((a, b) => b.score - a.score);
    const scope = state.mode === 'study' ? 'Study' : 'General';
    $('#nav').innerHTML = '<p class="muted nav-note">' + results.length + ' result' + (results.length === 1 ? '' : 's') +
      ' in ' + scope + '</p><ul class="results">' + results.slice(0, 40).map(({ item }) =>
        '<li><a href="' + href(item.ref.key) + '"><span class="r-title">' + esc(item.ref.title) + '</span>' +
        '<span class="muted r-where">' + esc(item.ref.groupTitle) + '</span>' +
        '<span class="r-snip">' + snippet(item.text, terms[0]) + '</span></a></li>').join('') + '</ul>';
  }

  /* ------------------------------ events ------------------------------ */

  function closeMenu() {
    document.body.classList.remove('menu-open');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
  }

  function bindEvents() {
    window.addEventListener('hashchange', route);

    $('#nav').addEventListener('click', (e) => {
      const btn = e.target.closest('.unit-toggle');
      if (!btn) return;
      const uid = btn.dataset.unit;
      const unit = btn.parentElement;
      const open = !unit.classList.contains('open');
      unit.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) expanded.add(uid); else expanded.delete(uid);
    });

    $('#doc').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (tab) {
        const lang = tab.dataset.lang;
        setPrefLang(lang);
        document.querySelectorAll('.code-block').forEach((block) => {
          if (!block.querySelector('.panel[data-lang="' + lang + '"]')) return;
          block.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.lang === lang)));
          block.querySelectorAll('.panel').forEach((p) => { p.hidden = p.dataset.lang !== lang; });
        });
        return;
      }
      const copy = e.target.closest('.copy');
      if (copy) {
        const panel = copy.closest('.code-block').querySelector('.panel:not([hidden])');
        const text = panel.textContent;
        const done = (ok) => {
          copy.textContent = ok ? 'Copied' : 'Copy failed';
          copy.classList.toggle('ok', ok);
          copy.classList.toggle('fail', !ok);
          setTimeout(() => { copy.textContent = 'Copy'; copy.classList.remove('ok', 'fail'); }, 1600);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(() => done(true), () => done(fallbackCopy(text)));
        } else {
          done(fallbackCopy(text));
        }
      }
    });

    let timer = null;
    $('#search').addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(runSearch, 150);
    });
    $('#search').addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { $('#search').value = ''; renderNav(); }
      if (e.key === 'Enter') {
        const first = $('#nav .results a');
        if (first) { location.hash = first.getAttribute('href'); }
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== $('#search') && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        $('#search').focus();
      }
    });

    $('#menu-toggle').addEventListener('click', () => {
      const open = !document.body.classList.contains('menu-open');
      document.body.classList.toggle('menu-open', open);
      $('#menu-toggle').setAttribute('aria-expanded', String(open));
    });

    // Switching mode clears a running search so the nav shows the new mode.
    $('#mode-switch').addEventListener('click', () => { $('#search').value = ''; });
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  async function init() {
    bindEvents();
    try {
      const [s, g] = await Promise.all([loadText('study/_index.json'), loadText('general/_index.json')]);
      site.study = JSON.parse(s);
      site.general = JSON.parse(g);
    } catch (e) {
      showLoadError(e);
      return;
    }
    buildModel();
    if (!location.hash) history.replaceState(null, '', '#/study/stats1');
    await route();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderMarkdown, inline, parseTopic, renderTopicBody, splitRow };
  } else if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
