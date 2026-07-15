import Link from 'next/link';
import Image from 'next/image';
import {
  links,
  pillars,
  programSnapshot,
  site,
} from '@/lib/content';
import { images, pillarImage } from '@/lib/images';
import { Button, Badge, Section } from '@/components/ui';
import {
  AnimatedCounter,
  FadeUp,
  PageTransition,
  Stagger,
  StaggerItem,
} from '@/components/motion';
import { EventsCarousel } from '@/components/EventsCarousel';
import { QrConnectStrip } from '@/components/QrConnectStrip';
import { PageHero } from '@/components/PageHero';
import { NoticeStrip } from '@/components/NoticeStrip';
import { MediaBand } from '@/components/MediaBand';

const yearsServing = new Date().getFullYear() - 1995;

const stats = [
  { value: yearsServing, suffix: '+', label: 'Years serving the community' },
  { value: 5, suffix: '', label: 'Daily prayers, every day' },
  { value: programSnapshot.length, suffix: '+', label: 'Active programmes' },
];

export default function HomePage() {
  return (
    <PageTransition>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <PageHero
        image={images.hero}
        eyebrow={site.masjid}
        title={site.name}
        description="Faith, knowledge, and community — serving Toronto's Muslim families since 1995."
        actions={
          <>
            <Button href="/visit" variant="light">
              Plan your visit
            </Button>
            <Button href={links.donate} variant="gold" external>
              Donate
            </Button>
          </>
        }
      />

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <div className="border-b border-ist-green/8 bg-white">
        <div className="container-ist">
          <Stagger staggerDelay={0.1} className="grid divide-x divide-ist-green/8 sm:grid-cols-3">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <div className="py-8 text-center">
                  <p className="font-display text-5xl text-ist-green">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ist-muted">
                    {s.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      {/* ── Notices ──────────────────────────────────────────────────── */}
      <Section className="!pb-0">
        <NoticeStrip />
      </Section>

      {/* ── Events ───────────────────────────────────────────────────── */}
      <Section className="section-band">
        <EventsCarousel />
        <FadeUp delay={0.08} className="mt-6 text-right">
          <Link href="/events" className="text-sm font-semibold text-ist-teal hover:underline">
            View all events →
          </Link>
        </FadeUp>
      </Section>

      {/* ── Pillars ──────────────────────────────────────────────────── */}
      <Section>
        <FadeUp>
          <span className="eyebrow">What we offer</span>
          <h2 className="mt-4 font-display text-4xl text-ist-green sm:text-5xl">
            How we serve our community
          </h2>
          <p className="mt-3 max-w-2xl text-base text-ist-ink/65 leading-relaxed">
            From Islamic education and youth programmes to life services and directions to 20 Overlea Blvd.
          </p>
        </FadeUp>

        <Stagger staggerDelay={0.09} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => {
            const img = pillarImage(p.title);
            return (
              <StaggerItem key={p.href}>
                <Link href={p.href} className="group block">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ist-green-deep/80 via-ist-green-deep/15 to-transparent" />
                    {/* Hover arrow */}
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/0 text-white/0 transition duration-300 group-hover:bg-white/15 group-hover:text-white/90">
                      →
                    </span>
                    <h3 className="absolute bottom-3 left-4 right-4 font-display text-2xl text-white">
                      {p.title}
                    </h3>
                  </div>
                  {/* Body */}
                  <div className="border-x border-b border-ist-green/8 bg-white px-4 py-4">
                    <p className="text-sm leading-relaxed text-ist-ink/65">{p.body}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ist-teal transition-all duration-200 group-hover:gap-2">
                      Explore <span>→</span>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>

      {/* ── Programs (dark band) ─────────────────────────────────────── */}
      <section className="section-band-green">
        <div className="container-ist py-16 sm:py-20 lg:py-24">
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

          <FadeUp delay={0.1} className="mt-10">
            <Button href="/education" variant="light">
              View all programmes
            </Button>
          </FadeUp>
        </div>
      </section>

      {/* ── Connect (QR) ─────────────────────────────────────────────── */}
      <Section className="section-band">
        <QrConnectStrip />
      </Section>

      {/* ── Visit / Map ──────────────────────────────────────────────── */}
      <Section>
        <MediaBand image={images.visit} eyebrow="Visit us" title="Join us at 20 Overlea Blvd">
          <p className="text-ist-ink/70">{site.address}</p>
          <p className="text-sm font-medium text-ist-gold">
            ⚠ Please review parking guidance before you arrive — nearby lots actively tow.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href="/visit" variant="primary">
              Directions &amp; parking
            </Button>
            <Button href="/contact" variant="outline">
              Contact the office
            </Button>
          </div>
        </MediaBand>

        <FadeUp delay={0.1} className="mt-8 overflow-hidden border border-ist-green/8">
          <iframe
            title="IST location map"
            src={site.mapEmbed}
            className="h-[300px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </FadeUp>
      </Section>
    </PageTransition>
  );
}
