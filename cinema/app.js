'use strict';

/* ------------------------------------------------------------------ helpers */
const root = document.getElementById('app');
const nav = document.getElementById('nav');
const searchInput = document.getElementById('search-input');
let me = null;
let renderToken = 0;

// Tiny DOM builder. All text goes through text nodes, so user content can't inject HTML.
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  add(el, kids);
  return el;
}
function add(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
  return el;
}

const go = (path) => { location.hash = '#' + path; };
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const scoreColor = (s) => `hsl(${Math.round(s * 12)} 62% 44%)`;
const hue = (name) => [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

function fmtDate(iso, dateOnly) {
  const d = new Date(dateOnly ? iso + 'T00:00:00' : iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* --------------------------------------------------------------- components */
function verdict(s) {
  const tiers = [[9.5, '🏆', 'Masterpiece'], [8.5, '🤩', 'Loved it'], [7.5, '😊', 'Great'], [6.5, '👍', 'Good'],
    [5, '😐', 'Decent'], [3, '😕', 'Meh'], [0, '🙅', 'Skip it']];
  const [, emoji, label] = tiers.find(([min]) => s >= min);
  return `${emoji} ${label}`;
}

function poster(url, title, size = 'md') {
  const fallback = () => h('div', { class: `poster ${size} fallback`, style: `--h:${hue(title)}`, 'aria-hidden': 'true' }, title[0].toUpperCase());
  if (!url) return fallback();
  const img = h('img', { class: `poster ${size}`, src: url, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' });
  img.addEventListener('error', () => img.replaceWith(fallback()));
  return img;
}

// Type-ahead dropdown for any text input. The input's parent must be position:relative.
function attachSuggest(input, { fetchItems, render, onPick }) {
  const box = h('div', { class: 'suggest', role: 'listbox', hidden: true });
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  let items = [], active = -1, seq = 0, timer;

  const close = () => { box.hidden = true; active = -1; input.setAttribute('aria-expanded', 'false'); };
  const highlight = () => [...box.children].forEach((el, i) => {
    el.classList.toggle('active', i === active);
    el.setAttribute('aria-selected', String(i === active));
    if (i === active) el.scrollIntoView({ block: 'nearest' });
  });
  const pick = (item) => { close(); onPick(item); };
  const paint = () => {
    if (!box.isConnected) input.parentElement.append(box); // input may not be mounted when attached
    box.replaceChildren(...items.map((item, i) => {
      const el = render(item);
      el.setAttribute('role', 'option');
      el.addEventListener('click', () => pick(item));
      el.addEventListener('mousemove', () => { if (active !== i) { active = i; highlight(); } });
      return el;
    }));
    box.hidden = !items.length;
    input.setAttribute('aria-expanded', String(items.length > 0));
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { seq++; close(); return; }
    timer = setTimeout(async () => {
      const mine = ++seq;
      let found = [];
      try { found = await fetchItems(q); } catch { /* offline: just show nothing */ }
      if (mine !== seq || document.activeElement !== input) return;
      items = found; active = -1; paint();
    }, 180);
  });
  input.addEventListener('keydown', (e) => {
    if (box.hidden || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % items.length; highlight(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + items.length) % items.length; highlight(); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(items[active]); }
    else if (e.key === 'Escape') close();
  });
  box.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus in the input
  input.addEventListener('blur', () => { seq++; setTimeout(close, 120); });
  return { close };
}

function filmSuggestRow(f) {
  return h('div', { class: 'suggest-item' },
    poster(f.poster, f.title, 'sm'),
    h('div', { class: 'si-text' },
      h('div', { class: 'si-title' }, f.title, f.year ? h('span', { class: 'muted' }, ` (${f.year})`) : null),
      h('div', { class: 'si-sub' }, f.reviews ? `★ ${f.reviews} review${f.reviews === 1 ? '' : 's'} on Reel Notes` : (f.cast || 'Be the first to review it'))),
    imdbPill(f));
}

// Search box used in the header and on the home page.
function siteSuggest(input) {
  return attachSuggest(input, {
    async fetchItems(q) {
      const d = await api('GET', '/api/suggest?people=1&q=' + encodeURIComponent(q));
      return [...d.films.map((f) => ({ kind: 'film', f })), ...d.users.map((u) => ({ kind: 'user', u })), { kind: 'all', q }];
    },
    render(item) {
      if (item.kind === 'film') return filmSuggestRow(item.f);
      if (item.kind === 'user') {
        return h('div', { class: 'suggest-item' }, avatar(item.u.username),
          h('div', { class: 'si-text' }, h('div', { class: 'si-title' }, '@' + item.u.username),
            h('div', { class: 'si-sub' }, item.u.films ? `${item.u.films} film${item.u.films === 1 ? '' : 's'} watched` : 'Member')));
      }
      return h('div', { class: 'suggest-item all' }, `See all results for “${item.q}”`);
    },
    onPick(item) {
      if (item.kind === 'user') { input.value = ''; go('/u/' + item.u.username); }
      else if (item.kind === 'all') goSearch(item.q);
      else if (item.f.id) { input.value = ''; go('/film/' + item.f.id); }
      else {
        input.value = '';
        const f = item.f;
        go('/new?' + new URLSearchParams({ title: f.title, ...(f.year ? { year: f.year } : {}), imdb: f.imdb_url, ...(f.poster ? { poster: f.poster } : {}) }));
      }
    },
  });
}

function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = h('canvas', { class: 'confetti', 'aria-hidden': 'true' });
  c.width = innerWidth; c.height = innerHeight;
  document.body.append(c);
  const ctx = c.getContext('2d');
  const colors = ['#e0584d', '#f5c518', '#4cc38a', '#5b9cf5', '#c084fc'];
  const bits = Array.from({ length: 110 }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 16, vy: Math.random() * -13 - 3,
    r: Math.random() * 6 + 3, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, color: colors[Math.floor(Math.random() * colors.length)],
  }));
  const start = performance.now();
  (function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, c.width, c.height);
    for (const b of bits) {
      b.vy += 0.35; b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot); ctx.globalAlpha = Math.max(0, 1 - t / 2200);
      ctx.fillStyle = b.color; ctx.fillRect(-b.r, -b.r / 2, b.r * 2, b.r); ctx.restore();
    }
    if (t < 2200) requestAnimationFrame(frame); else c.remove();
  })(start);
}

