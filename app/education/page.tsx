import type { Metadata } from 'next';
import Link from 'next/link';
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
