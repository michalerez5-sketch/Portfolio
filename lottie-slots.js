/* Plays Lottie animations inside their Figma slots, only while visible. */
(function () {
  if (!window.lottie) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-lottie]').forEach(slot => {
    let anim = null;
    const load = () => {
      anim = lottie.loadAnimation({
        container: slot, renderer: 'svg', loop: !reduce, autoplay: false,
        path: slot.dataset.lottie,
        rendererSettings: { preserveAspectRatio: slot.dataset.fit === 'meet' ? 'xMidYMid meet' : 'xMidYMid slice', progressiveLoad: true }
      });
      anim.addEventListener('DOMLoaded', () => {
        slot.classList.add('is-ready');
        if (reduce) anim.goToAndStop(anim.totalFrames - 1, true); else if (slot._visible) anim.play();
      });
    };
    new IntersectionObserver(([e]) => {
      slot._visible = e.isIntersecting;
      if (e.isIntersecting) { if (!anim) load(); else if (!reduce) anim.play(); }
      else if (anim) anim.pause();
    }, { rootMargin: '200px 0px', threshold: 0 }).observe(slot);
  });
})();
