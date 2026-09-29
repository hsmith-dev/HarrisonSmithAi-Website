(() => {
  'use strict';

  document.documentElement.classList.remove('no-js');

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const hasIO = 'IntersectionObserver' in window;

  // Header border once the page scrolls past a sentinel near the top
  const header = document.getElementById('site-header');
  if (hasIO && header) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:12px;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting))
      .observe(sentinel);
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const setNav = (open) => {
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setNav(false);
      navToggle.focus();
    }
  });

  // Scroll reveal: elements that enter together cascade in sequence
  const revealEls = document.querySelectorAll('.reveal');
  if (hasIO && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, i) => {
            entry.target.style.setProperty('--delay', `${Math.min(i, 6) * 70}ms`);
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // Active nav link highlighting
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if (hasIO && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }
})();
