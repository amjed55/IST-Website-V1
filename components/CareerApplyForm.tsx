'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import type { Career } from '@/lib/content';
import { Button } from './ui';
import { TurnstileField } from './TurnstileField';

const ACCEPTED =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  job: Career;
};

export function CareerApplyForm({ job }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const [fileName, setFileName] = useState('');

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
    const fd = new FormData(form);
    const file = fd.get('resumeFile');
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_BYTES) {
        setStatus('error');
        setError('Resume must be 5MB or smaller.');
        return;
      }
    }

    fd.set('type', 'career-apply');
    fd.set('jobId', job.id);
    fd.set('role', job.title);
    fd.set('applySubject', job.applySubject);
    fd.set('turnstileToken', turnstileToken);

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setStatus('ok');
      form.reset();
      setFileName('');
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
    <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div className="rounded-2xl border border-ist-teal/20 bg-ist-teal/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ist-teal">Applying for</p>
        <p className="mt-1 font-display text-xl text-ist-green">{job.title}</p>
        <p className="mt-0.5 text-xs text-ist-muted">Job ID: {job.id}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">Full name</span>
          <input name="name" required maxLength={120} className={field} autoComplete="name" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={160}
            className={field}
            autoComplete="email"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ist-green">Phone</span>
        <input name="phone" maxLength={40} className={field} autoComplete="tel" />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ist-green">LinkedIn profile</span>
        <input
          name="linkedin"
          type="url"
          className={field}
          placeholder="https://www.linkedin.com/in/your-profile"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">Upload resume</span>
          <input
            name="resumeFile"
            type="file"
            accept={ACCEPTED}
            className="block w-full text-sm text-ist-muted file:mr-3 file:rounded-full file:border-0 file:bg-ist-green file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ist-green-deep"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
          />
          <span className="mt-1.5 block text-xs text-ist-muted">
            PDF or Word · max 5MB{fileName ? ` · ${fileName}` : ''}
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ist-green">Or resume link</span>
          <input
            name="resume"
            className={field}
            placeholder="Google Drive / Dropbox URL"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ist-green">Cover letter / message</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={4000}
          className={field}
          defaultValue={`I am applying for ${job.title}.\n\n`}
        />
      </label>

      <TurnstileField key={captchaKey} onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

      <p className="text-xs text-ist-muted">
        Your application is emailed to {job.applyEmail}. See our{' '}
        <Link href="/privacy" className="text-ist-teal underline-offset-2 hover:underline">
          Privacy
        </Link>{' '}
        page.
      </p>

      <Button
        type="submit"
        disabled={status === 'loading' || !turnstileToken}
        className="w-full sm:w-auto"
        variant="teal"
      >
        {status === 'loading' ? 'Submitting…' : 'Submit application'}
      </Button>

      {status === 'ok' && (
        <p className="rounded-2xl bg-ist-teal/10 px-4 py-3 text-sm text-ist-teal">
          Thank you — your application was sent. Only shortlisted candidates will be contacted.
        </p>
      )}
      {status === 'error' && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
    </form>
  );
}
