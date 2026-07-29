'use client';

import Link from 'next/link';
import { links, primaryNav, site } from '@/lib/content';
import { connectLinks } from '@/lib/links';
import { connectIcons, IconPrayer } from './icons';
import { FadeUp } from './motion';

const menuLinks = [
  ...primaryNav.map((item) => [item.label, item.href] as const),
  ['Prayer Times', '/prayer-times'] as const,
  ['Careers', '/careers'] as const,
];

export function Footer() {
  return (
    <footer className="border-t border-ist-green/10 bg-ist-green text-white">
      <div
        className="container-ist"
        style={{
          paddingBottom:
            'calc(var(--mobile-cta-h, 0px) + var(--prayer-bar-h, 0px) + 2rem + env(safe-area-inset-bottom))',
        }}
      >
        <FadeUp y={32} className="grid gap-12 py-16 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ist-teal-light">
              Contact
            </p>
            <p className="mt-5 font-display text-2xl leading-snug">{site.name}</p>
            <p className="mt-1 text-sm text-white/55">{site.masjid}</p>
            <div className="mt-5 space-y-1.5 text-sm text-white/60">
              <p>{site.address}</p>
              <p>
                <a href={site.phoneHref} className="transition hover:text-white">
                  {site.phone}
                </a>
              </p>
              <p>
                <a href={site.emailHref} className="transition hover:text-white">
                  {site.email}
                </a>
              </p>
            </div>
          </div>

          {/* Menu */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ist-teal-light">
              Menu
            </p>
            <nav className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5" aria-label="Footer menu">
              {menuLinks.map(([label, href]) => (
                <Link
                  key={`${label}-${href}`}
                  href={href}
                  className="text-sm text-white/65 transition hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ist-teal-light">
              Connect
            </p>
            <div className="mt-5 space-y-3">
              {connectLinks.map((item) => {
                const Icon = connectIcons[item.id];
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-white/65 transition hover:text-white"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: item.accent }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </span>
                    {item.label}
                  </a>
                );
              })}
              <a
                href={links.prayerClock}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/65 transition hover:text-white"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <IconPrayer className="h-3.5 w-3.5" />
                </span>
                Live prayer board
              </a>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/[0.08]">
        <div className="container-ist flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <Link href="/privacy" className="text-xs text-white/35 transition hover:text-white/65">
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
