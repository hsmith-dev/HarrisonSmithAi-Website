/* ============================================================
   Mock data for the Reporting Platform case studies.
   Everything here is invented: no real company, product, table,
   or customer name. Seeded so the page looks the same on every
   load; "refresh" actions below mix in Math.random() on purpose,
   to simulate a live re-query.
   ============================================================ */

(function (global) {
  'use strict';

  // ---------- seeded RNG (mulberry32) ----------
  function makeRng(seed) {
    let a = seed >>> 0;
    return function rng() {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function int(rng, min, max) { return Math.floor(min + rng() * (max - min + 1)); }
  function float(rng, min, max, digits) {
    const v = min + rng() * (max - min);
    return digits === undefined ? v : Number(v.toFixed(digits));
  }

  const FIRST = ['Mara', 'Dev', 'Tola', 'Quinn', 'Ines', 'Rafe', 'Sana', 'Oliver', 'Priya', 'Lucas', 'Noor', 'Wes', 'Yuki', 'Camille', 'Theo', 'Beza'];
  const LAST = ['Okafor', 'Lindqvist', 'Marchetti', 'Haddad', 'Novak', 'Reyes', 'Brennan', 'Suzuki', 'Patel', 'Larsson', 'Mbeki', 'Castillo', 'Fournier', 'Krantz'];
  const BIZ_NOUN = ['Harbor', 'Granite', 'Cedarline', 'Westbrook', 'Palmetto', 'Rivergate', 'Foxglove', 'Amberfield', 'Northwind', 'Coral Bay', 'Mapleton', 'Driftwood', 'Sierra', 'Millhouse'];
  const BIZ_KIND = ['Market', 'Studio', 'Supply Co.', 'Clinic', 'Garage', 'Bakery', 'Fitness', 'Outfitters', 'Salon', 'Hardware', 'Grill', 'Logistics', 'Dental Group', 'Press'];

  function fakeName(rng) { return `${pick(rng, FIRST)} ${pick(rng, LAST)}`; }
  function fakeBiz(rng) { return `${pick(rng, BIZ_NOUN)} ${pick(rng, BIZ_KIND)}`; }

  function uniqueNames(rng, n, genFn) {
    const seen = new Set(); const out = [];
    let guard = 0;
    while (out.length < n && guard < n * 20) {
      guard++;
      const name = genFn(rng);
      if (!seen.has(name)) { seen.add(name); out.push(name); }
    }
    return out;
  }

  // ---------- shared data shapes ----------

  function timeSeries(rng, n, base, volatility, drift) {
    const out = []; let v = base;
    for (let i = 0; i < n; i++) {
      v = Math.max(0, v + (rng() - 0.45 + (drift || 0)) * volatility);
      out.push(Number(v.toFixed(1)));
    }
    return out;
  }

  function sparkline(seed, opts) {
    const rng = makeRng(seed);
    const o = opts || {};
    return timeSeries(rng, o.n || 14, o.base || 100, o.volatility || 8, o.drift || 0.15);
  }

  // ---------- Pulse: company-wide ops stat tiles + sparkline ----------
  function pulseData(seed) {
    const rng = makeRng(seed);
    const ranges = { '7d': 7, '30d': 30, '90d': 90 };
    const series = {};
    Object.keys(ranges).forEach((k) => {
      series[k] = sparkline(seed + ranges[k], { n: ranges[k], base: 420, volatility: 26, drift: 0.2 });
    });
    return {
      tiles: [
        { label: 'Active accounts', value: int(rng, 3100, 3400).toLocaleString(), delta: '+' + float(rng, 1.2, 4.8, 1) + '%' },
        { label: 'Processing volume', value: '$' + float(rng, 18.2, 24.6, 1) + 'M', delta: '+' + float(rng, 0.4, 3.1, 1) + '%' },
        { label: 'Onboarding this week', value: int(rng, 24, 61), delta: '-' + float(rng, 1.0, 6.0, 1) + '%' },
      ],
      series,
    };
  }

  // ---------- Pathway: decline-recovery funnel ----------
  function pathwayFunnel(seed) {
    const rng = makeRng(seed);
    const base = int(rng, 8200, 9600);
    const stages = [
      { key: 'contacted', label: 'Contacted', detail: 'Decline detected, outreach sent within 2 hours.' },
      { key: 'responded', label: 'Responded', detail: 'Customer opened a text or picked up a call.' },
      { key: 'promised', label: 'Promise to pay', detail: 'Customer committed to a retry date.' },
      { key: 'retried', label: 'Retry attempted', detail: 'A new charge attempt was made on the promised date.' },
      { key: 'recovered', label: 'Recovered', detail: 'Payment succeeded and the balance cleared.' },
    ];
    let v = base;
    return stages.map((s, i) => {
      if (i > 0) v = Math.round(v * float(rng, 0.58, 0.82, 2));
      return { ...s, count: v };
    });
  }

  // ---------- Collect IQ: before / after go-live ----------
  function collectIQData(seed) {
    const rng = makeRng(seed);
    const weeks = 10;
    const before = timeSeries(makeRng(seed), weeks, 38, 5, -0.05).map((v) => Math.round(v * 100));
    const after = timeSeries(makeRng(seed + 1), weeks, 61, 6, 0.1).map((v) => Math.round(v * 100));
    return { weeks, before, after };
  }

  // ---------- Growth Ledger: cohort retention heatmap ----------
  function cohortHeatmap(seed) {
    const rng = makeRng(seed);
    const cohorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const months = 6;
    const matrix = cohorts.map((c, ci) => {
      const row = [];
      let retention = 100;
      for (let m = 0; m < months; m++) {
        if (m === 0) { row.push(100); continue; }
        if (m > months - 1 - ci) { row.push(null); continue; }
        retention = Math.max(28, retention - float(rng, 4, 11, 1));
        row.push(Number(retention.toFixed(0)));
      }
      return row;
    });
    return { cohorts, months, matrix };
  }

  // ---------- Atlas: fictional warehouse table map ----------
  function atlasGraph(seed) {
    const nodes = [
      { id: 'accounts', label: 'accounts', group: 'core' },
      { id: 'payments', label: 'payments', group: 'core' },
      { id: 'invoices', label: 'invoices', group: 'billing' },
      { id: 'subscriptions', label: 'subscriptions', group: 'billing' },
      { id: 'support_tickets', label: 'support_tickets', group: 'cs' },
      { id: 'outreach_events', label: 'outreach_events', group: 'collections' },
      { id: 'risk_flags', label: 'risk_flags', group: 'risk' },
      { id: 'feature_usage', label: 'feature_usage', group: 'product' },
    ];
    const edges = [
      ['accounts', 'payments'], ['accounts', 'invoices'], ['accounts', 'subscriptions'],
      ['payments', 'risk_flags'], ['accounts', 'support_tickets'], ['accounts', 'outreach_events'],
      ['payments', 'outreach_events'], ['accounts', 'feature_usage'], ['subscriptions', 'feature_usage'],
    ];
    return { nodes, edges };
  }

  // ---------- Merchant Lens: account directory ----------
  function merchantLensAccounts(seed, n) {
    const rng = makeRng(seed);
    const names = uniqueNames(rng, n || 24, fakeBiz);
    const plans = ['Standard', 'Growth', 'Growth', 'Enterprise'];
    const statuses = ['Active', 'Active', 'Active', 'Past due'];
    return names.map((name) => ({
      name,
      plan: pick(rng, plans),
      lastPayment: `${int(rng, 1, 28)} days ago`,
      status: pick(rng, statuses),
      contact: fakeName(rng),
    }));
  }

  // ---------- Paytrace: outcomes by method ----------
  function paytraceData(seed) {
    const rng = makeRng(seed);
    const methods = [
      { key: 'card', label: 'Card', value: int(rng, 54, 62) },
      { key: 'ach', label: 'ACH', value: int(rng, 18, 24) },
      { key: 'wallet', label: 'Wallet', value: int(rng, 10, 16) },
      { key: 'other', label: 'Other', value: int(rng, 3, 7) },
    ];
    const total = methods.reduce((s, m) => s + m.value, 0);
    methods.forEach((m) => { m.pct = Number((100 * m.value / total).toFixed(1)); });
    return methods;
  }

  // ---------- Paytrace: outcome breakdown for one method ----------
  function paytraceOutcomes(seed, methodKey) {
    const rng = makeRng(seed + methodKey.length * 97);
    const successBase = { card: 91, ach: 86, wallet: 94, other: 80 }[methodKey] || 85;
    const success = float(rng, successBase - 3, successBase + 2, 1);
    const decline = float(rng, 3, (100 - success) * 0.7, 1);
    const refund = Number((100 - success - decline).toFixed(1));
    return [
      { label: 'Success', value: success },
      { label: 'Decline', value: decline },
      { label: 'Refund', value: Math.max(0.2, refund) },
    ];
  }

  // ---------- Margin Line: processing economics ----------
  function marginLineData(seed) {
    const rng = makeRng(seed);
    const cats = ['Qualified', 'Mid-qualified', 'Non-qualified', 'Rewards', 'Debit', 'ACH'];
    return cats.map((label) => ({ label, value: float(rng, 1.4, 3.2, 2) }));
  }

  // ---------- Adoption Radar: feature usage ----------
  function adoptionRadarData(seed) {
    const rng = makeRng(seed);
    const features = ['Autopay retry', 'Embedded lending', 'Collections texting', 'ACH collection', 'Usage-based pricing', 'Self-serve onboarding'];
    return features.map((label) => ({ label, adoption: int(rng, 22, 86), on: true }));
  }

  // ---------- Pipeline: sales kanban ----------
  function pipelineBoard(seed) {
    const rng = makeRng(seed);
    const stages = ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed won'];
    const reps = ['M. Okafor', 'D. Lindqvist', 'T. Marchetti', 'Q. Haddad'];
    return stages.map((stage) => ({
      stage,
      cards: Array.from({ length: int(rng, 2, 5) }, () => ({
        account: fakeBiz(rng),
        amount: int(rng, 4, 48) * 500,
        rep: pick(rng, reps),
      })),
    }));
  }

  // ---------- Customer 360: summary + drill-down ----------
  function customer360Data(seed) {
    const rng = makeRng(seed);
    const accounts = uniqueNames(rng, 6, fakeBiz);
    return accounts.map((name) => ({
      name,
      healthScore: int(rng, 52, 97),
      touchpoints: Array.from({ length: int(rng, 2, 4) }, () => ({
        type: pick(rng, ['Support ticket', 'Collections text', 'Payment retry', 'CS call']),
        when: `${int(rng, 1, 30)}d ago`,
        note: pick(rng, ['Resolved, no follow-up needed.', 'Escalated to account manager.', 'Customer requested a plan change.', 'Payment succeeded on retry.']),
      })),
    }));
  }

  // ---------- Source Book: doc catalogue ----------
  function sourceBookDocs() {
    return [
      { name: 'Pulse', owner: 'You', updated: '2 days ago', purpose: 'Company-wide ops and leadership dashboard.' },
      { name: 'Paytrace', owner: 'You', updated: '6 days ago', purpose: 'Payment outcome analytics by method and wallet.' },
      { name: 'Collect IQ', owner: 'You', updated: '1 week ago', purpose: 'Collections usage and before/after go-live impact.' },
      { name: 'Pipeline', owner: 'You', updated: '3 weeks ago', purpose: 'Sales pipeline, win/loss, and commissions.' },
    ];
  }

  // ---------- Ledger Check: billing gap table ----------
  function ledgerCheckRows(seed) {
    const rng = makeRng(seed);
    const names = uniqueNames(rng, 7, fakeBiz);
    return names.map((name) => ({
      name,
      period: pick(rng, ['Mar 2026', 'Apr 2026', 'May 2026']),
      expected: '$' + int(rng, 180, 2400),
      note: 'No matching invoice line found for this period.',
    }));
  }

  // ---------- Relay: chat mock ----------
  function relayThread(seed) {
    const rng = makeRng(seed);
    const people = uniqueNames(rng, 4, fakeName);
    const lines = [
      'Pushed the weekly numbers to #ops-review, can someone sanity check the onboarding count?',
      'Looks right to me, matches what I saw this morning.',
      'Thanks, scheduling the recap deck to send at 9am Friday.',
      'Can we add the retry-rate chart to that one too?',
    ];
    return people.map((p, i) => {
      const hour24 = 9 + i;
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
      const ampm = hour24 >= 12 ? 'pm' : 'am';
      return { who: p, text: lines[i % lines.length], when: `${hour12}:0${i}${ampm}` };
    });
  }

  global.MockData = {
    makeRng, pick, int, float, uniqueNames, fakeName, fakeBiz, sparkline, timeSeries,
    pulseData, pathwayFunnel, collectIQData, cohortHeatmap, atlasGraph, merchantLensAccounts,
    paytraceData, paytraceOutcomes, marginLineData, adoptionRadarData, pipelineBoard, customer360Data,
    sourceBookDocs, ledgerCheckRows, relayThread,
  };
}(window));
