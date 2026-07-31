'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

type Program = {
  id: string;
  category: string;
  title: string;
  summary: string;
  schedule: string | null;
  tags_json: string | null;
  image_src: string | null;
  hub: string | null;
  sort_order: number;
};

const empty = {
  id: '',
  category: 'education',
  title: '',
  summary: '',
  schedule: '',
  tags: '',
  hub: '',
  image_src: '',
  sort_order: 0,
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [form, setForm] = useState(empty);
  const [poster, setPoster] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
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

  function startEdit(p: Program) {
    setEditing(true);
    setPoster(null);
    setForm({
      id: p.id,
      category: p.category,
      title: p.title,
      summary: p.summary,
      schedule: p.schedule || '',
      tags: p.tags_json ? (JSON.parse(p.tags_json) as string[]).join(', ') : '',
      hub: p.hub || '',
      image_src: p.image_src || '',
      sort_order: p.sort_order || 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditing(false);
    setPoster(null);
    setForm(empty);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, String(v)));
    if (poster) fd.set('poster', poster);
    const res = await fetch('/api/admin/programs', {
      method: editing ? 'PUT' : 'POST',
      body: fd,
    });
    if (!res.ok) {
      setMsg('Could not save programme');
      return;
    }
    setMsg(editing ? 'Programme updated' : 'Programme created');
    reset();
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this programme?')) return;
    await fetch(`/api/admin/programs?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (form.id === id) reset();
    load();
  }

  return (
    <>
      <AdminNav title="Programs" username="admin" />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <form onSubmit={onSubmit} className="grid gap-3 border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <h2 className="font-display text-2xl md:col-span-2">
            {editing ? `Edit: ${form.title}` : 'Add programme'}
          </h2>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          >
            <option value="education">Education</option>
            <option value="community">Community</option>
            <option value="service">Service</option>
          </select>
          <input
            placeholder="Schedule"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <select
            value={form.hub}
            onChange={(e) => setForm({ ...form, hub: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          >
            <option value="">No hub</option>
            <option value="youth">Youth Hub</option>
            <option value="sisters">Sisters&apos; Hub</option>
            <option value="seniors">Seniors Hub</option>
          </select>
          <label className="text-sm text-white/70 md:col-span-2">
            Poster / picture
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPoster(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm"
            />
          </label>
          {form.image_src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image_src} alt="" className="h-28 w-auto object-cover border border-white/10" />
          )}
          <textarea
            required
            placeholder="Summary"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="min-h-24 border border-white/15 bg-black/20 px-3 py-2 md:col-span-2"
          />
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button type="submit" className="bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep">
              {editing ? 'Save changes' : 'Create programme'}
            </button>
            {editing && (
              <button type="button" onClick={reset} className="border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
                Cancel edit
              </button>
            )}
          </div>
          {msg && <p className="text-sm text-ist-teal-light md:col-span-2">{msg}</p>}
        </form>

        <div className="divide-y divide-white/10 border border-white/10">
          {programs.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:justify-between">
              <div className="flex gap-4">
                {p.image_src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_src} alt="" className="hidden h-20 w-20 object-cover sm:block" />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-ist-teal-light">
                    {p.category}
                    {p.hub ? ` · ${p.hub}` : ''}
                  </p>
                  <h3 className="mt-1 font-display text-xl">{p.title}</h3>
                  {p.schedule && <p className="text-sm text-ist-gold/90">{p.schedule}</p>}
                  <p className="mt-2 max-w-2xl text-sm text-white/70">{p.summary}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="h-fit rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="h-fit rounded-full border border-red-400/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
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
