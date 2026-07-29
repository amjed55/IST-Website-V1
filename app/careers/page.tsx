import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { careersEmail } from '@/lib/content';
import { listPublicCareers } from '@/lib/careers';
import { images } from '@/lib/images';
import { Badge, Button, Section } from '@/components/ui';
import { FadeUp, PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { IconBriefcase } from '@/components/icons';

export const metadata: Metadata = { title: 'Careers' };
export const dynamic = 'force-dynamic';

export default function CareersPage() {
  const careers = listPublicCareers();

  return (
    <PageTransition>
      <PageHero
        compact
        image={images.events}
        eyebrow="Join our team"
        title="Careers at IST"
        description="Join the team at Masjid Darus Salaam and Madrasah Faizul Quran. Browse current openings and apply through our online portal."
      />

      <Section>
        <FadeUp className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Open positions</span>
            <h2 className="mt-4 font-display text-3xl text-ist-green sm:text-4xl">
              {careers.length} role{careers.length === 1 ? '' : 's'} available
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ist-ink/60">
              Send your resume and cover letter to {careersEmail}. Due to the volume of applications,
              only shortlisted candidates will be contacted.
            </p>
          </div>
          <Button href={`mailto:${careersEmail}`} variant="outline" external>
            Email us directly
          </Button>
        </FadeUp>

        {careers.length === 0 ? (
          <FadeUp className="mt-12 border-y border-ist-green/8 py-14 text-center text-ist-ink/50">
            There are no open positions at this time. Check back soon, or send a general expression of
            interest to <a href={`mailto:${careersEmail}`} className="text-link">{careersEmail}</a>.
          </FadeUp>
        ) : (
          <Stagger
            staggerDelay={0.08}
            className="mt-12 divide-y divide-ist-green/8 border-y border-ist-green/8"
          >
            {careers.map((c) => {
              const posterSrc = c.imageSrc || images.careers[c.id]?.src;
              const posterAlt = images.careers[c.id]?.alt || `${c.title} posting`;
              return (
                <StaggerItem key={c.id}>
                  <article className="group grid gap-6 py-8 lg:grid-cols-[160px_1fr_auto] lg:items-center">
                    <div className="relative aspect-[4/3] overflow-hidden border border-ist-green/10 bg-ist-green/[0.03] lg:aspect-square lg:h-36 lg:w-40">
                      {posterSrc ? (
                        <Image
                          src={posterSrc}
                          alt={posterAlt}
                          fill
                          sizes="160px"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ist-teal">
                          <IconBriefcase className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{c.type}</Badge>
                        {c.department && (
                          <Badge className="bg-ist-gold/15 text-ist-green">{c.department}</Badge>
                        )}
                      </div>
                      <h3 className="mt-3 font-display text-2xl text-ist-green transition-colors group-hover:text-ist-teal sm:text-3xl">
                        <Link href={`/careers/${c.id}`}>{c.title}</Link>
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ist-ink/60 sm:text-base">
                        {c.summary}
                      </p>
                      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-ist-ink/50">
                        {c.location && <dd>{c.location}</dd>}
                        {c.schedule && <dd>{c.schedule}</dd>}
                        <dd>
                          Apply by{' '}
                          <span className="font-semibold text-ist-green">{c.deadline}</span>
                        </dd>
                      </dl>
                    </div>
                    <div className="flex flex-wrap gap-3 lg:flex-col lg:items-stretch">
                      <Button href={`/careers/apply?job=${c.id}`} variant="teal">
                        Apply now
                      </Button>
                      <Button href={`/careers/${c.id}`} variant="outline">
                        View role
                      </Button>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </Section>
    </PageTransition>
  );
}
