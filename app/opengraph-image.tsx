import { ImageResponse } from 'next/og';

export const alt = 'Islamic Society of Toronto — Masjid Darus Salaam';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 84px',
          color: '#f7f4ef',
          background:
            'radial-gradient(circle at 85% 15%, #0d9488 0%, #0b3d36 42%, #072a25 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#b8944a',
              color: '#072a25',
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            IST
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 25, color: '#6ee7d8', letterSpacing: 5 }}>
              MASJID DARUS SALAAM
            </span>
            <span style={{ marginTop: 8, fontSize: 20, color: '#ffffffaa' }}>
              20 Overlea Blvd · Toronto
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 980 }}>
          <span style={{ fontSize: 76, lineHeight: 1, fontWeight: 600 }}>
            Islamic Society of Toronto
          </span>
          <span style={{ marginTop: 26, fontSize: 30, color: '#ffffffbb' }}>
            Faith, knowledge, and community since 1995
          </span>
        </div>
      </div>
    ),
    size,
  );
}
