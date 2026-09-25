import { getLocale, getTranslations } from 'next-intl/server';
import { links } from '@/lib/content';
import { IconAudio } from './icons';

export async function MixlrPlayer() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'LiveAudio' });

  return (
    <div
      id="live-audio"
      className="scroll-mt-28 overflow-hidden rounded-[2rem] border border-ist-green/10 bg-white shadow-soft"
    >
      <div className="grid gap-0 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="flex flex-col justify-center bg-ist-green p-7 text-white sm:p-9">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ist-gold text-ist-green-deep">
            <IconAudio className="h-5 w-5" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-ist-teal-light">
            {t('eyebrow')}
          </p>
          <h2 className="mt-3 font-display text-4xl">{t('title')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{t('description')}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
            <a
              href={links.mixlr}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ist-gold underline-offset-4 hover:underline"
            >
              {t('openChannel')}
            </a>
            <a
              href={links.mixlrRecordings}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ist-teal-light underline-offset-4 hover:underline"
            >
              {t('recordings')}
            </a>
          </div>
        </div>

        <div className="flex min-h-56 flex-col justify-center p-5 sm:p-7">
          <iframe
            title={t('playerTitle')}
            src={links.mixlrEmbed}
            width="100%"
            height="180"
            scrolling="no"
            loading="lazy"
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
            className="w-full border-0"
          />
          <p className="mt-3 text-xs text-ist-muted">{t('offlineNote')}</p>
        </div>
      </div>
    </div>
  );
}