const avatar = (name, cls = '') =>
  h('span', { class: 'avatar ' + cls, style: `--h:${hue(name)}`, 'aria-hidden': 'true' }, name[0].toUpperCase());

const scoreBadge = (s, big) =>
  h('div', { class: 'score' + (big ? ' big' : ''), style: `--c:${scoreColor(s)}`, title: `${fmt(s)} out of 10 · ${verdict(s)}` },
    fmt(s), big ? h('small', null, '/10') : null);

const bar = (s) => h('div', { class: 'bar', style: `--c:${scoreColor(s)}` },
  h('i', { style: `width:${s * 10}%` }));

const imdbPill = (item) => h('a', {
  class: 'imdb-link', href: item.imdb_url, target: '_blank', rel: 'noopener noreferrer',
  title: item.imdb_exact ? 'Open this film on IMDb' : 'Search for this film on IMDb',
  onclick: (e) => e.stopPropagation(),
}, 'IMDb ↗');

const empty = (title, text, action) =>
  h('div', { class: 'empty' }, h('strong', null, title), text, action ? h('div', { style: 'margin-top:14px' }, action) : null);

function reviewCard(r, { showUser = true } = {}) {
  const chips = [...r.criteria].sort((a, b) => b.score - a.score).slice(0, 5);
  return h('article', { class: 'card review-card' },
    poster(r.poster, r.title, 'md'),
    h('div', { class: 'rc-body' },
      h('div', { class: 'top' },
        h('div', { class: 'grow' },
          h('a', { class: 'title stretch', href: `#/review/${r.id}` }, r.title, ' ',
            r.year ? h('span', { class: 'year' }, `(${r.year})`) : null),
          showUser ? h('div', { class: 'by' }, avatar(r.user.username, 'xs'),
            h('a', { class: 'above', href: `#/u/${r.user.username}` }, '@' + r.user.username)) : null),
        scoreBadge(r.overall)),
      r.summary ? h('p', { class: 'snippet' }, r.summary) : null,
      chips.length ? h('div', { class: 'chips' }, chips.map((c) =>
        h('span', { class: 'chip', style: `--c:${scoreColor(c.score)}` }, c.name, h('b', null, fmt(c.score))))) : null,
      h('div', { class: 'card-foot' },
        h('span', { class: 'muted small' }, r.watched_on ? 'Watched ' + fmtDate(r.watched_on, true) : fmtDate(r.created)),
        h('span', { class: 'above' }, imdbPill(r)))));
}

function personCard(u) {
  return h('article', { class: 'card person' },
    avatar(u.username),
    h('div', null,
      h('a', { class: 'name stretch', href: `#/u/${u.username}` }, '@' + u.username),
      h('div', { class: 'muted small' },
        u.films ? `${u.films} film${u.films === 1 ? '' : 's'} · avg ${u.avg}` : 'No reviews yet')));
}

function errorView(e) {
  return empty(e.status === 404 ? 'Not found' : 'Something went wrong', e.message,
    h('a', { class: 'btn', href: '#/' }, 'Back to home'));
}

/* ---------------------------------------------------------------------- nav */
function renderNav() {
  add(nav.replaceChildren() || nav, [
    me ? [
      h('a', { class: 'btn primary small', href: '#/new' }, '+ Add review'),
      h('a', { class: 'btn ghost small', href: `#/u/${me.username}`, title: 'Your profile' }, avatar(me.username, 'xs'), me.username),
      h('button', { class: 'btn ghost small', type: 'button', onclick: logout }, 'Log out'),
    ] : [
      h('a', { class: 'btn small', href: '#/login' }, 'Log in'),
      h('a', { class: 'btn primary small', href: '#/signup' }, 'Sign up'),
    ],
  ]);
}

async function logout() {
  await api('POST', '/api/logout');
  me = null;
  renderNav();
  toast('Logged out');
  go('/');
}

