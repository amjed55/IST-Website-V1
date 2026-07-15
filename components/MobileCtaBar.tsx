'use client';

import { useEffect } from 'react';
import { links } from '@/lib/content';
import { IconDonate } from './icons';

/** Mobile donate bar — prayer times live in the sticky iqamah bar */
export function MobileCtaBar() {
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const sync = () => {
      document.documentElement.style.setProperty(
        '--mobile-cta-h',
        mq.matches ? '3.75rem' : '0px',
      );
    };
    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      document.documentElement.style.removeProperty('--mobile-cta-h');
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 z-40 border-t border-ist-green/10 bg-ist-cream/95 p-3 backdrop-blur-md lg:hidden"
      style={{
        bottom: 'var(--prayer-bar-h, 0px)',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="container-ist">
        <a
          href={links.donate}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ist-green px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
        >
          <IconDonate className="h-4 w-4" />
          Donate
        </a>
      </div>
    </div>
  );
}
