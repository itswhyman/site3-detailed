/* SITE 3 — CLINIC MOTION ENGINE */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  /* -------- 1. HERO — clinical fade with staggered element entry -------- */
  function initHero() {
    const content = document.querySelector('.hero-content');
    const eyebrow = document.querySelector('.hero-eyebrow');
    const title = document.getElementById('hero-title');
    const sub = document.getElementById('hero-sub');
    const cta = document.getElementById('hero-cta');
    const topBar = document.getElementById('topNav');

    requestAnimationFrame(() => {
      topBar?.classList.add('is-loaded');
      content?.classList.add('is-visible');
    });

    setTimeout(() => eyebrow?.classList.add('is-visible'), 200);
    setTimeout(() => title?.classList.add('is-visible'), 380);
    setTimeout(() => sub?.classList.add('is-visible'), 580);
    setTimeout(() => cta?.classList.add('is-visible'), 780);
  }

  /* -------- 2. Scroll reveals -------- */
  function initScrollReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -7% 0px' });

    document.querySelectorAll('[data-blur-in], [data-mask-in]').forEach(el => io.observe(el));

    document.querySelectorAll('.service-card').forEach((el, i) => {
      el.style.transitionDelay = (i * 95) + 'ms';
      io.observe(el);
    });

    document.querySelectorAll('.gallery-item').forEach((el, i) => {
      el.style.transitionDelay = (i * 110) + 'ms';
      io.observe(el);
    });

    document.querySelectorAll('.testi-card').forEach((el, i) => {
      el.style.transitionDelay = (i * 110) + 'ms';
      io.observe(el);
    });

    const featList = document.getElementById('about-features');
    if (featList) io.observe(featList);

    const contactInfo = document.getElementById('contact-info');
    if (contactInfo) io.observe(contactInfo);
  }

  /* -------- 3. Subtle hero parallax (desktop only) -------- */
  function initParallax() {
    if (isMobile) return;
    const bg = document.getElementById('hero-bg');
    if (!bg) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          bg.style.transform = `translateY(${y * 0.18}px) scale(1.05)`;
        }
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  /* -------- 4. Section label gentle tracking expand -------- */
  function initLabelTracking() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.transition = 'letter-spacing 1.2s cubic-bezier(0.65,0,0.35,1), color 1s ease';
          el.style.letterSpacing = '0.18em';
          setTimeout(() => { el.style.letterSpacing = '0.14em'; }, 40);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.section-label').forEach(el => io.observe(el));
  }

  /* -------- 5. Anchor scroll keeps smoothness -------- */
  function initSmoothScrollBehavior() {
    // html { scroll-behavior: smooth } already set in base CSS — nothing to do
  }

  /* -------- Boot -------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    initHero();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initScrollReveals();
        initParallax();
        initLabelTracking();
        initSmoothScrollBehavior();
      });
    });
  }
})();