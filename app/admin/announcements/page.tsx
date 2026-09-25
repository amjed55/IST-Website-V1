'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

type Ann = {
  id: number;
  message: string;
  is_active: number;
  sort_order: number;
  source: string;
  updated_at: string;
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Ann[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/announcements');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setItems(data.announcements || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: fd.get('message') }),
    });
    if (!res.ok) {
      setMsg('Could not create');
      return;
    }
    setMsg('Announcement added');
    e.currentTarget.reset();
    load();
  }

  async function toggle(a: Ann) {
    await fetch('/api/admin/announcements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: a.id,
        message: a.message,
        is_active: a.is_active ? 0 : 1,
        sort_order: a.sort_order,
      }),
    });
    load();
  }

  async function remove(id: number) {
    if (!confirm('Delete announcement?')) return;
    await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <AdminNav title="Announcements" username="admin" />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <form onSubmit={onCreate} className="grid gap-3 border border-white/10 bg-white/5 p-5">
          <h2 className="font-display text-2xl">Add announcement</h2>
          <textarea
            name="message"
            required
            placeholder="Message shown in sticky banner / notices"
            className="min-h-20 border border-white/15 bg-black/20 px-3 py-2"
          />
          <button type="submit" className="w-fit bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep">
            Add
          </button>
          {msg && <p className="text-sm text-ist-teal-light">{msg}</p>}
        </form>

        <div className="divide-y divide-white/10 border border-white/10">
          {items.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-ist-teal-light">
                  {a.is_active ? 'Active' : 'Hidden'} · {a.source}
                </p>
                <p className="mt-1 text-white/85">{a.message}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggle(a)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  {a.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
