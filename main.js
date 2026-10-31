/* Michal Erez — Portfolio interactions */
(function () {
  const root = document.documentElement;
  root.classList.add('js');

  /* ---------- Always open a page at its top (unless a #section is targeted) ---------- */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  const toTop = () => {
    if (location.hash) return;
    try { window.scrollTo(0, 0); } catch (e) {}
    // when the site is shown inside a taller embedding page, bring the page's top into view too
    try { document.documentElement.scrollIntoView(true); } catch (e) {}
  };
  toTop();
  window.addEventListener('pageshow', toTop);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Load sequence ---------- */
  root.classList.add('is-intro');
  const start = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.add('is-loaded');
    root.classList.remove('is-intro');
  }));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(start);
  } else { window.addEventListener('load', start); }

  /* ---------- Split intro text into words for staggered reveal ---------- */
  document.querySelectorAll('[data-words]').forEach(el => {
    let i = 0;
    // <br> keeps forced line breaks; whole words (incl. hyphenated ones) never break inside
    const parts = el.innerHTML.split(/<br\s*\/?>/i).map(h => { const t = document.createElement('div'); t.innerHTML = h; return t.textContent.trim(); });
    el.innerHTML = parts.map(p => p.split(/[ \t\n\r]+/).filter(Boolean)
      .map(w => `<span class="w" style="--i:${i++}">${w}</span>`).join(' ')).join('<br>');
  });

  /* ---------- Sticky nav state ---------- */
  const nav = document.querySelector('.nav');
  const progress = document.querySelector('.progress');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 12);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty('--p', max > 0 ? Math.min(1, y / max) : 0);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Tile cursor pill ---------- */
  document.querySelectorAll('.tile__media').forEach(media => {
    const pill = media.querySelector('.tile__pill');
    if (!pill) return;
    media.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = media.getBoundingClientRect();
      media.style.setProperty('--px', (e.clientX - r.left) + 'px');
      media.style.setProperty('--py', (e.clientY - r.top) + 'px');
    });
    media.addEventListener('pointerleave', () => {
      media.style.removeProperty('--px'); media.style.removeProperty('--py');
    });
  });

  /* ---------- Toast for projects without a case yet ---------- */
  let toast, toastTimer;
  const showToast = (msg) => {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="dot"></span>${msg}`;
    requestAnimationFrame(() => toast.classList.add('is-on'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2600);
  };
  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    const label = btn.textContent;
    btn.addEventListener('click', () => {
      const v = btn.dataset.copy;
      const done = () => {
        btn.textContent = 'Copied ✓'; btn.classList.add('is-done'); showToast('Email copied — ' + v);
        clearTimeout(btn._t); btn._t = setTimeout(() => { btn.textContent = label; btn.classList.remove('is-done'); }, 2200);
      };
      const fallback = () => {
        try { const t = document.createElement('textarea'); t.value = v; t.style.position = 'fixed'; t.style.opacity = '0';
          document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); done(); }
        catch (e) { location.href = 'mailto:' + v; }
      };
      try { navigator.clipboard.writeText(v).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  /* ---------- Big email: scale to fill the column exactly ---------- */
  const fits = document.querySelectorAll('[data-fit]');
  const fitAll = () => fits.forEach(a => {
    const line = a.querySelector('.contact__line'); if (!line) return;
    line.style.fontSize = '100px';
    const w = line.getBoundingClientRect().width, avail = a.clientWidth;
    if (w > 0 && avail > 0) line.style.fontSize = (100 * avail / w).toFixed(2) + 'px';
  });
  if (fits.length) {
    fitAll();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
    window.addEventListener('load', fitAll);
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fitAll, 80); });
  }

  document.querySelectorAll('.tile.is-soon').forEach(t => {
    t.addEventListener('click', e => {
      if (t.getAttribute('href') === '#') {
        e.preventDefault();
        showToast(`${t.dataset.name} — case study coming soon`);
      }
    });
  });

  /* ---------- Lightbox for case images ---------- */
  const zoomables = document.querySelectorAll('.block--zoom');
  if (zoomables.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image preview');
    lb.innerHTML = '<img alt=""><button class="lightbox__close" aria-label="Close preview"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l14 14M16 2L2 16"/></svg></button>';
    document.body.appendChild(lb);
    const lbImg = lb.querySelector('img');
    const closeBtn = lb.querySelector('.lightbox__close');
    let lastFocus = null;
    const open = (src, alt) => {
      lastFocus = document.activeElement;
      lbImg.src = src; lbImg.alt = alt || '';
      lb.classList.add('is-on'); document.body.style.overflow = 'hidden';
      closeBtn.focus({ preventScroll: true });
    };
    const close = () => {
      lb.classList.remove('is-on'); document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    zoomables.forEach(b => {
      const img = b.querySelector('img');
      b.setAttribute('tabindex', '0'); b.setAttribute('role', 'button');
      b.setAttribute('aria-label', 'Enlarge: ' + (img.alt || 'image'));
      const go = () => open(img.currentSrc || img.src, img.alt);
      b.addEventListener('click', go);
      b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    lb.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('is-on')) close(); });
  }

  /* ---------- Videos: play only while on screen ---------- */
  const vids = document.querySelectorAll('.block__video');
  if (vids.length && !reduce && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver(entries => entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { v.preload = 'auto'; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else v.pause();
    }), { threshold: 0.2 });
    vids.forEach(v => {
      v.addEventListener('playing', () => v.classList.add('is-playing'));
      vio.observe(v);
    });
  }

  /* ---------- Back to top ---------- */
  document.querySelectorAll('[data-top]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }));
})();