/* -------------------------------------------------------------------- pages */
async function homePage() {
  const d = await api('GET', '/api/home');
  const form = h('form', { class: 'search', role: 'search', onsubmit: (e) => { e.preventDefault(); goSearch(input.value); } });
  const input = h('input', { type: 'search', placeholder: 'Search for a person or a film…', 'aria-label': 'Search' });
  form.append(input);
  siteSuggest(input);
  const hints = ['Try “Inception”…', 'Search a film you just watched…', 'Look up a friend by username…', 'Try “Parasite”…', 'Find “Spirited Away”…'];
  let hintIdx = 0;
  const rotate = setInterval(() => {
    if (!input.isConnected) return clearInterval(rotate);
    if (document.activeElement !== input && !input.value) input.placeholder = hints[++hintIdx % hints.length];
  }, 2800);
  form.insertAdjacentHTML('afterbegin',
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 105.2 12.9l4.2 4.2 1.4-1.4-4.2-4.2A7.5 7.5 0 0010.5 3zm0 2a5.5 5.5 0 110 11 5.5 5.5 0 010-11z" fill="currentColor"/></svg>');

  return h('div', null,
    h('section', { class: 'hero' },
      h('h1', null, 'See what people think of the films they watch'),
      h('p', null, 'Find a member, browse everything they\'ve watched, and read their take on story, visuals, setting and more — then compare it with your own.'),
      form,
      h('div', { class: 'hero-stats' }, `${d.totals.users} member${d.totals.users === 1 ? '' : 's'} · ${d.totals.reviews} review${d.totals.reviews === 1 ? '' : 's'}`)),
    !me ? h('div', { class: 'callout section' },
      h('p', null, h('b', null, 'Keep your own film diary. '), 'Rate each movie on the things that matter to you and share it with others.'),
      h('a', { class: 'btn primary', href: '#/signup' }, 'Create your free profile')) : null,
    h('section', { class: 'section' },
      h('h2', null, 'Latest reviews'),
      d.reviews.length ? h('div', { class: 'grid' }, d.reviews.map((r) => reviewCard(r)))
        : empty('No reviews yet', 'Be the first to add one.',
          h('a', { class: 'btn primary', href: me ? '#/new' : '#/signup' }, me ? 'Write a review' : 'Sign up'))),
    d.people.length ? h('section', { class: 'section' },
      h('h2', null, 'Members'),
      h('div', { class: 'person-grid' }, d.people.map(personCard))) : null);
}

async function searchPage({ params }) {
  const q = params[0] || '';
  if (document.activeElement !== searchInput) searchInput.value = q;
  const d = await api('GET', '/api/search?q=' + encodeURIComponent(q));
  return h('div', null,
    h('h1', null, `Results for “${q}”`),
    h('section', { class: 'section' },
      h('h2', null, 'People', h('span', { class: 'count' }, d.users.length)),
      d.users.length ? h('div', { class: 'person-grid' }, d.users.map(personCard))
        : empty('No members found', 'Try a different name.')),
    h('section', { class: 'section' },
      h('h2', null, 'Films', h('span', { class: 'count' }, d.films.length)),
      d.films.length ? h('div', { class: 'stack' }, d.films.map((f) =>
        h('article', { class: 'card row between', style: 'flex-wrap:nowrap' },
          h('div', { class: 'row', style: 'flex-wrap:nowrap;min-width:0' },
            poster(f.poster, f.title, 'sm'),
            h('div', null,
              h('a', { class: 'stretch', href: `#/film/${f.id}`, style: 'font-weight:700' }, f.title, f.year ? ` (${f.year})` : ''),
              h('div', { class: 'muted small' }, `${f.reviews} review${f.reviews === 1 ? '' : 's'} · avg ${f.avg} · ${verdict(f.avg)}`))),
          h('span', { class: 'above row', style: 'flex-wrap:nowrap' }, scoreBadge(f.avg), imdbPill(f)))))
        : empty('No films found', 'Only films that someone has reviewed show up here.')));
}

async function profilePage({ params }) {
  const d = await api('GET', '/api/users/' + params[0]);
  const u = d.user;
  const own = me && me.username === u.username;
  const bioBox = h('div', { class: 'bio' }, u.bio || (own ? 'Add a short bio so people know your taste.' : ''));

  const editBio = () => {
    const ta = h('textarea', { maxlength: 300, 'aria-label': 'Bio' }, u.bio);
    const save = h('button', { class: 'btn primary small', type: 'button', onclick: async () => {
      try {
        const r = await api('PUT', '/api/me', { bio: ta.value });
        u.bio = r.user.bio;
        bioBox.replaceChildren(u.bio || 'Add a short bio so people know your taste.');
        toast('Bio saved');
      } catch (e) { toast(e.message); }
    } }, 'Save');
    bioBox.replaceChildren(ta, h('div', { class: 'row', style: 'margin-top:8px' }, save));
    ta.focus();
  };

  const list = h('div', { class: 'grid' });
  const filter = h('input', { type: 'search', placeholder: 'Filter this list by film title…', 'aria-label': 'Filter films' });
  const sort = h('select', { 'aria-label': 'Sort films' },
    h('option', { value: 'new' }, 'Newest first'),
    h('option', { value: 'high' }, 'Highest rated'),
    h('option', { value: 'low' }, 'Lowest rated'),
    h('option', { value: 'az' }, 'A – Z'));
  const paint = () => {
    const q = filter.value.trim().toLowerCase();
    const sorters = {
      new: () => 0,
      high: (a, b) => b.overall - a.overall,
      low: (a, b) => a.overall - b.overall,
      az: (a, b) => a.title.localeCompare(b.title),
    };
    const rows = d.reviews.filter((r) => r.title.toLowerCase().includes(q)).sort(sorters[sort.value]);
    list.replaceChildren(...(rows.length ? rows.map((r) => reviewCard(r, { showUser: false }))
      : [empty(d.reviews.length ? 'No matches' : own ? 'You haven\'t reviewed anything yet' : 'Nothing here yet',
        d.reviews.length ? 'Try a different title.' : own ? 'Add your first film to start your diary.' : 'This member hasn\'t reviewed any films.',
        own && !d.reviews.length ? h('a', { class: 'btn primary', href: '#/new' }, '+ Add review') : null)]));
  };
  filter.addEventListener('input', paint);
  sort.addEventListener('change', paint);
  paint();

  return h('div', { class: 'stack' },
    h('section', { class: 'card profile-head' },
      avatar(u.username, 'xl'),
      h('div', { class: 'info' },
        h('h1', null, '@' + u.username),
        bioBox,
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('b', null, u.films), h('span', null, 'Films')),
          h('div', { class: 'stat' }, h('b', null, u.avg == null ? '–' : fmt(u.avg)), h('span', null, 'Avg score')),
          h('div', { class: 'stat' }, h('b', null, fmtDate(u.created)), h('span', null, 'Joined')))),
      own ? h('div', { class: 'row' },
        h('button', { class: 'btn small', type: 'button', onclick: editBio }, 'Edit bio'),
        h('a', { class: 'btn primary small', href: '#/new' }, '+ Add review')) : null),
    d.taste.length ? h('section', { class: 'section' },
      h('h2', null, 'What they pay attention to'),
      h('div', { class: 'tendencies card' }, d.taste.map((t) =>
        h('div', { class: 'tendency' },
          h('div', { class: 'label' }, h('span', null, t.name),
            h('span', { class: 'muted' }, `avg ${fmt(t.avg)} · ${t.n} film${t.n === 1 ? '' : 's'}`)),
          bar(t.avg))))) : null,
    h('section', { class: 'section' },
      h('h2', null, 'Films watched', h('span', { class: 'count' }, d.reviews.length)),
      d.reviews.length > 1 ? h('div', { class: 'toolbar' }, filter, sort) : null,
      list));
}

