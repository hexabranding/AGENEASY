/* =========================================================
   AGENEASY COMMUNIQUE — Interactions & Animation Engine
   High-performance GSAP, Lenis Smooth Scroll, Real-Time Widgets
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  let lenis = null;
  let menuOpen = false;

  /* ---- 1. Live Kerala / IST Clock --------------------------- */
  function initLiveClock() {
    const clockEls = $$('.kerala-clock, #live-time, [data-clock]');
    if (!clockEls.length) return;

    function update() {
      try {
        const now = new Date();
        const istString = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        clockEls.forEach(el => {
          el.textContent = istString;
        });
      } catch (e) {
        // Fallback calculation for UTC + 5:30
        const d = new Date();
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        const nd = new Date(utc + (3600000 * 5.5));
        const hours = nd.getHours();
        const minutes = String(nd.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formatted = `${hours % 12 || 12}:${minutes} ${ampm} IST`;
        clockEls.forEach(el => { el.textContent = formatted; });
      }
    }

    update();
    setInterval(update, 1000);
  }

  /* ---- 2. Navigation ---------------------------------------- */
  function initNav() {
    const nav = $('#nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const page = document.body.dataset.page;
    $$('.nav-links a').forEach(a => a.classList.toggle('on', a.dataset.nav === page));
  }

  /* ---- 3. Mobile Menu --------------------------------------- */
  function toggleMenu() {
    const menu = $('#menu'), b = $('.burger');
    if (!menu || !b) return;
    menuOpen = !menuOpen;
    b.classList.toggle('open', menuOpen);
    b.setAttribute('aria-expanded', String(menuOpen));
    b.setAttribute('aria-label', menuOpen ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!menuOpen));
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    document.body.classList.toggle('menu-open', menuOpen);

    if (hasGsap && !reduce) {
      if (menuOpen) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.85, ease: 'expo.out' });
        gsap.fromTo(
          $$('a, .m-meta', menu),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.8, delay: 0.15, ease: 'expo.out' }
        );
      } else {
        gsap.to(menu, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.6,
          ease: 'expo.inOut',
          onComplete: () => gsap.set(menu, { visibility: 'hidden' })
        });
      }
    } else {
      menu.style.visibility = menuOpen ? 'visible' : 'hidden';
      menu.style.clipPath = menuOpen ? 'none' : 'inset(0 0 100% 0)';
    }
    if (menuOpen) lenis && lenis.stop(); else lenis && lenis.start();
  }

  const closeMenu = () => menuOpen && toggleMenu();

  function initMenu() {
    const b = $('.burger');
    if (b) b.addEventListener('click', toggleMenu);
    window.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
    $$('#menu a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ---- 4. Page Transitions ---------------------------------- */
  function initTransitions() {
    const veil = $('.veil');
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:|\/\/)/.test(href)) return;
      if (!/\.html($|\?|#)/i.test(href)) return;
      e.preventDefault();
      closeMenu();
      const go = () => { window.location.href = href; };
      if (!veil || !hasGsap || reduce) { go(); return; }
      gsap.timeline({ onComplete: go })
        .set(veil, { transformOrigin: 'bottom' })
        .to(veil, { scaleY: 1, duration: 0.45, ease: 'expo.inOut' });
    });

    window.addEventListener('pageshow', e => {
      if (e.persisted && veil && hasGsap) gsap.set(veil, { scaleY: 0 });
    });
    if (veil && hasGsap && !reduce) gsap.set(veil, { scaleY: 0 });
  }

  /* ---- 5. Intro Animation ----------------------------------- */
  function loadIntro() {
    if (!hasGsap || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.from('.logo', { opacity: 0, y: -15, duration: 0.9 })
      .from('.nav-links a, .nav > .btn, .burger', { y: -25, opacity: 0, stagger: 0.05, duration: 0.8 }, 0.1)
      .from('.hero .status, .phead .eyebrow', { opacity: 0, y: 20, duration: 0.8 }, 0.2)
      .from('.hero .mega .ln > span, .phead .mega .ln > span', { yPercent: 115, stagger: 0.1, duration: 1.25 }, 0.3)
      .from('.lead, .phead .intro, .phead-row .label', { opacity: 0, y: 24, stagger: 0.08, duration: 0.9 }, 0.8)
      .from('.ctas .btn, .phead-row .btn, .studio-badge', { opacity: 0, y: 20, stagger: 0.08, duration: 0.8 }, 0.95);

    if ($('.orb')) {
      tl.from('.orb', { scale: 0.5, opacity: 0, duration: 1.8 }, 0.8)
        .from('.ring', { scale: 1.4, opacity: 0, duration: 1.8, ease: 'circ.out' }, 0.9)
        .from('.lockup', { opacity: 0, y: 30, duration: 1.3 }, 1.0);

      gsap.to('.orb', { y: 28, x: -15, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.ring', { rotate: 360, duration: 60, repeat: -1, ease: 'none' });
    }
  }

  /* ---- 6. Hero Parallax ------------------------------------- */
  function heroParallax() {
    if (!fine || !$('.hero') || !hasGsap) return;
    const ox = gsap.quickTo('.orb', 'x', { duration: 1.4, ease: 'power3.out' });
    const oy = gsap.quickTo('.orb', 'y', { duration: 1.4, ease: 'power3.out' });
    const rx = gsap.quickTo('.ring', 'x', { duration: 1.8, ease: 'power3.out' });
    const ry = gsap.quickTo('.ring', 'y', { duration: 1.8, ease: 'power3.out' });

    $('.hero').addEventListener('mousemove', e => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      ox(x * -60);
      oy(y * -40);
      rx(x * 70);
      ry(y * 70);
    });
  }

  /* ---- 7. Infinite Smooth Marquee --------------------------- */
  function marquee() {
    if (!hasGsap) return;
    const start = () => $$('.track').forEach(track => {
      const first = track.firstElementChild;
      if (!first) return;
      gsap.killTweensOf(track);
      const w = first.offsetWidth;
      if (!w) return;
      const tween = gsap.fromTo(track, { x: 0 }, { x: -w, duration: 24, ease: 'none', repeat: -1 });
      const box = track.parentElement;
      box.onmouseenter = () => gsap.to(tween, { timeScale: 0.2, duration: 0.8 });
      box.onmouseleave = () => gsap.to(tween, { timeScale: 1, duration: 0.8 });
    });

    start();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    window.addEventListener('load', start, { once: true });
  }

  /* ---- 8. Scroll Reveals ------------------------------------ */
  function reveals() {
    if (!hasGsap || reduce) return;

    $$('.split').forEach(el => {
      if (el.matches('blockquote, .statement')) {
        el.innerHTML = el.textContent.trim().split(/\s+/)
          .map(w => `<span class="ln" style="display:inline-block;margin-right:.22em"><span>${w}</span></span>`).join('');
      } else {
        el.innerHTML = el.innerHTML.split('<br>')
          .map(l => `<span class="ln"><span>${l}</span></span>`).join('');
      }

      gsap.from($$('.ln > span', el), {
        yPercent: 110,
        stagger: 0.025,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    if ($('.cta .ln > span')) {
      gsap.from('.cta .ln > span', {
        yPercent: 115,
        stagger: 0.1,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.cta', start: 'top 65%' }
      });
    }

    gsap.utils.toArray('.blob').forEach((b, i) => {
      gsap.to(b, {
        yPercent: i ? -35 : 30,
        ease: 'none',
        scrollTrigger: { trigger: '.cta', scrub: true }
      });
    });

    $$('.process li, .value, .member, .faq li, .pkg-card').forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 35,
        duration: 0.9,
        scrollTrigger: { trigger: el, start: 'top 92%' }
      });
    });

    $$('.stats div').forEach(d => {
      gsap.from(d, {
        opacity: 0,
        y: 25,
        duration: 0.9,
        scrollTrigger: { trigger: d, start: 'top 92%' }
      });
    });

    [['.who', '.who'], ['.about-grid p', '.about-grid'], ['.details > *', '.details']].forEach(([sel, trg]) => {
      const t = $(trg), items = $$(sel);
      if (!t || !items.length) return;
      gsap.from(items, {
        opacity: 0,
        y: 22,
        stagger: 0.08,
        duration: 0.9,
        scrollTrigger: { trigger: t, start: 'top 82%' }
      });
    });
  }

  /* ---- 9. Work & Case Studies ------------------------------- */
  function work() {
    if (!hasGsap) return;

    $$('.proj').forEach(p => {
      const img = $('.img', p), im = $('.art', p);
      if (img) {
        gsap.to(img, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.3,
          ease: 'expo.out',
          scrollTrigger: { trigger: p, start: 'top 86%' }
        });
      }
      if (im) {
        gsap.fromTo(im, { yPercent: -7 }, {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: p, scrub: true }
        });
      }
      gsap.from($$('.meta > *', p), {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.9,
        scrollTrigger: { trigger: p, start: 'top 75%' }
      });

      const n = $('.n', p);
      if (n && fine) {
        p.addEventListener('mouseenter', () => gsap.to(n, { y: -5, duration: 0.4, ease: 'expo.out' }));
        p.addEventListener('mouseleave', () => gsap.to(n, { y: 0, duration: 0.4, ease: 'expo.out' }));
      }
    });
  }

  /* ---- 10. Work Category Filter ----------------------------- */
  function initWorkFilter() {
    const filterBtns = $$('.filter-btn');
    const projects = $$('.proj');
    if (!filterBtns.length || !projects.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.dataset.filter;

        projects.forEach(p => {
          const match = cat === 'all' || p.dataset.category === cat || (p.dataset.categories && p.dataset.categories.includes(cat));

          if (hasGsap && !reduce) {
            if (match) {
              p.style.display = 'block';
              gsap.fromTo(p, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out' });
            } else {
              gsap.to(p, {
                opacity: 0,
                y: -15,
                scale: 0.96,
                duration: 0.35,
                ease: 'power2.in',
                onComplete: () => { p.style.display = 'none'; }
              });
            }
          } else {
            p.style.display = match ? 'block' : 'none';
          }
        });

        if (hasGsap) ScrollTrigger.refresh();
      });
    });
  }

  /* ---- 11. Interactive Services Accordion ------------------- */
  function initServices() {
    $$('.svc').forEach(li => {
      li.tabIndex = 0;
      li.addEventListener('click', () => {
        const isOpen = li.classList.contains('open');
        $$('.svc').forEach(o => o.classList.remove('open'));
        if (!isOpen) li.classList.add('open');
      });
      li.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          li.classList.toggle('open');
        }
      });
    });
  }

  /* ---- 12. Animated Counters -------------------------------- */
  function counters() {
    if (!hasGsap) return;
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count;
      const pad = el.dataset.pad ? 2 : 0;
      const o = { v: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: () => gsap.to(o, {
          v: end,
          duration: 2.2,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = String(Math.round(o.v)).padStart(pad, '0');
          }
        })
      });
    });
  }

  /* ---- 13. Magnetic Buttons --------------------------------- */
  function magnetic() {
    if (!fine || !hasGsap) return;
    $$('.magnetic').forEach(b => {
      const x = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3.out' });
      const y = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3.out' });
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.35);
        y((e.clientY - r.top - r.height / 2) * 0.45);
      });
      b.addEventListener('mouseleave', () => { x(0); y(0); });
    });
  }

  /* ---- 14. Luxury Custom Cursor ----------------------------- */
  function cursor() {
    if (!fine) return;
    const c = $('.cursor');
    if (!c) return;
    const dot = $('span', c);
    document.body.classList.add('has-cursor');

    if (hasGsap && !reduce) {
      const mx = gsap.quickTo(c, 'x', { duration: 0.28, ease: 'power3.out' });
      const my = gsap.quickTo(c, 'y', { duration: 0.28, ease: 'power3.out' });
      window.addEventListener('mousemove', e => { mx(e.clientX); my(e.clientY); });
    } else {
      window.addEventListener('mousemove', e => {
        c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      });
    }

    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) {
        dot.textContent = t.dataset.cursor;
        c.classList.add('big');
      } else if (e.target.closest('a, button, .svc, .chip, .filter-btn')) {
        dot.textContent = '';
        c.classList.add('big');
      } else {
        dot.textContent = '';
        c.classList.remove('big');
      }
    });
  }

  /* ---- 15. Scroll Progress & Back-to-Top -------------------- */
  function progress() {
    if ($('.progress') && hasGsap) {
      gsap.to('.progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.2 }
      });
    }
  }

  function initTopButton() {
    const b = $('.totop');
    if (!b) return;
    b.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---- 16. Contact Form & Interactive Chips ----------------- */
  function initForm() {
    const form = $('#form');
    if (!form) return;
    const note = $('.note');

    // Interactive Chips handling
    $$('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const group = chip.closest('.chip-group');
        const targetSelectId = chip.dataset.target;
        if (!group) return;

        // Toggle or single select in group
        const isSingle = !group.dataset.multiple;
        if (isSingle) {
          $$('.chip', group).forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        } else {
          chip.classList.toggle('active');
        }

        // Sync with underlying input/select if present
        if (targetSelectId) {
          const sel = $(`#${targetSelectId}`);
          if (sel) {
            sel.value = chip.dataset.value || chip.textContent.trim();
            sel.dispatchEvent(new Event('change'));
          }
        }
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach(f => {
        const val = f.value.trim();
        const bad = !val || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(val));
        f.closest('.f')?.classList.toggle('err', bad);
        if (bad) ok = false;
      });

      if (note) {
        if (ok) {
          note.style.color = 'var(--lime)';
          note.innerHTML = '✦ Inquiry received! Arjun & Meera will review your brief and reply within 24 hours.';
          form.reset();
          $$('.chip.active').forEach(c => c.classList.remove('active'));
        } else {
          note.style.color = '#ff5252';
          note.textContent = 'Please fill in all highlighted fields with valid information.';
        }
      }
    });

    $$('input, select, textarea', form).forEach(f =>
      f.addEventListener('input', () => f.closest('.f')?.classList.remove('err')));
  }

  /* ---- 17. Copy to Clipboard Utility ------------------------ */
  function initCopyPills() {
    $$('.copy-pill, [data-copy]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        const text = el.dataset.copy || 'hello@ageneasy.com';
        navigator.clipboard.writeText(text).then(() => {
          const original = el.innerHTML;
          el.innerHTML = 'COPIED! ✓';
          el.style.borderColor = 'var(--lime)';
          el.style.color = 'var(--lime)';
          setTimeout(() => {
            el.innerHTML = original;
            el.style.borderColor = '';
            el.style.color = '';
          }, 2000);
        });
      });
    });
  }

  /* ---- 18. Robust Lazy Images & ScrollTrigger Auto-Refresh --- */
  function initLazyImages() {
    const images = $$('.art img, .member .ph img, img[loading="lazy"]');
    if (!images.length) return;

    let refreshTimeout = null;
    const scheduleRefresh = () => {
      if (!hasGsap) return;
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    };

    const markLoaded = img => {
      img.classList.add('loaded');
      const box = img.closest('.img, .ph');
      if (box) box.classList.add('img-ready');
      scheduleRefresh();
    };

    // Preload lookahead observer so below-the-fold images load before clipPath reveals
    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.decode) {
              img.decode().catch(() => {}).finally(() => markLoaded(img));
            } else if (img.complete) {
              markLoaded(img);
            }
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '350px 0px 350px 0px' });
    }

    images.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        markLoaded(img);
      } else {
        img.addEventListener('load', () => markLoaded(img), { once: true });
        img.addEventListener('error', () => markLoaded(img), { once: true });
        if (observer) observer.observe(img);
      }
    });
  }

  /* ---- 19. Fallback (No GSAP / Reduced Motion) -------------- */
  function showAll() {
    $$('.img').forEach(e => { e.style.clipPath = 'none'; });
    $$('.art').forEach(e => { e.style.transform = 'none'; });
    $$('.art img, .member .ph img').forEach(e => { e.classList.add('loaded'); });
    $$('.img, .ph').forEach(e => { e.classList.add('img-ready'); });
    $$('[data-count]').forEach(el => {
      el.textContent = String(el.dataset.count).padStart(el.dataset.pad ? 2 : 0, '0');
    });
  }

  /* ---- 20. Boot Engine -------------------------------------- */
  initLiveClock();
  initNav();
  initMenu();
  initTransitions();
  initServices();
  initWorkFilter();
  initForm();
  initCopyPills();
  initTopButton();
  initLazyImages();

  if (!hasGsap || reduce) {
    showAll();
    cursor();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  loadIntro();
  heroParallax();
  marquee();
  reveals();
  work();
  counters();
  magnetic();
  cursor();
  progress();

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
