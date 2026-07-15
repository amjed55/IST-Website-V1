import type { Metadata } from 'next';
import Link from 'next/link';
import { about } from '@/lib/content';
import { aboutSubsections } from '@/lib/subsections';
import { images } from '@/lib/images';
import { Section } from '@/components/ui';
import { FadeUp, PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.about}
        eyebrow="About IST"
        title={`Serving Toronto since ${about.since}`}
        description={about.summary}
      />

      <Section>
        <FadeUp>
          <p className="max-w-3xl text-lg leading-relaxed text-ist-ink/70">{about.reach}</p>
        </FadeUp>

        <Stagger staggerDelay={0.08} className="mt-12 grid gap-5 md:grid-cols-3">
          {aboutSubsections.map((page) => (
            <StaggerItem key={page.slug}>
              <Link
                href={`/about/${page.slug}`}
                className="group flex h-full flex-col border-t-2 border-ist-teal/30 bg-white px-6 py-6 transition-all duration-300 hover:border-ist-teal hover:shadow-soft"
              >
                <h2 className="font-display text-2xl text-ist-green transition group-hover:text-ist-teal">
                  {page.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ist-ink/60 line-clamp-3">
                  {page.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ist-teal">
                  Learn more →
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
    </PageTransition>
  );
}
