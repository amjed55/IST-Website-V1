'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: fd.get('username'),
        password: fd.get('password'),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Login failed');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md border border-white/10 bg-ist-green/80 p-8 shadow-lift backdrop-blur">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ist-gold">
          Islamic Society of Toronto
        </p>
        <h1 className="mt-3 font-display text-4xl text-white">Admin login</h1>
        <p className="mt-2 text-sm text-white/60">
          Manage events, programmes, and site pictures.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-white/70">Username</span>
            <input
              name="username"
              required
              autoComplete="username"
              className="mt-1.5 w-full border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-ist-teal"
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/70">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-ist-teal"
            />
          </label>
          {error && (
            <p className="text-sm text-red-300" role="alert" aria-live="polite">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ist-gold py-3 text-sm font-semibold text-ist-green-deep transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
