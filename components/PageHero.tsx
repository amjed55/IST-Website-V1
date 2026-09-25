'use client';

import Image from 'next/image';
import { ReactNode, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ease } from './motion';
import type { SiteImage } from '@/lib/images';

type Props = {
  image: SiteImage;
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  siteMap?: ReactNode;
  compact?: boolean;
  /** Medium banner — shorter than full-screen, taller than compact */
  banner?: boolean;
  align?: 'left' | 'center';
  showScrollCue?: boolean;
};

// Gentle fade-up for the brand line — avoids awkward word orphans from per-word splits
function BrandHeadline({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.h1
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.75, ease }}
    >
      {text}
    </motion.h1>
  );
}

export function PageHero({
  image,
  eyebrow,
  title,
  description,
  actions,
  siteMap,
  compact = false,
  banner = false,
  align = 'left',
  showScrollCue,
}: Props) {
  const reduce = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', banner || compact ? '18%' : '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', compact ? '8%' : banner ? '10%' : '15%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const cue = showScrollCue ?? (!compact && !banner);
  const titleIsString = typeof title === 'string';

  const titleClass = `mt-4 font-display leading-[1.08] tracking-tight drop-shadow-sm text-balance ${
    compact
      ? 'text-4xl sm:text-5xl'
      : banner
        ? 'text-4xl sm:text-5xl lg:text-6xl'
        : 'text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem]'
  } max-w-4xl`;

  const contentClass = `container-ist relative z-10 flex flex-col justify-end ${
    compact
      ? 'py-12 sm:py-14'
      : banner
        ? 'pb-10 pt-20 sm:pb-12 sm:pt-24'
        : 'pb-20 pt-28 sm:pb-28 sm:pt-36'
  } ${align === 'center' ? 'items-center text-center' : ''}`;

  const descDelay = titleIsString ? 0.45 : 0.5;
  const actionsDelay = descDelay + 0.12;
  const mapDelay = actionsDelay + 0.12;

  const heightClass = compact
    ? 'min-h-[280px] sm:min-h-[320px]'
    : banner
      ? 'min-h-[auto]'
      : 'min-h-[88vh] sm:min-h-screen';

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden text-white ${heightClass}`}
    >
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 scale-110"
        style={reduce ? {} : { y: imageY }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      <div className="hero-photo-scrim absolute inset-0 z-[1]" />

      {/* Content with scroll parallax */}
      <motion.div
        className={contentClass}
        style={reduce ? {} : { y: textY, opacity: textOpacity }}
      >
        {/* Eyebrow */}
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, x: reduce ? 0 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease }}
            className={`flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}
          >
            <span className="h-px w-8 bg-ist-gold/80" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ist-gold sm:text-xs sm:tracking-[0.3em]">
              {eyebrow}
            </p>
          </motion.div>
        )}

        {/* Title */}
        {titleIsString ? (
          <BrandHeadline text={title} className={titleClass} />
        ) : (
          <motion.h1
            className={titleClass}
            initial={{ opacity: 0, y: reduce ? 0 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease }}
          >
            {title}
          </motion.h1>
        )}

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : descDelay, duration: 0.7, ease }}
            className={`mt-5 text-base leading-relaxed text-white/85 sm:text-lg ${
              align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-lg'
            }`}
          >
            {description}
          </motion.p>
        )}

        {/* Actions */}
        {actions && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : actionsDelay, duration: 0.7, ease }}
            className={`mt-8 flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''}`}
          >
            {actions}
          </motion.div>
        )}

        {/* Site map / quick links */}
        {siteMap && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : mapDelay, duration: 0.7, ease }}
            className={`mt-8 w-full ${banner ? 'max-w-none' : 'max-w-4xl'}`}
          >
            {siteMap}
          </motion.div>
        )}
      </motion.div>

      {/* Scroll cue */}
      {cue && !reduce && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
          aria-hidden
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-5 w-px bg-gradient-to-b from-ist-gold to-transparent"
          />
        </motion.div>
      )}
    </section>
  );
}
