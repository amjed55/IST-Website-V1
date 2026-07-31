import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { about } from '@/lib/content';
import { aboutSubsections } from '@/lib/subsections';
import { images } from '@/lib/images';
import { Section } from '@/components/ui';
import { FadeUp, PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { topicIcons, IconAbout } from '@/components/icons';

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
          {aboutSubsections.map((page) => {
            const Icon = topicIcons[page.slug] || IconAbout;
            return (
              <StaggerItem key={page.slug}>
                <Link
                  href={`/about/${page.slug}`}
                  className="group flex h-full flex-col overflow-hidden border border-ist-green/8 bg-white transition-all duration-300 hover:border-ist-teal/40 hover:shadow-soft"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={page.image.src}
                      alt={page.image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ist-green-deep/70 to-transparent" />
                    <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ist-teal">
                      <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-5 py-5">
                    <h2 className="font-display text-2xl text-ist-green transition group-hover:text-ist-teal">
                      {page.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ist-ink/60 line-clamp-3">
                      {page.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ist-teal">
                      Learn more →
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>
    </PageTransition>
  );
}
