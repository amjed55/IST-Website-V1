import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { servicesSubsections, findSubsection } from '@/lib/subsections';
import { SubsectionLayout } from '@/components/SubsectionLayout';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return servicesSubsections.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = findSubsection(servicesSubsections, slug);
  return { title: page?.title || 'Services' };
}

export default async function ServicesSubsectionPage({ params }: Props) {
  const { slug } = await params;
  const page = findSubsection(servicesSubsections, slug);
  if (!page) notFound();
  return <SubsectionLayout page={page} />;
}
