import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { involveSubsections, findSubsection } from '@/lib/subsections';
import { SubsectionLayout } from '@/components/SubsectionLayout';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return involveSubsections.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = findSubsection(involveSubsections, slug);
  return { title: page?.title || 'Get involved' };
}

export default async function InvolveSubsectionPage({ params }: Props) {
  const { slug } = await params;
  const page = findSubsection(involveSubsections, slug);
  if (!page) notFound();
  return <SubsectionLayout page={page} />;
}
