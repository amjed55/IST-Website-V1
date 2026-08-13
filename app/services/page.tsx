import type { Metadata } from 'next';
import { servicesSubsections } from '@/lib/subsections';
import { images } from '@/lib/images';
import { Badge, Section } from '@/components/ui';
import { FadeUp, PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { MediaLinkRow } from '@/components/MediaLinkRow';

export const metadata: Metadata = {
  title: 'Life Services',
  description:
    'Learn about Nikah, counselling, Janazah guidance, and pastoral services at Islamic Society of Toronto.',
};

export default function ServicesPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.services}
        eyebrow="Life Services"
        title="Pastoral &amp; Life Services"
        description="Nikah ceremonies, marriage counselling, and Janazah care — each conducted by qualified scholars according to Islamic principles."
      />

      <Section>
        <Stagger staggerDelay={0.07} className="divide-y divide-ist-green/8">
          {servicesSubsections.map((page) => (
            <StaggerItem key={page.slug}>
              <MediaLinkRow
                href={`/services/${page.slug}`}
                title={page.title}
                description={page.description}
                image={page.image}
                iconKey={page.slug}
                cta="View details →"
                badgeExtra={
                  page.comingSoon ? (
                    <Badge className="bg-ist-gold/15 text-ist-green">Coming soon</Badge>
                  ) : null
                }
              />
            </StaggerItem>
          ))}
        </Stagger>

        <FadeUp className="mt-10 border-t border-ist-green/8 pt-8">
          <p className="text-sm font-semibold text-ist-green">Gym & hall availability</p>
          <p className="mt-1 text-sm text-ist-ink/60">
            The gym facility is currently <strong className="text-ist-ink">not available for rental</strong>. Please contact the office for any future availability enquiries.
          </p>
        </FadeUp>
      </Section>
    </PageTransition>
  );
}