function criterionBlock(c) {
  return h('div', { class: 'criterion', style: `--c:${scoreColor(c.score)}` },
    h('div', { class: 'head' }, h('b', null, c.name), h('span', { class: 'val' }, fmt(c.score), h('span', { class: 'muted small' }, ' /10'))),
    bar(c.score),
    c.comment ? h('p', null, c.comment) : null);
}

function deltaPill(mine, theirs) {
  const d = Math.round((mine - theirs) * 10) / 10;
  if (d === 0) return h('span', { class: 'delta same' }, 'Same');
  return h('span', { class: 'delta ' + (d > 0 ? 'up' : 'down') }, (d > 0 ? '+' : '−') + fmt(Math.abs(d)));
}

function comparePanel(d, own) {
  const r = d.review;
  if (own) return null;
  if (!me) {
    return h('div', { class: 'callout' },
      h('p', null, h('b', null, 'Compare with your own take. '), 'Log in, review this film, and see your scores next to @' + r.user.username + '\'s.'),
      h('a', { class: 'btn primary', href: `#/login?next=${encodeURIComponent('/review/' + r.id)}` }, 'Log in'));
  }
  if (!d.mine) {
    const q = new URLSearchParams({ title: r.title, ...(r.year ? { year: r.year } : {}), ...(r.imdb_exact ? { imdb: r.imdb_url } : {}), ...(r.poster ? { poster: r.poster } : {}) });
    return h('div', { class: 'callout' },
      h('p', null, h('b', null, 'Seen it too? '), 'Write your own review and it will appear side by side with this one.'),
      h('a', { class: 'btn primary', href: `#/new?${q}` }, 'Review this film'));
  }
  const names = [];
  const seen = new Set();
  for (const c of [...r.criteria, ...d.mine.criteria]) {
    if (!seen.has(c.name.toLowerCase())) { seen.add(c.name.toLowerCase()); names.push(c.name); }
  }
  const find = (list, n) => list.find((c) => c.name.toLowerCase() === n.toLowerCase());
  const cell = (s) => s == null ? h('span', { class: 'muted' }, '—')
    : h('div', { class: 'cell' }, bar(s), h('b', { style: `color:${scoreColor(s)}` }, fmt(s)));
  const row = (label, theirs, mine) => h('tr', null,
    h('td', { class: 'cname' }, label), h('td', null, cell(theirs)), h('td', null, cell(mine)),
    h('td', null, theirs != null && mine != null ? deltaPill(mine, theirs) : null));
  return h('section', { class: 'card' },
    h('div', { class: 'row between', style: 'margin-bottom:12px' },
      h('h2', null, 'Your take vs @' + r.user.username),
      h('a', { class: 'small', href: `#/review/${d.mine.id}` }, 'Open your review')),
    h('table', { class: 'compare-table' },
      h('thead', null, h('tr', null, h('th', null, ''), h('th', null, '@' + r.user.username), h('th', null, 'You'), h('th', null, 'You vs them'))),
      h('tbody', null,
        row('Overall', r.overall, d.mine.overall),
        names.map((n) => {
          const t = find(r.criteria, n), m = find(d.mine.criteria, n);
          return row(n, t && t.score, m && m.score);
        }))));
}

