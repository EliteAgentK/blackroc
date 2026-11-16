/* Black Roc site behaviour. Nothing here blocks or takes over scrolling. */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const go = el => el && el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });

/* header: clear over the hero, solid once you scroll (always solid on pages without a hero) */
const head = $('.head'), hero = $('.hero'), dock = $('.dock');
function bars() {
  head.classList.toggle('solid', !hero || scrollY > 40);
  if (dock) dock.classList.toggle('show', !hero || scrollY > hero.offsetHeight * 0.5);
}
addEventListener('scroll', bars, { passive: true }); requestAnimationFrame(bars);

/* mobile menu */
const burger = $('.burger');
function menu(open) {
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
if (burger) {
  burger.onclick = () => menu(!document.body.classList.contains('menu-open'));
  $$('.sheet a').forEach(a => a.addEventListener('click', () => menu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && menu(false));
}

/* reveal sections as they come into view */
/* tag the pieces of each section so they arrive one after another */
const stagger = (sel, start = 0) => $$(sel).forEach((el, i) => { if (el.classList.contains('fx')) return; el.classList.add('fx'); el.style.setProperty('--i', start + i); });
stagger('.sec-head p', 1); stagger('.accr .tiles span', 1); stagger('.partners .rail', 1); stagger('.partners .ph-note', 1);
stagger('.journey li', 2); stagger('.byq', 5); stagger('.close .map', 2); stagger('.svc .eyebrow, .partners .eyebrow, .accr .eyebrow, .close .eyebrow, .products .eyebrow, .about .eyebrow');
const foot = $('footer'); if (foot) { foot.classList.add('rv'); stagger('footer .wrap > div'); }
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.remove('rv'); io.unobserve(e.target);
  setTimeout(() => e.target.classList.add('done'), 2600);
}), { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
$$('.rv').forEach(el => io.observe(el));

/* the rock and the material piles drift a little against the scroll */
if (!calm) {
  const drift = [[$('.about .rock'), 46], [$('.piles'), 30]].filter(d => d[0]);
  const move = () => drift.forEach(([el, amt]) => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const k = Math.min(Math.max((innerHeight - r.top) / (innerHeight + r.height), 0), 1); el.style.setProperty('--py', ((0.5 - k) * amt).toFixed(1) + 'px'); });
  addEventListener('scroll', move, { passive: true }); move();
}

/* facts count up once */
if (!calm) {
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    const el = e.target, T = +el.dataset.n, from = T > 1000 ? T - 18 : 0, t0 = performance.now();
    (function f(t) { const k = Math.min((t - t0) / 1500, 1), v = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(from + (T - from) * v); if (k < 1) requestAnimationFrame(f); })(t0);
  }), { threshold: 0.6 });
  $$('[data-n]').forEach(el => co.observe(el));
}

/* the stack: each layer is its own image; hover, focus or tap shakes only that layer (inner wrapper) */
const art = $('#art');
if (art) {
  const layers = $$('.lyr', art), swD = $$('.index button'), swM = $$('.sw button'), name = $('#swname');
  const names = { 1: '01 Sands', 2: '02 Builders mix', 3: '03 Stone', 4: '04 Fill and dump rock', 5: '05 Gabion rock' };
  function lit(k) {
    art.classList.toggle('hl', !!k);
    layers.forEach(b => b.classList.toggle('lit', b.dataset.k === k));
    $$('.piece[data-k]', art).forEach(p => p.classList.toggle('lit', p.dataset.k === k));
    [...swD, ...swM].forEach(b => b.classList.toggle('lit', b.dataset.k === k));
    if (name) name.textContent = k ? names[k] : 'Tap a material';
  }
  /* only the chosen material moves: about 1px sideways, settling within 350ms; no vertical movement */
  const pieces = $$('.piece[data-k]', art);
  function shake(k) {
    const p = pieces.find(x => x.dataset.k === k); if (!p || calm) return;
    p.classList.remove('nudge'); void p.offsetWidth; p.classList.add('nudge');
  }
  pieces.forEach(p => p.addEventListener('animationend', e => {
    if (e.animationName === 'pieceIn') p.classList.add('ready');   /* entrance done: later nudges never replay it */
    if (e.animationName === 'nudge') p.classList.remove('nudge');
  }));
  const toProducts = () => go($('#products'));
  const hover = matchMedia('(hover:hover)');
  layers.forEach(b => {
    b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { lit(b.dataset.k); shake(b.dataset.k); } });
    b.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') lit(null); });
    b.addEventListener('focus', () => { lit(b.dataset.k); shake(b.dataset.k); });
    b.addEventListener('blur', () => lit(null));
    b.addEventListener('click', () => { if (hover.matches) toProducts(); else { lit(b.dataset.k); shake(b.dataset.k); } });
  });
  swD.forEach(b => {
    b.onmouseenter = b.onfocus = () => { lit(b.dataset.k); shake(b.dataset.k); };
    b.onmouseleave = b.onblur = () => lit(null);
    b.onclick = toProducts;
  });
  let cur = null;
  swM.forEach(b => b.onclick = () => { cur = cur === b.dataset.k ? null : b.dataset.k; lit(cur); if (cur) shake(cur); });

}

