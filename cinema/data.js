'use strict';

/* data.js - everything that talks to the outside world.
 *
 * The pages call api(method, url, body) exactly as they did when a Python server sat behind
 * them. Here those calls are answered by Supabase (accounts + database) and by IMDb's public
 * search-box script (film suggestions), so the whole site can be plain static files.
 */

const CFG = window.REEL_CONFIG || {};
const isConfigured = Boolean(CFG.supabaseUrl && CFG.supabaseAnonKey) &&
  !/YOUR[_-]/i.test(CFG.supabaseUrl + CFG.supabaseAnonKey);
const sb = isConfigured && window.supabase
  ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'reelnotes-auth' },
  })
  : null;

class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
const fail = (status, message, data) => { throw new ApiError(status, message, data); };

/* ---------------------------------------------------------- error mapping */
function dbError(err) {
  const msg = err.message || '';
  const dup = msg.match(/^DUPLICATE:(\d+)/);
  if (dup) fail(409, "You've already reviewed this film - you can edit that review instead.", { existing_id: Number(dup[1]) });
  if (err.code === '23505') fail(409, 'You already have a review of this film.');
  if (err.code === '42501' || /row-level security/i.test(msg)) fail(403, 'You can only change your own content.');
  if (err.code === '23514' || err.code === '22P02' || err.code === '22007') fail(400, 'Some of the values look invalid. Please check the form.');
  if (err.code === 'PGRST301' || /jwt/i.test(msg)) fail(401, 'Please log in again.');
  if (err.code === 'P0001') fail(400, msg);
  console.error('Database error:', err);
  fail(500, 'Something went wrong. Please try again.');
}
async function ok(query) {
  const { data, error } = await query;
  if (error) dbError(error);
  return data;
}
async function countRows(table) {
  const { count, error } = await sb.from(table).select('id', { count: 'exact', head: true });
  if (error) dbError(error);
  return count || 0;
}

/* ------------------------------------------------------------- validation */
const IMDB_ID = /(tt\d{6,10})/i;
const POSTER_RE = /^https:\/\/m\.media-amazon\.com\/images\/M\/[A-Za-z0-9@._,%-]+$/;

function parseImdb(raw) {
  raw = (raw || '').trim();
  if (!raw) return null;
  if (/^tt\d{6,10}$/i.test(raw)) return raw.toLowerCase();
  let host = '';
  try { host = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : 'https://' + raw).hostname.toLowerCase(); } catch { /* not a URL */ }
  const m = raw.match(IMDB_ID);
  if ((host === 'imdb.com' || host.endsWith('.imdb.com')) && m) return m[1].toLowerCase();
  return fail(400, "That doesn't look like an IMDb film link (expected something like imdb.com/title/tt1375666).");
}

function smallPoster(url) {
  if (!url || typeof url !== 'string' || !POSTER_RE.test(url)) return null;
  return url.replace(/_V1_[^/]*\.jpg$/, '_V1_UX240_.jpg'); // ask for a small version
}

function imdbLinks(title, year, imdbId) {
  if (imdbId) return { imdb_id: imdbId, imdb_exact: true, imdb_url: `https://www.imdb.com/title/${imdbId}/` };
  const q = encodeURIComponent(`${title} ${year || ''}`.trim());
  return { imdb_id: null, imdb_exact: false, imdb_url: `https://www.imdb.com/find/?q=${q}&s=tt` };
}

function cleanText(value, field, limit, required = false) {
  if (value == null) value = '';
  if (typeof value !== 'string') fail(400, `${field} must be text.`);
  value = value.trim();
  if (required && !value) fail(400, `${field} is required.`);
  if (value.length > limit) fail(400, `${field} is too long (max ${limit} characters).`);
  return value;
}

function cleanScore(value, field) {
  const n = Number(value);
  if (value === '' || value == null || !Number.isFinite(n) || n < 0 || n > 10) fail(400, `${field} needs a score between 0 and 10.`);
  return Math.round(n * 2) / 2;
}

