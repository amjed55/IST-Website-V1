import {
  about,
  communityPrograms,
  educationPrograms,
  lifeServices,
  site,
  type Program,
} from '@/lib/content';
import { images, programImage, type SiteImage } from '@/lib/images';

export type SubsectionPage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  body: string[];
  schedule?: string;
  tags?: string[];
  image: SiteImage;
  parentLabel: string;
  parentHref: string;
  contacts?: { name: string; phone: string }[];
  comingSoon?: boolean;
  cta?: { label: string; href: string; external?: boolean };
  form?: 'program-register' | 'volunteer' | null;
};

function fromProgram(
  p: Program,
  meta: {
    eyebrow: string;
    parentLabel: string;
    parentHref: string;
    image: SiteImage;
    body?: string[];
    form?: SubsectionPage['form'];
  },
): SubsectionPage {
  return {
    slug: p.id,
    title: p.title,
    eyebrow: meta.eyebrow,
    description: p.summary,
    body: meta.body || [p.summary],
    schedule: p.schedule,
    tags: p.tags,
    image: meta.image,
    parentLabel: meta.parentLabel,
    parentHref: meta.parentHref,
    form: meta.form ?? null,
  };
}

const educationBodies: Record<string, string[]> = {
  madressa: [
    'Our weekday evening Madressa helps children ages 6–16 build a strong foundation in Quran recitation, Islamic knowledge, and the etiquette of a practising Muslim.',
    'Classes run Monday through Friday in a structured, age-appropriate setting with qualified and dedicated teachers.',
  ],
  sunday: [
    'Sunday Madrasah is a weekend option designed for families who prefer a single, condensed learning day over weekday evenings.',
    'Children ages 6–16 cover Quran fundamentals and essential Islamic teachings in a welcoming classroom environment.',
  ],
  hifz: [
    'Students in our Hifz programme memorise the Quran under the close guidance of experienced instructors who track and review progress with care.',
    'A full-time day track and a part-time evening track are both available, allowing students to choose a schedule that suits their school and family commitments.',
  ],
  alim: [
    'The Alim programme is a rigorous, multi-year path through classical Arabic, Fiqh, Hadith, Quran, and the broader spectrum of Islamic sciences.',
    'Both full-time and part-time schedules are offered, enabling students to deepen their knowledge while managing other academic or professional obligations.',
  ],
  essentials: [
    'Islamic Essentials (Advanced Maktab) is designed for high school students who want a level of depth and discussion beyond the standard Maktab curriculum.',
    'Over two years, students engage seriously with Islamic creed, jurisprudence, ethics, and personal development — building a confident, grounded faith.',
  ],
  adults: [
    'Our adult Tajweed and Arabic classes are tailored for learners who want to refine their Quran recitation or build Arabic language foundations from scratch.',
    'Sessions are paced for busy adults — contact the office to confirm the current schedule and register your interest.',
  ],
};

const communityBodies: Record<string, string[]> = {
  youth: [
    'Youth Hub brings young people together every Friday night for learning with scholars, leadership development, and authentic community.',
    'Expect Islamic guidance rooted in confidence, friendship built on shared values, and a space where young Muslims can grow in faith and character.',
  ],
  sisters: [
    "Sisters' Hub offers a dedicated space for women at IST — through classes, programmes, and gatherings that strengthen faith, sisterhood, and service.",
    'Contact the office for the current schedule of classes and events available to the women of our community.',
  ],
  seniors: [
    'Seniors Support is built around companionship, spiritual care, and maintaining a sense of belonging for the elders of our community.',
    'We welcome families to connect their elders with regular check-ins and community moments at the masjid — because dignity in later life is a community responsibility.',
  ],
  weekly: [
    'Our Weekly Gathering brings the community together through Fiqh Halaqa, English and Urdu Tafseer circles, Hadith Dars, and Jawla.',
    'Attending regularly is one of the most consistent ways to build knowledge, stay connected to the community, and strengthen your relationship with the deen.',
  ],
};

