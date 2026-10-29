/* ============================================================
   Config for the 14 non-Deckhand case studies: copy + a render()
   that builds that app's interactive widget into a container.
   All data from MockData; all charts from Charts. Nothing here
   is derived from or resembles any real company's product.
   ============================================================ */

(function (global) {
  'use strict';
  const M = global.MockData, C = global.Charts;

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  const APPS = [
    {
      id: 'pathway', name: 'Pathway', tag: 'Collections · Analytics',
      desc: 'Customer-journey analytics for a decline-recovery and outreach program: every attempt, message, and recovery outcome in one funnel.',
      bullets: ['Every decline-to-recovery step in one funnel', 'Hover any stage for what happens there', 'Built for BI, product, and support teams'],
      impact: 'Collections and support now share one view of every recovery attempt, instead of filing a ticket to ask what happened to a payment.',
      render(container) {
        const wrap = el('div');
        const chart = el('div');
        wrap.appendChild(chart);
        container.appendChild(wrap);
        C.funnel(chart, M.pathwayFunnel(42));
      },
    },
    {
      id: 'relay', name: 'Relay', tag: 'Internal tools · Prototype',
      desc: 'Internal prototype workplace chat (channels, threads, search, file sharing) piloting an alternative to our chat tool.',
      bullets: ['Channels, threads, and reactions', 'Full-text search across messages and files', 'Piloted internally before any wider rollout'],
      impact: 'A dozen people piloted this before any decision on a wider rollout, feedback that shaped what shipped next.',
      render(container) {
        const thread = M.relayThread(7);
        const mock = el('div', 'chat-mock');
        thread.forEach((m, i) => {
          const line = el('div', 'chat-line');
          const initials = m.who.split(' ').map((p) => p[0]).join('');
          line.innerHTML = `
            <div class="chat-avatar" style="background:${C.seriesColor(i)}">${initials}</div>
            <div>
              <div class="chat-who">${m.who} · ${m.when}</div>
              <div class="chat-body">${m.text}</div>
            </div>`;
          mock.appendChild(line);
        });
        container.appendChild(mock);
      },
    },
    {
      id: 'ledger-check', name: 'Ledger Check', tag: 'Finance',
      desc: 'Finds customers using a billable feature with no matching invoice line, by period, with CSV export.',
      bullets: ['Flags billing gaps before they reach Finance close', 'Payment-level detail behind every row', 'One-click export for the collections hand-off'],
      impact: 'Finance runs this at every close; it catches billing gaps days before they would otherwise surface in revenue.',
      render(container) {
        const rows = M.ledgerCheckRows(11);
        const table = el('table', 'mock-table');
        table.innerHTML = `<thead><tr><th>Account</th><th>Period</th><th>Expected line</th></tr></thead>`;
        const tbody = el('tbody');
        rows.forEach((r) => {
          const tr = el('tr');
          tr.innerHTML = `<td>${r.name}</td><td>${r.period}</td><td>${r.expected}</td>`;
          tr.title = r.note;
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);
        const btn = el('button', 'dh-btn', '<i class="ph-light ph-download-simple" aria-hidden="true"></i>Export CSV (demo)');
        btn.style.marginTop = '14px';
        btn.addEventListener('click', (e) => {
          btn.textContent = 'Exported, check your downloads (not really)';
          setTimeout(() => { btn.innerHTML = '<i class="ph-light ph-download-simple" aria-hidden="true"></i>Export CSV (demo)'; }, 1800);
        });
        container.appendChild(btn);
      },
    },
    {
      id: 'collect-iq', name: 'Collect IQ', tag: 'Collections · Performance',
      desc: 'Usage and performance reporting for a collections product: contact activity, cost vs. recovered revenue, before/after go-live impact.',
      bullets: ['Net revenue vs. cost, by week', 'Before/after comparison for every merchant’s own go-live date', 'Queue contact and promise-to-pay tracking'],
      impact: 'Collections leadership uses this as the source of truth for whether a new workflow change actually pays for itself.',
      render(container) {
        const data = M.collectIQData(5);
        const toggleRow = el('div', 'toggle-row');
        const toggle = el('div', 'toggle');
        toggle.innerHTML = '<span></span>';
        toggleRow.appendChild(toggle);
        const label = el('span', null, 'Show: <strong>Before go-live</strong>');
        toggleRow.appendChild(label);
        container.appendChild(toggleRow);
        const chartEl = el('div');
        container.appendChild(chartEl);
        let after = false;
        function draw() {
          const vals = after ? data.after : data.before;
          const bars = vals.map((v, i) => ({ label: 'W' + (i + 1), value: v }));
          C.barChart(chartEl, bars, { formatValue: (v) => '$' + v.toLocaleString() + ' recovered' });
        }
        toggle.addEventListener('click', () => {
          after = !after;
          toggle.classList.toggle('is-on', after);
          label.innerHTML = `Show: <strong>${after ? 'After go-live' : 'Before go-live'}</strong>`;
          draw();
        });
        draw();
      },
    },
    {
      id: 'pulse', name: 'Pulse', tag: 'Leadership · Ops', span: 'wide',
      desc: 'Company-wide ops and leadership dashboard: revenue, platform activity, onboarding trends, weekly ops.',
      bullets: ['One screen for the metrics leadership checks daily', 'Date-range toggle redraws every chart instantly', 'Links out to the detail dashboard for each metric'],
      impact: 'The first tab open in every Monday leadership meeting, replacing a dashboard that used to take most of a day to refresh.',
      preview(container) {
        C.sparkline(container, M.sparkline(21, { n: 14, base: 420, volatility: 26 }), { height: 64 });
      },
      render(container) {
        const data = M.pulseData(21);
        const statRow = el('div', 'stat-row');
        data.tiles.forEach((t) => {
          const up = t.delta.startsWith('+');
          statRow.appendChild(el('div', 'stat-tile', `<div class="num">${t.value}</div><div class="lbl">${t.label}</div><div class="delta ${up ? 'up' : 'down'}">${t.delta}</div>`));
        });
        container.appendChild(statRow);
        const chips = el('div', 'chip-row');
        ['7d', '30d', '90d'].forEach((k, i) => {
          const chip = el('button', 'chip' + (i === 0 ? ' is-active' : ''), k);
          chip.dataset.range = k;
          chips.appendChild(chip);
        });
        container.appendChild(chips);
        const sparkWrap = el('div');
        container.appendChild(sparkWrap);
        function draw(range) { C.sparkline(sparkWrap, data.series[range], { height: 70 }); }
        chips.addEventListener('click', (e) => {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          chips.querySelectorAll('.chip').forEach((c) => c.classList.remove('is-active'));
          chip.classList.add('is-active');
          draw(chip.dataset.range);
        });
        draw('7d');
      },
    },
    {
      id: 'growth-ledger', name: 'Growth Ledger', tag: 'Growth · Retention', span: 'wide',
      desc: 'Company-wide growth and retention scorecard: cohort heatmaps, retention, concentration, an underperforming-account watchlist.',
      bullets: ['Cohort retention heatmap, hover any cell for detail', 'Growth sources: new, returning, and churned accounts', 'Flags the watchlist before it shows up in revenue'],
      impact: 'Finance and leadership pull retention numbers straight from here now instead of waiting on a quarterly manual rollup.',
      preview(container) {
        const data = M.cohortHeatmap(33);
        C.heatmap(container, data.cohorts, data.months, data.matrix);
      },
      render(container) {
        const data = M.cohortHeatmap(33);
        const chart = el('div');
        container.appendChild(chart);
        C.heatmap(chart, data.cohorts, data.months, data.matrix);
      },
    },
    {
      id: 'customer-360', name: 'Customer 360', tag: 'CS · Intelligence',
      desc: 'Unified customer and collections intelligence hub, consolidating several legacy tools into one view.',
      bullets: ['One profile per account across support, billing, and collections', 'Click an account to see its recent touchpoints', 'Replaces tab-switching between four older tools'],
      impact: 'Support and CS now work from one profile per account instead of switching between four separate tools mid-call.',
      render(container) {
        const accounts = M.customer360Data(9);
        const list = el('div', 'chip-row');
        const detail = el('div', 'mini-panel');
        detail.style.marginTop = '14px';
        accounts.forEach((a, i) => {
          const chip = el('button', 'chip' + (i === 0 ? ' is-active' : ''), `${a.name} · ${a.healthScore}`);
          chip.addEventListener('click', () => {
            list.querySelectorAll('.chip').forEach((c) => c.classList.remove('is-active'));
            chip.classList.add('is-active');
            renderDetail(a);
          });
          list.appendChild(chip);
        });
        function renderDetail(a) {
          detail.innerHTML = `<p style="margin-bottom:10px;color:var(--text-dim);font-size:.9rem;">Health score <strong style="color:var(--text)">${a.healthScore}</strong></p>`;
          const ul = el('ul', null);
          a.touchpoints.forEach((t) => {
            ul.appendChild(el('li', null, `<strong>${t.type}</strong> · ${t.when}: ${t.note}`));
          });
          ul.style.display = 'flex'; ul.style.flexDirection = 'column'; ul.style.gap = '8px';
          ul.querySelectorAll('li').forEach((li) => { li.style.fontSize = '.86rem'; li.style.color = 'var(--text-dim)'; });
          detail.appendChild(ul);
        }
        container.appendChild(list);
        container.appendChild(detail);
        renderDetail(accounts[0]);
      },
    },
    {
      id: 'atlas', name: 'Atlas', tag: 'Data platform', span: 'big',
      desc: 'Visual map of the company’s data warehouse tables and join paths, cross-checked against the internal AI agent’s own knowledge of the data.',
      bullets: ['Click any table to trace its joins', 'Flags dead or deprecated tables and join traps', 'Keeps the AI agent’s own memory of the schema in sync'],
      impact: 'New analysts ramp on the warehouse in days instead of weeks, and it’s where the AI agent’s own join memory gets corrected.',
      preview(container) {
        const g = M.atlasGraph(1);
        C.nodeGraph(container, g.nodes, g.edges, { height: 220, labels: false });
      },
      render(container) {
        const g = M.atlasGraph(1);
        const chart = el('div');
        container.appendChild(chart);
        C.nodeGraph(chart, g.nodes, g.edges, { height: 260 });
      },
    },
    {
      id: 'merchant-lens', name: 'Merchant Lens', tag: 'Ops · CS · Sales',
      desc: 'Customer and account 360: lookup, locations, payments, messaging response times, collections, and waived-fee review.',
      bullets: ['Search any account by name', 'Payments, messaging, and collections in one lookup', 'Waived-fee review built in'],
      impact: 'Customer Success now lives in this daily for account lookups, replacing three separate internal tools.',
      render(container) {
        const accounts = M.merchantLensAccounts(3, 18);
        const search = el('input', 'mock-search');
        search.type = 'search'; search.placeholder = 'Search accounts…';
        container.appendChild(search);
        const table = el('table', 'mock-table');
        table.innerHTML = '<thead><tr><th>Account</th><th>Plan</th><th>Last payment</th><th>Status</th></tr></thead>';
        const tbody = el('tbody');
        table.appendChild(tbody);
        container.appendChild(table);
        function draw(filter) {
          tbody.innerHTML = '';
          accounts.filter((a) => a.name.toLowerCase().includes(filter.toLowerCase())).slice(0, 8).forEach((a) => {
            const tr = el('tr');
            const statusCls = a.status === 'Active' ? 'active' : 'past-due';
            tr.innerHTML = `<td>${a.name}</td><td>${a.plan}</td><td>${a.lastPayment}</td><td><span class="status-pill ${statusCls}">${a.status}</span></td>`;
            tbody.appendChild(tr);
          });
        }
        search.addEventListener('input', () => draw(search.value));
        draw('');
      },
    },
    {
      id: 'paytrace', name: 'Paytrace', tag: 'Payments · Analytics',
      desc: 'Payment outcome analytics by method and wallet type (success, decline, refund).',
      bullets: ['Outcome mix by payment method', 'Filter chips re-render the breakdown instantly', 'Wallet traffic broken out on its own'],
      impact: 'Product and risk use this to catch a declining payment method early, before it shows up as a support queue.',
      render(container) {
        const methods = M.paytraceData(14);
        const donutEl = el('div');
        container.appendChild(donutEl);
        C.donutChart(donutEl, methods.map((m, i) => ({ label: m.label, pct: m.pct, color: C.seriesColor(i) })));
        const chips = el('div', 'chip-row');
        chips.style.marginTop = '18px';
        methods.forEach((m, i) => {
          const chip = el('button', 'chip' + (i === 0 ? ' is-active' : ''), m.label);
          chip.dataset.key = m.key;
          chips.appendChild(chip);
        });
        container.appendChild(chips);
        const outcomeEl = el('div');
        container.appendChild(outcomeEl);
        function draw(key) {
          const outcomes = M.paytraceOutcomes(14, key);
          C.barChart(outcomeEl, outcomes.map((o, i) => ({ ...o, color: i === 0 ? 'var(--status-good)' : i === 1 ? 'var(--status-serious)' : 'var(--series-4)' })), { formatValue: (v) => v + '%' });
        }
        chips.addEventListener('click', (e) => {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          chips.querySelectorAll('.chip').forEach((c) => c.classList.remove('is-active'));
          chip.classList.add('is-active');
          draw(chip.dataset.key);
        });
        draw('card');
      },
    },
    {
      id: 'margin-line', name: 'Margin Line', tag: 'Finance · Risk',
      desc: 'Card-processing economics and margin analysis for Finance and Risk.',
      bullets: ['Margin by interchange category', 'Hover any bar for the exact rate', 'Flags classification drift day over day'],
      impact: 'Finance’s weekly margin review runs off this now instead of a hand-built spreadsheet rebuilt from scratch each time.',
      render(container) {
        const data = M.marginLineData(18);
        const chart = el('div');
        container.appendChild(chart);
        C.barChart(chart, data, { formatValue: (v) => v + '% margin' });
      },
    },
    {
      id: 'adoption-radar', name: 'Adoption Radar', tag: 'Product analytics',
      desc: 'Feature adoption and usage analytics across the product line.',
      bullets: ['Toggle features in and out of the comparison', 'Adoption percentage per feature, at a glance', 'Shared view for product and leadership'],
      impact: 'Product leadership checks this before every roadmap review to see what’s actually sticking, not just what shipped.',
      render(container) {
        const data = M.adoptionRadarData(26);
        const list = el('div', 'feature-list');
        data.forEach((f, i) => {
          const row = el('label', 'feature-row');
          row.innerHTML = `<input type="checkbox" checked data-i="${i}"><span>${f.label}</span>`;
          list.appendChild(row);
        });
        container.appendChild(list);
        const chart = el('div');
        container.appendChild(chart);
        function draw() {
          const active = data.filter((f) => f.on);
          C.barChart(chart, active.map((f) => ({ label: f.label.split(' ')[0], value: f.adoption })), { formatValue: (v) => v + '% adoption' });
        }
        list.addEventListener('change', (e) => {
          const i = Number(e.target.dataset.i);
          data[i].on = e.target.checked;
          draw();
        });
        draw();
      },
    },
    {
      id: 'source-book', name: 'Source Book', tag: 'BI meta-tooling',
      desc: 'Living documentation and a read-only inspector into every reporting app’s own source and logic. A catalogue of the catalogue.',
      bullets: ['Purpose, audience, and owner for every report', 'Read-only inspector into each app’s own source', 'Keeps documentation from drifting out of date'],
      impact: 'New engineers read this before touching a reporting app’s source, instead of asking around to find out who owns what.',
      render(container) {
        const docs = M.sourceBookDocs();
        const list = el('div', 'doc-list');
        const pane = el('div', 'doc-source', 'Select a doc to view its summary.');
        docs.forEach((d, i) => {
          const row = el('div', 'doc-row');
          row.innerHTML = `<span class="name">${d.name}</span><span class="meta">${d.owner} · updated ${d.updated}</span>`;
          row.addEventListener('click', () => {
            pane.textContent = `# ${d.name}\nowner: ${d.owner}\nupdated: ${d.updated}\npurpose: ${d.purpose}`;
          });
          list.appendChild(row);
        });
        container.appendChild(list);
        container.appendChild(pane);
      },
    },
    {
      id: 'pipeline', name: 'Pipeline', tag: 'Sales', span: 'wide',
      desc: 'Rep and manager sales dashboard: pipeline, win/loss, activity, commissions.',
      bullets: ['Reps see their own book; managers see everyone’s', 'Stage filters isolate exactly where deals are stuck', 'Commission statements pull from the same pipeline data'],
      impact: 'Sales managers run every forecast call from this now, replacing three separate spreadsheets reps used to keep updating by hand.',
      preview(container) {
        const board = M.pipelineBoard(3);
        const bars = board.map((col) => ({ label: col.stage.split(' ')[0], value: col.cards.reduce((s, c) => s + c.amount, 0) }));
        C.barChart(container, bars, { height: 90, formatValue: (v) => '$' + v.toLocaleString() });
      },
      render(container) {
        const board = M.pipelineBoard(3);
        const chips = el('div', 'chip-row');
        board.forEach((col, i) => {
          const chip = el('button', 'chip is-active', col.stage);
          chip.dataset.stage = col.stage;
          chips.appendChild(chip);
        });
        container.appendChild(chips);
        const kanban = el('div', 'kanban');
        container.appendChild(kanban);
        board.forEach((col) => {
          const colEl = el('div', 'kanban-col');
          colEl.dataset.stage = col.stage;
          colEl.innerHTML = `<h4>${col.stage}</h4>`;
          col.cards.forEach((c) => {
            colEl.appendChild(el('div', 'kanban-card', `<div class="acct">${c.account}</div><div class="amt">$${c.amount.toLocaleString()}</div><div class="rep">${c.rep}</div>`));
          });
          kanban.appendChild(colEl);
        });
        chips.addEventListener('click', (e) => {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          chip.classList.toggle('is-active');
          const colEl = kanban.querySelector(`[data-stage="${CSS.escape(chip.dataset.stage)}"]`);
          if (colEl) colEl.classList.toggle('is-hidden', !chip.classList.contains('is-active'));
        });
      },
    },
  ];

  global.PlatformApps = APPS;
}(window));
