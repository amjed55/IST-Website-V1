import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Islamic Society of Toronto — Masjid Darus Salaam',
    short_name: 'IST',
    description: 'Prayer times, programs, events, services, and visitor information.',
    start_url: '/prayer-times',
    display: 'standalone',
    background_color: '#f3efe6',
    theme_color: '#0b3d36',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/brand/ist-mark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
