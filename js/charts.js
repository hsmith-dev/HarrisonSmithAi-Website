/* ============================================================
   Tiny chart primitives shared by every case study.
   Plain SVG + DOM, no library, CSS vars for color (see
   css/platform.css :root --series-* / --status-*).
   Mark specs follow the dataviz skill: thin lines, rounded
   data-ends, a hover layer, legends for 2+ series.
   ============================================================ */

(function (global) {
  'use strict';

  const SERIES = ['--series-1', '--series-2', '--series-3', '--series-4', '--series-5', '--series-6', '--series-7', '--series-8'];

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function seriesColor(i) { return cssVar(SERIES[i % SERIES.length]); }

  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach((k) => el.setAttribute(k, attrs[k]));
    return el;
  }

  // ---------- shared tooltip ----------
  let tipEl = null;
  function tip() {
    if (tipEl) return tipEl;
    tipEl = document.createElement('div');
    tipEl.className = 'viz-tooltip';
    tipEl.setAttribute('role', 'status');
    tipEl.hidden = true;
    document.body.appendChild(tipEl);
    return tipEl;
  }
  function showTip(x, y, html) {
    const t = tip();
    t.innerHTML = html;
    t.style.left = x + 'px';
    t.style.top = y + 'px';
    t.hidden = false;
  }
  function hideTip() { if (tipEl) tipEl.hidden = true; }

  // ============================================================
  // Sparkline: thin line, rounded end-cap, last value labeled
  // ============================================================
  function sparkline(container, data, opts) {
    const o = opts || {};
    const w = o.width || container.clientWidth || 280;
    const h = o.height || 64;
    container.innerHTML = '';
    const svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, class: 'viz-sparkline', 'aria-hidden': 'true' });
    const max = Math.max(...data), min = Math.min(...data);
    const pad = 6;
    const x = (i) => pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = (v) => h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
    let d = '';
    data.forEach((v, i) => { d += (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(v).toFixed(1) + ' '; });
    svg.appendChild(svgEl('path', { d, fill: 'none', stroke: o.color || seriesColor(0), 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('circle', { cx: x(data.length - 1), cy: y(data[data.length - 1]), r: 3.5, fill: o.color || seriesColor(0) }));
    container.appendChild(svg);
  }

  // ============================================================
  // Bar chart: vertical bars, rounded top, hover tooltip
  // ============================================================
  function barChart(container, data, opts) {
    const o = opts || {};
    const w = o.width || container.clientWidth || 360;
    const h = o.height || 180;
    const padL = 8, padB = 22, padT = 14;
    container.innerHTML = '';
    const svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, class: 'viz-bars' });
    const max = Math.max(...data.map((d) => d.value)) * 1.15;
    const bw = (w - padL * 2) / data.length;
    data.forEach((d, i) => {
      const barH = Math.max(2, ((h - padB - padT) * d.value) / max);
      const x = padL + i * bw + bw * 0.18;
      const bw2 = bw * 0.64;
      const y = h - padB - barH;
      const rect = svgEl('rect', {
        x, y, width: bw2, height: barH, rx: 4,
        fill: d.color || seriesColor(i), class: 'viz-bar',
      });
      rect.addEventListener('mouseenter', (e) => showTip(e.clientX + 12, e.clientY - 10, `<strong>${d.label}</strong><br>${o.formatValue ? o.formatValue(d.value) : d.value}`));
      rect.addEventListener('mousemove', (e) => showTip(e.clientX + 12, e.clientY - 10, `<strong>${d.label}</strong><br>${o.formatValue ? o.formatValue(d.value) : d.value}`));
      rect.addEventListener('mouseleave', hideTip);
      svg.appendChild(rect);
      const label = svgEl('text', { x: x + bw2 / 2, y: h - 6, class: 'viz-axis-label', 'text-anchor': 'middle' });
      label.textContent = d.label;
      svg.appendChild(label);
    });
    container.appendChild(svg);
  }

  // ============================================================
  // Donut chart: identity encoding + legend + direct labels
  // ============================================================
  function donutChart(container, data, opts) {
    const o = opts || {};
    const size = o.size || 160;
    const r = size / 2 - 10, cx = size / 2, cy = size / 2, thickness = o.thickness || 22;
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'viz-donut-wrap';
    const svg = svgEl('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, class: 'viz-donut' });
    let angle = -90;
    data.forEach((d, i) => {
      const slice = (d.pct / 100) * 360;
      const large = slice > 180 ? 1 : 0;
      const a0 = (angle * Math.PI) / 180, a1 = ((angle + slice) * Math.PI) / 180;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const path = svgEl('path', {
        d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`,
        fill: 'none', stroke: d.color || seriesColor(i), 'stroke-width': thickness, class: 'viz-donut-slice',
      });
      path.addEventListener('mouseenter', (e) => showTip(e.clientX + 12, e.clientY - 10, `<strong>${d.label}</strong><br>${d.pct}%`));
      path.addEventListener('mousemove', (e) => showTip(e.clientX + 12, e.clientY - 10, `<strong>${d.label}</strong><br>${d.pct}%`));
      path.addEventListener('mouseleave', hideTip);
      svg.appendChild(path);
      angle += slice;
    });
    wrap.appendChild(svg);
    const legend = document.createElement('ul');
    legend.className = 'viz-legend';
    data.forEach((d, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="viz-legend-dot" style="background:${d.color || seriesColor(i)}"></span>${d.label} <span class="viz-legend-pct">${d.pct}%</span>`;
      legend.appendChild(li);
    });
    wrap.appendChild(legend);
    container.appendChild(wrap);
  }

  // ============================================================
  // Funnel: horizontal stacked bars, hover reveals stage detail
  // ============================================================
  function funnel(container, stages, opts) {
    const o = opts || {};
    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'viz-funnel';
    const max = stages[0].count;
    stages.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'viz-funnel-row';
      const pct = Math.max(6, (100 * s.count) / max);
      row.innerHTML = `
        <div class="viz-funnel-label">${s.label}</div>
        <div class="viz-funnel-track">
          <div class="viz-funnel-fill" style="width:${pct}%; background:${seriesColor(i)}"></div>
        </div>
        <div class="viz-funnel-value">${s.count.toLocaleString()}</div>
      `;
      row.addEventListener('mouseenter', (e) => showTip(e.clientX + 12, e.clientY - 10, `<strong>${s.label}</strong><br>${s.detail}`));
      row.addEventListener('mousemove', (e) => showTip(e.clientX + 12, e.clientY - 10, `<strong>${s.label}</strong><br>${s.detail}`));
      row.addEventListener('mouseleave', hideTip);
      list.appendChild(row);
    });
    container.appendChild(list);
  }

  // ============================================================
  // Heatmap: sequential one-hue ramp, hover tooltip per cell
  // ============================================================
  function heatmap(container, rows, cols, matrix, opts) {
    const o = opts || {};
    container.innerHTML = '';
    const table = document.createElement('div');
    table.className = 'viz-heatmap';
    table.style.gridTemplateColumns = `88px repeat(${cols}, 1fr)`;
    table.appendChild(document.createElement('div'));
    for (let c = 0; c < cols; c++) {
      const h = document.createElement('div');
      h.className = 'viz-heatmap-colhead';
      h.textContent = 'M' + c;
      table.appendChild(h);
    }
    rows.forEach((rowLabel, ri) => {
      const rh = document.createElement('div');
      rh.className = 'viz-heatmap-rowhead';
      rh.textContent = rowLabel;
      table.appendChild(rh);
      matrix[ri].forEach((v) => {
        const cell = document.createElement('div');
        cell.className = 'viz-heatmap-cell';
        if (v === null) {
          cell.classList.add('is-empty');
        } else {
          const t = Math.max(0, Math.min(1, v / 100));
          cell.style.background = `color-mix(in oklab, var(--seq-hue) ${Math.round(t * 85 + 10)}%, var(--core-2))`;
          cell.textContent = v + '%';
          cell.addEventListener('mouseenter', (e) => showTip(e.clientX + 12, e.clientY - 10, `<strong>${rowLabel} cohort</strong><br>${v}% retained`));
          cell.addEventListener('mousemove', (e) => showTip(e.clientX + 12, e.clientY - 10, `<strong>${rowLabel} cohort</strong><br>${v}% retained`));
          cell.addEventListener('mouseleave', hideTip);
        }
        table.appendChild(cell);
      });
    });
    container.appendChild(table);
  }

  // ============================================================
  // Node graph: fixed circular layout, click highlights edges
  // ============================================================
  function nodeGraph(container, nodes, edges, opts) {
    const o = opts || {};
    const w = o.width || container.clientWidth || 360;
    const h = o.height || 300;
    const showLabels = o.labels !== false;
    const pad = showLabels ? 48 : 22;
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - pad;
    container.innerHTML = '';
    const svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, class: 'viz-graph' });
    const pos = {};
    nodes.forEach((n, i) => {
      const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      pos[n.id] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
    const edgeEls = edges.map(([a, b]) => {
      const line = svgEl('line', {
        x1: pos[a].x, y1: pos[a].y, x2: pos[b].x, y2: pos[b].y,
        class: 'viz-graph-edge', 'data-a': a, 'data-b': b,
      });
      svg.appendChild(line);
      return line;
    });
    nodes.forEach((n) => {
      const g = svgEl('g', { class: 'viz-graph-node', tabindex: '0', role: 'button', 'aria-label': 'table ' + n.label });
      const c = svgEl('circle', { cx: pos[n.id].x, cy: pos[n.id].y, r: showLabels ? 9 : 7, fill: seriesColor(nodes.indexOf(n) % 8) });
      g.appendChild(c);
      if (showLabels) {
        const label = svgEl('text', { x: pos[n.id].x, y: pos[n.id].y + 22, class: 'viz-graph-label', 'text-anchor': 'middle' });
        label.textContent = n.label;
        g.appendChild(label);
      }
      const activate = () => {
        edgeEls.forEach((el) => {
          const on = el.getAttribute('data-a') === n.id || el.getAttribute('data-b') === n.id;
          el.classList.toggle('is-active', on);
        });
      };
      g.addEventListener('click', activate);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
      g.addEventListener('mouseenter', (e) => showTip(e.clientX + 12, e.clientY - 10, `<strong>${n.label}</strong><br>click to trace its joins`));
      g.addEventListener('mouseleave', hideTip);
      svg.appendChild(g);
    });
    container.appendChild(svg);
  }

  global.Charts = { sparkline, barChart, donutChart, funnel, heatmap, nodeGraph, seriesColor, showTip, hideTip };
}(window));
