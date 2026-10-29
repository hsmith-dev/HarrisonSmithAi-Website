/* ============================================================
   Renders the 14-app case-study grid. Each card shows a preview
   (where one exists) plus what it actually changed for the team
   that uses it; clicking opens a modal with the fuller detail.
   ============================================================ */

(function () {
  'use strict';
  const grid = document.getElementById('caseGrid');
  const modal = document.getElementById('caseModal');
  if (!grid || !window.PlatformApps) return;

  window.PlatformApps.forEach((app) => {
    const card = document.createElement('article');
    const spanClass = app.span === 'wide' ? ' span-wide' : app.span === 'big' ? ' span-big' : '';
    card.className = 'bezel case-card reveal' + spanClass;
    card.innerHTML = `
      <div class="bezel-core">
        <span class="case-tag">${app.tag}</span>
        <h3>${app.name}</h3>
        <p>${app.desc}</p>
        ${app.preview ? '<div class="case-card-preview"></div>' : ''}
        ${app.impact ? `<p class="case-impact"><i class="ph-light ph-trend-up" aria-hidden="true"></i>${app.impact}</p>` : ''}
        <span class="case-open">More detail <i class="ph-light ph-arrow-up-right" aria-hidden="true"></i></span>
      </div>`;

    if (app.preview) {
      const previewEl = card.querySelector('.case-card-preview');
      requestAnimationFrame(() => app.preview(previewEl));
    }

    card.addEventListener('click', () => openModal(app));
    grid.appendChild(card);
  });

  if (!modal) return;
  const backdrop = document.getElementById('caseModalBackdrop');
  const closeBtn = document.getElementById('caseModalClose');
  const tagEl = document.getElementById('caseModalTag');
  const titleEl = document.getElementById('caseModalTitle');
  const descEl = document.getElementById('caseModalDesc');
  const impactEl = document.getElementById('caseModalImpact');
  const bulletsEl = document.getElementById('caseModalBullets');
  let lastFocused = null;

  function openModal(app) {
    tagEl.textContent = app.tag;
    titleEl.textContent = app.name;
    descEl.textContent = app.desc;
    if (app.impact) { impactEl.innerHTML = `<i class="ph-light ph-trend-up" aria-hidden="true"></i>${app.impact}`; impactEl.hidden = false; } else { impactEl.hidden = true; }
    bulletsEl.innerHTML = app.bullets.map((b) => `<li>${b}</li>`).join('');
    lastFocused = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 250);
    if (lastFocused) lastFocused.focus();
  }

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}());
