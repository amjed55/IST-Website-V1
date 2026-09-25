import { links } from './content';

export const INSTAGRAM_USERNAME = 'islamicsocietyoftoronto';

export type InstagramMediaType = 'image' | 'video' | 'reel' | 'carousel';

/** Normalize a pasted Instagram URL to a canonical permalink. */
export function normalizeInstagramPermalink(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'p' || parts[0] === 'reel' || parts[0] === 'tv') {
      if (!parts[1]) return null;
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/`;
    }
    // Profile URL — not embeddable as a post
    return null;
  } catch {
    return null;
  }
}

export function detectMediaType(permalink: string): InstagramMediaType {
  if (/\/reel\//i.test(permalink) || /\/tv\//i.test(permalink)) return 'reel';
  return 'image';
}

/**
 * Official Instagram embed iframe URL.
 * Videos and Reels play natively inside this embed on the site.
 */
export function instagramEmbedSrc(permalink: string, captioned = true): string {
  const base = permalink.replace(/\/?$/, '/');
  return captioned ? `${base}embed/captioned/` : `${base}embed/`;
}

export function isEmbeddablePost(permalink: string): boolean {
  return /instagram\.com\/(p|reel|tv)\//i.test(permalink);
}

export function profileUrl() {
  return links.instagram.replace(/\/$/, '');
}

/** Demo carousel slides used until real Instagram post URLs are added in admin. */
export const seedInstagramPosts: {
  id: string;
  permalink: string;
  media_type: InstagramMediaType;
  caption: string;
  poster_src: string;
  video_src?: string | null;
  sort_order: number;
}[] = [
  {
    id: 'ig-prayer-hall',
    permalink: 'https://www.instagram.com/islamicsocietyoftoronto/',
    media_type: 'image',
    caption: 'Masjid Darus Salaam — prayer hall ready for the congregation.',
    poster_src: '/images/generated/prayer-aisle.jpg',
    sort_order: 0,
  },
  {
    id: 'ig-quran',
    permalink: 'https://www.instagram.com/islamicsocietyoftoronto/',
    media_type: 'image',
    caption: 'Quran study and education programmes continue throughout the week.',
    poster_src: '/images/generated/quran-open.jpg',
    sort_order: 1,
  },
  {
    id: 'ig-gym',
    permalink: 'https://www.instagram.com/islamicsocietyoftoronto/',
    media_type: 'video',
    caption: 'Youth sports and Friday programmes in the IST gym.',
    poster_src: '/images/generated/gym-hall.jpg',
    // Local clip for native in-site playback — replace with Reel URL in admin for live embeds
    video_src: '/videos/masjid-ambient.mp4',
    sort_order: 2,
  },
  {
    id: 'ig-courtyard',
    permalink: 'https://www.instagram.com/islamicsocietyoftoronto/',
    media_type: 'image',
    caption: 'Community gatherings and open house moments at the courtyard.',
    poster_src: '/images/generated/courtyard-dusk.jpg',
    sort_order: 3,
  },
  {
    id: 'ig-lounge',
    permalink: 'https://www.instagram.com/islamicsocietyoftoronto/',
    media_type: 'image',
    caption: "Sisters' Hub and Seniors gatherings in our community lounge.",
    poster_src: '/images/generated/community-lounge.jpg',
    sort_order: 4,
  },
  {
    id: 'ig-library',
    permalink: 'https://www.instagram.com/islamicsocietyoftoronto/',
    media_type: 'image',
    caption: 'Hifz and Alim students draw from our library of Islamic sciences.',
    poster_src: '/images/generated/islamic-library.jpg',
    sort_order: 5,
  },
];
