import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { ZakatCalculator } from '@/components/ZakatCalculator';
import { images } from '@/lib/images';

export const metadata: Metadata = {
  title: 'Zakat Calculator',
  description:
    'Estimate Zakat in Canadian dollars, compare against a current nisab threshold, and continue to the IST donation portal.',
};

export default function ZakatPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.connect.donate}
        eyebrow="Giving"
        title="Zakat calculator"
        description="A simple Canadian-dollar estimate to help organize your figures before speaking with a qualified scholar."
      />
      <Section>
        <div className="mb-8 max-w-3xl">
          <span className="eyebrow">Estimate only</span>
          <h2 className="mt-4 font-display text-4xl text-ist-green">
            Calculate 2.5% of eligible assets
          </h2>
          <p className="mt-3 leading-relaxed text-ist-ink/65">
            Nisab changes with gold or silver prices. Enter a current threshold from a trusted
            source, and confirm asset categories, lunar-year requirements, debts, and eligibility
            with an Imam. This tool is not a fatwa and does not store your figures.
          </p>
        </div>
        <ZakatCalculator />
      </Section>
    </PageTransition>
  );
}