async function reviewPage({ params }) {
  const d = await api('GET', '/api/reviews/' + params[0]);
  const r = d.review;
  document.title = `${r.title} – review by @${r.user.username} · Reel Notes`;
  const own = me && me.username === r.user.username;

  const del = async () => {
    if (!confirm(`Delete your review of “${r.title}”? This can't be undone.`)) return;
    try { await api('DELETE', '/api/reviews/' + r.id); toast('Review deleted'); go('/u/' + me.username); }
    catch (e) { toast(e.message); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(location.href); toast('Link copied'); }
    catch { toast('Copy the address from your browser bar'); }
  };

  return h('div', { class: 'stack' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/u/' + r.user.username }, '← @' + r.user.username + '\'s films')),
    h('section', { class: 'card stack' },
      h('div', { class: 'review-head' },
        poster(r.poster, r.title, 'lg'),
        scoreBadge(r.overall, true),
        h('div', { class: 'grow' },
          h('h1', null, r.title, ' ', r.year ? h('span', { class: 'year' }, `(${r.year})`) : null),
          h('div', { class: 'verdict' }, verdict(r.overall)),
          h('div', { class: 'row small muted', style: 'margin-top:6px' },
            avatar(r.user.username, 'xs'),
            h('span', null, 'Reviewed by ', h('a', { href: '#/u/' + r.user.username }, '@' + r.user.username)),
            h('span', null, '· ' + (r.watched_on ? 'Watched ' + fmtDate(r.watched_on, true) : fmtDate(r.created))))),
        h('div', { class: 'stack', style: 'gap:8px;align-items:stretch' },
          h('a', { class: 'btn imdb', href: r.imdb_url, target: '_blank', rel: 'noopener noreferrer' },
            r.imdb_exact ? 'Compare on IMDb ↗' : 'Find on IMDb ↗'),
          h('button', { class: 'btn small', type: 'button', onclick: copy }, 'Copy link'))),
      r.summary ? h('p', { class: 'summary' }, r.summary) : null,
      own ? h('div', { class: 'row' },
        h('a', { class: 'btn small', href: '#/edit/' + r.id }, 'Edit'),
        h('button', { class: 'btn small danger', type: 'button', onclick: del }, 'Delete')) : null),
    r.criteria.length ? h('section', { class: 'card' },
      h('h2', { style: 'margin-bottom:14px' }, 'Breakdown'),
      r.criteria.map(criterionBlock)) : null,
    comparePanel(d, own),
    d.others.length ? h('section', { class: 'section' },
      h('h2', null, 'Other reviews of this film',
        h('a', { class: 'small', style: 'margin-left:auto', href: `#/film/${r.id}` }, 'See all')),
      h('div', { class: 'grid' }, d.others.map((o) => reviewCard(o)))) : null);
}

async function filmPage({ params }) {
  const d = await api('GET', '/api/films/' + params[0]);
  const f = d.film;
  document.title = `${f.title} · Reel Notes`;
  return h('div', { class: 'stack' },
    h('section', { class: 'card review-head' },
      poster(f.poster, f.title, 'lg'),
      scoreBadge(f.avg, true),
      h('div', { class: 'grow' },
        h('h1', null, f.title, ' ', f.year ? h('span', { class: 'year muted' }, `(${f.year})`) : null),
        h('div', { class: 'verdict' }, verdict(f.avg)),
        h('p', { class: 'muted', style: 'margin-top:6px' }, `Average of ${f.count} member review${f.count === 1 ? '' : 's'}`)),
      h('a', { class: 'btn imdb', href: f.imdb_url, target: '_blank', rel: 'noopener noreferrer' },
        f.imdb_exact ? 'Compare on IMDb ↗' : 'Find on IMDb ↗')),
    h('section', { class: 'section' },
      h('h2', null, 'Reviews', h('span', { class: 'count' }, d.reviews.length)),
      h('div', { class: 'grid' }, d.reviews.map((r) => reviewCard(r)))));
}

/* ------------------------------------------------------------- review form */
const PRESETS = [
  ['Story', 'Plot, structure and themes'],
  ['Acting', 'Performances'],
  ['Graphics & VFX', 'Visual effects, CGI, animation'],
  ['Mise-en-scène', 'Composition, lighting, costumes and set design'],
  ['Setting', 'World, locations and atmosphere'],
  ['Cinematography', 'Camera work, framing, colour'],
  ['Sound & Music', 'Score and sound design'],
  ['Direction', 'Vision and execution'],
  ['Pacing', 'Rhythm and editing'],
  ['Dialogue', 'Writing and lines'],
  ['Characters', 'Depth and development'],
  ['Emotional impact', 'How it made you feel'],
  ['Rewatch value', 'Would you watch it again?'],
];
const DEFAULT_CRITERIA = ['Story', 'Acting', 'Graphics & VFX', 'Mise-en-scène', 'Setting'];

