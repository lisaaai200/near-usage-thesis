// Pure analysis helpers. Every number in the dashboard comes from these functions.
const YOCTO = 1e24;
export function toSeries(charts) {
  return charts
    .map(c => ({
      date: c.date.slice(0, 10),
      price: Number(c.near_price),
      txns: Number(c.txns),
      active: Number(c.active_accounts),
      newAcc: Number(c.new_accounts),
      activeContracts: Number(c.active_contracts),
      feeNear: Number(c.txn_fee) / YOCTO,
      feeUsd: Number(c.txn_fee_usd),
      volUsd: Number(c.txn_volume_usd),
      supply: Number(c.total_supply) / YOCTO,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function rolling(xs, n) {
  const out = []; let s = 0;
  xs.forEach((x, i) => { s += x; if (i >= n) s -= xs[i - n]; out.push(i >= n - 1 ? s / n : null); });
  return out;
}
export function pearson(a, b) {
  const p = a.map((x, i) => [x, b[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const n = p.length; if (n < 10) return { r: null, n };
  const mx = p.reduce((s, [x]) => s + x, 0) / n, my = p.reduce((s, [, y]) => s + y, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of p) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
  return { r: sxx && syy ? sxy / Math.sqrt(sxx * syy) : null, n };
}
// log change over k days, sampled every k days (non-overlapping) to avoid fake significance
export function logChanges(xs, k) {
  const out = [];
  for (let i = k; i < xs.length; i += k) out.push(xs[i] > 0 && xs[i - k] > 0 ? Math.log(xs[i] / xs[i - k]) : NaN);
  return out;
}
// does a k-day usage change predict the NEXT k-day price change?
export function leadLag(usage, price, k) {
  const u = logChanges(usage, k), p = logChanges(price, k);
  return { same: pearson(u, p), usageLeads: pearson(u.slice(0, -1), p.slice(1)), priceLeads: pearson(p.slice(0, -1), u.slice(1)) };
}
export function yoy(series, key, days = 365, win = 30) {
  const v = rolling(series.map(d => d[key]), win);
  const a = v[v.length - 1], b = v[v.length - 1 - days];
  return a && b ? a / b - 1 : null;
}
