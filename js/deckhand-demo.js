/* ============================================================
   Deckhand flagship demo: a tiny slide canvas with a live embed
   that pulls from the other mock apps, a refresh action, and a
   short scripted walkthrough. Built from scratch, concept only,
   no code reused from any real app.
   ============================================================ */

(function () {
  'use strict';
  const M = window.MockData, C = window.Charts;
  const rail = document.getElementById('slideRail');
  if (!rail || !M || !C) return;

  const slides = [
    {
      id: 'ops', title: 'Weekly Ops', embed: 'pulse', embedLabel: 'Pulse',
      body: 'Active accounts are up for the third week running. Onboarding volume dipped slightly, and Risk flagged two applications for manual review.',
    },
    {
      id: 'pipe', title: 'Pipeline Review', embed: 'pipeline', embedLabel: 'Pipeline',
      body: 'Three deals moved into Negotiation this week. Proposal stage is getting crowded, worth a check-in with the reps holding the oldest ones.',
    },
    {
      id: 'health', title: 'Customer Health', embed: 'paytrace', embedLabel: 'Paytrace',
      body: 'Card remains the dominant payment method. Wallet share keeps climbing quarter over quarter, with a lower decline rate than card overall.',
    },
  ];

  let current = 0;
  let seedTick = 0;
  let refreshedAt = Date.now();
  let embedOverride = null;
  const EMBED_ORDER = ['pulse', 'pipeline', 'paytrace'];
  const EMBED_NAMES = { pulse: 'Pulse', pipeline: 'Pipeline', paytrace: 'Paytrace' };

  const titleEl = document.getElementById('slideTitle');
  const bodyEl = document.getElementById('slideBody');
  const embedLabelEl = document.querySelector('#embedCard .embed-card-head span');
  const embedWidget = document.getElementById('embedWidget');
  const embedCard = document.getElementById('embedCard');
  const refreshedAtEl = document.getElementById('embedRefreshedAt');

  function drawEmbed() {
    const slide = slides[current];
    const source = embedOverride || slide.embed;
    embedLabelEl.textContent = 'LIVE EMBED · ' + EMBED_NAMES[source];
    embedWidget.innerHTML = '';
    if (source === 'pulse') {
      const series = M.sparkline(100 + seedTick, { n: 14, base: 420, volatility: 26 });
      C.sparkline(embedWidget, series, { height: 56 });
    } else if (source === 'pipeline') {
      const board = M.pipelineBoard(200 + seedTick);
      const bars = board.map((col) => ({ label: col.stage.split(' ')[0], value: col.cards.reduce((s, c) => s + c.amount, 0) }));
      C.barChart(embedWidget, bars, { height: 110, formatValue: (v) => '$' + v.toLocaleString() });
    } else if (source === 'paytrace') {
      const methods = M.paytraceData(300 + seedTick);
      C.donutChart(embedWidget, methods.map((m, i) => ({ label: m.label, pct: m.pct, color: C.seriesColor(i) })), { size: 120, thickness: 16 });
    }
  }

  function renderSlide() {
    const slide = slides[current];
    embedOverride = null;
    titleEl.textContent = slide.title;
    bodyEl.innerHTML = `<p class="slide-copy" contenteditable="true" spellcheck="false">${slide.body}</p>`;
    drawEmbed();
    rail.querySelectorAll('.slide-thumb').forEach((t, i) => t.classList.toggle('is-active', i === current));
  }

  slides.forEach((s, i) => {
    const thumb = document.createElement('button');
    thumb.className = 'slide-thumb' + (i === 0 ? ' is-active' : '');
    thumb.setAttribute('role', 'tab');
    thumb.innerHTML = `<strong>${i + 1}. ${s.title}</strong>embeds ${s.embedLabel}`;
    thumb.addEventListener('click', () => { current = i; renderSlide(); });
    rail.appendChild(thumb);
  });

  function tickFreshness() {
    const secs = Math.round((Date.now() - refreshedAt) / 1000);
    let label;
    if (secs < 5) {
      label = 'refreshed just now';
    } else if (secs < 60) {
      label = `refreshed ${secs}s ago`;
    } else if (secs < 3600) {
      const mins = Math.round(secs / 60);
      label = `refreshed ${mins}m ago`;
    } else {
      const hours = Math.round(secs / 3600);
      label = `refreshed ${hours}h ago`;
    }
    refreshedAtEl.textContent = label;
  }
  setInterval(tickFreshness, 3000);

  document.getElementById('dhRefreshBtn').addEventListener('click', () => {
    embedCard.classList.add('is-refreshing');
    setTimeout(() => {
      seedTick += 1;
      drawEmbed();
      refreshedAt = Date.now();
      tickFreshness();
      embedCard.classList.remove('is-refreshing');
    }, 650);
  });

  const dialog = document.getElementById('dhDialog');
  document.getElementById('dhScheduleBtn').addEventListener('click', () => dialog.classList.add('is-open'));
  document.getElementById('dhDialogClose').addEventListener('click', () => dialog.classList.remove('is-open'));

  renderSlide();

  /* ---------- Ribbon: tabs ---------- */
  const tabs = document.querySelectorAll('.dh-tab');
  const groups = document.querySelectorAll('.dh-group, .dh-group-divider');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const target = tab.dataset.tab;
      groups.forEach((g) => { g.hidden = g.dataset.group !== target; });
    });
  });

  /* ---------- Ribbon: Font group (bold/italic/underline) ---------- */
  document.querySelectorAll('.dh-mini[data-cmd]').forEach((btn) => {
    btn.addEventListener('mousedown', (e) => e.preventDefault()); // keep selection focused in the slide text
    btn.addEventListener('click', () => {
      document.execCommand(btn.dataset.cmd);
      btn.classList.toggle('is-active', document.queryCommandState(btn.dataset.cmd));
    });
  });

  /* ---------- Ribbon: Insert > Embed from app ---------- */
  document.getElementById('dhCycleEmbedBtn').addEventListener('click', () => {
    const activeSource = embedOverride || slides[current].embed;
    const idx = EMBED_ORDER.indexOf(activeSource);
    embedOverride = EMBED_ORDER[(idx + 1) % EMBED_ORDER.length];
    drawEmbed();
    refreshedAt = Date.now();
    tickFreshness();
  });

  /* ---------- Ribbon: Design > Theme swatches ---------- */
  document.querySelectorAll('.dh-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.dh-swatch').forEach((s) => s.classList.remove('is-active'));
      sw.classList.add('is-active');
      document.querySelector('.deckhand-shell').style.setProperty('--dh-accent', sw.dataset.accent);
    });
  });

  /* ---------- Scripted tour ---------- */
  const tourSteps = [
    { target: () => rail, text: 'Slides live in a rail, same as any deck tool. Click one to switch.' },
    { target: () => embedCard, text: 'This card isn’t a picture, it’s a live view pulled straight from another app in the platform.' },
    { target: () => document.getElementById('dhRefreshBtn'), text: 'Refresh re-queries every embed on the slide and drops in new numbers.' },
    { target: () => document.getElementById('dhScheduleBtn'), text: 'Schedule send ships a refreshed PDF on a recurring cadence (illustrative here, no real send).' },
  ];
  let tourStep = -1;
  let calloutEl = null;

  function placeCallout() {
    if (tourStep < 0) return;
    const step = tourSteps[tourStep];
    const target = step.target();
    if (!calloutEl) {
      calloutEl = document.createElement('div');
      calloutEl.className = 'dh-callout';
      calloutEl.style.position = 'fixed';
      document.body.appendChild(calloutEl);
    }
    calloutEl.innerHTML = `
      <span class="step">Step ${tourStep + 1} of ${tourSteps.length}</span>
      ${step.text}
      <div class="dh-callout-nav">
        <button data-act="prev" ${tourStep === 0 ? 'disabled' : ''}>Back</button>
        <button data-act="next">${tourStep === tourSteps.length - 1 ? 'Done' : 'Next'}</button>
      </div>`;
    const rect = target.getBoundingClientRect();
    const top = Math.max(12, Math.min(window.innerHeight - 160, rect.bottom + 10));
    const left = Math.max(12, Math.min(window.innerWidth - 260, rect.left));
    calloutEl.style.top = top + 'px';
    calloutEl.style.left = left + 'px';
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function endTour() {
    tourStep = -1;
    if (calloutEl) { calloutEl.remove(); calloutEl = null; }
  }

  document.body.addEventListener('click', (e) => {
    const act = e.target && e.target.dataset ? e.target.dataset.act : null;
    if (!act) return;
    if (act === 'next') {
      if (tourStep >= tourSteps.length - 1) { endTour(); return; }
      tourStep += 1; placeCallout();
    } else if (act === 'prev') {
      tourStep = Math.max(0, tourStep - 1); placeCallout();
    }
  });

  document.getElementById('dhTourBtn').addEventListener('click', () => { tourStep = 0; placeCallout(); });
  window.addEventListener('scroll', () => { if (tourStep >= 0) placeCallout(); }, { passive: true });
  window.addEventListener('resize', () => { if (tourStep >= 0) placeCallout(); });
}());
