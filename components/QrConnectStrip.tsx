'use client';

import { useEffect, useState } from 'react';
import { connectLinks } from '@/lib/links';
import { connectIcons } from './icons';
import { FadeUp, Stagger, StaggerItem } from './motion';

export function QrConnectStrip({ title = 'Connect with IST' }: { title?: string }) {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const next: Record<string, string> = {};
        for (const item of connectLinks) {
          next[item.id] = await QRCode.toDataURL(item.url, {
            margin: 1,
            width: 160,
            color: { dark: item.accent, light: '#ffffff' },
          });
        }
        if (!cancelled) setImages(next);
      } catch {
        /* QR is progressive enhancement */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <FadeUp>
        <span className="eyebrow">Scan or tap</span>
        <h2 className="mt-4 font-display text-3xl text-ist-green sm:text-4xl">{title}</h2>
        <p className="mt-2 text-ist-ink/60">
          Donate, join WhatsApp updates, or follow us on Instagram.
        </p>
      </FadeUp>

      <Stagger staggerDelay={0.1} className="mt-10 grid gap-8 sm:grid-cols-3">
        {connectLinks.map((item) => {
          const Icon = connectIcons[item.id];
          return (
            <StaggerItem key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 sm:flex-col sm:items-center sm:text-center"
              >
                {/* Icon */}
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition group-hover:opacity-80"
                  style={{ backgroundColor: item.accent }}
                >
                  <Icon className="h-5 w-5" />
                </span>

                {/* QR */}
                <div className="hidden sm:block rounded-lg bg-white p-2 shadow-soft">
                  {images[item.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[item.id]}
                      alt={`${item.label} QR code`}
                      className="h-24 w-24"
                    />
                  ) : (
                    <div className="h-24 w-24 animate-pulse rounded-md bg-ist-cream-dark" />
                  )}
                </div>

                {/* Label */}
                <div>
                  <p className="font-semibold text-ist-green">{item.label}</p>
                  <p className="mt-0.5 text-xs text-ist-muted transition group-hover:text-ist-teal">
                    Open link →
                  </p>
                </div>
              </a>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
