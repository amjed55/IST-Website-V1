import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { Button, Section } from '@/components/ui';
import { images } from '@/lib/images';
import { links } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Donate',
  description:
    'Support Islamic Society of Toronto through Zakat, Sadaqah, education, and masjid operations.',
};

const categories = [
  {
    title: 'General Sadaqah',
    body: 'Flexible charitable support for current community and masjid needs.',
  },
  {
    title: 'Zakat',
    body: 'Select the Zakat designation in the secure portal. Confirm your own eligibility and calculation with a qualified scholar.',
  },
  {
    title: 'Education',
    body: 'Support Quran learning, Madressa, Hifz, Alim, and related educational resources.',
  },
  {
    title: 'Masjid operations',
    body: 'Help maintain the prayer space and the everyday services that keep the masjid open.',
  },
];

export default function DonatePage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.connect.donate}
        eyebrow="Support IST"
        title="Give with clarity"
        description="Choose the purpose that best matches your intention, then complete your gift through IST’s secure donation portal."
        actions={
          <>
            <Button href={links.donate} variant="gold" external>
              Open donation portal
            </Button>
            <Button href="/get-involved/zakat" variant="ghost">
              Estimate Zakat
            </Button>
          </>
        }
      />
      <Section>
        <Stagger className="grid gap-5 sm:grid-cols-2" staggerDelay={0.08}>
          {categories.map((category) => (
            <StaggerItem key={category.title}>
              <article className="h-full border border-ist-green/10 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                <h2 className="font-display text-3xl text-ist-green">{category.title}</h2>
                <p className="mt-3 leading-relaxed text-ist-ink/65">{category.body}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-8 border-l-4 border-ist-gold bg-ist-gold/10 p-5 text-sm leading-relaxed text-ist-ink/70">
          Fund availability, designation rules, processing fees, and tax-receipt eligibility are
          governed by the options and notices shown in the external donation portal. Contact the
          IST office before giving if you need confirmation about a restricted gift.
        </div>
      </Section>
    </PageTransition>
  );
}
