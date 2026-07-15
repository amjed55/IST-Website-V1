import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCareerById, careers } from '@/lib/content';
import { images } from '@/lib/images';
import { Badge, Button, Section } from '@/components/ui';
import { FadeIn, PageTransition } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { CareerApplyForm } from '@/components/CareerApplyForm';

type Props = {
  searchParams: Promise<{ job?: string }>;
};

export const metadata: Metadata = { title: 'Apply' };

export default async function CareerApplyPage({ searchParams }: Props) {
  const { job: jobId } = await searchParams;
  const job = getCareerById(jobId);

  if (!jobId) {
    return (
      <PageTransition>
        <PageHero
          compact
          image={images.events}
          eyebrow="Careers"
          title="Choose a role to apply"
          description="Select an open position to start your application."
        />
        <Section>
          <FadeIn className="space-y-4">
            {careers.map((c) => (
              <Link
                key={c.id}
                href={`/careers/apply?job=${c.id}`}
                className="flex flex-col gap-2 border-b border-ist-green/10 py-5 transition hover:border-ist-teal sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-xl text-ist-green">{c.title}</p>
                  <p className="mt-1 text-sm text-ist-muted">
                    {c.type}
                    {c.department ? ` · ${c.department}` : ''}
                  </p>
                </div>
                <span className="text-sm font-semibold text-ist-teal">Apply →</span>
              </Link>
            ))}
            <Button href="/careers" variant="outline" className="mt-4">
              Back to careers
            </Button>
          </FadeIn>
        </Section>
      </PageTransition>
    );
  }

  if (!job) {
    redirect('/careers/apply');
  }

  return (
    <PageTransition>
      <PageHero
        compact
        image={images.events}
        eyebrow="Application"
        title="Apply for this role"
        description={`You’re applying for ${job.title}. Upload a resume, add LinkedIn, and tell us why you’re a fit.`}
        actions={
          <Button href={`/careers/${job.id}`} variant="ghost">
            View job details
          </Button>
        }
      />

      <Section>
        <div className="mx-auto grid max-w-3xl gap-8">
          <FadeIn className="flex flex-wrap items-center gap-2">
            <Badge>{job.type}</Badge>
            {job.department && (
              <Badge className="bg-ist-gold/20 text-ist-green">{job.department}</Badge>
            )}
            <span className="text-sm text-ist-muted">Deadline: {job.deadline}</span>
          </FadeIn>

          <FadeIn delay={0.08}>
            <CareerApplyForm job={job} />
          </FadeIn>
        </div>
      </Section>
    </PageTransition>
  );
}
