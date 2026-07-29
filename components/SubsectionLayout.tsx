'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { links } from '@/lib/content';
import { Badge, Button, Section } from '@/components/ui';
import { FadeUp, PageTransition, SlideInLeft, SlideInRight } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { SiteForm } from '@/components/SiteForm';
import type { SubsectionPage } from '@/lib/subsections';

export function SubsectionLayout({
  page,
  children,
}: {
  page: SubsectionPage;
  children?: ReactNode;
}) {
  const donateHref = links.donate;
  const primaryCta =
    page.slug === 'donate'
      ? { label: 'Donate now', href: donateHref, external: true as const }
      : page.cta;

  return (
    <PageTransition>
      <PageHero
        compact
        image={page.image}
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        actions={
          primaryCta ? (
            <Button
              href={primaryCta.href}
              variant={page.slug === 'donate' ? 'gold' : 'light'}
              external={primaryCta.external}
            >
              {primaryCta.label}
            </Button>
          ) : undefined
        }
      />

      <Section>
        <FadeUp>
          <nav className="text-sm text-ist-muted" aria-label="Breadcrumb">
            <Link href={page.parentHref} className="font-medium text-ist-teal hover:underline">
              {page.parentLabel}
            </Link>
            <span className="mx-2 text-ist-green/25">/</span>
            <span className="text-ist-ink">{page.title}</span>
          </nav>
        </FadeUp>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
          <SlideInLeft>
            {(page.tags?.length || page.comingSoon) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {page.tags?.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
                {page.comingSoon && (
                  <Badge className="bg-ist-gold/15 text-ist-green">Coming soon</Badge>
                )}
              </div>
            )}

            <div className="space-y-4">
              {page.body.map((para, i) => (
                <FadeUp key={para.slice(0, 48)} delay={0.05 * i}>
                  <p className="text-base leading-relaxed text-ist-ink/75">{para}</p>
                </FadeUp>
              ))}
            </div>

            {page.schedule && (
              <FadeUp delay={0.1}>
                <p className="mt-6 border-l-2 border-ist-teal/40 pl-4 text-sm font-medium text-ist-teal">
                  {page.schedule}
                </p>
              </FadeUp>
            )}

            {page.contacts && page.contacts.length > 0 && (
              <FadeUp delay={0.12} className="mt-8 border-t border-ist-green/8 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ist-teal">
                  Contacts
                </p>
                <ul className="mt-3 space-y-2">
                  {page.contacts.map((c) => (
                    <li key={c.phone} className="text-sm text-ist-ink/75">
                      {c.name}:{' '}
                      <a
                        href={`tel:+1${c.phone.replace(/\D/g, '')}`}
                        className="font-medium text-ist-teal hover:underline"
                      >
                        {c.phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </FadeUp>
            )}
          </SlideInLeft>

          <SlideInRight delay={0.1}>
            {page.form === 'program-register' && (
              <div className="border border-ist-green/8 bg-white p-6">
                <h3 className="font-display text-2xl text-ist-green">Register interest</h3>
                <p className="mt-2 text-sm text-ist-ink/60">
                  Tell us you&apos;re interested in {page.title}. Staff will follow up by email.
                </p>
                <div className="mt-6">
                  <SiteForm
                    type="program-register"
                    submitLabel="Submit interest"
                    prefill={{
                      program: page.title,
                      message: `I am interested in ${page.title}.\n\n`,
                    }}
                  />
                </div>
              </div>
            )}

            {page.form === 'volunteer' && (
              <div className="border border-ist-green/8 bg-white p-6">
                <h3 className="font-display text-2xl text-ist-green">Volunteer interest</h3>
                <p className="mt-2 text-sm text-ist-ink/60">Share how you&apos;d like to help.</p>
                <div className="mt-6">
                  <SiteForm type="volunteer" submitLabel="Submit interest" />
                </div>
              </div>
            )}

            {page.slug === 'donate' && (
              <div id="give" className="scroll-mt-24 border border-ist-gold/40 bg-ist-gold/5 p-6">
                <h3 className="font-display text-2xl text-ist-green">Give online</h3>
                <p className="mt-2 text-sm text-ist-ink/60">
                  Open the secure portal to support Zakat, Sadaqah, or the Masjid Fund.
                </p>
                <Button href={donateHref} variant="gold" external className="mt-5">
                  Donate now
                </Button>
              </div>
            )}

            {!page.form && page.slug !== 'donate' && (
              <div className="border-l-2 border-ist-teal/20 pl-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ist-teal">
                  {page.parentLabel}
                </p>
                <p className="mt-2 text-sm text-ist-ink/60">
                  Explore more sections under {page.parentLabel} using the navigation above.
                </p>
              </div>
            )}
          </SlideInRight>
        </div>

        <FadeUp className="mt-14 border-t border-ist-green/8 pt-6">
          <Link href={page.parentHref} className="text-sm font-semibold text-ist-teal hover:underline">
            ← Back to {page.parentLabel}
          </Link>
        </FadeUp>
      </Section>

      {children}
    </PageTransition>
  );
}
