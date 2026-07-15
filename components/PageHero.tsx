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
  compact?: boolean;
  align?: 'left' | 'center';
  showScrollCue?: boolean;
};

// Word-by-word stagger — identical to BPWebsite hero pattern
function WordHeadline({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const words = text.split(' ');

  const wordVariants = {
    hidden: { opacity: 0, y: reduce ? 0 : 60 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.12,
        duration: 0.8,
        ease,
      },
    }),
  };

  return (
    <h1 className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          className="mr-[0.25em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

export function PageHero({
  image,
  eyebrow,
  title,
  description,
  actions,
  compact = false,
  align = 'left',
  showScrollCue,
}: Props) {
  const reduce = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', compact ? '8%' : '15%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const cue = showScrollCue ?? !compact;
  const titleIsString = typeof title === 'string';
  const wordCount = titleIsString ? title.split(' ').length : 0;

  const titleClass = `mt-3 font-display leading-[1.05] drop-shadow-sm ${
    compact ? 'text-4xl sm:text-5xl' : 'text-4xl sm:text-5xl lg:text-7xl'
  } max-w-3xl`;

  const contentClass = `container-ist relative z-10 flex flex-col justify-end ${
    compact ? 'py-12 sm:py-14' : 'pb-20 pt-28 sm:pb-28 sm:pt-36'
  } ${align === 'center' ? 'items-center text-center' : ''}`;

  const descDelay = titleIsString ? 0.3 + wordCount * 0.12 + 0.1 : 0.5;
  const actionsDelay = descDelay + 0.15;

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden text-white ${
        compact ? 'min-h-[280px] sm:min-h-[320px]' : 'min-h-[88vh] sm:min-h-screen'
      }`}
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ist-teal-light">
              {eyebrow}
            </p>
          </motion.div>
        )}

        {/* Title */}
        {titleIsString ? (
          <WordHeadline text={title} className={titleClass} />
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
            className={`mt-4 text-base text-white/80 sm:text-lg ${
              align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-xl'
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
            className={`mt-8 flex flex-wrap gap-4 ${align === 'center' ? 'justify-center' : ''}`}
          >
            {actions}
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
