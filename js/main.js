(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const hasIO = 'IntersectionObserver' in window;

  /* ---------- Nav: glass pill state ---------- */
  const shell = document.getElementById('site-header');
  if (hasIO && shell) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:24px;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => shell.classList.toggle('scrolled', !e.isIntersecting)).observe(sentinel);
  }

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('navToggle');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); }
  });

  /* ---------- Active nav link ---------- */
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if (hasIO) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => obs.observe(s));
  }

  /* ---------- Skills tabs (roving tabindex) ---------- */
  const tabs = [...document.querySelectorAll('.skill-tabs [role="tab"]')];
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) selectTab(tab); });
    tab.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      selectTab(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });

  /* ---------- Split text into masked words ---------- */
  const splitWords = (el, cls) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const outer = document.createElement('span');
            outer.className = cls;
            if (cls === 'w') {
              const inner = document.createElement('span');
              inner.className = 'w-in';
              inner.textContent = part;
              outer.appendChild(inner);
            } else {
              outer.textContent = part;
            }
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
  };

  /* ---------- GSAP choreography ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger || reduced) return; // content stays fully visible

  gsap.registerPlugin(ScrollTrigger);
  const heroTitle = document.querySelector('[data-split]');
  const statement = document.querySelector('[data-scrub]');
  if (heroTitle) splitWords(heroTitle, 'w');
  if (statement) splitWords(statement, 'sw');
  root.classList.add('motion');

  const ease = 'expo.out';

  // Hero entrance: pill, masked words, then copy and actions
  gsap.timeline({ defaults: { ease } })
    .to('.hero-pill', { opacity: 1, y: 0, duration: 1 })
    .to('.hero-title .w-in', { y: 0, duration: 1.3, stagger: 0.06 }, '-=0.8')
    .to('.hero-sub, .hero-actions', { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, '-=0.9')
    .from('.stage-frame', { opacity: 0, y: 120, duration: 1.6 }, '-=0.9');

  const mm = gsap.matchMedia();

  // Screenshot tilts flat as the hero scrolls away (desktop only)
  mm.add('(min-width: 768px)', () => {
    gsap.to('.stage-frame', {
      rotateX: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.hero-stage', start: 'top 85%', end: 'top 15%', scrub: 0.6 },
    });
  });

  // Statement: words brighten in sequence while scrolling
  if (statement) {
    gsap.fromTo(statement.querySelectorAll('.sw'), { opacity: 0.14 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: 0.4 },
    });
  }

  // Heavy fade-up for everything tagged .reveal, batched so siblings cascade
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease, stagger: 0.08, overwrite: true }),
  });

  // Bento screenshot scales up as it enters
  gsap.fromTo('.tile-shot', { scale: 0.88, opacity: 0.4, transformOrigin: '0% 100%' }, {
    scale: 1, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.tile-ogden', start: 'top 85%', end: 'center 60%', scrub: 0.6 },
  });

  // Experience: each card recedes as the next one stacks onto it
  mm.add('(min-width: 768px)', () => {
    const cards = gsap.utils.toArray('.stack-card');
    cards.forEach((card, i) => {
      card.style.setProperty('--i', i);
      const next = cards[i + 1];
      if (!next) return;
      // Fade fully so a taller card never shows beneath a shorter one
      gsap.to(card, {
        scale: 0.92, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top 75%', end: () => `top ${120 + (i + 1) * 22}px`, scrub: 0.5 },
      });
    });
  });

  // Recalculate once web fonts settle so trigger positions are exact
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
