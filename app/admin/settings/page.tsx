'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/settings');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setSettings(data.settings || {});
  }

  useEffect(() => {
    load();
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    if (!res.ok) {
      setMsg('Could not save settings');
      return;
    }
    setMsg('Site settings saved');
    load();
  }

  function set(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <>
      <AdminNav title="Site settings" username="admin" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={onSave} className="space-y-4 border border-white/10 bg-white/5 p-5">
          <h2 className="font-display text-2xl">Homepage hero</h2>
          <label className="block text-sm">
            <span className="text-white/60">Eyebrow</span>
            <input
              value={settings.hero_eyebrow || ''}
              onChange={(e) => set('hero_eyebrow', e.target.value)}
              className="mt-1 w-full border border-white/15 bg-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/60">Title</span>
            <input
              value={settings.hero_title || ''}
              onChange={(e) => set('hero_title', e.target.value)}
              className="mt-1 w-full border border-white/15 bg-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/60">Description</span>
            <textarea
              value={settings.hero_description || ''}
              onChange={(e) => set('hero_description', e.target.value)}
              className="mt-1 min-h-24 w-full border border-white/15 bg-black/20 px-3 py-2"
            />
          </label>

          <h2 className="pt-4 font-display text-2xl">Maintenance</h2>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={settings.maintenance_mode === '1'}
              onChange={(e) => set('maintenance_mode', e.target.checked ? '1' : '0')}
            />
            Enable maintenance mode
          </label>
          <label className="block text-sm">
            <span className="text-white/60">Maintenance message</span>
            <textarea
              value={settings.maintenance_message || ''}
              onChange={(e) => set('maintenance_message', e.target.value)}
              className="mt-1 min-h-20 w-full border border-white/15 bg-black/20 px-3 py-2"
            />
          </label>

          <button type="submit" className="bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep">
            Save settings
          </button>
          {msg && <p className="text-sm text-ist-teal-light">{msg}</p>}
        </form>
      </main>
    </>
  );
}
