(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const body = document.body;

  const grid = document.createElement('div'); grid.className = 'fx-grid';
  const scan = document.createElement('div'); scan.className = 'fx-scan';
  body.prepend(grid); body.append(scan);


  if (!touch && !reduce) {
    const spot = document.createElement('div'); spot.className = 'fx-spot'; body.prepend(spot);
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    (function loop() { x += (tx - x) * .12; y += (ty - y) * .12; spot.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(loop); })();
  }

  if (!touch && !reduce) document.querySelectorAll('.proj').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateZ(6px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  const chars = '!<>-_\\/[]{}—=+*^?#01';
  const scramble = el => {
    if (el._s) return; el._s = true; const txt = el.dataset.t || (el.dataset.t = el.textContent); let f = 0;
    const id = setInterval(() => {
      el.textContent = txt.split('').map((c, i) => c === ' ' ? ' ' : i < f / 2 ? c : chars[Math.random() * chars.length | 0]).join('');
      if (++f > txt.length * 2) { clearInterval(id); el.textContent = txt; el._s = false; }
    }, 28);
  };
  if (!reduce) document.querySelectorAll('.nav-links a, .menu a, .footer nav a').forEach(a => {
    if (a.children.length) return; a.addEventListener('mouseenter', () => scramble(a));
  });

  const targets = document.querySelectorAll('.svc, .stats > *, .who > *, .quote, blockquote, .step, .faq > *, .row, .work-filters');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('fx-vis'), (e.target._d || 0)); io.unobserve(e.target); } }), { threshold: .12 });
    targets.forEach((t, i) => { if (t.closest('.hero')) return; t._d = (i % 3) * 90; t.classList.add('fx-in'); io.observe(t); });
  }
})();