function validateReview(data) {
  const title = cleanText(data.title, 'Title', 200, true);
  let year = data.year;
  if (year === '' || year == null) year = null;
  else {
    year = Number(year);
    if (!Number.isInteger(year)) fail(400, 'Year must be a number.');
    if (year < 1888 || year > 2100) fail(400, 'Year looks wrong.');
  }
  const watched = data.watched_on || null;
  if (watched && (!/^\d{4}-\d{2}-\d{2}$/.test(watched) || Number.isNaN(Date.parse(watched)))) {
    fail(400, 'Watched date must look like 2025-01-31.');
  }
  const critIn = data.criteria || [];
  if (!Array.isArray(critIn) || critIn.length > 20) fail(400, 'Too many criteria (max 20).');
  const seen = new Set();
  const criteria = critIn.map((c) => {
    const name = cleanText(c && c.name, 'Criterion name', 40, true);
    if (seen.has(name.toLowerCase())) fail(400, `'${name}' appears twice.`);
    seen.add(name.toLowerCase());
    return { name, score: cleanScore(c.score, name), comment: cleanText(c.comment, `${name} comment`, 1000) };
  });
  return {
    title, year,
    imdb_id: parseImdb(data.imdb),
    poster: smallPoster(data.poster),
    overall: cleanScore(data.overall, 'Overall rating'),
    summary: cleanText(data.summary, 'Summary', 3000),
    watched_on: watched,
    criteria,
  };
}

/* ------------------------------------------------------------ serializers */
const REVIEW_SEL = '*, profiles(username), criteria(name, score, comment, pos)';

function serializeReview(r) {
  return {
    id: r.id, title: r.title, year: r.year, overall: Number(r.overall), summary: r.summary,
    watched_on: r.watched_on, created: r.created_at, updated: r.updated_at,
    user: { username: r.profiles ? r.profiles.username : '?' },
    poster: r.poster,
    criteria: (r.criteria || []).slice().sort((a, b) => a.pos - b.pos)
      .map((c) => ({ name: c.name, score: Number(c.score), comment: c.comment })),
    ...imdbLinks(r.title, r.year, r.imdb_id),
  };
}
const userPublic = (m) => ({
  username: m.username, bio: m.bio, created: m.created_at, films: m.films,
  avg: m.avg == null ? null : Number(m.avg),
});
const filmRow = (f) => ({
  id: f.rid, title: f.title, year: f.year, reviews: f.n, poster: f.poster, avg: Number(f.avg),
  ...imdbLinks(f.title, f.year, f.imdb_id),
});
// Strip characters that have a special meaning in search patterns / filter strings.
const searchSafe = (q) => q.replace(/[%_,()"'\\*]/g, ' ').replace(/\s+/g, ' ').trim();

async function sessionUserId() {
  const { data } = await sb.auth.getSession();
  return data.session ? data.session.user.id : null;
}
async function needUserId() {
  const id = await sessionUserId();
  if (!id) fail(401, 'Please log in first.');
  return id;
}
async function memberById(id) {
  return ok(sb.from('member_stats').select('*').eq('id', id).maybeSingle());
}
async function relatedRows(id) {
  const ids = await ok(sb.rpc('related_reviews', { p_id: id }));
  if (!ids || !ids.length) return [];
  return ok(sb.from('reviews').select(REVIEW_SEL).in('id', ids)
    .order('created_at', { ascending: false }).limit(200));
}

/* -------------------------------------------- film suggestions from IMDb */
// IMDb's search box loads a tiny script that calls imdb$<query>(data). Unlike their JSON
// endpoint it can be used from any web page. It is unofficial: if it ever stops working,
// suggestions simply fall back to films already reviewed on this site.
const imdbCache = new Map();
const imdbInflight = new Map();

function imdbSuggest(q) {
  const key = q.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 60);
  if (key.length < 2) return Promise.resolve([]);
  if (imdbCache.has(key)) return Promise.resolve(imdbCache.get(key));
  if (imdbInflight.has(key)) return imdbInflight.get(key);

  const promise = new Promise((resolve) => {
    const fn = 'imdb$' + key;
    const script = document.createElement('script');
    let done = false;
    const finish = (items, cache) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      script.remove();
      delete window[fn];
      imdbInflight.delete(key);
      if (cache) imdbCache.set(key, items);
      resolve(items);
    };
    const timer = setTimeout(() => finish([], false), 4000);
    window[fn] = (data) => {
      const kinds = new Set(['movie', 'tvSeries', 'tvMiniSeries', 'tvMovie', 'tvSpecial']);
      const items = ((data && data.d) || [])
        .filter((d) => typeof d.id === 'string' && d.id.startsWith('tt') && kinds.has(d.qid))
        .map((d) => ({
          imdb_id: d.id, title: String(d.l || ''), year: d.y || null,
          poster: smallPoster(Array.isArray(d.i) ? d.i[0] : d.i && d.i.imageUrl),
          cast: String(d.s || ''),
        }));
      finish(items, true);
    };
    script.onerror = () => finish([], false);
    script.src = `https://sg.media-imdb.com/suggests/${key[0]}/${key}.json`;
    document.head.append(script);
  });
  imdbInflight.set(key, promise);
  return promise;
}

