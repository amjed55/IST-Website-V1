/**
 * Local image catalog for the marketing site.
 * Atmospheric photos under /images and /images/generated are royalty-free stand-ins —
 * replace with real 20 Overlea / Masjid Darus Salaam photography when available.
 */

export type SiteImage = {
  src: string;
  alt: string;
};

const g = (file: string, alt: string): SiteImage => ({
  src: `/images/generated/${file}`,
  alt,
});

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
  library: g('islamic-library.jpg', 'Islamic reference books on wooden library shelves'),
  lectureHall: g('lecture-hall.jpg', 'Empty classroom ready for Islamic studies'),
  quranOpen: g('quran-open.jpg', 'Open Holy Quran on a wooden rehal'),
  courtyardDusk: g('courtyard-dusk.jpg', 'Mosque courtyard arches at dusk'),
  tilework: g('tilework.jpg', 'Blue and gold Islamic geometric tilework'),
  prayerAisle: g('prayer-aisle.jpg', 'Prayer hall aisle with green carpet and arches'),
  gym: g('gym-hall.jpg', 'Empty community gymnasium with wooden floor'),
  lounge: g('community-lounge.jpg', 'Empty community lounge with warm lamps'),
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
  hubs: {
    sisters: g('community-lounge.jpg', 'Welcoming sisters gathering space'),
    youth: g('gym-hall.jpg', 'Youth programmes and sports hall'),
    seniors: g('community-lounge.jpg', 'Quiet lounge for seniors companionship'),
  },
  eventsById: {
    jummah: {
      src: '/images/event-jummah.jpg',
      alt: 'Prayer hall prepared for Jummah',
    },
    'youth-friday': g('gym-hall.jpg', 'Youth Friday programme space'),
    'brothers-basketball': g('gym-hall.jpg', 'IST gym for basketball'),
    'sisters-volleyball': g('gym-hall.jpg', 'IST gym for sisters volleyball'),
    'badminton-dropin': g('gym-hall.jpg', 'IST gym for badminton'),
    'operating-donate': {
      src: '/images/event-donate.jpg',
      alt: 'Supporting the masjid community',
    },
    'careers-open': {
      src: '/images/event-careers.jpg',
      alt: 'Careers at the Islamic Society of Toronto',
    },
    'youth-quran-circle': g('quran-open.jpg', 'Youth Quran circle'),
    'youth-leadership': g('lecture-hall.jpg', 'Youth leadership workshop'),
    'sisters-halaqa': g('community-lounge.jpg', "Sisters' halaqa space"),
    'sisters-fitness': g('gym-hall.jpg', 'Sisters fitness space'),
    'seniors-tea': g('community-lounge.jpg', 'Seniors tea lounge'),
    'seniors-quran': g('quran-open.jpg', 'Seniors Quran listening'),
    'family-picnic': g('courtyard-dusk.jpg', 'Community outdoor gathering'),
    'open-house': {
      src: '/images/visit.jpg',
      alt: 'Masjid open house entrance',
    },
    'new-muslim-circle': g('lecture-hall.jpg', 'New Muslim circle classroom'),
  } as Record<string, SiteImage>,
  programsById: {
    madressa: g('lecture-hall.jpg', 'Evening Madressa classroom'),
    sunday: g('quran-open.jpg', 'Sunday Madrasah Quran study'),
    hifz: g('islamic-library.jpg', 'Hifz programme study space'),
    alim: g('islamic-library.jpg', 'Alim programme library'),
    essentials: g('lecture-hall.jpg', 'Islamic Essentials classroom'),
    adults: g('quran-open.jpg', 'Adult Tajweed class materials'),
    'kids-story': g('lecture-hall.jpg', 'Kids seerah story hour'),
    'youth-mentorship': g('courtyard-dusk.jpg', 'Youth mentorship'),
    youth: g('gym-hall.jpg', 'Youth Hub'),
    sisters: g('community-lounge.jpg', "Sisters' Hub"),
    seniors: g('community-lounge.jpg', 'Seniors Hub'),
    weekly: g('prayer-aisle.jpg', 'Weekly gathering in the prayer hall'),
    'sisters-tajweed': g('quran-open.jpg', 'Sisters Tajweed'),
    'sisters-arabic': g('islamic-library.jpg', 'Sisters Arabic foundations'),
    'sisters-parenting': g('community-lounge.jpg', 'Sisters parenting circle'),
    'youth-sports-league': g('gym-hall.jpg', 'Youth sports league'),
    'youth-dawah': g('lecture-hall.jpg', 'Youth dawah and media'),
    'seniors-fiqh': g('quran-open.jpg', 'Seniors fiqh circle'),
    'seniors-transport': g('courtyard-dusk.jpg', 'Seniors ride assistance'),
    'convert-care': g('lecture-hall.jpg', 'Convert care programme'),
    'family-night': g('courtyard-dusk.jpg', 'Monthly family night'),
    'nikah-service': g('tilework.jpg', 'Nikah ceremony space'),
    'counselling-service': g('community-lounge.jpg', 'Pastoral counselling space'),
    'janazah-service': g('prayer-aisle.jpg', 'Janazah facilities'),
  } as Record<string, SiteImage>,
  aboutBySlug: {
    story: g('courtyard-dusk.jpg', 'Masjid Darus Salaam courtyard'),
    leadership: g('prayer-aisle.jpg', 'Prayer hall for leadership and worship'),
    facility: {
      src: '/images/visit.jpg',
      alt: 'Masjid facility entrance',
    },
  } as Record<string, SiteImage>,
  servicesBySlug: {
    nikah: g('tilework.jpg', 'Nikah — marriage ceremony'),
    counselling: g('community-lounge.jpg', 'Marriage counselling space'),
    janazah: g('prayer-aisle.jpg', 'Funeral and Janazah facilities'),
  } as Record<string, SiteImage>,
  connect: {
    volunteer: g('courtyard-dusk.jpg', 'Volunteer at the masjid'),
    donate: {
      src: '/images/event-donate.jpg',
      alt: 'Support the masjid with your donation',
    },
    careers: {
      src: '/images/event-careers.jpg',
      alt: 'Careers at IST',
    },
  },
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

export function programImage(id: string, fallback: SiteImage = images.education): SiteImage {
  return images.programsById[id] || fallback;
}

export function hubImage(id: string): SiteImage {
  if (id === 'sisters') return images.hubs.sisters;
  if (id === 'youth') return images.hubs.youth;
  if (id === 'seniors') return images.hubs.seniors;
  return images.community;
}

export function eventThumb(id: string): SiteImage {
  return images.eventsById[id] || images.events;
}
