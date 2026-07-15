'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { events } from '@/lib/content';
import { images } from '@/lib/images';
import { Badge } from './ui';
import { ease } from './motion';

export function EventsCarousel() {
  const [index, setIndex] = useState(0);
  const item = events[index];
  const thumb = images.eventsById[item.id] || images.events;

  function prev() {
    setIndex((i) => (i - 1 + events.length) % events.length);
  }
  function next() {
    setIndex((i) => (i + 1) % events.length);
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">Announcements</span>
          <h2 className="mt-3 font-display text-3xl text-ist-green sm:text-4xl">
            Upcoming events &amp; programs
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ist-green/15 text-ist-green/60 transition hover:border-ist-teal hover:text-ist-teal"
            aria-label="Previous event"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="min-w-[2.5rem] text-center text-sm text-ist-muted tabular-nums">
            {index + 1}/{events.length}
          </span>
          <button
            type="button"
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ist-green/15 text-ist-green/60 transition hover:border-ist-teal hover:text-ist-teal"
            aria-label="Next event"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slide area */}
      <div className="relative mt-8 min-h-[220px]" aria-live="polite" aria-atomic="true">
        <p className="sr-only">Slide {index + 1} of {events.length}</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease }}
            className="grid gap-8 md:grid-cols-[240px_1fr]"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[220px]">
              <Image
                src={thumb.src}
                alt={thumb.alt}
                fill
                sizes="240px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ist-green-deep/95 to-transparent px-4 pb-4 pt-8 text-white">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Date</p>
                <p className="mt-0.5 font-display text-xl leading-tight">{item.dateLabel}</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center">
              {item.badge && <Badge className="mb-3 w-fit">{item.badge}</Badge>}
              <h3 className="font-display text-2xl text-ist-green sm:text-3xl">{item.title}</h3>
              <p className="mt-3 max-w-xl leading-relaxed text-ist-ink/65">{item.summary}</p>
              {item.location && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-ist-teal">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M7 1a4 4 0 0 1 4 4c0 3-4 8-4 8S3 8 3 5a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.25" />
                    <circle cx="7" cy="5" r="1.25" stroke="currentColor" strokeWidth="1.25" />
                  </svg>
                  {item.location}
                </p>
              )}
              <Link
                href={`/events#${item.id}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ist-teal underline-offset-4 hover:underline"
              >
                Learn more →
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="mt-6 flex items-center gap-2" role="tablist" aria-label="Event slides">
        {events.map((e, i) => (
          <button
            key={e.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${e.title}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-ist-teal' : 'w-2 bg-ist-green/20 hover:bg-ist-green/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
