import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { educationSubsections, findSubsection } from '@/lib/subsections';
import { SubsectionLayout } from '@/components/SubsectionLayout';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return educationSubsections.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = findSubsection(educationSubsections, slug);
  return { title: page?.title || 'Education' };
}

export default async function EducationSubsectionPage({ params }: Props) {
  const { slug } = await params;
  const page = findSubsection(educationSubsections, slug);
  if (!page) notFound();
  return <SubsectionLayout page={page} />;
}
