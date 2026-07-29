import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { communitySubsections, findSubsection } from '@/lib/subsections';
import { listEventsByHub, listProgramsByHub } from '@/lib/db';
import { SubsectionLayout } from '@/components/SubsectionLayout';
import { HubRelatedContent } from '@/components/HubRelatedContent';
import { Section } from '@/components/ui';
import { PageTransition } from '@/components/motion';

type Props = { params: Promise<{ slug: string }> };

const HUB_SLUGS = new Set(['youth', 'sisters', 'seniors']);

export function generateStaticParams() {
  return communitySubsections.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = findSubsection(communitySubsections, slug);
  return { title: page?.title || 'Community' };
}

export const dynamic = 'force-dynamic';

export default async function CommunitySubsectionPage({ params }: Props) {
  const { slug } = await params;
  const page = findSubsection(communitySubsections, slug);
  if (!page) notFound();

  const isHub = HUB_SLUGS.has(slug);
  const events = isHub ? listEventsByHub(slug) : [];
  const programs = isHub ? listProgramsByHub(slug) : [];

  return (
    <PageTransition>
      <SubsectionLayout page={page} />
      {isHub && (
        <Section className="!pt-0">
          <HubRelatedContent hubLabel={page.title} events={events} programs={programs} />
        </Section>
      )}
    </PageTransition>
  );
}
