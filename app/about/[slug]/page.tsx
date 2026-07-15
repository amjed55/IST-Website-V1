import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { aboutSubsections, findSubsection } from '@/lib/subsections';
import { SubsectionLayout } from '@/components/SubsectionLayout';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return aboutSubsections.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = findSubsection(aboutSubsections, slug);
  return { title: page?.title || 'About' };
}

export default async function AboutSubsectionPage({ params }: Props) {
  const { slug } = await params;
  const page = findSubsection(aboutSubsections, slug);
  if (!page) notFound();
  return <SubsectionLayout page={page} />;
}
