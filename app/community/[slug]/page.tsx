import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { communitySubsections, findSubsection } from '@/lib/subsections';
import { SubsectionLayout } from '@/components/SubsectionLayout';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return communitySubsections.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = findSubsection(communitySubsections, slug);
  return { title: page?.title || 'Community' };
}

export default async function CommunitySubsectionPage({ params }: Props) {
  const { slug } = await params;
  const page = findSubsection(communitySubsections, slug);
  if (!page) notFound();
  return <SubsectionLayout page={page} />;
}
