/**
 * Local image catalog for the marketing site.
 * Atmospheric photos under /images are royalty-free stand-ins —
 * replace with real 20 Overlea / Masjid Darus Salaam photography when available.
 * Career images are sourced from islamicsocietyoftoronto.com job postings.
 */

export type SiteImage = {
  src: string;
  alt: string;
};

export const images = {
  logo: {
    src: '/brand/ist-logo.png',
    alt: 'Islamic Society of Toronto logo',
  },
  hero: {
    src: '/images/hero.jpg',
    alt: 'Empty mosque prayer hall with arched columns and warm light',
  },
  visit: {
    src: '/images/visit.jpg',
    alt: 'Ornate mosque doorway with Islamic geometric carving',
  },
  education: {
    src: '/images/education.jpg',
    alt: 'Holy Quran with gold calligraphy on a wooden stand',
  },
  community: {
    src: '/images/community.jpg',
    alt: 'Mosque exterior and empty courtyard at golden hour',
  },
  services: {
    src: '/images/services.jpg',
    alt: 'Mosque mihrab niche with geometric tilework',
  },
  about: {
    src: '/images/about.jpg',
    alt: 'Holy Quran with ornate gold cover',
  },
  events: {
    src: '/images/events.jpg',
    alt: 'Illuminated mosque dome and minaret at night',
  },
  pillars: {
    education: {
      src: '/images/pillar-education.jpg',
      alt: 'Holy Quran for Islamic education',
    },
    community: {
      src: '/images/pillar-community.jpg',
      alt: 'Mosque exterior representing community',
    },
    services: {
      src: '/images/pillar-services.jpg',
      alt: 'Mihrab architecture for life services',
    },
    visit: {
      src: '/images/pillar-visit.jpg',
      alt: 'Mosque entrance for visitors',
    },
  },
  eventsById: {
    jummah: {
      src: '/images/event-jummah.jpg',
      alt: 'Congregation preparing for Jummah',
    },
    'youth-friday': {
      src: '/images/event-youth.jpg',
      alt: 'Youth connecting as a group',
    },
    'brothers-basketball': {
      src: '/images/event-youth.jpg',
      alt: 'Brothers basketball at IST',
    },
    'sisters-volleyball': {
      src: '/images/event-youth.jpg',
      alt: 'Sisters volleyball at IST',
    },
    'badminton-dropin': {
      src: '/images/events.jpg',
      alt: 'Badminton drop-in at IST',
    },
    'operating-donate': {
      src: '/images/event-donate.jpg',
      alt: 'Supporting the masjid community',
    },
    'careers-open': {
      src: '/images/event-careers.jpg',
      alt: 'Team collaboration and careers',
    },
  } as Record<string, SiteImage>,
  careers: {
    'maktab-male-teacher': {
      src: '/images/careers/maktab-male-teacher.png',
      alt: 'Part-Time Maktab Teacher (Male) job posting',
    },
    'social-media-coordinator': {
      src: '/images/careers/social-media-coordinator.png',
      alt: 'Digital Marketing & Social Media Coordinator job posting',
    },
  } as Record<string, SiteImage>,
} as const;

export function pillarImage(title: string): SiteImage {
  const map: Record<string, SiteImage> = {
    marriageservices: images.pillars.services,
    funeralservices: images.pillars.services,
    education: images.pillars.education,
    community: images.pillars.community,
    lifeservices: images.pillars.services,
    visit: images.pillars.visit,
  };
  const key = title.toLowerCase().replace(/\s+/g, '');
  return map[key] || images.pillars.visit;
}
