export const site = {
  name: 'Islamic Society of Toronto',
  shortName: 'IST',
  masjid: 'Masjid Darus Salaam',
  tagline: "Serving Toronto's Muslim community since 1995",
  address: '20 Overlea Blvd, Toronto, ON M4H 1A4',
  phone: '+1 416-467-0786',
  phoneHref: 'tel:+14164670786',
  email: 'info@islamicsocietyoftoronto.com',
  emailHref: 'mailto:info@islamicsocietyoftoronto.com',
  formTo: 'mamjed@myist.org',
  mapEmbed:
    'https://www.google.com/maps?q=20+Overlea+Blvd,+Toronto,+ON+M4H+1A4&output=embed',
  mixlr: 'https://mixlr.com/',
};

export const links = {
  donate:
    process.env.NEXT_PUBLIC_DONATE_URL ||
    'https://app.irm.io/islamicsocietyoftoronto.com',
  whatsapp:
    process.env.NEXT_PUBLIC_WHATSAPP_URL ||
    'https://chat.whatsapp.com/CAAwHH6yUf5H2JFn8rF73c',
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    'https://www.instagram.com/islamicsocietyoftoronto',
  prayerClock:
    process.env.NEXT_PUBLIC_PRAYER_CLOCK_EMBED_URL ||
    'http://localhost:5000/classic',
  prayerApi:
    process.env.NEXT_PUBLIC_PRAYER_CLOCK_API_URL ||
    process.env.NEXT_PUBLIC_PRAYER_CLOCK_EMBED_URL?.replace(/\/classic\/?$/, '') ||
    'http://localhost:5000',
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Our Story', href: '/about/story' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'Facility', href: '/about/facility' },
    ],
  },
  {
    label: 'Education',
    href: '/education',
    children: [
      { label: 'Madressa', href: '/education/madressa' },
      { label: 'Hifz', href: '/education/hifz' },
      { label: 'Alim', href: '/education/alim' },
      { label: 'Sunday Class', href: '/education/sunday' },
      { label: 'Adults', href: '/education/adults' },
    ],
  },
  {
    label: 'Community',
    href: '/community',
    children: [
      { label: 'Youth', href: '/community/youth' },
      { label: 'Sisters', href: '/community/sisters' },
      { label: 'Seniors', href: '/community/seniors' },
      { label: 'Weekly Gathering', href: '/community/weekly' },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Nikah', href: '/services/nikah' },
      { label: 'Counselling', href: '/services/counselling' },
      { label: 'Janazah', href: '/services/janazah' },
    ],
  },
  { label: 'Events', href: '/events' },
  { label: 'Visit', href: '/visit' },
  {
    label: 'Involve',
    href: '/get-involved',
    children: [
      { label: 'Volunteer', href: '/get-involved/volunteer' },
      { label: 'Donate', href: '/get-involved/donate' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

export const notices = [
  {
    tone: 'gold' as const,
    title: 'Parking notice',
    body: 'Do not park at 25 Overlea Blvd (strip plaza) or East York Town Centre. Both lots actively enforce — unauthorized vehicles will be towed.',
  },
  {
    tone: 'teal' as const,
    title: 'Support our masjid',
    body: 'Your contribution sustains daily prayers, education programs, and community services. Every donation makes a difference.',
  },
  {
    tone: 'muted' as const,
    title: 'Facility update',
    body: 'The gym is not available for rental at this time. Nikah ceremonies are offered independently, without a hall booking requirement.',
  },
];

export const about = {
  since: 1995,
  summary:
    'The Islamic Society of Toronto — home to Masjid Darus Salaam — has anchored the Muslim community of East Toronto since 1995. From Thorncliffe Park and Flemingdon Park to the wider city, IST offers a space for daily worship, full-time Islamic education, youth development, and vital community services.',
  reach:
    'Serving one of the largest Muslim populations in Toronto, IST is committed to nurturing faith, knowledge, and unity — through full-time Hifz and Alim programs, evening Madressa, adult learning, and year-round community initiatives.',
};

export type Program = {
  id: string;
  title: string;
  summary: string;
  schedule?: string;
  tags?: string[];
};

export const educationPrograms: Program[] = [
  {
    id: 'madressa',
    title: 'Evening Quran & Madressa',
    summary:
      'Weekday evening classes for children ages 6–16 covering Quran recitation, Islamic studies, and foundational adab.',
    schedule: 'Monday – Friday: 5:15 – 7:15 PM',
    tags: ['Ages 6–16'],
  },
  {
    id: 'sunday',
    title: 'Sunday Madrasah',
    summary:
      'A condensed weekend option for families — children ages 6–16 study Quran and core Islamic teachings in a welcoming classroom setting.',
    schedule: 'Sunday: 10:30 AM – 2:00 PM',
    tags: ['Weekend'],
  },
  {
    id: 'hifz',
    title: 'Hifz Program',
    summary:
      'Memorise the Quran with careful Tajweed under dedicated instructors. Choose between a full-time day track or a part-time evening schedule.',
    schedule: 'Full-Time: Mon–Fri 8:15 AM – 3:00 PM · Part-Time: Mon–Fri 4:40 – 7:30 PM',
    tags: ['Full-time', 'Part-time'],
  },
  {
    id: 'alim',
    title: 'Alim Program',
    summary:
      'A multi-year intensive covering classical Arabic, Fiqh, Hadith, Quran, and the full spectrum of Islamic sciences — available in full-time and part-time formats.',
    schedule: 'Full-Time: Mon–Fri 8:00 AM – 3:00 PM · Part-Time: Mon–Fri 4:40 – 7:30 PM',
    tags: ['6-year track'],
  },
  {
    id: 'essentials',
    title: 'Islamic Essentials — Advanced Maktab',
    summary:
      'A two-year course for high school students exploring Islamic creed, jurisprudence, and ethics in greater depth than a standard Maktab track.',
    tags: ['High school'],
  },
  {
    id: 'adults',
    title: 'Adult Tajweed & Arabic',
    summary:
      'Quran recitation classes to refine Tajweed and Arabic language fundamentals — paced for adults balancing work and family commitments.',
    tags: ['Adults'],
  },
];

export const communityPrograms: Program[] = [
  {
    id: 'youth',
    title: 'Youth Hub',
    summary:
      'A Friday-night gathering where young people learn from scholars, build leadership skills, and develop a grounded and confident Muslim identity.',
    schedule: 'Friday evenings',
    tags: ['Youth'],
  },
  {
    id: 'sisters',
    title: "Sisters' Hub",
    summary:
      'Dedicated programs, classes, and gatherings for women — fostering faith, sisterhood, and active community service.',
    tags: ['Sisters'],
  },
  {
    id: 'seniors',
    title: 'Seniors Support',
    summary:
      'Spiritual and social support for our elders — regular check-ins, companionship, and community connection rooted in dignity and care.',
    tags: ['Seniors'],
  },
  {
    id: 'weekly',
    title: 'Weekly Gathering',
    summary:
      'A regular programme of Fiqh Halaqa, Tafseer circles (English & Urdu), Hadith Dars, and Jawla for ongoing spiritual growth and community bonds.',
    tags: ['Weekly'],
  },
];

export const lifeServices = [
  {
    id: 'nikah',
    title: 'Nikah — Marriage Ceremony',
    summary:
      'Qualified marriage officers conduct nikah ceremonies in accordance with Islamic law and Ontario civil requirements. This service does not include hall booking.',
    contacts: [
      { name: 'ML. Muhammad', phone: '416-825-7921' },
      { name: 'Qr. Umar', phone: '416-696-2967' },
    ],
  },
  {
    id: 'counselling',
    title: 'Marriage Counselling & Pastoral Support',
    summary:
      'Confidential marriage counselling and pastoral support are available through our Imams. Contact the office or visit to arrange an appointment.',
  },
  {
    id: 'janazah',
    title: 'Funeral & Janazah Services',
    summary:
      'Dedicated Janazah facilities are planned as part of our building development. This service will be announced when available.',
    comingSoon: true,
  },
];

export type EventItem = {
  id: string;
  title: string;
  dateLabel: string;
  summary: string;
  badge?: string;
  location?: string;
};

export const events: EventItem[] = [
  {
    id: 'jummah',
    title: 'Friday Jummah Prayer',
    dateLabel: 'Every Friday',
    summary:
      'Join the congregation for khutbah and Jummah prayer. Multiple congregations are held each week — check the prayer board or website for updated times.',
    badge: 'Weekly',
    location: '20 Overlea Blvd',
  },
  {
    id: 'youth-friday',
    title: 'Youth Programme Night',
    dateLabel: 'Every Friday evening',
    summary:
      'Youth gather each Friday to learn from scholars, strengthen their Islamic identity, and build lasting bonds of brotherhood and community.',
    badge: 'Featured',
    location: 'Masjid Darus Salaam',
  },
  {
    id: 'operating-donate',
    title: 'Support Our Masjid\'s Daily Operations',
    dateLabel: 'Ongoing',
    summary:
      'Your sadaqah and voluntary contributions help sustain daily prayers, education programmes, and community services. Every amount is appreciated.',
    badge: 'Announcement',
  },
  {
    id: 'careers-open',
    title: 'Now Hiring — Maktab Teacher & Marketing Coordinator',
    dateLabel: 'Apply by July 19, 2026',
    summary:
      'Two part-time positions are currently open: a Maktab Teacher (Male) and a Digital Marketing & Social Media Coordinator. Submit a resume and cover letter to jobs@myist.org.',
    badge: 'Careers',
  },
];

export type Career = {
  id: string;
  title: string;
  type: string;
  department?: string;
  summary: string;
  schedule?: string;
  location?: string;
  deadline: string;
  startDate?: string;
  contract?: string;
  applyEmail: string;
  applySubject: string;
  responsibilities: string[];
  requirements: string[];
};

export const careersEmail = 'jobs@myist.org';

export const careers: Career[] = [
  {
    id: 'maktab-male-teacher',
    title: 'Part-Time Maktab Teacher (Male)',
    type: 'Part-time',
    department: 'Madrasah Faizul Quran',
    summary:
      'The Islamic Society of Toronto (Madrasah Faizul Quran) is seeking a qualified Alim or Hafiz to teach Quran, Tajweed, and Qaidah to boys aged 5–14. Applicants must demonstrate strong classroom management and fluency in English.',
    schedule: 'Monday – Friday | 5:05 PM – 7:25 PM',
    location: 'On-site at Masjid Darus Salaam',
    deadline: 'July 19, 2026',
    startDate: 'TBD — July or August 2026',
    contract: '1-year contract with a 3-month probationary period',
    applyEmail: careersEmail,
    applySubject: 'Part-Time Maktab Teacher – Male',
    responsibilities: [
      'Teach Quran, Tajweed, and Qaidah to assigned age groups',
      'Maintain excellent classroom management and discipline',
      'Foster an engaging and inclusive learning environment',
      'Track student progress and communicate with parents as needed',
      'Collaborate with teaching staff and administration',
    ],
    requirements: [
      'Resident of Toronto or the Greater Toronto Area',
      'Qualified as an Alim or Hafiz',
      'Previous teaching experience required',
      'Fluent in English',
      'Proven ability to manage a classroom of boys aged 5–14',
    ],
  },
  {
    id: 'social-media-coordinator',
    title: 'Digital Marketing & Social Media Coordinator',
    type: 'Part-time',
    department: 'Communications',
    summary:
      'The Islamic Society of Toronto is seeking a creative communicator to manage our digital presence, produce engaging content, and grow community connection through meaningful storytelling.',
    schedule: 'Part-time | Flexible hours',
    location: 'Toronto (hybrid, as arranged)',
    deadline: 'July 19, 2026',
    startDate: 'August 2026 (tentative)',
    contract: '1-year contract with a 3-month probationary period',
    applyEmail: careersEmail,
    applySubject: 'Digital Marketing & Social Media Coordinator',
    responsibilities: [
      'Create and schedule content across Instagram, Facebook, TikTok, and related platforms',
      'Design graphics and edit short-form video content',
      'Support community campaigns and event announcements',
      'Maintain a consistent brand voice across all channels',
      'Update website content and assist with email communications',
    ],
    requirements: [
      'Demonstrated experience in social media management',
      'Proficiency with design tools (Canva, CapCut, Adobe Suite, or equivalent)',
      'Excellent written English and communication skills',
      'Reliable, self-directed, and collaborative',
      'Genuine passion for storytelling that serves a faith-based community',
    ],
  },
];

export function getCareerById(id: string | null | undefined) {
  if (!id) return undefined;
  return careers.find((c) => c.id === id);
}

export const pillars = [
  {
    title: 'Education',
    href: '/education',
    body: 'Evening Madressa, full-time Hifz and Alim programmes, Sunday classes, and adult Tajweed.',
  },
  {
    title: 'Community',
    href: '/community',
    body: 'Youth Hub, Sisters\u2019 programmes, seniors support, and weekly spiritual gatherings.',
  },
  {
    title: 'Life Services',
    href: '/services',
    body: 'Nikah ceremonies, marriage counselling, and Janazah care — guided by qualified scholars.',
  },
  {
    title: 'Visit',
    href: '/visit',
    body: 'Address, parking guidance, and everything you need to know before your first visit.',
  },
];

export const programSnapshot = [
  'Evening Quran & Madressa',
  'Sunday Madrasah',
  'Hifz Programme',
  'Alim & Alima Programme',
  'Islamic Essentials — Advanced Maktab',
  'Community Iftar & Outreach',
];