/* dust in the hero */
(() => {
  const c = $('#dust'); if (!c || calm) return;
  const x = c.getContext('2d'); let w, h, P, d = Math.min(devicePixelRatio, 2), on = true;
  const small = () => innerWidth < 861;
  function size() {
    w = c.width = c.offsetWidth * d; h = c.height = c.offsetHeight * d;
    P = Array.from({ length: small() ? 30 : 64 }, () => ({ x: w * ((small() ? 0 : 0.36) + Math.random() * (small() ? 1 : 0.6)), y: Math.random() * h, r: (Math.random() * 1.4 + 0.4) * d, v: Math.random() * 0.2 + 0.05, p: Math.random() * 6.3, a: Math.random() * 0.5 + 0.12 }));
  }
  size(); addEventListener('resize', size);
  new IntersectionObserver(e => { on = e[0].isIntersecting; if (on) tick(); }).observe(c);
  function tick() {
    if (!on) return; x.clearRect(0, 0, w, h);
    for (const p of P) { p.p += 0.008; p.y -= p.v * d; p.x += Math.sin(p.p) * 0.25 * d; if (p.y < -5) p.y = h + 5; x.fillStyle = `rgba(222,160,118,${p.a * (0.6 + 0.4 * Math.sin(p.p * 2))})`; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* partner placeholders: two identical sets so the rail loops without a jump */
const rail = $('#rail'); if (rail) rail.innerHTML = Array(16).fill('<span>Client logo</span>').join('');

/* the route map redraws when it comes into view and when a location is typed */
$$('.map').forEach(map => {
  const replay = () => { map.classList.remove('run'); void map.offsetWidth; map.classList.add('run'); };
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { replay(); o.disconnect(); } }, { threshold: 0.4 }).observe(map);
  const loc = $('#loc'); let tm;
  if (loc) loc.addEventListener('input', () => { clearTimeout(tm); if (loc.value.trim().length > 2) tm = setTimeout(replay, 450); });
});

/* contact form: product chips, preselect from the link, and no sending in this concept */
const chips = $$('.chips button');
chips.forEach(b => b.onclick = () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'));
const want = new URLSearchParams(location.search).get('product');
if (want) chips.forEach(b => { if (b.textContent.trim() === want) b.setAttribute('aria-pressed', 'true'); });
const form = $('#qf');
if (form) form.addEventListener('submit', e => { e.preventDefault(); $('#note').textContent = 'Concept only. Nothing was sent.'; });

$$('.c-main .chips button').forEach((b, i) => b.style.setProperty('--n', i));

/* the About rock drifts a little as you scroll */
const fig = $('.about-fig img');
if (fig && !calm) {
  const move = () => { const r = fig.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const p = (r.top + r.height / 2) / innerHeight - 0.5; fig.style.setProperty('--py', (p * -7).toFixed(2) + '%'); };
  addEventListener('scroll', move, { passive: true }); move();
}

/* on a phone the backdrop is sized to the stack */
if (hero && art) {
  const fit = () => { hero.style.setProperty('--st', art.offsetTop + 'px'); hero.style.setProperty('--sh', art.offsetHeight + 'px'); };
  fit(); addEventListener('resize', fit); addEventListener('load', fit);
}

/* light version: keep it while moving between pages */
const keep = [document.documentElement.classList.contains('light') && 'theme=light'].filter(Boolean).join('&');
if (keep) {
  $$('a[href]').forEach(a => { const h = a.getAttribute('href'); if (!/^(index|contact)\.html/.test(h)) return;
    const [path, hash] = h.split('#'); a.setAttribute('href', path + (path.includes('?') ? '&' : '?') + keep + (hash ? '#' + hash : '')); });
}

/* fit the phone hero: the stack takes whatever height is left after the text, swatches, buttons and facts,
   so the whole hero always fits one screen, whatever the phone's size */
function fitPhoneHero() {
  const a = document.querySelector('#art'), he = document.querySelector('.hero');
  if (!a || !he) return;
  if (innerWidth > 860) { a.style.width = ''; return; }
  he.classList.add('measuring'); a.style.width = '0px';
  const others = he.offsetHeight;            /* everything except the stack */
  he.classList.remove('measuring');
  const avail = innerHeight - others - 6;
  const w = Math.max(120, Math.min(avail * 1160 / 1195, document.documentElement.clientWidth * 0.86));
  a.style.width = Math.round(w) + 'px';
}
fitPhoneHero();
addEventListener('resize', fitPhoneHero);
addEventListener('load', fitPhoneHero);
if (document.fonts) document.fonts.ready.then(fitPhoneHero);

/* the next page rises over the hero: the hero holds (its foot first if it is taller than the screen),
   then dims and settles back as the page slides up over it */
if (hero) {
  let hold = 0;
  const measure = () => { hold = Math.min(0, innerHeight - hero.offsetHeight); hero.style.setProperty('--hold', hold + 'px'); };
  const cover = () => {
    const start = Math.max(0, -hold), k = Math.min(Math.max((scrollY - start) / (innerHeight * 0.9), 0), 1);
    hero.style.setProperty('--cov', calm ? 0 : k.toFixed(3));
  };
  measure(); cover();
  addEventListener('resize', () => { fitPhoneHero(); measure(); cover(); });
  addEventListener('load', () => { fitPhoneHero(); measure(); cover(); });
  addEventListener('scroll', cover, { passive: true });
}

/* eased travel for every navigation link: a slow start, a long glide, a soft landing */
(() => {
  const headH = () => (head ? head.getBoundingClientRect().height : 0) - 1;
  const ease = t => t < .5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
  let anim = 0;
  function glide(aim) {
    cancelAnimationFrame(anim);
    const y = typeof aim === 'function' ? aim() : aim;
    const from = scrollY, dist = y - from;
    if (calm || Math.abs(dist) < 2) { scrollTo(0, y); return; }
    const dur = Math.min(1700, 750 + Math.abs(dist) * 0.32), t0 = performance.now();
    const stop = () => cancelAnimationFrame(anim);
    addEventListener('wheel', stop, { once: true, passive: true }); addEventListener('touchstart', stop, { once: true, passive: true });
    /* the header shrinks on the way down, so the landing point is re-read every frame */
    (function step(now) { const k = Math.min((now - t0) / dur, 1), to = typeof aim === 'function' ? aim() : y; scrollTo(0, from + (to - from) * ease(k)); if (k < 1) anim = requestAnimationFrame(step); })(t0);
  }
  const targetY = el => {
    let top = 0, n = el;                       /* offsetTop ignores the sticky hero's hold, so walk the layout */
    while (n) { top += n.offsetTop; n = n.offsetParent; }
    return Math.max(0, top - headH());
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="#"]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const el = url.hash === '#top' ? document.body : document.querySelector(url.hash); if (!el) return;
    e.preventDefault();
    const go = () => { glide(url.hash === '#top' ? 0 : () => targetY(el)); history.replaceState(null, '', url.hash); };
    document.body.classList.contains('menu-open') ? setTimeout(go, 420) : go();
  });
  /* arriving from another page with an #anchor: start at the top, then glide down */
  if (location.hash && document.querySelector(location.hash)) {
    const el = document.querySelector(location.hash);
    history.scrollRestoration = 'manual';
    addEventListener('load', () => { scrollTo(0, 0); setTimeout(() => glide(() => targetY(el)), 250); });
  }
})();
