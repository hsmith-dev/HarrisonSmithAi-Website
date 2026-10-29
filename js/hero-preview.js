/* ============================================================
   Fills the hero's "stage" bezel with a tiny live-looking
   dashboard (stat tiles + sparkline) instead of a static image,
   same mock data system as the full platform page.
   ============================================================ */

(function () {
  'use strict';
  const M = window.MockData, C = window.Charts;
  const statRow = document.getElementById('heroStatRow');
  const sparkEl = document.getElementById('heroSpark');
  if (!statRow || !sparkEl || !M || !C) return;

  const data = M.pulseData(99);
  data.tiles.forEach((t) => {
    const up = t.delta.startsWith('+');
    const tile = document.createElement('div');
    tile.className = 'stat-tile';
    tile.innerHTML = `<div class="num">${t.value}</div><div class="lbl">${t.label}</div><div class="delta ${up ? 'up' : 'down'}">${t.delta}</div>`;
    statRow.appendChild(tile);
  });
  C.sparkline(sparkEl, data.series['30d'], { height: 90 });
}());
