import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCareerById, listPublicCareers } from '@/lib/careers';
import { images } from '@/lib/images';
import { Badge, Button, Section } from '@/components/ui';
import { FadeIn, PageTransition, SlideInLeft, SlideInRight } from '@/components/motion';
import { PageHero } from '@/components/PageHero';

type Props = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  try {
    return listPublicCareers().map((c) => ({ id: c.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = getCareerById(id);
  return { title: job ? job.title : 'Role not found' };
}

export default async function CareerDetailPage({ params }: Props) {
  const { id } = await params;
  const job = getCareerById(id);
  if (!job) notFound();

  const posterSrc = job.imageSrc || images.careers[job.id]?.src;
  const posterAlt = images.careers[job.id]?.alt || `${job.title} posting`;

  return (
    <PageTransition>
      <PageHero
        compact
        image={images.events}
        eyebrow={job.department || 'Careers'}
        title={job.title}
        description={job.summary}
        actions={
          <>
            <Button href={`/careers/apply?job=${job.id}`} variant="gold">
              Apply for this role
            </Button>
            <Button href="/careers" variant="ghost">
              All openings
            </Button>
          </>
        }
      />

      <Section>
        <div className="flex flex-wrap gap-2">
          <Badge>{job.type}</Badge>
          {job.department && (
            <Badge className="bg-ist-gold/20 text-ist-green">{job.department}</Badge>
          )}
        </div>

        <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            job.schedule && { label: 'Hours', value: job.schedule },
            job.location && { label: 'Location', value: job.location },
            { label: 'Deadline', value: job.deadline },
            job.contract && { label: 'Contract', value: job.contract },
          ]
            .filter(Boolean)
            .map((item) => {
              const row = item as { label: string; value: string };
              return (
                <div key={row.label} className="border-l-2 border-ist-teal/40 pl-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ist-teal">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-ist-ink">{row.value}</dd>
                </div>
              );
            })}
        </dl>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <SlideInLeft>
              <h2 className="font-display text-2xl text-ist-green">Responsibilities</h2>
              <ul className="mt-4 space-y-3 text-ist-muted">
                {job.responsibilities.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ist-teal" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SlideInLeft>
            <SlideInLeft delay={0.08}>
              <h2 className="font-display text-2xl text-ist-green">Requirements</h2>
              <ul className="mt-4 space-y-3 text-ist-muted">
                {job.requirements.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ist-gold" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SlideInLeft>
          </div>

          <SlideInRight>
            <aside className="sticky top-28 space-y-6">
              <div className="rounded-[1.5rem] border border-ist-green/10 bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ist-teal">
                  Ready to apply?
                </p>
                <p className="mt-2 text-sm text-ist-muted">
                  Submit your resume, LinkedIn, and cover letter on our application form. Applications
                  go to {job.applyEmail}.
                </p>
                {job.startDate && (
                  <p className="mt-3 text-sm text-ist-muted">
                    Start date: <strong className="text-ist-ink">{job.startDate}</strong>
                  </p>
                )}
                <Button href={`/careers/apply?job=${job.id}`} variant="teal" className="mt-5 w-full">
                  Apply now
                </Button>
                <p className="mt-3 text-center text-xs text-ist-muted">
                  Or email{' '}
                  <a
                    href={`mailto:${job.applyEmail}?subject=${encodeURIComponent(job.applySubject)}`}
                    className="font-semibold text-ist-teal hover:underline"
                  >
                    {job.applyEmail}
                  </a>
                </p>
              </div>

              {posterSrc && (
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] border border-ist-green/10 bg-[#f4f1ea]">
                  <Image
                    src={posterSrc}
                    alt={posterAlt}
                    fill
                    className="object-contain object-top p-4"
                    sizes="(max-width: 1024px) 100vw, 36vw"
                  />
                </div>
              )}
            </aside>
          </SlideInRight>
        </div>

        <FadeIn className="mt-12">
          <Link href="/careers" className="text-sm font-semibold text-ist-teal hover:underline">
            ← Back to all careers
          </Link>
        </FadeIn>
      </Section>
    </PageTransition>
  );
}
