/* =========================================================
   DuaLLs — interactions
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  /* ---------- PRELOADER (fast) ---------- */
  const preloader = document.getElementById('preloader');
  const fill = preloader && preloader.querySelector('.preloader__fill');
  const count = preloader && preloader.querySelector('.preloader__count');

  function runPreloader() {
    if (!preloader) return;
    let pct = 0;
    const tick = () => {
      const remaining = 100 - pct;
      pct += Math.max(2, remaining * 0.16);   // faster fill
      if (pct >= 100) pct = 100;
      if (fill) fill.style.width = pct + '%';
      if (count) count.textContent = Math.round(pct) + '%';
      if (pct < 100) setTimeout(tick, 35 + Math.random() * 35);
      else setTimeout(closePreloader, 180);
    };
    tick();
  }

  function closePreloader() {
    if (!preloader) return;
    preloader.classList.add('is-done');
    document.body.classList.add('is-loaded');
    setTimeout(() => { preloader.style.display = 'none'; }, 500);
    startReveals();
  }

  if (reduceMotion && preloader) {
    if (fill) fill.style.width = '100%';
    if (count) count.textContent = '100%';
    closePreloader();
  } else {
    if (document.readyState === 'complete') runPreloader();
    else window.addEventListener('load', runPreloader);
    setTimeout(() => { if (preloader && !preloader.classList.contains('is-done')) closePreloader(); }, 3500);
  }

  /* ---------- HEADER SCROLL STATE + PROGRESS ---------- */
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('scrollProgress');

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE NAV ---------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (navToggle && nav) {
    const closeNav = () => {
      nav.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  let revealStarted = false;

  function startReveals() {
    if (revealStarted) return;
    revealStarted = true;

    // auto-stagger grouped items
    document.querySelectorAll('.fronts__grid, .process__list, .plans__grid, .faq__list, .hero__stats, .calc__checks').forEach((group) => {
      group.querySelectorAll('[data-reveal]').forEach((el, i) => { el.dataset.delay = i * 80; });
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => { el.classList.add('is-visible'); animateCounters(el); });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = Number(el.dataset.delay || 0);
          setTimeout(() => el.classList.add('is-visible'), delay);
          io.unobserve(el);
          animateCounters(el);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach((el) => io.observe(el));
  }
  if (reduceMotion) startReveals();

  /* ---------- NUMBER COUNTERS ---------- */
  function animateCounters(scope) {
    const nums = scope.querySelectorAll ? scope.querySelectorAll('[data-count]') : [];
    nums.forEach((el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const dur = 1300;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const strength = 16;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${x * strength}px, ${y * strength - 3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- PARALLAX ---------- */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!reduceMotion && parallaxEls.length) {
    let ticking = false;
    const apply = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const off = (center - vh / 2) / vh;
        const speed = parseFloat(el.dataset.parallax) || 0.05;
        el.style.transform = `translateY(${off * speed * -100}px)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(apply); ticking = true; }
    }, { passive: true });
    apply();
  }

  /* ---------- CALCULATOR (employee-type toggles) ---------- */
  const AI_COST = 399;
  const roleBtns = Array.from(document.querySelectorAll('.calc__role'));
  const elTeam = document.getElementById('teamMonthly');
  const elTeamFill = document.getElementById('teamFill');
  const elAiFill = document.getElementById('aiFill');
  const elSaveM = document.getElementById('saveMonthly');
  const elSaveY = document.getElementById('saveYearly');
  const elFoot = document.getElementById('calcFoot');

  const animMap = new WeakMap();
  function setMoney(el, value) {
    if (!el) return;
    if (reduceMotion) { el.textContent = BRL.format(Math.round(value)); return; }
    const from = typeof animMap.get(el) === 'number' ? animMap.get(el) : value;
    const start = performance.now();
    const dur = 500;
    const run = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = BRL.format(Math.round(from + (value - from) * eased));
      if (p < 1) requestAnimationFrame(run);
    };
    animMap.set(el, value);
    requestAnimationFrame(run);
  }

  function recalc() {
    const selected = roleBtns.filter((b) => b.classList.contains('is-on'));
    const team = selected.reduce((sum, b) => sum + (parseInt(b.dataset.cost, 10) || 0), 0);
    const saveM = Math.max(team - AI_COST, 0);
    const saveY = saveM * 12;

    setMoney(elTeam, team);
    setMoney(elSaveM, saveM);
    setMoney(elSaveY, saveY);

    if (elTeamFill) elTeamFill.style.width = team > 0 ? '100%' : '0%';
    if (elAiFill) elAiFill.style.width = team > 0 ? Math.max((AI_COST / team) * 100, 3) + '%' : '0%';

    if (elFoot) {
      const n = selected.length;
      elFoot.innerHTML = n
        ? `Selecionados: <strong>${n} ${n === 1 ? 'cargo' : 'cargos'}</strong> · custo cheio estimado da operação`
        : `Selecione ao menos um cargo para ver a economia`;
    }
  }

  if (roleBtns.length) {
    roleBtns.forEach((b) => {
      b.setAttribute('aria-pressed', b.classList.contains('is-on') ? 'true' : 'false');
      b.addEventListener('click', () => {
        const on = b.classList.toggle('is-on');
        b.setAttribute('aria-pressed', String(on));
        recalc();
      });
    });
    recalc();
  }

  /* ---------- FOOTER YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
