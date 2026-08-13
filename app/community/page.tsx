import type { Metadata } from 'next';
import { communitySubsections } from '@/lib/subsections';
import { images, programImage } from '@/lib/images';
import { Section } from '@/components/ui';
import { PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { MediaLinkRow } from '@/components/MediaLinkRow';

export const metadata: Metadata = {
  title: 'Community',
  description:
    'Find youth, sisters, seniors, new-Muslim, family, and weekly community programs at Masjid Darus Salaam.',
};

export default function CommunityPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.community}
        eyebrow="Community"
        title="Community life at IST"
        description="Youth programmes, Sisters' Hub, seniors support, and weekly spiritual gatherings — select a programme below for full details."
      />

      <Section>
        <Stagger staggerDelay={0.07} className="divide-y divide-ist-green/8">
          {communitySubsections.map((page) => (
            <StaggerItem key={page.slug}>
              <MediaLinkRow
                href={`/community/${page.slug}`}
                title={page.title}
                description={page.description}
                schedule={page.schedule}
                tags={page.tags}
                image={programImage(page.slug, page.image)}
                iconKey={page.slug}
                cta="Learn more →"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
    </PageTransition>
  );
}
