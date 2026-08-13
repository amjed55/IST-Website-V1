'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Button } from './ui';
import { TurnstileField } from './TurnstileField';
import { isAppLocale } from '@/i18n/routing';

export type FormType =
  | 'contact'
  | 'program-register'
  | 'event-inquiry'
  | 'volunteer'
  | 'career-apply';

type Props = {
  type: FormType;
  prefill?: Record<string, string>;
  submitLabel?: string;
};

export function SiteForm({ type, prefill = {}, submitLabel }: Props) {
  const t = useTranslations('Form');
  const locale = useLocale();
  const pathname = usePathname();
  const privacyHref = isAppLocale(pathname.split('/').filter(Boolean)[0])
    ? `/${locale}/privacy`
    : '/privacy';
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    if (!turnstileToken) {
      setStatus('error');
      setError('Please complete the captcha.');
      return;
    }

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, turnstileToken, ...data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setStatus('ok');
      form.reset();
      setTurnstileToken('');
      setCaptchaKey((k) => k + 1);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to send');
      setTurnstileToken('');
      setCaptchaKey((k) => k + 1);
    }
  }

  const field =
    'w-full rounded-2xl border border-ist-green/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-ist-teal focus:ring-2 focus:ring-ist-teal/20';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">{t('name')}</span>
          <input name="name" required maxLength={120} className={field} defaultValue={prefill.name} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">{t('email')}</span>
          <input
            name="email"
            type="email"
            required
            maxLength={160}
            className={field}
            defaultValue={prefill.email}
          />
        </label>
      </div>

      {(type === 'program-register' ||
        type === 'volunteer' ||
        type === 'career-apply' ||
        type === 'event-inquiry') && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">{t('phone')}</span>
          <input name="phone" maxLength={40} className={field} defaultValue={prefill.phone} />
        </label>
      )}

      {type === 'contact' && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">{t('topic')}</span>
          <select name="topic" className={field} defaultValue={prefill.topic || 'General'}>
            {[
              'General',
              'Nikah',
              'Education',
              'Janazah',
              'Volunteer',
              'Careers',
              'Events',
              'Visit',
            ].map((topic) => (
              <option key={topic} value={topic}>
                {(
                  {
                    General: t('general'),
                    Nikah: t('nikah'),
                    Education: t('education'),
                    Janazah: t('janazah'),
                    Volunteer: t('volunteer'),
                  } as Record<string, string>
                )[topic] || topic}
              </option>
            ))}
          </select>
        </label>
      )}

      {type === 'program-register' && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">Program</span>
          <input name="program" required className={field} defaultValue={prefill.program} />
        </label>
      )}

      {type === 'event-inquiry' && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">Event</span>
          <input name="event" required className={field} defaultValue={prefill.event} />
        </label>
      )}

      {type === 'volunteer' && (
        <>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ist-green">{t('role')}</span>
            <select
              name="interests"
              required
              className={field}
              defaultValue={prefill.interests || ''}
            >
              <option value="" disabled>
                Choose a role
              </option>
              {[
                'Parking',
                'Hospitality',
                'Education',
                'Youth',
                'Sisters',
                'Seniors',
                'Events',
                'Facilities',
              ].map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ist-green">{t('availability')}</span>
            <input
              name="availability"
              required
              maxLength={200}
              className={field}
              placeholder="For example: Friday evenings and weekends"
              defaultValue={prefill.availability}
            />
          </label>
        </>
      )}

      {type === 'career-apply' && (
        <>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ist-green">Role</span>
            <input name="role" required className={field} defaultValue={prefill.role} readOnly={!!prefill.role} />
          </label>
          {prefill.jobId && <input type="hidden" name="jobId" value={prefill.jobId} />}
          {prefill.applySubject && (
            <input type="hidden" name="applySubject" value={prefill.applySubject} />
          )}
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ist-green">LinkedIn profile</span>
            <input
              name="linkedin"
              type="url"
              className={field}
              placeholder="https://www.linkedin.com/in/…"
              defaultValue={prefill.linkedin}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ist-green">Resume link / note</span>
            <input
              name="resume"
              className={field}
              placeholder="Optional Drive/Dropbox link"
              defaultValue={prefill.resume}
            />
          </label>
        </>
      )}

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ist-green">{t('message')}</span>
        <textarea
          name="message"
          required
          rows={4}
          maxLength={4000}
          className={field}
          defaultValue={prefill.message}
        />
      </label>

      <TurnstileField key={captchaKey} onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

      <p className="text-xs text-ist-muted">
        {t('privacy')}{' '}
        See our{' '}
        <Link href={privacyHref} className="text-ist-teal underline-offset-2 hover:underline">
          Privacy
        </Link>{' '}
        page.
      </p>

      <Button type="submit" disabled={status === 'loading' || !turnstileToken} className="w-full sm:w-auto">
        {status === 'loading' ? t('sending') : submitLabel || t('send')}
      </Button>

      {status === 'ok' && (
        <p
          className="rounded-2xl bg-ist-teal/10 px-4 py-3 text-sm text-ist-teal"
          role="status"
          aria-live="polite"
        >
          {t('success')}
        </p>
      )}
      {status === 'error' && (
        <p
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </form>
  );
}
