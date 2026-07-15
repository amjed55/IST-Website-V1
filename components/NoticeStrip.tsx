'use client';

import Link from 'next/link';
import { notices } from '@/lib/content';
import { FadeUp, Stagger, StaggerItem } from './motion';

export function NoticeStrip() {
  const [parking, ...rest] = notices;

  return (
    <div className="space-y-5">
      {parking && (
        <FadeUp>
          <div className="border-l-4 border-ist-gold bg-ist-gold/10 px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ist-green">
                  {parking.title}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ist-ink sm:text-base">
                  {parking.body}
                </p>
              </div>
              <Link
                href="/visit"
                className="shrink-0 text-sm font-semibold text-ist-teal underline-offset-4 hover:underline"
              >
                Directions & parking →
              </Link>
            </div>
          </div>
        </FadeUp>
      )}

      {rest.length > 0 && (
        <Stagger staggerDelay={0.08} className="grid gap-4 sm:grid-cols-2">
          {rest.map((n) => (
            <StaggerItem key={n.title}>
              <div className="border-l-2 border-ist-teal/35 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ist-teal">
                  {n.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ist-ink/65">{n.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
