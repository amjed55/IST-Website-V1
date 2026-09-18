'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { careersEmail } from '@/lib/content';

type CareerRow = {
  id: string;
  title: string;
  type: string;
  department: string | null;
  summary: string;
  schedule: string | null;
  location: string | null;
  deadline: string;
  start_date: string | null;
  contract: string | null;
  apply_email: string;
  apply_subject: string;
  responsibilities_json: string | null;
  requirements_json: string | null;
  image_src: string | null;
  is_active: number;
  sort_order: number;
  updated_at: string;
};

const emptyForm = {
  id: '',
  title: '',
  type: 'Part-time',
  department: '',
  summary: '',
  schedule: '',
  location: '',
  deadline: '',
  start_date: '',
  contract: '',
  apply_email: careersEmail,
  apply_subject: '',
  responsibilities: '',
  requirements: '',
  is_active: true,
  sort_order: 0,
  image_src: '',
};

function linesFromJson(raw: string | null) {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String).join('\n');
  } catch {
    /* ignore */
  }
  return raw;
}

export default function AdminCareersPage() {
  const [careers, setCareers] = useState<CareerRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [poster, setPoster] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/careers');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setCareers(data.careers || []);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(row: CareerRow) {
    setEditing(true);
    setPoster(null);
    setError('');
    setMsg('');
    setForm({
      id: row.id,
      title: row.title,
      type: row.type,
      department: row.department || '',
      summary: row.summary,
      schedule: row.schedule || '',
      location: row.location || '',
      deadline: row.deadline,
      start_date: row.start_date || '',
      contract: row.contract || '',
      apply_email: row.apply_email || careersEmail,
      apply_subject: row.apply_subject,
      responsibilities: linesFromJson(row.responsibilities_json),
      requirements: linesFromJson(row.requirements_json),
      is_active: Boolean(row.is_active),
      sort_order: row.sort_order || 0,
      image_src: row.image_src || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditing(false);
    setPoster(null);
    setForm(emptyForm);
    setError('');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMsg('');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'is_active') fd.set('is_active', v ? '1' : '0');
      else fd.set(k, String(v));
    });
    if (poster) fd.set('poster', poster);

    const res = await fetch('/api/admin/careers', {
      method: editing ? 'PUT' : 'POST',
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Could not save job posting');
      return;
    }

    setMsg(editing ? 'Job posting updated' : 'Job posting created');
    resetForm();
    load();
  }

  async function toggleActive(row: CareerRow) {
    await fetch('/api/admin/careers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: row.id,
        title: row.title,
        type: row.type,
        department: row.department,
        summary: row.summary,
        schedule: row.schedule,
        location: row.location,
        deadline: row.deadline,
        start_date: row.start_date,
        contract: row.contract,
        apply_email: row.apply_email,
        apply_subject: row.apply_subject,
        responsibilities: row.responsibilities_json,
        requirements: row.requirements_json,
        image_src: row.image_src,
        is_active: row.is_active ? 0 : 1,
        sort_order: row.sort_order,
      }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Permanently delete this job posting? This cannot be undone.')) return;
    await fetch(`/api/admin/careers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (form.id === id) resetForm();
    setMsg('Job posting deleted');
    load();
  }

  const openCount = careers.filter((c) => c.is_active).length;

  return (
    <>
      <AdminNav title="Careers & jobs" username="admin" />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ist-teal-light">
              Hiring
            </p>
            <p className="mt-1 text-sm text-white/60">
              {openCount} open · {careers.length} total postings on /careers
            </p>
          </div>
          <a
            href="/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ist-teal-light hover:underline"
          >
            Preview public careers page →
          </a>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid gap-3 border border-white/10 bg-white/5 p-5 md:grid-cols-2"
        >
          <h2 className="font-display text-2xl md:col-span-2">
            {editing ? `Edit: ${form.title}` : 'Add job posting'}
          </h2>
          <p className="text-sm text-white/55 md:col-span-2">
            Complete roles appear on the public Careers page and in the online application form.
            Hide a role without deleting it by marking it closed.
          </p>

          {!editing && (
            <label className="text-sm text-white/70 md:col-span-2">
              URL slug (optional — auto from title)
              <input
                placeholder="e.g. youth-coordinator"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="mt-1 w-full border border-white/15 bg-black/20 px-3 py-2"
              />
            </label>
          )}

          <input
            required
            placeholder="Job title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            required
            placeholder="Type (Part-time, Full-time, Contract…) *"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            required
            placeholder="Application deadline *"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            placeholder="Schedule / hours"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            placeholder="Start date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            placeholder="Contract terms"
            value={form.contract}
            onChange={(e) => setForm({ ...form, contract: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            required
            type="email"
            placeholder="Apply-to email *"
            value={form.apply_email}
            onChange={(e) => setForm({ ...form, apply_email: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            required
            placeholder="Email subject line *"
            value={form.apply_subject}
            onChange={(e) => setForm({ ...form, apply_subject: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            type="number"
            placeholder="Sort order"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Open / visible on public careers page
          </label>

          <label className="text-sm text-white/70 md:col-span-2">
            Poster image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPoster(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm"
            />
          </label>
          {form.image_src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.image_src}
              alt=""
              className="h-28 w-auto border border-white/10 object-cover md:col-span-2"
            />
          )}

          <textarea
            required
            placeholder="Summary shown on listing and detail pages *"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="min-h-24 border border-white/15 bg-black/20 px-3 py-2 md:col-span-2"
          />
          <textarea
            placeholder="Responsibilities (one per line)"
            value={form.responsibilities}
            onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
            className="min-h-28 border border-white/15 bg-black/20 px-3 py-2 md:col-span-2"
          />
          <textarea
            placeholder="Requirements (one per line)"
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            className="min-h-28 border border-white/15 bg-black/20 px-3 py-2 md:col-span-2"
          />

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep disabled:opacity-60"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create job posting'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
              >
                Cancel edit
              </button>
            )}
          </div>
          {msg && <p className="text-sm text-ist-teal-light md:col-span-2">{msg}</p>}
          {error && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
        </form>

        <div className="divide-y divide-white/10 border border-white/10">
          {careers.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex gap-4">
                {row.image_src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.image_src}
                    alt=""
                    className="hidden h-24 w-20 object-cover sm:block"
                  />
                ) : (
                  <div className="hidden h-24 w-20 items-center justify-center bg-black/30 text-[10px] uppercase tracking-wider text-white/35 sm:flex">
                    No art
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-ist-teal-light">
                    {row.is_active ? 'Open' : 'Closed'} · {row.type}
                    {row.department ? ` · ${row.department}` : ''} · order {row.sort_order}
                  </p>
                  <h3 className="mt-1 font-display text-xl">{row.title}</h3>
                  <p className="text-sm text-white/55">Deadline: {row.deadline}</p>
                  <p className="mt-2 max-w-2xl text-sm text-white/70 line-clamp-2">{row.summary}</p>
                  <a
                    href={`/careers/${row.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-ist-teal-light hover:underline"
                  >
                    /careers/{row.id}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(row)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  {row.is_active ? 'Close role' : 'Reopen'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {careers.length === 0 && (
            <p className="p-6 text-sm text-white/50">
              No job postings yet. Create the first opening above.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
