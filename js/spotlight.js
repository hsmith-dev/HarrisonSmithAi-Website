/* ============================================================
   Spotlight-border cards: tracks the cursor over any .bezel and
   sets --mx/--my so the CSS radial-gradient ring (style.css)
   follows the pointer. One delegated listener, no per-card cost.
   ============================================================ */

(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!matchMedia('(hover: hover)').matches) return;

  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.bezel');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  }, { passive: true });
}());
