'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { CALENDAR_WEEKDAYS, toTorontoLocalInput } from '@/lib/calendar';

type EventRow = {
  id: string;
  title: string;
  date_label: string;
  summary: string;
  badge: string | null;
  location: string | null;
  status: 'upcoming' | 'past';
  recurring: number;
  details_json: string | null;
  schedule_kind: string | null;
  image_src: string | null;
  starts_at: string | null;
  ends_at: string | null;
  hub: string | null;
  sort_order: number;
  calendar_enabled: number;
  recurrence_rule: string | null;
  recurrence_until: string | null;
  venue: string | null;
  published: number;
};

const emptyForm = {
  id: '',
  title: '',
  date_label: '',
  summary: '',
  badge: '',
  location: '',
  status: 'upcoming' as 'upcoming' | 'past',
  recurring: false,
  details: '',
  schedule_kind: '',
  starts_at: '',
  ends_at: '',
  hub: '',
  sort_order: 0,
  image_src: '',
  calendar_enabled: false,
  recurrence_frequency: 'none' as 'none' | 'daily' | 'weekly',
  recurrence_days: [] as string[],
  recurrence_interval: 1,
  recurrence_until: '',
  venue: '',
  published: true,
};

function recurrenceForm(rule: string | null) {
  if (!rule) {
    return { frequency: 'none' as const, days: [] as string[], interval: 1 };
  }
  const frequency = rule.includes('FREQ=DAILY') ? ('daily' as const) : ('weekly' as const);
  const days = rule.match(/BYDAY=([^;\r\n]+)/)?.[1]?.split(',') || [];
  const interval = Number(rule.match(/INTERVAL=(\d+)/)?.[1] || 1);
  return { frequency, days, interval };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [poster, setPoster] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/events');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    const rows = data.events || [];
    setEvents(rows);
    const editId = new URLSearchParams(window.location.search).get('edit');
    const target = rows.find((event: EventRow) => event.id === editId);
    if (target) {
      startEdit(target);
      window.history.replaceState({}, '', '/admin/events');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(ev: EventRow) {
    const recurrence = recurrenceForm(ev.recurrence_rule);
    setEditing(true);
    setPoster(null);
    setForm({
      id: ev.id,
      title: ev.title,
      date_label: ev.date_label,
      summary: ev.summary,
      badge: ev.badge || '',
      location: ev.location || '',
      status: ev.status,
      recurring: Boolean(ev.recurring),
      details: ev.details_json
        ? (JSON.parse(ev.details_json) as string[]).join('\n')
        : '',
      schedule_kind: ev.schedule_kind || '',
      starts_at: toTorontoLocalInput(ev.starts_at),
      ends_at: toTorontoLocalInput(ev.ends_at),
      hub: ev.hub || '',
      sort_order: ev.sort_order || 0,
      image_src: ev.image_src || '',
      calendar_enabled: Boolean(ev.calendar_enabled),
      recurrence_frequency: recurrence.frequency,
      recurrence_days: recurrence.days,
      recurrence_interval: recurrence.interval,
      recurrence_until: ev.recurrence_until || '',
      venue: ev.venue || ev.location || '',
      published: ev.published !== 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditing(false);
    setPoster(null);
    setForm(emptyForm);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (typeof v === 'boolean') fd.set(k, v ? '1' : '0');
      else if (Array.isArray(v)) fd.set(k, v.join(','));
      else fd.set(k, String(v));
    });
    fd.set('dateLabel', form.date_label);
    fd.set('scheduleKind', form.schedule_kind);
    if (poster) fd.set('poster', poster);

    const res = await fetch('/api/admin/events', {
      method: editing ? 'PUT' : 'POST',
      body: fd,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error || 'Could not save event');
      return;
    }
    setMsg(editing ? 'Event updated' : 'Event created');
    resetForm();
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (form.id === id) resetForm();
    load();
  }

  return (
    <>
      <AdminNav title="Events" username="admin" />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <form onSubmit={onSubmit} className="grid gap-3 border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <h2 className="font-display text-2xl md:col-span-2">
            {editing ? `Edit: ${form.title}` : 'Add event'}
          </h2>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            required
            placeholder="Date label (shown on site)"
            value={form.date_label}
            onChange={(e) => setForm({ ...form, date_label: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            placeholder="Badge"
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <fieldset className="space-y-4 border border-ist-teal/30 bg-ist-green-deep/40 p-4 md:col-span-2">
            <legend className="px-2 font-semibold text-ist-teal-light">Public calendar</legend>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.calendar_enabled}
                onChange={(e) => setForm({ ...form, calendar_enabled: e.target.checked })}
              />
              Show this event on the public calendar
            </label>
            {form.calendar_enabled && (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm text-white/70">
                  Starts in Toronto
                  <input
                    required
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    className="mt-1 w-full border border-white/15 bg-black/20 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-white/70">
                  Ends in Toronto
                  <input
                    required
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    className="mt-1 w-full border border-white/15 bg-black/20 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-white/70">
                  Repeats
                  <select
                    value={form.recurrence_frequency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recurrence_frequency: e.target.value as 'none' | 'daily' | 'weekly',
                      })
                    }
                    className="mt-1 w-full border border-white/15 bg-black/20 px-3 py-2"
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </label>
                <label className="text-sm text-white/70">
                  Venue
                  <input
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="Masjid Darus Salaam"
                    className="mt-1 w-full border border-white/15 bg-black/20 px-3 py-2"
                  />
                </label>
                {form.recurrence_frequency !== 'none' && (
                  <>
                    <label className="text-sm text-white/70">
                      Repeat every
                      <span className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={form.recurrence_interval}
                          onChange={(e) =>
                            setForm({ ...form, recurrence_interval: Number(e.target.value) })
                          }
                          className="w-20 border border-white/15 bg-black/20 px-3 py-2"
                        />
                        {form.recurrence_frequency === 'daily' ? 'day(s)' : 'week(s)'}
                      </span>
                    </label>
                    <label className="text-sm text-white/70">
                      Repeat until (optional)
                      <input
                        type="date"
                        value={form.recurrence_until}
                        onChange={(e) => setForm({ ...form, recurrence_until: e.target.value })}
                        className="mt-1 w-full border border-white/15 bg-black/20 px-3 py-2"
                      />
                    </label>
                  </>
                )}
                {form.recurrence_frequency === 'weekly' && (
                  <div className="md:col-span-2">
                    <p className="mb-2 text-sm text-white/70">Repeat on</p>
                    <div className="flex flex-wrap gap-2">
                      {CALENDAR_WEEKDAYS.map((day) => (
                        <label
                          key={day}
                          className="flex items-center gap-1.5 border border-white/15 px-2.5 py-1.5 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={form.recurrence_days.includes(day)}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                recurrence_days: e.target.checked
                                  ? [...form.recurrence_days, day]
                                  : form.recurrence_days.filter((value) => value !== day),
                              })
                            }
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  Published
                </label>
                <p className="text-xs text-white/50 md:text-right">
                  {form.starts_at && form.ends_at
                    ? `${form.recurrence_frequency === 'none' ? 'Once' : `Repeats ${form.recurrence_frequency}`} · ${form.starts_at.replace('T', ' ')}–${form.ends_at.split('T')[1] || form.ends_at}`
                    : 'Choose a start and end to preview the schedule.'}
                </p>
              </div>
            )}
          </fieldset>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'upcoming' | 'past' })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <select
            value={form.schedule_kind}
            onChange={(e) => setForm({ ...form, schedule_kind: e.target.value })}
            className="border border-white/15 bg-black/20 px-3 py-2"
          >
            <option value="">No special schedule</option>
            <option value="zuhr-window">Zuhr iqamah window</option>
          </select>
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
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
            />
            Recurring (won&apos;t auto-expire)
          </label>
          <label className="text-sm text-white/70">
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
          <textarea
            placeholder="Details (one per line)"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            className="min-h-20 border border-white/15 bg-black/20 px-3 py-2 md:col-span-2"
          />
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button type="submit" className="bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep">
              {editing ? 'Save changes' : 'Create event'}
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
          {msg && (
            <p className="text-sm text-ist-teal-light md:col-span-2" role="status">
              {msg}
            </p>
          )}
        </form>

        <div className="divide-y divide-white/10 border border-white/10">
          {events.map((ev) => (
            <div key={ev.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                {ev.image_src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ev.image_src} alt="" className="hidden h-20 w-20 object-cover sm:block" />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-ist-teal-light">
                    {ev.status} {ev.recurring ? '· recurring' : ''} {ev.badge ? `· ${ev.badge}` : ''}
                    {ev.hub ? ` · ${ev.hub}` : ''}
                    {ev.calendar_enabled ? ' · calendar' : ''}
                  </p>
                  <h3 className="mt-1 font-display text-xl">{ev.title}</h3>
                  <p className="text-sm text-white/55">{ev.date_label}</p>
                  {ev.ends_at && (
                    <p className="text-xs text-white/40">Ends: {new Date(ev.ends_at).toLocaleString()}</p>
                  )}
                  <p className="mt-2 max-w-2xl text-sm text-white/70">{ev.summary}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(ev)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  Edit
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
