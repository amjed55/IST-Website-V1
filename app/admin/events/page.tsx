'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

type EventRow = {
  id: string;
  title: string;
  date_label: string;
  summary: string;
  badge: string | null;
  location: string | null;
  status: 'upcoming' | 'past';
  recurring: number;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [username, setUsername] = useState('admin');
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/events');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setEvents(data.events || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fd.get('title'),
        dateLabel: fd.get('dateLabel'),
        summary: fd.get('summary'),
        badge: fd.get('badge') || null,
        location: fd.get('location') || null,
        status: fd.get('status'),
        recurring: fd.get('recurring') === 'on',
      }),
    });
    if (!res.ok) {
      setMsg('Could not create event');
      return;
    }
    setMsg('Event created');
    e.currentTarget.reset();
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    load();
  }

  async function toggleStatus(ev: EventRow) {
    await fetch('/api/admin/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: ev.id,
        title: ev.title,
        dateLabel: ev.date_label,
        summary: ev.summary,
        badge: ev.badge,
        location: ev.location,
        status: ev.status === 'upcoming' ? 'past' : 'upcoming',
        recurring: Boolean(ev.recurring),
      }),
    });
    load();
  }

  return (
    <>
      <AdminNav title="Events" username={username} />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <form onSubmit={onCreate} className="grid gap-3 border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <h2 className="font-display text-2xl md:col-span-2">Add event</h2>
          <input name="title" required placeholder="Title" className="border border-white/15 bg-black/20 px-3 py-2" />
          <input name="dateLabel" required placeholder="Date label" className="border border-white/15 bg-black/20 px-3 py-2" />
          <input name="badge" placeholder="Badge" className="border border-white/15 bg-black/20 px-3 py-2" />
          <input name="location" placeholder="Location" className="border border-white/15 bg-black/20 px-3 py-2" />
          <select name="status" className="border border-white/15 bg-black/20 px-3 py-2">
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input name="recurring" type="checkbox" /> Recurring
          </label>
          <textarea name="summary" required placeholder="Summary" className="min-h-24 border border-white/15 bg-black/20 px-3 py-2 md:col-span-2" />
          <button type="submit" className="bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep md:col-span-2">
            Create event
          </button>
          {msg && <p className="text-sm text-ist-teal-light md:col-span-2">{msg}</p>}
        </form>

        <div className="divide-y divide-white/10 border border-white/10">
          {events.map((ev) => (
            <div key={ev.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-ist-teal-light">
                  {ev.status} {ev.recurring ? '· recurring' : ''} {ev.badge ? `· ${ev.badge}` : ''}
                </p>
                <h3 className="mt-1 font-display text-xl">{ev.title}</h3>
                <p className="text-sm text-white/55">{ev.date_label}</p>
                <p className="mt-2 max-w-2xl text-sm text-white/70">{ev.summary}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleStatus(ev)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  Mark {ev.status === 'upcoming' ? 'past' : 'upcoming'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(ev.id)}
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
