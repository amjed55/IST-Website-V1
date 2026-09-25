export type ZakatValues = {
  cash: number;
  goldSilver: number;
  investments: number;
  business: number;
  receivables: number;
  debts: number;
};

export function calculateZakat(values: ZakatValues, nisab: number) {
  const assets =
    values.cash +
    values.goldSilver +
    values.investments +
    values.business +
    values.receivables;
  const net = Math.max(0, assets - values.debts);
  const eligible = nisab > 0 && net >= nisab;
  return { assets, net, eligible, zakat: eligible ? net * 0.025 : 0 };
}