function slider(value, onInput, { showVerdict = false } = {}) {
  const out = h('output');
  const input = h('input', { type: 'range', min: 0, max: 10, step: 0.5, 'aria-label': 'Score out of 10' });
  const row = h('div', { class: 'slider-row' }, input, out);
  const tag = showVerdict ? h('div', { class: 'verdict' }) : null;
  const el = h('div', { class: 'slider-wrap' }, row, tag);
  const set = (v) => {
    input.value = v;
    out.textContent = fmt(Number(v));
    el.style.setProperty('--c', scoreColor(Number(v)));
    if (tag) tag.textContent = verdict(Number(v));
  };
  input.addEventListener('input', () => { set(input.value); onInput(Number(input.value)); });
  set(value);
  return { el, set };
}

async function formPage({ params, query }) {
  if (!me) { go('/login?next=' + encodeURIComponent(location.hash.slice(1))); return h('div'); }
  let existing = null;
  if (params[0]) {
    existing = (await api('GET', '/api/reviews/' + params[0])).review;
    if (existing.user.username !== me.username) throw Object.assign(new Error('You can only edit your own reviews.'), { status: 403 });
  }
  document.title = (existing ? 'Edit review' : 'New review') + ' · Reel Notes';
  const state = {
    overall: existing ? existing.overall : 7,
    poster: existing ? existing.poster : query.poster || null,
    criteria: existing ? existing.criteria.map((c) => ({ ...c }))
      : DEFAULT_CRITERIA.map((name) => ({ name, score: 7, comment: '' })),
  };

  const errorBox = h('div', { class: 'error', role: 'alert', style: 'display:none' });
  const title = h('input', { type: 'text', required: true, maxlength: 200, placeholder: 'e.g. Inception', value: existing ? existing.title : query.title || '' });
  const year = h('input', { type: 'number', min: 1888, max: 2100, placeholder: '2010', value: existing ? existing.year ?? '' : query.year || '' });
  const imdb = h('input', { type: 'text', placeholder: 'https://www.imdb.com/title/tt1375666/',
    value: existing ? (existing.imdb_exact ? existing.imdb_url : '') : query.imdb || '' });
  let pickedId = ((existing && existing.imdb_id) || (query.imdb || '').match(/tt\d{6,10}/i)?.[0] || '').toLowerCase();
  const preview = h('div', { class: 'picked', hidden: true });
  const paintPreview = () => {
    const m = imdb.value.match(/tt\d{6,10}/i);
    preview.hidden = !m;
    preview.replaceChildren();
    if (!m) return;
    preview.append(
      poster(state.poster, title.value || '?', 'sm'),
      h('div', { class: 'grow' },
        h('b', null, title.value || 'This film'), year.value ? ` (${year.value})` : '',
        h('div', { class: 'muted small' }, '✓ Linked to IMDb — others can compare with it')),
      h('a', { class: 'btn imdb small', href: `https://www.imdb.com/title/${m[0].toLowerCase()}/`, target: '_blank', rel: 'noopener noreferrer' }, 'Open on IMDb ↗'));
  };
  const imdbFind = h('a', { href: '#', target: '_blank', rel: 'noopener noreferrer' }, 'Find it on IMDb ↗');
  const updateFind = () => {
    imdbFind.href = 'https://www.imdb.com/find/?s=tt&q=' + encodeURIComponent(`${title.value} ${year.value}`.trim());
  };
  title.addEventListener('input', () => { updateFind(); paintPreview(); });
  year.addEventListener('input', () => { updateFind(); paintPreview(); });
  imdb.addEventListener('input', () => {
    if (state.poster && !imdb.value.toLowerCase().includes(pickedId)) state.poster = null;
    paintPreview();
  });
  title.setAttribute('autocomplete', 'off');
  attachSuggest(title, {
    async fetchItems(q) { return (await api('GET', '/api/suggest?q=' + encodeURIComponent(q))).films; },
    render: filmSuggestRow,
    onPick(f) {
      title.value = f.title;
      year.value = f.year || '';
      imdb.value = f.imdb_url;
      state.poster = f.poster;
      pickedId = f.imdb_id;
      updateFind();
      paintPreview();
      toast('IMDb link filled in ✓');
    },
  });
  updateFind();
  paintPreview();
  const watched = h('input', { type: 'date', max: new Date().toISOString().slice(0, 10), value: existing ? existing.watched_on || '' : '' });
  const summary = h('textarea', { maxlength: 3000, rows: 4, placeholder: 'Your overall take, in your own words…' }, existing ? existing.summary : '');

  const overall = slider(state.overall, (v) => { state.overall = v; }, { showVerdict: true });
  const avgBtn = h('button', { class: 'btn small', type: 'button', onclick: () => {
    if (!state.criteria.length) return;
    const avg = state.criteria.reduce((s, c) => s + c.score, 0) / state.criteria.length;
    state.overall = Math.round(avg * 2) / 2;
    overall.set(state.overall);
  } }, 'Use average of criteria');

  // criteria editor
  const critList = h('div', { class: 'stack' });
  const chipsBox = h('div', { class: 'preset-chips' });
  const customInput = h('input', { type: 'text', maxlength: 40, placeholder: 'Add your own, e.g. Costumes, Humour, Plot twist…', 'aria-label': 'Custom criterion' });

  const has = (name) => state.criteria.some((c) => c.name.toLowerCase() === name.toLowerCase());
  const addCriterion = (name) => {
    name = name.trim();
    if (!name || has(name)) return;
    state.criteria.push({ name, score: 7, comment: '' });
    paintCriteria();
  };
  const removeCriterion = (name) => {
    state.criteria = state.criteria.filter((c) => c.name !== name);
    paintCriteria();
  };

  function paintCriteria() {
    chipsBox.replaceChildren(...PRESETS.map(([name, tip]) =>
      h('button', { class: 'toggle', type: 'button', title: tip, 'aria-pressed': String(has(name)),
        onclick: () => (has(name) ? removeCriterion(state.criteria.find((c) => c.name.toLowerCase() === name.toLowerCase()).name) : addCriterion(name)) }, name)));
    critList.replaceChildren(...(state.criteria.length ? state.criteria.map((c) => {
      const sl = slider(c.score, (v) => { c.score = v; });
      return h('div', { class: 'crit-card' },
        h('div', { class: 'head' }, h('b', null, c.name),
          h('button', { class: 'btn ghost small', type: 'button', onclick: () => removeCriterion(c.name), 'aria-label': 'Remove ' + c.name }, 'Remove')),
        sl.el,
        h('textarea', { rows: 2, maxlength: 1000, 'aria-label': c.name + ' comment', placeholder: `What did you think of the ${c.name.toLowerCase()}?`,
          oninput: (e) => { c.comment = e.target.value; } }, c.comment));
    }) : [empty('No criteria selected', 'Pick some above to rate the film on specific qualities, or skip them and just give an overall score.')]));
  }
  paintCriteria();

  const save = h('button', { class: 'btn primary', type: 'submit' }, existing ? 'Save changes' : 'Publish review');
  const form = h('form', { class: 'stack', novalidate: true, onsubmit: async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    save.disabled = true;
    const payload = {
      title: title.value, year: year.value || null, imdb: imdb.value, watched_on: watched.value || null,
      overall: state.overall, summary: summary.value, criteria: state.criteria, poster: state.poster,
    };
    try {
      const r = existing ? await api('PUT', '/api/reviews/' + existing.id, payload) : await api('POST', '/api/reviews', payload);
      toast(existing ? 'Review updated' : 'Review published 🎬');
      go('/review/' + r.id);
      if (!existing) confetti();
    } catch (err) {
      errorBox.replaceChildren(err.message, ' ',
        err.data && err.data.existing_id ? h('a', { href: '#/edit/' + err.data.existing_id }, 'Edit it') : '');
      errorBox.style.display = 'block';
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      save.disabled = false;
    }
  } },
    errorBox,
    h('section', { class: 'card stack' },
      h('h2', null, 'The film'),
      h('div', { class: 'three' },
        h('div', { class: 'field' }, h('label', null, 'Title *'), title),
        h('div', { class: 'field' }, h('label', null, 'Year'), year),
        h('div', { class: 'field' }, h('label', null, 'Date watched'), watched)),
      h('div', { class: 'field' }, h('label', null, 'IMDb link'), imdb,
        h('span', { class: 'hint' }, 'Start typing the title above and pick the film — the link fills itself in. Or paste one. ', imdbFind),
        preview)),
    h('section', { class: 'card stack' },
      h('h2', null, 'Your overall verdict'),
      h('div', { class: 'field' }, overall.el),
      h('div', null, avgBtn),
      h('div', { class: 'field' }, h('label', null, 'Summary'), summary)),
    h('section', { class: 'card stack' },
      h('div', null, h('h2', null, 'Rate it on what matters'),
        h('p', { class: 'muted small', style: 'margin-top:4px' }, 'Tap to add or remove criteria, score each from 0 to 10, and say why.')),
      chipsBox,
      h('div', { class: 'add-custom' }, customInput,
        h('button', { class: 'btn', type: 'button', onclick: () => { addCriterion(customInput.value); customInput.value = ''; customInput.focus(); } }, 'Add')),
      critList),
    h('div', { class: 'row' }, save, h('a', { class: 'btn ghost', href: existing ? '#/review/' + existing.id : '#/u/' + me.username }, 'Cancel')));
  customInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCriterion(customInput.value); customInput.value = ''; }
  });

  return h('div', { class: 'stack' }, h('h1', null, existing ? 'Edit review' : 'Add a review'), form);
}

