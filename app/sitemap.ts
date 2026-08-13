import type { MetadataRoute } from 'next';
import {
  aboutSubsections,
  communitySubsections,
  educationSubsections,
  involveSubsections,
  servicesSubsections,
} from '@/lib/subsections';

const base =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.islamicsocietyoftoronto.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const primary = [
    '',
    '/prayer-times',
    '/about',
    '/education',
    '/community',
    '/services',
    '/events',
    '/careers',
    '/get-involved',
    '/get-involved/zakat',
    '/contact',
    '/visit',
    '/privacy',
  ];
  const subsections = [
    ...aboutSubsections.map((page) => `/about/${page.slug}`),
    ...educationSubsections.map((page) => `/education/${page.slug}`),
    ...communitySubsections.map((page) => `/community/${page.slug}`),
    '/community/new-muslim',
    ...servicesSubsections.map((page) => `/services/${page.slug}`),
    ...involveSubsections.map((page) => `/get-involved/${page.slug}`),
  ];
  const localizedTopPages = ['en', 'ar', 'ur', 'ps', 'fa-AF', 'fr'].flatMap((locale) =>
    [
      '',
      '/visit',
      '/contact',
      '/prayer-times',
      '/events',
      '/community/new-muslim',
      '/get-involved/zakat',
      '/get-involved/volunteer',
    ].map((route) => `/${locale}${route}`),
  );

  return [...new Set([...primary, ...subsections, ...localizedTopPages])].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route.includes('prayer-times') || route.includes('events') ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.includes('prayer-times') ? 0.9 : 0.7,
  }));
}
