'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

type Program = {
  id: string;
  category: string;
  title: string;
  summary: string;
  schedule: string | null;
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/programs');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setPrograms(data.programs || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fd.get('title'),
        category: fd.get('category'),
        summary: fd.get('summary'),
        schedule: fd.get('schedule') || null,
      }),
    });
    if (!res.ok) {
      setMsg('Could not create programme');
      return;
    }
    setMsg('Programme created');
    e.currentTarget.reset();
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this programme?')) return;
    await fetch(`/api/admin/programs?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <AdminNav title="Programs" username="admin" />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <form onSubmit={onCreate} className="grid gap-3 border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <h2 className="font-display text-2xl md:col-span-2">Add programme</h2>
          <input name="title" required placeholder="Title" className="border border-white/15 bg-black/20 px-3 py-2" />
          <select name="category" className="border border-white/15 bg-black/20 px-3 py-2">
            <option value="education">Education</option>
            <option value="community">Community</option>
            <option value="service">Service</option>
          </select>
          <input name="schedule" placeholder="Schedule" className="border border-white/15 bg-black/20 px-3 py-2 md:col-span-2" />
          <textarea name="summary" required placeholder="Summary" className="min-h-24 border border-white/15 bg-black/20 px-3 py-2 md:col-span-2" />
          <button type="submit" className="bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep md:col-span-2">
            Create programme
          </button>
          {msg && <p className="text-sm text-ist-teal-light md:col-span-2">{msg}</p>}
        </form>

        <div className="divide-y divide-white/10 border border-white/10">
          {programs.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-ist-teal-light">{p.category}</p>
                <h3 className="mt-1 font-display text-xl">{p.title}</h3>
                {p.schedule && <p className="text-sm text-ist-gold/90">{p.schedule}</p>}
                <p className="mt-2 max-w-2xl text-sm text-white/70">{p.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="h-fit rounded-full border border-red-400/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
