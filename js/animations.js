/**
 * Animations Module - Premium UI/UX Designer Portfolio
 * Handles all visual animations, effects, and interactive behaviors.
 * Runs alongside script.js on all main pages.
 */

(function () {
  'use strict';

  /* ─── Palette ─────────────────────────────────────────────────────── */
  const PALETTE = ['#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#f97316'];
  const PALETTE_DIM = ['#6d28d9', '#2563eb', '#db2777', '#0891b2', '#ea580c'];

  /* ─── Utility ─────────────────────────────────────────────────────── */
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerp(start, end, factor) { return start + (end - start) * factor; }

  function isDesktop() { return window.innerWidth > 768; }

  /* ─── Injected <style> helpers ─────────────────────────────────────── */
  function injectStyle(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function injectParticleStyles() {
    injectStyle('anim-particles', `
      .anim-particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0;
        will-change: transform, opacity;
      }
      @keyframes particleFloat {
        0%   { transform: translateY(0) translateX(0); opacity: 0; }
        10%  { opacity: 0.7; }
        90%  { opacity: 0.7; }
        100% { transform: translateY(-110vh) translateX(40px); opacity: 0; }
      }
    `);
  }

  function injectTiltStyles() {
    injectStyle('anim-tilt', `
      .tilt-card {
        transform-style: preserve-3d;
        will-change: transform;
        transition: transform 0.3s cubic-bezier(.25,.46,.45,.94);
      }
    `);
  }

  function injectCursorStyles() {
    injectStyle('anim-cursor', `
      .custom-cursor {
        position: fixed;
        top: 0; left: 0;
        width: 8px; height: 8px;
        background: #8b5cf6;
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        mix-blend-mode: difference;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s, background 0.2s;
      }
      .custom-cursor.hovering {
        width: 14px; height: 14px;
        background: #ec4899;
      }
      .cursor-follower {
        position: fixed;
        top: 0; left: 0;
        width: 36px; height: 36px;
        border: 2px solid rgba(139,92,246,0.4);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99998;
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s, border-color 0.3s, opacity 0.3s;
      }
      .cursor-follower.hovering {
        width: 52px; height: 52px;
        border-color: rgba(236,72,153,0.5);
      }
    `);
  }

  function injectGradientStyles() {
    injectStyle('anim-gradient', `
      .gradient-text {
        background-size: 200% 200%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientFlow 4s ease infinite;
        display: inline-block;
      }
      @keyframes gradientFlow {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `);
  }

  function injectRevealImageStyles() {
    injectStyle('anim-reveal', `
      .reveal-image {
        clip-path: inset(100% 0 0 0);
        transition: clip-path 0.8s cubic-bezier(.77,0,.175,1);
      }
      .reveal-image.revealed {
        clip-path: inset(0 0 0 0);
      }
    `);
  }

  function injectRippleStyles() {
    injectStyle('anim-ripple', `
      .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.35);
        transform: scale(0);
        animation: rippleExpand 0.6s ease-out forwards;
        pointer-events: none;
      }
      @keyframes rippleExpand {
        to { transform: scale(4); opacity: 0; }
      }
    `);
  }

  function injectTypingStyles() {
    injectStyle('anim-typing', `
      .typing-cursor {
        display: inline-block;
        width: 2px;
        margin-left: 2px;
        background: #8b5cf6;
        animation: blink 0.8s step-end infinite;
        vertical-align: text-bottom;
      }
      @keyframes blink {
        50% { opacity: 0; }
      }
    `);
  }

  function injectFloatingStyles() {
    injectStyle('anim-floating', `
      .floating-enhanced {
        will-change: transform;
      }
      @keyframes floatEnhanced {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25%      { transform: translateY(-12px) rotate(1.5deg); }
        50%      { transform: translateY(-6px) rotate(-1deg); }
        75%      { transform: translateY(-14px) rotate(0.5deg); }
      }
    `);
  }

  function injectScrollAnimStyles() {
    injectStyle('anim-scroll-anim', `
      [data-animation] {
        opacity: 0;
        will-change: transform, opacity;
        transition: opacity 0.6s cubic-bezier(.25,.46,.45,.94),
                    transform 0.6s cubic-bezier(.25,.46,.45,.94);
      }
      [data-animation].in-view {
        opacity: 1;
        transform: translate(0,0) scale(1) rotate(0deg) !important;
      }
      .counter-pulse {
        animation: counterPulse 0.4s ease;
      }
      @keyframes counterPulse {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
    `);
  }

  /* ═══════════════════════════════════════════════════════════════════
     1. PARTICLE SYSTEM
     ═══════════════════════════════════════════════════════════════════ */
  function initParticles() {
    injectParticleStyles();
    const container = document.querySelector('.animated-bg');
    if (!container) return;

    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    const count = randInt(15, 20);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.classList.add('anim-particle');
      const size = rand(2, 6);
      const color = pick(PALETTE);
      const left = rand(0, 100);
      const dur = rand(10, 25);
      const delay = rand(0, 15);

      Object.assign(p.style, {
        width: size + 'px',
        height: size + 'px',
        background: color,
        left: left + '%',
        bottom: '-10px',
        animation: `particleFloat ${dur}s ${delay}s linear infinite`,
      });
      container.appendChild(p);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     2. MOUSE FOLLOW / PARALLAX ON HERO
     ═══════════════════════════════════════════════════════════════════ */
  function initMouseFollow() {
    if (!isDesktop()) return;

    const hero = document.querySelector('.hero-section') || document.querySelector('.hero');
    if (!hero) return;

    const cards = hero.querySelectorAll('.skill-card, .floating-card, .hero-card');
    const heroImage = hero.querySelector('.hero-image, .hero-img, .hero__image');
    const glow = hero.querySelector('.hero-glow, .hero__glow');

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let animating = false;

    function animate() {
      currentX = lerp(currentX, mouseX, 0.08);
      currentY = lerp(currentY, mouseY, 0.08);

      const heroRect = hero.getBoundingClientRect();
      const normX = (currentX - heroRect.left - heroRect.width / 2) / (heroRect.width / 2);
      const normY = (currentY - heroRect.top - heroRect.height / 2) / (heroRect.height / 2);

      cards.forEach((card, i) => {
        const depth = (i + 1) * 8;
        card.style.transform = `translate(${-normX * depth}px, ${-normY * depth}px)`;
      });

      if (heroImage) {
        heroImage.style.transform = `translate(${normX * 6}px, ${normY * 6}px)`;
      }

      if (glow) {
        glow.style.background = `radial-gradient(circle at ${currentX - heroRect.left}px ${currentY - heroRect.top}px, rgba(139,92,246,0.25) 0%, transparent 60%)`;
      }

      if (animating) requestAnimationFrame(animate);
    }

    hero.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
      }
    });

    hero.addEventListener('mouseleave', function () {
      animating = false;
      mouseX = hero.getBoundingClientRect().width / 2;
      mouseY = hero.getBoundingClientRect().height / 2;
      cards.forEach(function (card) {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = 'translate(0,0)';
        setTimeout(function () { card.style.transition = ''; }, 500);
      });
      if (heroImage) {
        heroImage.style.transition = 'transform 0.5s ease';
        heroImage.style.transform = 'translate(0,0)';
        setTimeout(function () { heroImage.style.transition = ''; }, 500);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     3. TILT EFFECT ON CARDS
     ═══════════════════════════════════════════════════════════════════ */
  function initTiltEffect() {
    injectTiltStyles();
    if (!isDesktop()) return;

    const cards = document.querySelectorAll('.project-card, .skill-card, .tilt-card');
    cards.forEach(function (card) {
      card.classList.add('tilt-card');

      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     4. TEXT GRADIENT ANIMATION
     ═══════════════════════════════════════════════════════════════════ */
  function initGradientText() {
    injectGradientStyles();

    const gradients = [
      ['#8b5cf6', '#ec4899'],
      ['#3b82f6', '#06b6d4'],
      ['#f97316', '#ec4899'],
      ['#8b5cf6', '#3b82f6'],
      ['#06b6d4', '#8b5cf6'],
    ];

    document.querySelectorAll('.gradient-text').forEach(function (el) {
      let idx = 0;
      const colors = gradients[idx];
      el.style.backgroundImage = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;

      if (el.hasAttribute('data-gradient')) {
        setInterval(function () {
          idx = (idx + 1) % gradients.length;
          const c = gradients[idx];
          el.style.backgroundImage = `linear-gradient(135deg, ${c[0]}, ${c[1]})`;
        }, 3000);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     5. SCROLL-TRIGGERED ANIMATIONS (ADVANCED)
     ═══════════════════════════════════════════════════════════════════ */
  function initScrollAnimations() {
    injectScrollAnimStyles();

    const defaults = {
      'fade-up':    'translateY(40px)',
      'fade-left':  'translateX(-40px)',
      'fade-right': 'translateX(40px)',
      'scale':      'scale(0.85)',
      'rotate':     'rotate(-5deg)',
    };

    const elements = document.querySelectorAll('[data-animation]');
    if (!elements.length) return;

    /* group by stagger parent */
    const staggerMap = {};
    elements.forEach(function (el) {
      const raw = el.getAttribute('data-stagger');
      const parent = raw ? (el.closest('[data-stagger]') || el.parentElement) : null;
      const key = raw ? (parent ? parent.dataset.stagger || 'default' : 'default') : null;

      const animType = el.getAttribute('data-animation') || 'fade-up';
      const initialTransform = defaults[animType] || defaults['fade-up'];
      el.style.transform = initialTransform;

      if (key) {
        if (!staggerMap[key]) staggerMap[key] = [];
        staggerMap[key].push(el);
      }
    });

    /* assign stagger indices */
    Object.keys(staggerMap).forEach(function (key) {
      staggerMap[key].forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.12) + 's';
      });
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ═══════════════════════════════════════════════════════════════════
     6. NAVBAR SCROLL ANIMATION
     ═══════════════════════════════════════════════════════════════════ */
  function initNavbarAnimation() {
    const navbar = document.querySelector('nav, .navbar, .nav-bar, header');
    if (!navbar) return;

    navbar.style.transition = 'background 0.3s, box-shadow 0.3s, transform 0.3s';
    const logo = navbar.querySelector('.logo, .nav-logo, a[href="index.html"]');

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        const scrollY = window.scrollY || window.pageYOffset;
        if (scrollY > 50) {
          navbar.style.background = 'rgba(10,10,20,0.92)';
          navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3)';
          if (logo) logo.style.transform = 'scale(1.05)';
        } else {
          navbar.style.background = 'rgba(10,10,20,0.6)';
          navbar.style.boxShadow = 'none';
          if (logo) logo.style.transform = 'scale(1)';
        }
        ticking = false;
      });
    }, { passive: true });

    /* fire once to set initial state */
    window.dispatchEvent(new Event('scroll'));
  }

  /* ═══════════════════════════════════════════════════════════════════
     7. SMOOTH ANCHOR SCROLLING
     ═══════════════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '#top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();

      const startY = window.scrollY || window.pageYOffset;
      const endY = target.getBoundingClientRect().top + startY - 80;
      const distance = Math.abs(endY - startY);
      const duration = Math.min(Math.max(distance * 0.6, 400), 1200);
      let startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, startY + (endY - startY) * eased);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     8. CURSOR EFFECTS (Desktop)
     ═══════════════════════════════════════════════════════════════════ */
  function initCursorEffects() {
    if (!isDesktop()) return;
    injectCursorStyles();

    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    const follower = document.createElement('div');
    follower.classList.add('cursor-follower');
    document.body.appendChild(follower);

    let cx = -100, cy = -100;
    let fx = -100, fy = -100;
    let running = false;

    function updateCursor() {
      cx = lerp(cx, mx, 0.2);
      cy = lerp(cy, my, 0.2);
      fx = lerp(fx, mx, 0.08);
      fy = lerp(fy, my, 0.08);

      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';

      if (running) requestAnimationFrame(updateCursor);
    }

    let mx = -100, my = -100;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!running) {
        running = true;
        requestAnimationFrame(updateCursor);
      }
    });

    const interactiveSelector = 'a, button, .btn, .btn-primary, .project-card, .skill-card, input, textarea, .nav-link, .social-link';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.add('hovering');
        follower.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.remove('hovering');
        follower.classList.remove('hovering');
      }
    });

    /* hide default cursor on interactive elements */
    injectStyle('cursor-hide', interactiveSelector + ' { cursor: none; }');
  }

  /* ═══════════════════════════════════════════════════════════════════
     9. MAGNETIC BUTTONS
     ═══════════════════════════════════════════════════════════════════ */
  function initMagneticButtons() {
    if (!isDesktop()) return;

    document.querySelectorAll('.btn-primary, .btn-magnetic').forEach(function (btn) {
      btn.style.position = 'relative';
      btn.style.transition = 'transform 0.35s cubic-bezier(.25,.46,.45,.94)';

      btn.addEventListener('mousemove', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     10. IMAGE REVEAL ON SCROLL
     ═══════════════════════════════════════════════════════════════════ */
  function initImageReveal() {
    injectRevealImageStyles();

    const images = document.querySelectorAll('.reveal-image');
    if (!images.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    images.forEach(function (img) { observer.observe(img); });
  }

  /* ═══════════════════════════════════════════════════════════════════
     11. COUNTER ANIMATION
     ═══════════════════════════════════════════════════════════════════ */
  function initCounters() {
    const counters = document.querySelectorAll('.counter, [data-count]');
    if (!counters.length) return;

    function formatNumber(n) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);

        const target = parseInt(el.getAttribute('data-count') || el.textContent.replace(/[^0-9]/g, ''), 10);
        if (isNaN(target)) return;

        const duration = 2000;
        let start = null;
        el.textContent = '0';

        function step(timestamp) {
          if (!start) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = formatNumber(current);

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = formatNumber(target);
            el.classList.add('counter-pulse');
            setTimeout(function () { el.classList.remove('counter-pulse'); }, 500);
          }
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ═══════════════════════════════════════════════════════════════════
     12. PARALLAX SCROLLING
     ═══════════════════════════════════════════════════════════════════ */
  function initParallaxScroll() {
    const elements = document.querySelectorAll('.parallax, [data-speed]');
    const blobs = document.querySelectorAll('.blob, .bg-blob, .hero-blob');

    if (!elements.length && !blobs.length) return;

    let ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        const scrollY = window.scrollY || window.pageYOffset;

        elements.forEach(function (el) {
          const speed = parseFloat(el.getAttribute('data-speed')) || 0.2;
          const rect = el.getBoundingClientRect();
          const offset = (scrollY + rect.top) * speed;
          el.style.transform = `translateY(${-offset}px)`;
        });

        blobs.forEach(function (blob, i) {
          const speed = 0.05 + (i % 3) * 0.03;
          blob.style.transform = `translateY(${scrollY * speed}px)`;
        });

        ticking = false;
      });
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════════════
     13. TYPING EFFECT
     ═══════════════════════════════════════════════════════════════════ */
  function initTypingEffect() {
    injectTypingStyles();

    const els = document.querySelectorAll('.typing-text');
    if (!els.length) return;

    els.forEach(function (el) {
      const fullText = el.getAttribute('data-text') || el.textContent;
      el.textContent = '';
      el.style.visibility = 'visible';

      const cursor = document.createElement('span');
      cursor.classList.add('typing-cursor');
      el.appendChild(cursor);

      let charIndex = 0;
      const shouldLoop = el.hasAttribute('data-loop');

      function type() {
        if (charIndex < fullText.length) {
          el.insertBefore(document.createTextNode(fullText.charAt(charIndex)), cursor);
          charIndex++;
          setTimeout(type, 80 + Math.random() * 60);
        } else if (shouldLoop) {
          setTimeout(function () {
            el.textContent = '';
            el.appendChild(cursor);
            charIndex = 0;
            setTimeout(type, 800);
          }, 2000);
        }
      }

      /* start after page load sequence */
      setTimeout(type, 1200);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     14. FLOATING ANIMATION ENHANCEMENT
     ═══════════════════════════════════════════════════════════════════ */
  function initFloatingEnhancement() {
    injectFloatingStyles();

    document.querySelectorAll('.floating').forEach(function (el) {
      el.classList.add('floating-enhanced');
      const duration = rand(4, 7);
      const delay = rand(0, 2);
      el.style.animation = `floatEnhanced ${duration}s ${delay}s ease-in-out infinite`;
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     15. PAGE LOAD SEQUENCE
     ═══════════════════════════════════════════════════════════════════ */
  function initPageLoadSequence() {
    injectStyle('anim-load-seq', `
      .load-fade-in {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .load-fade-in.loaded {
        opacity: 1;
        transform: translateY(0);
      }
    `);

    /* 1 – navbar */
    const navbar = document.querySelector('nav, .navbar, .nav-bar, header');
    if (navbar) {
      navbar.style.opacity = '0';
      setTimeout(function () {
        navbar.style.transition = 'opacity 0.5s ease';
        navbar.style.opacity = '1';
      }, 0);
    }

    /* 2 – hero content */
    const heroContent = document.querySelector('.hero-content, .hero__content, .hero-text');
    if (heroContent) {
      heroContent.classList.add('load-fade-in');
      setTimeout(function () { heroContent.classList.add('loaded'); }, 200);
    }

    /* 3 – hero image */
    const heroImage = document.querySelector('.hero-image, .hero-img, .hero__image');
    if (heroImage) {
      heroImage.classList.add('load-fade-in');
      setTimeout(function () { heroImage.classList.add('loaded'); }, 400);
    }

    /* 4 – floating cards stagger */
    const floatingCards = document.querySelectorAll('.skill-card, .floating-card, .hero-card');
    floatingCards.forEach(function (card, i) {
      card.classList.add('load-fade-in');
      setTimeout(function () { card.classList.add('loaded'); }, 600 + i * 120);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     16. RIPPLE EFFECT ON BUTTONS
     ═══════════════════════════════════════════════════════════════════ */
  function initRippleEffect() {
    injectRippleStyles();

    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn, .btn-primary, button');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');

      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      Object.assign(ripple.style, {
        width: size + 'px',
        height: size + 'px',
        left: x + 'px',
        top: y + 'px',
      });

      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);

      setTimeout(function () { ripple.remove(); }, 700);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     INITIALISE EVERYTHING
     ═══════════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initMouseFollow();
    initTiltEffect();
    initGradientText();
    initScrollAnimations();
    initNavbarAnimation();
    initSmoothScroll();
    initCursorEffects();
    initMagneticButtons();
    initImageReveal();
    initCounters();
    initParallaxScroll();
    initTypingEffect();
    initFloatingEnhancement();
    initPageLoadSequence();
    initRippleEffect();
  });

})();
