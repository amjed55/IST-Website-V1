import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { links } from '@/lib/content';
import { involveSubsections } from '@/lib/subsections';
import { images } from '@/lib/images';
import { Button, Section } from '@/components/ui';
import { PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { InstagramFeed } from '@/components/InstagramFeed';
import { topicIcons, IconBriefcase, IconHands, IconDonate } from '@/components/icons';

export const metadata: Metadata = { title: 'Get Involved' };

const hubCards = [
  ...involveSubsections.map((page) => ({
    href: `/get-involved/${page.slug}`,
    title: page.title,
    body: page.description,
    cta: 'Open page →',
    image: page.image,
    iconKey: page.slug,
  })),
  {
    href: '/careers',
    title: 'Careers',
    body: 'See open roles including Maktab teaching and social media coordination.',
    cta: 'View careers →',
    image: images.connect.careers,
    iconKey: 'careers',
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
        <Stagger staggerDelay={0.1} className="grid gap-5 md:grid-cols-3">
          {hubCards.map((card) => {
            const Icon =
              topicIcons[card.iconKey] ||
              (card.iconKey === 'careers'
                ? IconBriefcase
                : card.iconKey === 'donate'
                  ? IconDonate
                  : IconHands);
            return (
              <StaggerItem key={card.href}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col overflow-hidden border border-ist-green/8 bg-white transition hover:border-ist-teal/40 hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={card.image.src}
                      alt={card.image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ist-green-deep/65 to-transparent" />
                    <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ist-teal">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-5 py-5">
                    <h2 className="font-display text-2xl text-ist-green group-hover:text-ist-teal">
                      {card.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm text-ist-muted">{card.body}</p>
                    <span className="mt-4 text-sm font-semibold text-ist-teal">{card.cta}</span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>

      <Section id="social" className="section-band">
        <InstagramFeed />
      </Section>
    </PageTransition>
  );
}
