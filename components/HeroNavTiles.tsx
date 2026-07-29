'use client';

import Link from 'next/link';
import { siteMapLinks } from '@/lib/content';
import { Stagger, StaggerItem } from './motion';

const tileMeta: Record<string, { blurb: string }> = {
  Children: { blurb: 'Madressa & kids learning' },
  Youth: { blurb: 'Youth Hub & programmes' },
  Adults: { blurb: 'Tajweed & Arabic classes' },
  Sisters: { blurb: "Sisters' Hub" },
  Seniors: { blurb: 'Care & companionship' },
  Sports: { blurb: 'Gym & athletics' },
  'Social Media / Connect': { blurb: 'WhatsApp & Instagram' },
  'Deen Programs': { blurb: 'Halaqa & gatherings' },
  Education: { blurb: 'Hifz, Alim & more' },
  'Our Mission': { blurb: 'Our story & purpose' },
};

export function HeroNavTiles() {
  return (
    <nav aria-label="Quick links">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
        Explore IST
      </p>
      <Stagger
        staggerDelay={0.04}
        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5"
      >
        {siteMapLinks.map((item) => {
          const meta = tileMeta[item.label];
          return (
            <StaggerItem key={item.href}>
              <Link
                href={item.href}
                className="group flex h-full flex-col justify-between border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-ist-gold/50 hover:bg-white/18"
              >
                <span className="font-display text-lg leading-tight text-white sm:text-xl">
                  {item.label}
                </span>
                <span className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] leading-snug text-white/55">
                    {meta?.blurb || 'Open page'}
                  </span>
                  <span
                    className="text-ist-gold transition group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    →
                  </span>
                </span>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </nav>
  );
}