/* ------------------------------------------------------------------- auth */
function authPage(mode) {
  return async ({ query }) => {
    if (me) { go('/u/' + me.username); return h('div'); }
    const signup = mode === 'signup';
    const user = signup ? h('input', { type: 'text', required: true, autocomplete: 'username', maxlength: 24, autocapitalize: 'none', spellcheck: 'false' }) : null;
    const email = h('input', { type: 'email', required: true, autocomplete: 'email', autocapitalize: 'none', spellcheck: 'false' });
    const pass = h('input', { type: 'password', required: true, minlength: 6, autocomplete: signup ? 'new-password' : 'current-password' });
    const error = h('div', { class: 'error', role: 'alert', style: 'display:none' });
    const notice = h('div', { class: 'success', role: 'status', style: 'display:none' });
    const btn = h('button', { class: 'btn primary', type: 'submit' }, signup ? 'Create account' : 'Log in');
    const form = h('form', { class: 'card form-card stack', onsubmit: async (e) => {
      e.preventDefault();
      error.style.display = 'none';
      notice.style.display = 'none';
      btn.disabled = true;
      try {
        const body = signup ? { username: user.value, email: email.value, password: pass.value } : { email: email.value, password: pass.value };
        const r = await api('POST', signup ? '/api/register' : '/api/login', body);
        if (r.confirm) {
          notice.textContent = 'Almost there! We sent a confirmation link to ' + email.value + '. Click it, then log in.';
          notice.style.display = 'block';
          btn.disabled = false;
          return;
        }
        me = r.user;
        renderNav();
        toast(signup ? 'Welcome to Reel Notes!' : 'Welcome back, ' + me.username);
        go(query.next || (signup ? '/new' : '/'));
      } catch (err) {
        error.textContent = err.message;
        error.style.display = 'block';
        btn.disabled = false;
      }
    } },
      h('h1', null, signup ? 'Create your profile' : 'Welcome back'),
      error, notice,
      signup ? h('div', { class: 'field' }, h('label', null, 'Username'), user,
        h('span', { class: 'hint' }, '3–24 letters, numbers or underscores. This is public.')) : null,
      h('div', { class: 'field' }, h('label', null, 'Email'), email,
        signup ? h('span', { class: 'hint' }, 'Only used to sign in. It is never shown on your profile.') : null),
      h('div', { class: 'field' }, h('label', null, 'Password'), pass,
        signup ? h('span', { class: 'hint' }, 'At least 6 characters.') : null),
      btn,
      h('p', { class: 'muted small' }, signup ? 'Already a member? ' : 'New here? ',
        h('a', { href: signup ? '#/login' : '#/signup' }, signup ? 'Log in' : 'Create an account')));
    setTimeout(() => (user || email).focus(), 0);
    return form;
  };
}

