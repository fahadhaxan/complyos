/* ComplyOS case study â€” interactions */
(function () {
  'use strict';
  document.documentElement.classList.add('js-ready');
  document.body.classList.add('js-ready');

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav: scrolled state, progress, scrollspy ---------- */
  const nav = $('#nav');
  const progress = $('#progress');
  const links = $$('.links a');
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';

      let current = null;
      sections.forEach(sec => {
        if (sec.getBoundingClientRect().top <= 140) current = sec.id;
      });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  const linkList = $('#links');
  burger.addEventListener('click', () => {
    const open = linkList.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.forEach(a => a.addEventListener('click', () => {
    linkList.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------- hero parallax tilt ---------- */
  const heroVisual = $('.hero-visual');
  const tilt = $('#tilt');
  if (tilt && heroVisual && !reduced && window.matchMedia('(pointer:fine)').matches) {
    heroVisual.addEventListener('pointermove', e => {
      const r = heroVisual.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = 'rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' +
        (-py * 7).toFixed(2) + 'deg) translateZ(0)';
    });
    heroVisual.addEventListener('pointerleave', () => {
      tilt.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }

  /* ---------- count up ---------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const pad = parseInt(el.dataset.pad || '0', 10);
    if (isNaN(target)) return;
    if (reduced) { el.textContent = String(target).padStart(pad, '0'); return; }
    const start = performance.now();
    const dur = 900;
    (function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased)).padStart(pad, '0');
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
    }), { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- problem toggle ---------- */
  const chain = $('#chain');
  const hint = $('#toggleHint');
  const hintText = {
    frag: 'Five capabilities, five separate records.',
    conn: 'Five capabilities, one connected environment.'
  };
  $$('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.seg-btn').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('on');
      btn.setAttribute('aria-selected', 'true');
      const state = btn.dataset.state;
      chain.dataset.state = state;
      hint.textContent = hintText[state] || '';
    });
  });

  /* ---------- domain explorer ---------- */
  $$('.dom-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.dom-tab').forEach(t => { t.classList.remove('on'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('on');
      tab.setAttribute('aria-selected', 'true');
      $$('.dom-panel').forEach(p => p.classList.remove('on'));
      const panel = document.getElementById(tab.dataset.panel);
      if (panel) panel.classList.add('on');
    });
  });

  /* ---------- workflow steps ---------- */
  const details = $$('.sd');
  $$('.step').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.step').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('on');
      btn.setAttribute('aria-selected', 'true');
      details.forEach(d => d.classList.remove('on'));
      const i = parseInt(btn.dataset.step, 10);
      if (details[i]) details[i].classList.add('on');
    });
  });

  /* ---------- architecture tabs ---------- */
  $$('.arch-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.arch-tab').forEach(t => { t.classList.remove('on'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('on');
      tab.setAttribute('aria-selected', 'true');
      $$('.arch-panel').forEach(p => p.classList.remove('on'));
      const panel = document.getElementById(tab.dataset.arch);
      if (panel) panel.classList.add('on');
    });
  });

  /* ---------- capability filter ---------- */
  const rows = $$('.cap-row');
  const capCount = $('#capCount');
  $$('.fp').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.fp').forEach(p => p.classList.remove('on'));
      pill.classList.add('on');
      const f = pill.dataset.filter;
      let shown = 0;
      rows.forEach(r => {
        const show = f === 'all' || r.dataset.status === f;
        r.classList.toggle('hide', !show);
        if (show) shown++;
      });
      if (capCount) capCount.textContent = shown + (shown === 1 ? ' capability area' : ' capability areas');
    });
  });

  /* ---------- lightbox ---------- */
  const lightbox = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbTitle = $('#lbTitle');
  const lbDesc = $('#lbDesc');
  const items = [];
  $$('[data-shot]').forEach(el => {
    const img = el.tagName === 'IMG' ? el : el.querySelector('img');
    if (!img) return;
    items.push({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || '',
                 title: el.dataset.title || '', desc: el.dataset.shot || '' });
    const idx = items.length - 1;
    el.addEventListener('click', e => { e.preventDefault(); openLightbox(idx); });
    el.style.cursor = 'zoom-in';
  });
  let lbIndex = 0;
  function openLightbox(i) {
    if (!items.length) return;
    lbIndex = (i + items.length) % items.length;
    const it = items[lbIndex];
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbTitle.textContent = it.title;
    lbDesc.textContent = it.desc;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function move(dir) {
    const it = items[(lbIndex + dir + items.length) % items.length];
    lbIndex = (lbIndex + dir + items.length) % items.length;
    lbImg.src = it.src; lbImg.alt = it.alt;
    lbTitle.textContent = it.title; lbDesc.textContent = it.desc;
  }
  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => move(-1));
  $('#lbNext').addEventListener('click', () => move(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  });

  /* in-page anchors keep focus context sane */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        const el = document.querySelector(id);
        const top = el.getBoundingClientRect().top + window.scrollY - 78;
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      }
    });
  });

  /* preview helper: ?at=<sectionId> scrolls before capture */
  const at = new URLSearchParams(location.search).get('at');
  if (at) {
    const target = document.getElementById(at);
    if (target) { document.documentElement.style.scrollBehavior = 'auto'; target.scrollIntoView(); }
  }
})();


