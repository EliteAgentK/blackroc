/* Services illustrations: the truck holds the centre while its wheels turn and the road moves beneath it;
   a copper sweep clears a rough plot, holds, then fades back and repeats.
   Loops pause off screen, when the tab is hidden, on Pause, and for reduced motion. Illustrative only. */
(() => {
  const sec = document.querySelector('#services');
  if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const btn = sec.querySelector('.anim-toggle');
  const road = sec.querySelector('.tr .road'), marks = sec.querySelector('.tr .marks'), truck = sec.querySelector('.tr .truck');
  const wheels = sec.querySelectorAll('.tr .wheel');
  const e1 = sec.querySelector('.tr .e1'), e1d = sec.querySelector('.tr .e1d'), e2 = sec.querySelector('.tr .e2'), e2d = sec.querySelector('.tr .e2d');
  const rect = sec.querySelector('.cl .rv-rect'), sweep = sec.querySelector('.cl .sweep'), debris = sec.querySelector('.cl .debris'), rows = sec.querySelector('.cl .rows');

  /* rough ground: scattered rock fragments, drawn once */
  const tones = ['#5c4b3d', '#71604c', '#463d34', '#806a52'];
  let svg = '';
  for (let i = 0; i < 74; i++) {
    const x = 52 + ((i * 53) % 396), y = 66 + ((i * 37) % 190), s = 2.4 + (i % 6) * 1.25;
    svg += `<path d="M${x} ${y}l${s * .55} ${-s} ${s} ${-s * .32} ${s} ${s} ${-s * .5} ${s * .5}z" fill="${tones[i % 4]}" stroke="#a47a54" stroke-width=".55"/>`;
  }
  debris.innerHTML = svg;
  let r = '';
  for (let y = 66; y < 265; y += 12) r += `<path d="M45 ${y}H455" stroke="#c49a72" stroke-opacity=".32"/>`;
  rows.innerHTML = r;

  /* dust: a few soft puffs behind the truck (drawn under it) */
  const dust = document.createElementNS('http://www.w3.org/2000/svg', 'g'); dust.setAttribute('class', 'dust');
  dust.setAttribute('fill', '#e0a887'); truck.parentNode.insertBefore(dust, truck);
  const puffs = Array.from({ length: 12 }, () => dust.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'circle')));
  let paused = false, visible = false, last = 0, t = 0;
  new IntersectionObserver(es => { visible = es.some(x => x.isIntersecting); }).observe(sec);
  if (btn) btn.onclick = () => { paused = !paused; document.documentElement.classList.toggle('paused', paused); btn.textContent = paused ? 'Play animations' : 'Pause animations'; btn.setAttribute('aria-pressed', String(paused)); };

  function draw(t) {
    const a = Math.sin(t * 0.8) * 9, b = Math.cos(t * 0.8) * 9;
    const d = `M15 ${205 + a} C100 ${190 + b} 160 202 250 205 S380 ${220 - b} 485 ${205 - a}`;
    road.setAttribute('d', d); marks.setAttribute('d', d);
    marks.setAttribute('stroke-dashoffset', String(t * 34));
    e1.setAttribute('cx', 15); e1.setAttribute('cy', 205 + a); e1d.setAttribute('cx', 15); e1d.setAttribute('cy', 205 + a);
    e2.setAttribute('cx', 485); e2.setAttribute('cy', 205 - a); e2d.setAttribute('cx', 485); e2d.setAttribute('cy', 205 - a);
    truck.setAttribute('transform', `translate(250 ${204 + Math.sin(t * 5.2) * 0.8})`);
    /* dust kicked up behind the wheels, drifting back and fading */
    puffs.forEach((c, i) => {
      const age = (t * 0.85 + i / puffs.length) % 1, src = i % 2 ? 174 : 201;
      c.setAttribute('cx', (src - age * 70).toFixed(1));
      c.setAttribute('cy', (203 - age * 13 + Math.sin(i * 2.1 + t * 2) * 1.5).toFixed(1));
      c.setAttribute('r', (1.3 + age * 4.6).toFixed(2));
      c.setAttribute('opacity', (0.42 * (1 - age) * Math.min(1, age * 7)).toFixed(3));
    });
    for (const w of wheels) w.setAttribute('transform', `rotate(${t * 360})`);
    /* clearance: starts about a quarter cleared, sweeps to fully clear, holds, fades back */
    const ph = (t % 7) / 7;
    const p = ph < 0.1 ? 0.27 : ph < 0.72 ? 0.27 + (ph - 0.1) / 0.62 * 0.73 : 1;
    const fade = ph < 0.86 ? 1 : 1 - (ph - 0.86) / 0.14;
    rect.setAttribute('width', String(410 * p));
    rect.closest('svg').querySelector('[clip-path]').setAttribute('opacity', String(fade));
    sweep.setAttribute('d', `M${45 + 410 * p} 60V265`);
    sweep.setAttribute('opacity', p >= 1 ? '0' : '1');
  }
  function frame(now) {
    const run = last && !paused && visible && !document.hidden && !reduce.matches;
    if (run) t += Math.min(now - last, 60) / 1000;
    last = now;
    draw(reduce.matches ? 3.2 : t);
    requestAnimationFrame(frame);
  }
  draw(0);
  requestAnimationFrame(frame);
})();
