import type { Metadata } from 'next';
import Link from 'next/link';
import { links } from '@/lib/content';
import { involveSubsections } from '@/lib/subsections';
import { images } from '@/lib/images';
import { Button, Section } from '@/components/ui';
import { PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = { title: 'Get Involved' };

const hubCards = [
  ...involveSubsections.map((page) => ({
    href: `/get-involved/${page.slug}`,
    title: page.title,
    body: page.description,
    cta: 'Open page →',
  })),
  {
    href: '/careers',
    title: 'Careers',
    body: 'See open roles including Maktab teaching and social media coordination.',
    cta: 'View careers →',
  },
];

export default function GetInvolvedPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.community}
        eyebrow="Get involved"
        title="Give time or treasure"
        description="Volunteer, donate, or apply for open roles — each path has its own page."
        actions={
          <Button href={links.donate} variant="gold" external>
            Donate now
          </Button>
        }
      />

      <Section>
        <Stagger staggerDelay={0.1} className="grid gap-4 md:grid-cols-3">
          {hubCards.map((card) => (
            <StaggerItem key={card.href}>
              <Link
                href={card.href}
                className="group flex h-full flex-col border-l-4 border-ist-gold/50 bg-white py-6 pl-5 pr-4 shadow-soft transition hover:border-ist-teal hover:shadow-lift"
              >
                <h2 className="font-display text-2xl text-ist-green group-hover:text-ist-teal">
                  {card.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-ist-muted">{card.body}</p>
                <span className="mt-4 text-sm font-semibold text-ist-teal">{card.cta}</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
    </PageTransition>
  );
}
