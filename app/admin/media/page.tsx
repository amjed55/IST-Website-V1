'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

type Media = {
  id: string;
  key_name: string;
  src: string;
  alt: string;
};

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/media');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setMedia(data.media || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
    if (!res.ok) {
      setMsg('Upload failed');
      return;
    }
    setMsg('Picture uploaded');
    e.currentTarget.reset();
    load();
  }

  async function saveAlt(item: Media, alt: string) {
    await fetch('/api/admin/media', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key_name: item.key_name, src: item.src, alt }),
    });
    load();
  }

  return (
    <>
      <AdminNav title="Pictures" username="admin" />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <form onSubmit={onUpload} className="grid gap-3 border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <h2 className="font-display text-2xl md:col-span-2">Upload or replace picture</h2>
          <input
            name="key_name"
            required
            placeholder="Key (hero, education, community…)"
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <input name="alt" placeholder="Alt text" className="border border-white/15 bg-black/20 px-3 py-2" />
          <input name="file" type="file" accept="image/*" required className="md:col-span-2 text-sm" />
          <button type="submit" className="bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep md:col-span-2">
            Upload
          </button>
          {msg && <p className="text-sm text-ist-teal-light md:col-span-2">{msg}</p>}
        </form>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((m) => (
            <article key={m.id} className="border border-white/10 bg-white/5 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.src} alt={m.alt} className="aspect-[4/3] w-full object-cover" />
              <p className="mt-3 text-xs uppercase tracking-wider text-ist-teal-light">{m.key_name}</p>
              <input
                defaultValue={m.alt}
                onBlur={(e) => saveAlt(m, e.target.value)}
                className="mt-2 w-full border border-white/15 bg-black/20 px-2 py-1.5 text-sm"
              />
              <p className="mt-1 truncate text-[11px] text-white/40">{m.src}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
