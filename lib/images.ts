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
    alt: 'Peaceful mosque interior with soft light',
  },
  visit: {
    src: '/images/visit.jpg',
    alt: 'Welcoming path toward a house of worship',
  },
  education: {
    src: '/images/education.jpg',
    alt: 'Open Qur’an for Islamic education',
  },
  community: {
    src: '/images/community.jpg',
    alt: 'Community gathering in fellowship',
  },
  services: {
    src: '/images/services.jpg',
    alt: 'Quiet mosque hall ready for prayer',
  },
  about: {
    src: '/images/about.jpg',
    alt: 'Architectural detail of a mosque dome',
  },
  events: {
    src: '/images/events.jpg',
    alt: 'People collaborating on community work',
  },
  pillars: {
    education: {
      src: '/images/pillar-education.jpg',
      alt: 'Learning and mentorship',
    },
    community: {
      src: '/images/pillar-community.jpg',
      alt: 'Friends and community together',
    },
    services: {
      src: '/images/pillar-services.jpg',
      alt: 'Calm morning light for reflection',
    },
    visit: {
      src: '/images/pillar-visit.jpg',
      alt: 'Journey and arrival',
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
  const key = title.toLowerCase().replace(/\s+/g, '') as keyof typeof images.pillars;
  const map: Record<string, SiteImage> = {
    education: images.pillars.education,
    community: images.pillars.community,
    lifeservices: images.pillars.services,
    visit: images.pillars.visit,
  };
  return map[key] || images.pillars.visit;
}
