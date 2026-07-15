'use client';

import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'teal' | 'light' | 'ghost' | 'gold' | 'outline';

const styles: Record<Variant, string> = {
  primary:
    'bg-ist-green text-white hover:bg-ist-green-deep shadow-soft border border-white/10',
  teal: 'bg-ist-teal text-white hover:bg-ist-teal-light shadow-soft',
  light: 'bg-white/95 text-ist-green hover:bg-white shadow-soft',
  ghost:
    'bg-transparent text-inherit border border-white/45 hover:bg-white/10 hover:border-white/70',
  gold: 'bg-ist-gold text-ist-green-deep hover:brightness-105 shadow-soft',
  outline:
    'bg-transparent text-ist-green border-2 border-ist-green/25 hover:border-ist-green hover:bg-ist-green/5',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ist-teal disabled:pointer-events-none disabled:opacity-60';

export function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  external,
  ...props
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  external?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `${base} ${styles[variant]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-ist-teal/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ist-teal ${className}`}
    >
      {children}
    </span>
  );
}

export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-14 sm:py-16 lg:py-20 ${className}`}>
      <div className="container-ist">{children}</div>
    </section>
  );
}
