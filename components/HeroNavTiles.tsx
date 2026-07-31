'use client';

import Link from 'next/link';
import { siteMapLinks } from '@/lib/content';
import { Stagger, StaggerItem } from './motion';
import {
  IconChild,
  IconYouth,
  IconBook,
  IconSisters,
  IconSeniors,
  IconSports,
  IconInstagram,
  IconUsers,
  IconEducation,
  IconMosque,
} from './icons';

const tileMeta: Record<
  string,
  { blurb: string; Icon: typeof IconChild }
> = {
  Children: { blurb: 'Madressa & kids learning', Icon: IconChild },
  Youth: { blurb: 'Youth Hub & programmes', Icon: IconYouth },
  Adults: { blurb: 'Tajweed & Arabic classes', Icon: IconBook },
  Sisters: { blurb: "Sisters' Hub", Icon: IconSisters },
  Seniors: { blurb: 'Care & companionship', Icon: IconSeniors },
  Sports: { blurb: 'Gym & athletics', Icon: IconSports },
  'Social Media / Connect': { blurb: 'WhatsApp & Instagram', Icon: IconInstagram },
  'Deen Programs': { blurb: 'Halaqa & gatherings', Icon: IconUsers },
  Education: { blurb: 'Hifz, Alim & more', Icon: IconEducation },
  'Our Mission': { blurb: 'Our story & purpose', Icon: IconMosque },
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
          const Icon = meta?.Icon || IconMosque;
          return (
            <StaggerItem key={item.href}>
              <Link
                href={item.href}
                className="group flex h-full flex-col justify-between border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-ist-gold/50 hover:bg-white/18"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-lg leading-tight text-white sm:text-xl">
                    {item.label}
                  </span>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-ist-gold transition group-hover:bg-ist-gold/20">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
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
