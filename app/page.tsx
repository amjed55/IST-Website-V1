import Link from 'next/link';
import Image from 'next/image';
import {
  connectThroughIst,
  hubs,
  links,
  pillars,
  programSnapshot,
  site,
} from '@/lib/content';
import { images, pillarImage, hubImage } from '@/lib/images';
import { getMediaByKey, getSiteSettings } from '@/lib/data';
import { Button, Section } from '@/components/ui';
import {
  AnimatedCounter,
  FadeUp,
  PageTransition,
  Stagger,
  StaggerItem,
} from '@/components/motion';
import { EventsBoard } from '@/components/EventsBoard';
import { PageHero } from '@/components/PageHero';
import { NoticeStrip } from '@/components/NoticeStrip';
import { MediaBand } from '@/components/MediaBand';
import { HeroNavTiles } from '@/components/HeroNavTiles';
import { InstagramFeed } from '@/components/InstagramFeed';
import { JummahSchedule } from '@/components/JummahSchedule';
import {
  IconBriefcase,
  IconDonate,
  IconEducation,
  IconHands,
  IconMosque,
  IconUsers,
  topicIcons,
} from '@/components/icons';

export const dynamic = 'force-dynamic';

const yearsServing = new Date().getFullYear() - 1995;

const stats = [
  { value: yearsServing, suffix: '+', label: 'Years serving the community' },
  { value: 5, suffix: 'k+', label: 'Congregants per week' },
  { value: programSnapshot.length, suffix: '+', label: 'Active programmes' },
];

