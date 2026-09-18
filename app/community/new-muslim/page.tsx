import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { Button, Section } from '@/components/ui';
import { images } from '@/lib/images';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'New to Islam',
  description:
    'A welcoming starting point for new Muslims and anyone learning about Islam at Masjid Darus Salaam in Toronto.',
};

const steps = [
  {
    title: 'Visit without pressure',
    body: 'You are welcome to observe a prayer, ask questions, or simply become familiar with the masjid. Contact the office first if you would like someone to meet you.',
  },
  {
    title: 'Ask about the Shahada',
    body: 'If you are considering or have taken the declaration of faith, an Imam can explain its meaning and help you understand practical next steps.',
  },
  {
    title: 'Learn prayer gradually',
    body: 'Begin with the essentials: purification, the movements and words of Salah, and a small number of short surahs. Consistency matters more than learning everything at once.',
  },
  {
    title: 'Find community',
    body: 'The office can help connect brothers and sisters with appropriate classes, community gatherings, and pastoral support currently available at IST.',
  },
];

export default function NewMuslimPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.community}
        eyebrow="You are welcome"
        title="New to Islam or the masjid?"
        description="Start at your pace. Masjid Darus Salaam welcomes new Muslims, people exploring Islam, and anyone returning to their faith."
        actions={
          <>
            <Button href="/contact?topic=General" variant="gold">
              Contact the office
            </Button>
            <Button href="/visit" variant="ghost">
              Plan a first visit
            </Button>
          </>
        }
      />

      <Section>
        <Stagger className="grid gap-5 md:grid-cols-2" staggerDelay={0.08}>
          {steps.map((step, index) => (
            <StaggerItem key={step.title}>
              <article className="h-full border border-ist-green/10 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                <span className="font-display text-4xl text-ist-gold">0{index + 1}</span>
                <h2 className="mt-4 font-display text-3xl text-ist-green">{step.title}</h2>
                <p className="mt-3 leading-relaxed text-ist-ink/65">{step.body}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-10 rounded-3xl bg-ist-green p-7 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ist-teal-light">
            Reach a real person
          </p>
          <h2 className="mt-3 font-display text-4xl">The office can help you take the next step</h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Ask for a private conversation, a first-visit welcome, or guidance about learning and
            prayer. We do not publish individual mentor availability online.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <a href={site.phoneHref} className="font-semibold text-ist-gold hover:underline">
              {site.phone}
            </a>
            <a href={site.emailHref} className="font-semibold text-ist-gold hover:underline">
              {site.email}
            </a>
            <Link href="/prayer-times" className="font-semibold text-ist-teal-light hover:underline">
              View prayer times
            </Link>
          </div>
        </div>
      </Section>
    </PageTransition>
  );
}
