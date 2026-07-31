import type { Metadata } from 'next';
import { programSnapshot } from '@/lib/content';
import { educationSubsections } from '@/lib/subsections';
import { images, programImage } from '@/lib/images';
import { Button, Section } from '@/components/ui';
import { FadeUp, PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { MediaLinkRow } from '@/components/MediaLinkRow';
import { IconEducation } from '@/components/icons';

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
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-ist-gold">
                    <IconEducation className="h-4 w-4" />
                  </span>
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
                <MediaLinkRow
                  href={`/education/${page.slug}`}
                  title={page.title}
                  description={page.description}
                  schedule={page.schedule}
                  tags={page.tags}
                  image={programImage(page.slug, page.image)}
                  iconKey={page.slug}
                  cta="View program →"
                />
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
