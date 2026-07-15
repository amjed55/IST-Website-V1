'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { SlideInLeft, SlideInRight } from './motion';
import type { SiteImage } from '@/lib/images';

type Props = {
  image: SiteImage;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  reverse?: boolean;
  className?: string;
};

export function MediaBand({
  image,
  eyebrow,
  title,
  children,
  reverse = false,
  className = '',
}: Props) {
  return (
    <div className={`grid overflow-hidden border border-ist-green/8 bg-white lg:grid-cols-2 ${className}`}>
      {/* Image side */}
      <SlideInLeft
        className={`relative min-h-[280px] overflow-hidden lg:min-h-[360px] ${
          reverse ? 'lg:order-2' : ''
        }`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition duration-700 hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ist-green-deep/30 to-transparent" />
      </SlideInLeft>

      {/* Content side */}
      <SlideInRight
        delay={0.1}
        className={`flex flex-col justify-center p-8 sm:p-10 lg:p-12 ${
          reverse ? 'lg:order-1' : ''
        }`}
      >
        {eyebrow && (
          <span className="eyebrow">{eyebrow}</span>
        )}
        <h2 className="mt-4 font-display text-3xl text-ist-green sm:text-4xl">{title}</h2>
        <div className="mt-5 space-y-3 text-ist-ink/70">{children}</div>
      </SlideInRight>
    </div>
  );
}