export default async function HomePage() {
  const [settings, heroMedia] = await Promise.all([
    getSiteSettings(),
    getMediaByKey('hero'),
  ]);
  const heroImage = heroMedia
    ? { src: heroMedia.src, alt: heroMedia.alt }
    : images.hero;

  if (settings.maintenance_mode === '1') {
    return (
      <PageTransition>
        <section className="container-ist flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <p className="eyebrow justify-center">Maintenance</p>
          <h1 className="mt-4 font-display text-4xl text-ist-green sm:text-5xl">
            We&apos;ll be right back
          </h1>
          <p className="mt-4 max-w-xl text-ist-ink/65">
            {settings.maintenance_message ||
              'The website is undergoing maintenance. Please check back shortly.'}
          </p>
          <Button href="/prayer-times" variant="primary" className="mt-8">
            View prayer times
          </Button>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <PageHero
        banner
        showScrollCue={false}
        image={heroImage}
        eyebrow={settings.hero_eyebrow || site.masjid}
        title={settings.hero_title || site.name}
        description={
          settings.hero_description ||
          "Faith, knowledge, and community — serving Toronto's Muslim families since 1995."
        }
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
        siteMap={<HeroNavTiles />}
      />

      {/* ── Events (directly below banner) ───────────────────────────── */}
      <Section className="section-band !pt-12">
        <EventsBoard />
      </Section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <div className="border-y border-ist-green/8 bg-white">
        <div className="container-ist">
          <Stagger staggerDelay={0.1} className="grid divide-x divide-ist-green/8 sm:grid-cols-3">
            {stats.map((s, i) => {
              const StatIcon = [IconMosque, IconUsers, IconEducation][i] || IconEducation;
              return (
              <StaggerItem key={s.label}>
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-ist-teal/10 text-ist-teal">
                    <StatIcon className="h-5 w-5" />
                  </span>
                  <p className="font-display text-5xl text-ist-green">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ist-muted">
                    {s.label}
                  </p>
                </div>
              </StaggerItem>
            );})}
          </Stagger>
        </div>
      </div>

      {/* ── Notices ──────────────────────────────────────────────────── */}
      <Section className="!pb-0">
        <NoticeStrip />
      </Section>

      <Section className="!pb-0">
        <JummahSchedule />
      </Section>

      {/* ── Pillars ──────────────────────────────────────────────────── */}
      <Section>
        <FadeUp>
          <span className="eyebrow">What we offer</span>
          <h2 className="mt-4 font-display text-4xl text-ist-green sm:text-5xl">
            How we serve our community
          </h2>
          <p className="mt-3 max-w-2xl text-base text-ist-ink/65 leading-relaxed">
            Marriage and funeral services, Islamic education, and community programmes for every stage of life.
          </p>
        </FadeUp>

        <Stagger staggerDelay={0.09} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => {
            const img = pillarImage(p.title);
            return (
              <StaggerItem key={p.href}>
                <Link href={p.href} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ist-green-deep/80 via-ist-green-deep/15 to-transparent" />
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/0 text-white/0 transition duration-300 group-hover:bg-white/15 group-hover:text-white/90">
                      →
                    </span>
                    <h3 className="absolute bottom-3 left-4 right-4 font-display text-2xl text-white">
                      {p.title}
                    </h3>
                  </div>
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

      {/* ── Hubs ─────────────────────────────────────────────────────── */}
      <Section className="section-band">
        <FadeUp>
          <span className="eyebrow">Community hubs</span>
          <h2 className="mt-4 font-display text-4xl text-ist-green sm:text-5xl">Hubs</h2>
          <p className="mt-3 max-w-xl text-base text-ist-ink/65 leading-relaxed">
            Dedicated spaces for sisters, youth, and seniors.
          </p>
        </FadeUp>

        <Stagger staggerDelay={0.1} className="mt-10 grid gap-6 md:grid-cols-3">
          {hubs.map((hub) => {
            const img = hubImage(hub.id);
            const Icon = topicIcons[hub.id] || IconEducation;
            return (
              <StaggerItem key={hub.id}>
                <Link
                  href={hub.href}
                  className="group block overflow-hidden border border-ist-green/8 bg-white transition hover:border-ist-teal/40 hover:shadow-soft"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ist-green-deep/70 via-ist-green-deep/20 to-transparent" />
                    <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ist-teal">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                  </div>
                  <div className="border-t-2 border-ist-gold/60 px-5 py-5 transition group-hover:border-ist-teal">
                    <h3 className="font-display text-2xl text-ist-green group-hover:text-ist-teal">
                      {hub.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ist-ink/65">{hub.body}</p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-ist-teal">
                      Visit hub →
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
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-ist-gold">
                    <IconEducation className="h-4 w-4" />
                  </span>
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

      {/* ── Connect through IST ──────────────────────────────────────── */}
      <Section id="connect">
        <FadeUp>
          <span className="eyebrow">Get involved</span>
          <h2 className="mt-4 font-display text-4xl text-ist-green sm:text-5xl">
            Connect through IST
          </h2>
          <p className="mt-3 max-w-xl text-base text-ist-ink/65 leading-relaxed">
            Volunteer, donate, or explore careers — three ways to strengthen the masjid.
          </p>
        </FadeUp>

        <Stagger staggerDelay={0.1} className="mt-10 grid gap-8 md:grid-cols-3">
          {connectThroughIst.map((item) => {
            const href = item.external ? item.externalHref || links.donate : item.href;
            const connectImg =
              item.title === 'Donate'
                ? images.connect.donate
                : item.title === 'Careers'
                  ? images.connect.careers
                  : images.connect.volunteer;
            const ConnectIcon =
              item.title === 'Donate'
                ? IconDonate
                : item.title === 'Careers'
                  ? IconBriefcase
                  : IconHands;
            const body = (
              <>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={connectImg.src}
                    alt={connectImg.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ist-green-deep/70 to-transparent" />
                  <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ist-teal">
                    <ConnectIcon className="h-[18px] w-[18px]" />
                  </span>
                </div>
                <div className="px-1 pt-4">
                  <h3 className="font-display text-3xl text-ist-green transition group-hover:text-ist-teal">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ist-ink/65">{item.body}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-ist-teal">
                    {item.title === 'Donate' ? 'Donate now →' : `Open ${item.title.toLowerCase()} →`}
                  </span>
                </div>
              </>
            );

            if (item.external) {
              return (
                <StaggerItem key={item.title}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden"
                  >
                    {body}
                  </a>
                </StaggerItem>
              );
            }

            return (
              <StaggerItem key={item.title}>
                <Link href={href} className="group block overflow-hidden">
                  {body}
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>

      {/* ── Instagram ───────────────────────────────────────────────── */}
      <Section id="social" className="section-band">
        <InstagramFeed />
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
