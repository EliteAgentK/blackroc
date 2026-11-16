/* Contact page: phone three-step flow and the quote docket that writes itself as the visitor fills the form.
   Nothing is looked up or sent anywhere; the form itself sends nothing in this concept. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width:860px)');
  const body = document.body;

  /* ---------- the docket ---------- */
  const docket = $('#docket');
  const date = $('#dk-date');
  if (date) date.textContent = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  function put(key, text, sub) {
    const row = docket && docket.querySelector(`[data-k="${key}"]`); if (!row) return;
    const dd = row.querySelector('dd'), was = dd.dataset.v || '';
    const v = (text || '').trim();
    dd.textContent = v || '—';
    if (sub && v) { const s = document.createElement('span'); s.textContent = sub; dd.appendChild(s); }
    dd.classList.toggle('empty', !v);
    dd.dataset.v = v + (sub || '');
    if (dd.dataset.v !== was && v && !calm) { row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash'); }
  }
  const chips = $$('.chips button');
  const mats = () => put('mat', chips.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.trim()).join(', '));
  chips.forEach(b => b.addEventListener('click', mats));
  mats();
  [['nm', 'name'], ['ph', 'phone'], ['em', 'email'], ['msg', 'note']].forEach(([id, key]) => {
    const el = $('#' + id); if (el) el.addEventListener('input', () => put(key, el.value));
  });
  $('#qf').addEventListener('submit', () => {
    if (!docket) return;
    docket.classList.remove('sent'); void docket.offsetWidth; docket.classList.add('sent');
    $('#dk-state').textContent = 'Concept only';
  });

  /* ---------- steps (phone only; on desktop the whole form shows) ---------- */
  const next = $('#next'), hint = $('#nexthint'), count = $('#count'), dots = $$('.dots li');
  const chosen = () => chips.some(b => b.getAttribute('aria-pressed') === 'true');
  function setStep(n, scroll = true) {
    body.dataset.step = n;
    count.textContent = `${n} of 3`;
    dots.forEach((d, i) => { d.classList.toggle('on', i < n); d.classList.toggle('cur', i === n - 1); });
    if (scroll && phone.matches) scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  }
  function refreshNext() { const ok = chosen(); next.disabled = !ok; hint.textContent = ok ? '' : 'Choose at least one.'; }
  chips.forEach(b => b.addEventListener('click', refreshNext));
  refreshNext();
  $('#startq').addEventListener('click', () => setStep(2));
  next.addEventListener('click', () => { if (chosen()) setStep(3); });
  $('#back').addEventListener('click', () => setStep(Math.max(1, +body.dataset.step - 1)));
  setStep(new URLSearchParams(location.search).get('product') ? 2 : 1, false);
  const dockGo = $('.dock .btn.copper');
  if (dockGo) dockGo.addEventListener('click', e => { if (phone.matches) { e.preventDefault(); setStep(2); } });

  /* ---------- site address: typed in full, written onto the docket ---------- */
  const loc = $('#loc');
  loc.addEventListener('input', () => put('site', loc.value));
})();
