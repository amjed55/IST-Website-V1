import type { Metadata } from 'next';
import Link from 'next/link';
import { programSnapshot } from '@/lib/content';
import { educationSubsections } from '@/lib/subsections';
import { images } from '@/lib/images';
import { Badge, Button, Section } from '@/components/ui';
import { FadeUp, PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = { title: 'Education' };

export default function EducationPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.education}
        eyebrow="Education"
        title="Islamic Education at IST"
        description="From evening Madressa to full-time Hifz and Alim programmes — select a programme below to learn more or register your interest."
      />

      {/* Mirrored from homepage: complete Islamic education snapshot */}
      <section className="section-band-green">
        <div className="container-ist py-14 sm:py-16">
          <FadeUp>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ist-teal-light">
              Education &amp; programmes
            </span>
            <h2 className="mt-4 font-display text-4xl text-white sm:text-5xl">
              A complete Islamic education
            </h2>
            <p className="mt-3 max-w-xl text-base text-white/65 leading-relaxed">
              From evening Madressa and Sunday classes to full-time Hifz, the multi-year Alim programme, and year-round community outreach.
            </p>
          </FadeUp>

          <Stagger staggerDelay={0.06} className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-white/10">
            {programSnapshot.map((title) => (
              <StaggerItem key={title}>
                <div className="flex items-center gap-3 bg-ist-green px-5 py-4 transition hover:bg-ist-green-deep/80">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ist-gold" />
                  <span className="text-base font-medium text-white/90">{title}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Section>
        <Stagger staggerDelay={0.07} className="divide-y divide-ist-green/8">
          {educationSubsections
            .filter((p) => p.slug !== 'essentials')
            .map((page) => (
              <StaggerItem key={page.slug}>
                <Link
                  href={`/education/${page.slug}`}
                  className="group flex flex-col gap-1 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {page.tags?.map((t) => <Badge key={t}>{t}</Badge>)}
                    </div>
                    <h2 className="mt-2 font-display text-2xl text-ist-green transition-colors group-hover:text-ist-teal">
                      {page.title}
                    </h2>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ist-ink/60 line-clamp-2">
                      {page.description}
                    </p>
                    {page.schedule && (
                      <p className="mt-2 text-xs font-semibold text-ist-teal">{page.schedule}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-ist-teal">
                    View program →
                  </span>
                </Link>
              </StaggerItem>
            ))}
        </Stagger>

        <FadeUp className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ist-green/8 pt-8">
          <p className="text-sm text-ist-ink/60">
            Looking for the Islamic Essentials (Advanced Maktab) course for high school students?
          </p>
          <Button href="/education/essentials" variant="outline">
            View Islamic Essentials
          </Button>
        </FadeUp>
      </Section>
    </PageTransition>
  );
}
