import type { Metadata } from 'next';
import Link from 'next/link';
import { communitySubsections } from '@/lib/subsections';
import { images } from '@/lib/images';
import { Badge, Section } from '@/components/ui';
import { PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = { title: 'Community' };

export default function CommunityPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.community}
        eyebrow="Community"
        title="Community life at IST"
        description="Youth programmes, Sisters' Hub, seniors support, and weekly spiritual gatherings — select a programme below for full details."
      />

      <Section>
        <Stagger staggerDelay={0.07} className="divide-y divide-ist-green/8">
          {communitySubsections.map((page) => (
            <StaggerItem key={page.slug}>
              <Link
                href={`/community/${page.slug}`}
                className="group flex flex-col gap-1 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {page.tags?.[0] && <Badge>{page.tags[0]}</Badge>}
                  </div>
                  <h2 className="mt-2 font-display text-2xl text-ist-green transition-colors group-hover:text-ist-teal">
                    {page.title}
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ist-ink/60">
                    {page.description}
                  </p>
                  {page.schedule && (
                    <p className="mt-2 text-xs font-semibold text-ist-teal">{page.schedule}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold text-ist-teal">Learn more →</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
    </PageTransition>
  );
}
