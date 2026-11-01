import test from 'node:test';
import assert from 'node:assert/strict';
import { pearson, rolling, logChanges, leadLag, toSeries } from '../scripts/lib.mjs';
test('pearson perfect and inverse', () => {
  assert.ok(Math.abs(pearson([1,2,3,4,5,6,7,8,9,10],[2,4,6,8,10,12,14,16,18,20]).r - 1) < 1e-12);
  assert.ok(Math.abs(pearson([1,2,3,4,5,6,7,8,9,10],[10,9,8,7,6,5,4,3,2,1]).r + 1) < 1e-12);
});
test('pearson needs 10 points', () => assert.equal(pearson([1,2],[1,2]).r, null));
test('rolling mean', () => assert.deepEqual(rolling([1,2,3,4], 2), [null, 1.5, 2.5, 3.5]));
test('logChanges non-overlapping', () => assert.deepEqual(logChanges([1, 2, 4, 8, 16], 2).map(x => +x.toFixed(6)), [+Math.log(4).toFixed(6), +Math.log(4).toFixed(6)]));
test('leadLag detects a planted one-period lead', () => {
  const u = [], p = []; let a = 100, b = 100; const shocks = [];
  for (let i = 0; i < 400; i++) shocks.push(Math.sin(i * 1.7) * 0.1);
  for (let i = 0; i < 400; i++) { a *= Math.exp(shocks[i]); b *= Math.exp(i ? shocks[i - 1] : 0); u.push(a); p.push(b); }
  assert.ok(leadLag(u, p, 1).usageLeads.r > 0.99);
});
test('toSeries converts yocto and sorts', () => {
  const s = toSeries([{ date: '2026-01-02T00:00:00.000Z', near_price: '2', txns: '1', active_accounts: '1', new_accounts: '1', active_contracts: '1', txn_fee: '1000000000000000000000000', txn_fee_usd: '2', txn_volume_usd: '0', total_supply: '0' },
                      { date: '2026-01-01T00:00:00.000Z', near_price: '1', txns: '1', active_accounts: '1', new_accounts: '1', active_contracts: '1', txn_fee: '0', txn_fee_usd: '0', txn_volume_usd: '0', total_supply: '0' }]);
  assert.equal(s[0].date, '2026-01-01'); assert.equal(s[1].feeNear, 1);
});