/* ----------------------------------------------------------------- routes */
async function handle(method, path, query, body) {
  let m;

  if (method === 'GET' && path === '/api/me') {
    const id = await sessionUserId();
    const member = id ? await memberById(id) : null;
    return { user: member ? userPublic(member) : null };
  }

  if (method === 'POST' && path === '/api/register') {
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) fail(400, 'Username must be 3-24 letters, numbers or underscores.');
    if (!/^\S+@\S+\.\S+$/.test(email)) fail(400, 'Please enter a valid email address.');
    if (password.length < 6 || password.length > 72) fail(400, 'Password must be 6-72 characters.');
    if (!(await ok(sb.rpc('username_available', { p_username: username })))) fail(409, 'That username is already taken.');
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { username }, emailRedirectTo: location.origin + location.pathname },
    });
    if (error) {
      if (/already registered/i.test(error.message)) fail(409, 'An account with that email already exists. Try logging in.');
      if (/database error/i.test(error.message)) fail(409, 'That username is already taken.');
      if (/rate limit/i.test(error.message)) fail(429, 'Too many sign-up emails right now. Please try again in a little while.');
      if (/password/i.test(error.message)) fail(400, error.message);
      console.error(error);
      fail(400, 'Could not create the account. Please check your details.');
    }
    if (!data.session) return { user: null, confirm: true }; // email confirmation is switched on
    return { user: userPublic(await memberById(data.user.id)) };
  }

  if (method === 'POST' && path === '/api/login') {
    const { data, error } = await sb.auth.signInWithPassword({
      email: String(body.email || '').trim(), password: String(body.password || ''),
    });
    if (error) {
      if (/not confirmed/i.test(error.message)) fail(401, 'Please confirm your email first - check your inbox for the link.');
      if (/rate limit|too many/i.test(error.message)) fail(429, 'Too many attempts. Please wait a few minutes.');
      fail(401, 'Wrong email or password.');
    }
    const member = await memberById(data.user.id);
    if (!member) fail(500, 'Your profile could not be found.');
    return { user: userPublic(member) };
  }

  if (method === 'POST' && path === '/api/logout') {
    await sb.auth.signOut();
    return { ok: true };
  }

  if (method === 'PUT' && path === '/api/me') {
    const uid = await needUserId();
    const bio = cleanText(body.bio, 'Bio', 300);
    await ok(sb.from('profiles').update({ bio }).eq('id', uid));
    return { user: userPublic(await memberById(uid)) };
  }

  if (method === 'GET' && path === '/api/home') {
    const [rows, people, users, reviews] = await Promise.all([
      ok(sb.from('reviews').select(REVIEW_SEL).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(12)),
      ok(sb.from('member_stats').select('*').order('films', { ascending: false }).order('created_at', { ascending: false }).limit(8)),
      countRows('profiles'),
      countRows('reviews'),
    ]);
    return { reviews: rows.map(serializeReview), people: people.map(userPublic), totals: { users, reviews } };
  }

  if (method === 'GET' && path === '/api/search') {
    const q = (query.q || '').trim().slice(0, 100);
    const safe = searchSafe(q);
    if (!safe) return { users: [], films: [] };
    const [users, films] = await Promise.all([
      ok(sb.from('member_stats').select('*').or(`username.ilike."*${safe}*",bio.ilike."*${safe}*"`).order('username').limit(20)),
      ok(sb.rpc('search_films', { q: safe, p_limit: 20 })),
    ]);
    return { users: users.map(userPublic), films: films.map(filmRow) };
  }

  if (method === 'GET' && path === '/api/suggest') {
    const q = (query.q || '').trim().slice(0, 60);
    const safe = searchSafe(q);
    if (safe.length < 2) return { films: [], users: [] };
    const [local, remote, users] = await Promise.all([
      ok(sb.rpc('search_films', { q: safe, p_limit: 5 })),
      imdbSuggest(q),
      query.people
        ? ok(sb.from('member_stats').select('*').ilike('username', `*${safe.replace(/ /g, '')}*`).order('username').limit(3))
        : Promise.resolve([]),
    ]);
    const byId = new Map(remote.map((r) => [r.imdb_id, r]));
    const films = [];
    const seen = new Set();
    for (const f of local) {
      const rem = byId.get(f.imdb_id) || {};
      films.push({ ...filmRow(f), poster: f.poster || rem.poster || null, cast: rem.cast || '' });
      if (f.imdb_id) seen.add(f.imdb_id);
    }
    for (const r of remote) {
      if (!seen.has(r.imdb_id) && films.length < 8) {
        films.push({ id: null, title: r.title, year: r.year, reviews: 0, poster: r.poster, cast: r.cast, ...imdbLinks(r.title, r.year, r.imdb_id) });
      }
    }
    return { films, users: users.map(userPublic) };
  }

  if (method === 'GET' && (m = path.match(/^\/api\/users\/([A-Za-z0-9_]{3,24})$/))) {
    const name = m[1];
    const found = await ok(sb.from('member_stats').select('*').ilike('username', name.replace(/_/g, '\\_')).limit(5));
    const member = found.find((u) => u.username.toLowerCase() === name.toLowerCase());
    if (!member) fail(404, 'No such member.');
    const rows = await ok(sb.from('reviews').select(REVIEW_SEL).eq('user_id', member.id)
      .order('created_at', { ascending: false }).order('id', { ascending: false }));
    const reviews = rows.map(serializeReview);
    const groups = new Map();
    for (const r of reviews) {
      for (const c of r.criteria) {
        const g = groups.get(c.name.toLowerCase()) || { name: c.name, sum: 0, n: 0 };
        g.sum += c.score; g.n += 1;
        groups.set(c.name.toLowerCase(), g);
      }
    }
    const taste = [...groups.values()].map((g) => ({ name: g.name, avg: Math.round((g.sum / g.n) * 10) / 10, n: g.n }))
      .sort((a, b) => b.n - a.n || b.avg - a.avg).slice(0, 8);
    return { user: userPublic(member), reviews, taste };
  }

  if (method === 'GET' && (m = path.match(/^\/api\/reviews\/(\d+)$/))) {
    const id = Number(m[1]);
    const [rows, uid] = await Promise.all([relatedRows(id), sessionUserId()]);
    const row = rows.find((r) => r.id === id);
    if (!row) fail(404, 'Review not found.');
    const mine = uid && uid !== row.user_id ? rows.find((r) => r.user_id === uid) : null;
    return {
      review: serializeReview(row),
      mine: mine ? serializeReview(mine) : null,
      others: rows.filter((r) => r.id !== id).slice(0, 8).map(serializeReview),
    };
  }

  if (method === 'GET' && (m = path.match(/^\/api\/films\/(\d+)$/))) {
    const id = Number(m[1]);
    const rows = await relatedRows(id);
    const row = rows.find((r) => r.id === id);
    if (!row) fail(404, 'Film not found.');
    const reviews = rows.map(serializeReview);
    const avg = reviews.reduce((s, r) => s + r.overall, 0) / reviews.length;
    const imdbId = (rows.find((r) => r.imdb_id) || {}).imdb_id || null;
    return {
      film: {
        title: row.title, year: row.year, avg: Math.round(avg * 10) / 10, count: reviews.length,
        poster: (rows.find((r) => r.poster) || {}).poster || null, ...imdbLinks(row.title, row.year, imdbId),
      },
      reviews,
    };
  }

  if (method === 'POST' && path === '/api/reviews') {
    await needUserId();
    const id = await ok(sb.rpc('save_review', { p_id: null, p: validateReview(body) }));
    return { id };
  }

  if (method === 'PUT' && (m = path.match(/^\/api\/reviews\/(\d+)$/))) {
    await needUserId();
    const id = await ok(sb.rpc('save_review', { p_id: Number(m[1]), p: validateReview(body) }));
    return { id };
  }

  if (method === 'DELETE' && (m = path.match(/^\/api\/reviews\/(\d+)$/))) {
    await needUserId();
    const gone = await ok(sb.from('reviews').delete().eq('id', Number(m[1])).select('id'));
    if (!gone.length) fail(403, 'You can only delete your own reviews.');
    return { ok: true };
  }

  return fail(404, 'Not found.');
}

async function api(method, url, body) {
  if (!sb) {
    fail(503, 'This site is not connected to its database yet. Add the Supabase URL and key in config.js (see SETUP.md).');
  }
  const u = new URL(url, 'https://reel.invalid');
  try {
    return await handle(method, u.pathname, Object.fromEntries(u.searchParams), body || {});
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error(e);
    throw new ApiError(0, "Couldn't reach the server. Check your connection and try again.");
  }
}

// Let the page react when the session changes in another tab, or after an email-confirmation link.
if (sb) {
  sb.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
      setTimeout(() => window.dispatchEvent(new CustomEvent('reel-auth', { detail: event })), 0);
    }
  });
}
