import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateZakat, type ZakatValues } from '../lib/zakat';

const base: ZakatValues = {
  cash: 5000,
  goldSilver: 3000,
  investments: 2000,
  business: 1000,
  receivables: 500,
  debts: 1500,
};

test('calculates 2.5% when net assets meet nisab', () => {
  assert.deepEqual(calculateZakat(base, 8000), {
    assets: 11500,
    net: 10000,
    eligible: true,
    zakat: 250,
  });
});

test('returns zero when nisab is missing or not met', () => {
  assert.equal(calculateZakat(base, 0).zakat, 0);
  assert.equal(calculateZakat(base, 12000).zakat, 0);
});

test('never produces a negative net amount', () => {
  const result = calculateZakat({ ...base, debts: 20000 }, 1);
  assert.equal(result.net, 0);
  assert.equal(result.zakat, 0);
});