/* ------------------------------------------------------------------ router */
const routes = [
  [/^\/$/, homePage],
  [/^\/search\/(.*)$/, searchPage],
  [/^\/u\/([A-Za-z0-9_]+)$/, profilePage],
  [/^\/review\/(\d+)$/, reviewPage],
  [/^\/film\/(\d+)$/, filmPage],
  [/^\/new$/, formPage],
  [/^\/edit\/(\d+)$/, formPage],
  [/^\/login$/, authPage('login')],
  [/^\/signup$/, authPage('signup')],
];
let lastWasSearch = false;

async function router() {
  let raw = location.hash.slice(1);
  if (!raw.startsWith('/')) raw = '/'; // empty hash, or auth tokens from an email link
  const qIndex = raw.indexOf('?');
  const path = qIndex < 0 ? raw : raw.slice(0, qIndex);
  const query = Object.fromEntries(new URLSearchParams(qIndex < 0 ? '' : raw.slice(qIndex + 1)));
  const token = ++renderToken;
  document.title = 'Reel Notes';
  for (const [re, page] of routes) {
    const m = path.match(re);
    if (!m) continue;
    const isSearch = path.startsWith('/search/');
    if (!(isSearch && lastWasSearch)) root.replaceChildren(h('div', { class: 'loading' }, 'Loading…'));
    lastWasSearch = isSearch;
    try {
      let params;
      try { params = m.slice(1).map(decodeURIComponent); } catch { params = m.slice(1); }
      const node = await page({ params, query });
      if (token !== renderToken) return;
      root.replaceChildren(node);
    } catch (e) {
      if (token !== renderToken) return;
      root.replaceChildren(errorView(e));
    }
    if (!isSearch) window.scrollTo(0, 0);
    return;
  }
  root.replaceChildren(errorView({ status: 404, message: 'That page doesn\'t exist.' }));
}

/* ------------------------------------------------------------------ search */
function goSearch(q) {
  q = q.trim();
  go(q ? '/search/' + encodeURIComponent(q) : '/');
}
searchInput.setAttribute('autocomplete', 'off');
const headerSuggest = siteSuggest(searchInput);
document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  headerSuggest.close();
  goSearch(searchInput.value);
});

/* -------------------------------------------------------------------- boot */
window.addEventListener('hashchange', router);
window.addEventListener('reel-auth', async (e) => {
  try {
    if (e.detail === 'SIGNED_OUT' && me) { me = null; renderNav(); router(); }
    else if (e.detail === 'SIGNED_IN' && !me) { me = (await api('GET', '/api/me')).user; renderNav(); }
  } catch { /* ignore */ }
});
(async () => {
  try { me = (await api('GET', '/api/me')).user; } catch { me = null; }
  renderNav();
  router();
})();