export const aboutSubsections: SubsectionPage[] = [
  {
    slug: 'story',
    title: 'Our story',
    eyebrow: 'About',
    description: about.summary,
    body: [
      about.summary,
      about.reach,
      `Since ${about.since}, IST — Masjid Darus Salaam — has served as the spiritual and community home for Muslims across Thorncliffe Park, Flemingdon Park, and the wider East Toronto area.`,
    ],
    image: images.aboutBySlug.story,
    parentLabel: 'About',
    parentHref: '/about',
  },
  {
    slug: 'leadership',
    title: 'Leadership',
    eyebrow: 'About',
    description:
      'Reach the appropriate IST team for worship, education, pastoral care, and community questions.',
    body: [
      'IST’s Imams, scholars, staff, and volunteers support daily worship, Islamic education, Nikah enquiries, counselling, and community programmes.',
      'For current Imam availability or a pastoral appointment, contact the masjid office. For class registration, use the relevant Education page; for Nikah or counselling, begin on the Services page.',
      'Names, roles, and biographies are published only after they have been confirmed by the office so this page does not present an outdated leadership roster.',
    ],
    image: images.aboutBySlug.leadership,
    parentLabel: 'About',
    parentHref: '/about',
    cta: { label: 'Contact the office', href: '/contact' },
  },
  {
    slug: 'facility',
    title: 'Facility',
    eyebrow: 'About',
    description: `${site.masjid} at ${site.address}`,
    body: [
      `Located at ${site.address}, Masjid Darus Salaam hosts five daily prayers, Jummah congregations, and a full programme of educational and community activities throughout the week.`,
      'Gym rental is not currently available. Nikah ceremonies are offered without the requirement of a hall booking.',
      'Please review the parking guidance on our Visit page before you arrive — nearby private lots actively tow unauthorized vehicles.',
    ],
    image: images.aboutBySlug.facility,
    parentLabel: 'About',
    parentHref: '/about',
    cta: { label: 'Visit & parking', href: '/visit' },
  },
];

export const educationSubsections: SubsectionPage[] = educationPrograms.map((p) =>
  fromProgram(p, {
    eyebrow: 'Education',
    parentLabel: 'Education',
    parentHref: '/education',
    image: programImage(p.id, images.education),
    body: educationBodies[p.id],
    form: 'program-register',
  }),
);

export const communitySubsections: SubsectionPage[] = communityPrograms.map((p) =>
  fromProgram(p, {
    eyebrow: 'Community',
    parentLabel: 'Community',
    parentHref: '/community',
    image: programImage(p.id, images.community),
    body: communityBodies[p.id],
  }),
);

export const servicesSubsections: SubsectionPage[] = lifeServices.map((s) => ({
  slug: s.id,
  title: s.title,
  eyebrow: 'Services',
  description: s.summary,
  body: [s.summary],
  image: images.servicesBySlug[s.id] || images.services,
  parentLabel: 'Services',
  parentHref: '/services',
  contacts: 'contacts' in s ? s.contacts : undefined,
  comingSoon: 'comingSoon' in s ? s.comingSoon : undefined,
  cta: { label: 'Contact the office', href: '/contact' },
}));

export const involveSubsections: SubsectionPage[] = [
  {
    slug: 'volunteer',
    title: 'Volunteer',
    eyebrow: 'Get involved',
    description: 'Share your time and skills with the programmes and people that keep IST serving our community.',
    body: [
      'Volunteers contribute across education support, events, hospitality, facilities, and day-to-day operations — every role matters.',
      'Tell us about your interests and availability and our team will follow up when an opportunity that fits opens up.',
    ],
    image: images.connect.volunteer,
    parentLabel: 'Get involved',
    parentHref: '/get-involved',
    form: 'volunteer',
  },
  {
    slug: 'donate',
    title: 'Donate',
    eyebrow: 'Get involved',
    description: 'Support IST\'s operating expenses, education programmes, and community services.',
    body: [
      'Your Zakat, Sadaqah, and Masjid Fund contributions help sustain daily prayers, full-time education programmes, and community welfare initiatives.',
      'Give securely through our online donation portal, or speak with the office about in-person giving options.',
    ],
    image: images.connect.donate,
    parentLabel: 'Get involved',
    parentHref: '/get-involved',
    tags: ['Zakat', 'Sadaqah', 'Masjid Fund'],
  },
];

export function findSubsection(
  list: SubsectionPage[],
  slug: string,
): SubsectionPage | undefined {
  return list.find((p) => p.slug === slug);
}
