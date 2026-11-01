// Rebuilds every metric and chart from data/raw-charts.json. Run `npm run rebuild` to refetch first.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { toSeries, rolling, leadLag, yoy } from './lib.mjs';

const raw = JSON.parse(readFileSync('data/raw-charts.json', 'utf8'));
const all = toSeries(raw.charts);
const s = all.filter(d => d.price > 0); // price history starts later than the chain
const last = s[s.length - 1];
const usageKeys = { active: 'Daily active accounts', txns: 'Daily transactions', newAcc: 'New accounts', feeNear: 'Fees burned/paid (NEAR)' };
const tests = [];
for (const [key, label] of Object.entries(usageKeys)) for (const k of [7, 30, 90]) {
  const ll = leadLag(s.map(d => d[key]), s.map(d => d.price), k);
  tests.push({ metric: key, label, horizonDays: k, sameWindow: ll.same, usageLeadsPrice: ll.usageLeads, priceLeadsUsage: ll.priceLeads });
}
const metrics = {
  source: raw.source, fetchedAt: raw.fetchedAt, firstPriceDay: s[0].date, lastDay: last.date, days: s.length,
  latest: last,
  yoy30dAvg: Object.fromEntries(['active', 'txns', 'newAcc', 'feeUsd', 'price'].map(k => [k, yoy(s, k)])),
  leadLagTests: tests,
  note: 'Pearson r on non-overlapping log changes. |r| < 0.2 is treated as no usable signal. Correlation is not causation.',
};
mkdirSync('docs', { recursive: true });
writeFileSync('data/metrics.json', JSON.stringify(metrics, null, 2));

const fmt = (x, d = 2) => x == null ? 'n/a' : Number(x).toFixed(d);
const pct = x => x == null ? 'n/a' : (x * 100).toFixed(1) + '%';
function chart(title, key, { log = false, win = 30 } = {}) {
  const ys = rolling(s.map(d => d[key]), win), W = 760, H = 200;
  const pts = ys.map((y, i) => [i, y]).filter(([, y]) => y > 0);
  const f = log ? Math.log10 : (x => x);
  const lo = Math.min(...pts.map(p => f(p[1]))), hi = Math.max(...pts.map(p => f(p[1])));
  const path = pts.map(([i, y], j) => `${j ? 'L' : 'M'}${(i / (s.length - 1) * W).toFixed(1)},${(H - (f(y) - lo) / (hi - lo || 1) * H).toFixed(1)}`).join('');
  return `<figure><figcaption>${title} (${win}-day average${log ? ', log scale' : ''}), ${s[0].date} to ${last.date}</figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></figure>`;
}
const rows = tests.map(t => `<tr><td>${t.label}</td><td>${t.horizonDays}d</td><td>${fmt(t.sameWindow.r)}</td><td>${fmt(t.usageLeadsPrice.r)}</td><td>${fmt(t.priceLeadsUsage.r)}</td><td>${t.usageLeadsPrice.n}</td></tr>`).join('');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NEAR Usage Thesis</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:820px;margin:2rem auto;padding:0 1rem}svg{width:100%;height:auto;color:#00a37a}figure{margin:1.5rem 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 6px;text-align:right}td:first-child,th:first-child{text-align:left}</style>
<h1>NEAR Usage Thesis</h1>
<p>Question: does real onchain usage on NEAR lead its token price? Every number here is rebuilt from the public NearBlocks daily history by <code>npm run rebuild</code>. Data last day: <b>${last.date}</b> (fetched ${raw.fetchedAt}). AI-run project, built at NEAR HACKATHON by Genie (an AI agent) for JC.</p>
<h2>Latest day</h2><ul><li>Price: $${fmt(last.price)}</li><li>Active accounts: ${last.active.toLocaleString('en')}</li><li>Transactions: ${last.txns.toLocaleString('en')}</li><li>Fees: $${fmt(last.feeUsd, 0)}</li></ul>
<h2>Year over year (30-day average vs one year earlier)</h2><ul>${Object.entries(metrics.yoy30dAvg).map(([k, v]) => `<li>${k}: ${pct(v)}</li>`).join('')}</ul>
${chart('NEAR price (USD)', 'price', { log: true })}${chart('Daily active accounts', 'active', { log: true })}${chart('Daily transactions', 'txns', { log: true })}${chart('Fees paid (USD)', 'feeUsd', { log: true })}
<h2>Lead-lag tests</h2><p>${metrics.note} "Usage leads" correlates a usage change with the <i>next</i> period's price change.</p>
<table><tr><th>Metric</th><th>Horizon</th><th>Same window r</th><th>Usage leads price r</th><th>Price leads usage r</th><th>n</th></tr>${rows}</table>
<p>Method and caveats: <a href="https://github.com/lisaaai200/near-usage-thesis/blob/main/THESIS.md">THESIS.md</a>. Raw data: <a href="metrics.json">metrics.json</a>.</p></html>`;
writeFileSync('docs/index.html', html);
writeFileSync('docs/metrics.json', JSON.stringify(metrics, null, 2));
console.log(`built ${s.length} days; last ${last.date}`);
for (const t of tests) console.log(t.metric, t.horizonDays, fmt(t.sameWindow.r), fmt(t.usageLeadsPrice.r), fmt(t.priceLeadsUsage.r), t.usageLeadsPrice.n);
console.log(metrics.yoy30dAvg);
