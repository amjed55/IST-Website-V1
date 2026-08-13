'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { links } from '@/lib/content';

const fields = [
  ['cash', 'cash'],
  ['goldSilver', 'metals'],
  ['investments', 'investments'],
  ['business', 'business'],
  ['receivables', 'receivables'],
  ['debts', 'debts'],
] as const;

function money(value: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function ZakatCalculator() {
  const t = useTranslations('Zakat');
  const [values, setValues] = useState<Record<(typeof fields)[number][0], number>>({
    cash: 0,
    goldSilver: 0,
    investments: 0,
    business: 0,
    receivables: 0,
    debts: 0,
  });
  const [nisab, setNisab] = useState(0);

  const result = useMemo(() => {
    const assets =
      values.cash +
      values.goldSilver +
      values.investments +
      values.business +
      values.receivables;
    const net = Math.max(0, assets - values.debts);
    const eligible = nisab > 0 && net >= nisab;
    return { assets, net, eligible, zakat: eligible ? net * 0.025 : 0 };
  }, [nisab, values]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-4 rounded-3xl border border-ist-green/10 bg-white p-5 shadow-soft sm:grid-cols-2 sm:p-7">
        {fields.map(([key, label]) => (
          <label key={key} className="text-sm text-ist-ink/75">
            <span className="mb-1.5 block font-medium text-ist-green">{t(label)}</span>
            <span className="relative block">
              <span className="pointer-events-none absolute left-4 top-3 text-ist-muted">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={values[key] || ''}
                onChange={(event) =>
                  setValues({ ...values, [key]: Math.max(0, Number(event.target.value) || 0) })
                }
                className="w-full rounded-2xl border border-ist-green/15 bg-ist-cream/40 py-3 pl-8 pr-4 outline-none transition focus:border-ist-teal focus:ring-2 focus:ring-ist-teal/20"
              />
            </span>
          </label>
        ))}
        <label className="text-sm text-ist-ink/75 sm:col-span-2">
          <span className="mb-1.5 block font-medium text-ist-green">
            {t('nisab')}
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={nisab || ''}
            onChange={(event) => setNisab(Math.max(0, Number(event.target.value) || 0))}
            placeholder={t('nisabPlaceholder')}
            className="w-full rounded-2xl border border-ist-green/15 bg-ist-cream/40 px-4 py-3 outline-none transition focus:border-ist-teal focus:ring-2 focus:ring-ist-teal/20"
          />
        </label>
      </div>

      <aside className="rounded-3xl bg-ist-green p-6 text-white shadow-lift sm:p-8" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ist-teal-light">
          {t('estimate')}
        </p>
        <dl className="mt-6 space-y-4">
          <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
            <dt className="text-white/65">{t('totalAssets')}</dt>
            <dd className="font-semibold">{money(result.assets)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
            <dt className="text-white/65">{t('net')}</dt>
            <dd className="font-semibold">{money(result.net)}</dd>
          </div>
          <div>
            <dt className="text-white/65">{t('estimated')}</dt>
            <dd className="mt-2 font-display text-5xl text-ist-gold">{money(result.zakat)}</dd>
          </div>
        </dl>
        <p className="mt-5 text-sm leading-relaxed text-white/65">
          {!nisab
            ? t('enterNisab')
            : result.eligible
              ? t('eligible')
              : t('below')}
        </p>
        <a
          href={links.donate}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-full bg-ist-gold px-5 py-2.5 text-sm font-semibold text-ist-green-deep transition hover:-translate-y-0.5 hover:brightness-105"
        >
          {t('donate')}
        </a>
      </aside>
    </div>
  );
}
