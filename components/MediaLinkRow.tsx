'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import type { SiteImage } from '@/lib/images';
import { Badge } from '@/components/ui';
import { topicIcons, IconEducation } from '@/components/icons';

/** Image + text row for programme / community / service lists */
export function MediaLinkRow({
  href,
  title,
  description,
  schedule,
  tags,
  image,
  iconKey,
  cta = 'Learn more →',
  badgeExtra,
}: {
  href: string;
  title: string;
  description?: string;
  schedule?: string;
  tags?: string[];
  image: SiteImage;
  iconKey?: string;
  cta?: string;
  badgeExtra?: ReactNode;
}) {
  const Icon = (iconKey && topicIcons[iconKey]) || IconEducation;

  return (
    <Link
      href={href}
      className="group grid gap-5 py-7 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6"
    >
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-square sm:h-[110px] sm:w-[140px]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="140px"
          className="object-cover transition duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ist-green-deep/35 to-transparent" />
        <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ist-teal shadow-soft">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {tags?.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
          {badgeExtra}
        </div>
        <h2 className="mt-2 font-display text-2xl text-ist-green transition-colors group-hover:text-ist-teal">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ist-ink/60 line-clamp-2">
            {description}
          </p>
        )}
        {schedule && (
          <p className="mt-2 text-xs font-semibold text-ist-teal">{schedule}</p>
        )}
      </div>

      <span className="shrink-0 text-sm font-semibold text-ist-teal">{cta}</span>
    </Link>
  );
}
