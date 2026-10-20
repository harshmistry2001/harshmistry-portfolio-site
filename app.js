/* Builds the page from content.js and adds the interactions.
   You can ignore this file until you want to change how things behave. */
(function () {
  var S = window.SITE;
  var app = document.getElementById('app');
  if (!S || !app) return;

  // Small helper: h('div', {class:'x'}, [children])
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }
  function link(label, href, cls) {
    var external = /^https?:/.test(href);
    return h('a', { href: href, class: cls, target: external ? '_blank' : null, rel: external ? 'noopener' : null, text: label });
  }
  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-'); };

  if (S.meta) {
    if (S.meta.title) document.title = S.meta.title;
    var d = document.querySelector('meta[name="description"]');
    if (d && S.meta.description) d.setAttribute('content', S.meta.description);
  }

  app.textContent = '';

  // ---- Header
  app.appendChild(h('header', { class: 'top' }, [
    h('b', { text: S.name }),
    h('nav', { 'aria-label': 'Main' }, S.nav.map(function (n) { return link(n.label, n.href); }))
  ]));

  // ---- Hero
  var hero = S.hero;
  var stack = h('div', { class: 'stack', id: 'stack' }, [
    hero.stack[1] ? h('figure', { class: 'c c2' }, [h('img', { alt: '', src: hero.stack[1] })]) : null,
    hero.stack[0] ? h('figure', { class: 'c c1' }, [h('img', { alt: '', src: hero.stack[0] })]) : null,
    hero.stack[2] ? h('figure', { class: 'c c3' }, [h('img', { alt: '', src: hero.stack[2] })]) : null
  ]);
  var stage = h('div', { class: 'stage', id: 'stage', 'aria-hidden': 'true' }, [stack]);
  app.appendChild(h('div', { class: 'hero' }, [
    h('div', {}, [
      h('p', { class: 'note', text: hero.note }),
      h('h1', { text: hero.headline }),
      h('div', { class: 'cta' }, [link(hero.primary.label, hero.primary.href, 'btn'), link(hero.secondary.label, hero.secondary.href, 'btn ghost')])
    ]),
    stage
  ]));

  // ---- Work
  var W = S.work;
  var chipBtns = W.lenses.map(function (l) {
    return h('button', { class: 'chip', type: 'button', 'data-lens': slug(l), 'aria-pressed': 'false', text: l });
  });
  var tiles = W.projects.map(function (p) {
    var shotClass = 'shot' + (p.imageFit === 'contain' ? ' contain' : '') + (!p.image ? ' numonly' : '');
    var shot = p.image
      ? h('div', { class: shotClass }, [h('img', { src: p.image, alt: p.alt || '', loading: 'lazy', style: p.imagePosition ? 'object-position:' + p.imagePosition : null })])
      : h('div', { class: shotClass }, [h('p', { class: 'big', text: p.big })]);
    var title = h('h3', {}, [p.link ? link(p.title, p.link) : p.title]);
    return h('article', { class: 'tile', 'data-id': p.id, 'data-lens': slug(p.lens) }, [
      shot,
      h('span', { class: 'lens', text: p.lens }),
      title,
      p.image ? h('p', { class: 'big', text: p.big }) : null,
      h('p', { class: 'cap', text: p.caption })
    ]);
  });
  app.appendChild(h('section', { id: 'work', 'aria-labelledby': 'work-h' }, [
    h('p', { class: 'note', text: W.note }),
    h('h2', { id: 'work-h', text: W.title }),
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter work' }, chipBtns),
    h('div', { class: 'grid', id: 'grid' }, tiles)
  ]));

  // ---- Fit
  var F = S.fit;
  var pillBtns = F.skills.map(function (s) {
    return h('button', { class: 'pill', type: 'button', 'aria-pressed': 'false', 'data-tiles': (s.tiles || []).join(' '), 'data-proof': s.proof, text: s.label });
  });
  var proof = h('p', { class: 'proof', id: 'proof', 'aria-live': 'polite', text: F.hint });
  app.appendChild(h('section', { id: 'fit', 'aria-labelledby': 'fit-h' }, [
    h('p', { class: 'note', text: F.note }),
    h('h2', { id: 'fit-h', text: F.title }),
    h('div', { class: 'pills', role: 'group', 'aria-label': 'Skills' }, pillBtns),
    proof
  ]));

  // ---- Contact
  var C = S.contact;
  var mail = h('span', { id: 'mail', text: C.email });
  var copy = h('button', { type: 'button', id: 'copy', text: 'Copy' });
  var linkRow = h('p', {});
  C.links.forEach(function (l, i) {
    if (i) linkRow.appendChild(document.createTextNode(' · '));
    linkRow.appendChild(link(l.label, l.href));
  });
  app.appendChild(h('section', { id: 'contact', class: 'contact', 'aria-labelledby': 'contact-h' }, [
    h('p', { class: 'note', text: C.note }),
    h('h2', { id: 'contact-h', text: C.title }),
    h('p', { class: 'mail' }, [mail, copy]),
    h('p', { class: 'muted', text: C.line }),
    linkRow
  ]));
  app.appendChild(h('footer', { text: S.footer }));

  // ---- Interaction: filter chips
  var lens = null;
  chipBtns.forEach(function (c) {
    c.addEventListener('click', function () {
      lens = lens === c.dataset.lens ? null : c.dataset.lens;
      chipBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.lens === lens)); });
      tiles.forEach(function (t) { t.hidden = !!lens && t.dataset.lens !== lens; });
    });
  });

  // ---- Interaction: skill pills highlight their proof tiles
  var current = null;
  pillBtns.forEach(function (p) {
    p.addEventListener('click', function () {
      current = current === p ? null : p;
      pillBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === current)); });
      var ids = current && current.dataset.tiles ? current.dataset.tiles.split(' ') : [];
      tiles.forEach(function (t) {
        var hit = ids.indexOf(t.dataset.id) >= 0;
        t.classList.toggle('hit', !!current && hit);
        t.classList.toggle('dim', !!current && ids.length > 0 && !hit);
      });
      proof.textContent = current ? current.dataset.proof : F.hint;
    });
  });

  // ---- Interaction: 3D stack
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    var tx = -12, ty = 8, x = tx, y = ty, t = 0, active = false;
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 30;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 18;
      active = true;
    });
    stage.addEventListener('pointerleave', function () { active = false; });
    (function loop() {
      if (!active) { t += 0.012; tx = -12 + Math.sin(t) * 8; ty = 8 + Math.cos(t * 0.8) * 4; }
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      stack.style.transform = 'rotateX(' + y.toFixed(2) + 'deg) rotateY(' + x.toFixed(2) + 'deg)';
      requestAnimationFrame(loop);
    })();
  }

  // ---- Interaction: copy email
  copy.addEventListener('click', function () {
    var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1500); };
    var select = function () {
      var r = document.createRange(); r.selectNodeContents(mail);
      var s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = 'Selected';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail.textContent).then(done, select);
    else select();
  });
})();
