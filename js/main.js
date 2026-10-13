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

  // Hero entrance: masked words, then copy and actions
  gsap.timeline({ defaults: { ease } })
    .to('.hero-title .w-in', { y: 0, duration: 1.3, stagger: 0.06 })
    .to('.hero-sub, .hero-actions, .hero-stack', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, '-=0.9')
    .from('.stage-frame', { opacity: 0, y: 120, duration: 1.6 }, '-=0.9')
    .from('[data-chip]', { opacity: 0, y: 24, scale: 0.94, duration: 0.9 }, '-=0.6');

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

  // Bento screenshots scale up as each one enters
  gsap.utils.toArray('.tile-shot').forEach((shot) => {
    gsap.fromTo(shot, { scale: 0.88, opacity: 0.4, transformOrigin: '0% 100%' }, {
      scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: shot.closest('article'), start: 'top 85%', end: 'center 60%', scrub: 0.6 },
    });
  });

  // Recalculate once web fonts settle so trigger positions are exact
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
