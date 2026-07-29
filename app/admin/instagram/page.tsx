'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

type IgPost = {
  id: string;
  permalink: string;
  media_type: string;
  caption: string | null;
  poster_src: string | null;
  video_src: string | null;
  is_active: number;
  sort_order: number;
  updated_at: string;
};

export default function AdminInstagramPage() {
  const [posts, setPosts] = useState<IgPost[]>([]);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState<IgPost | null>(null);

  async function load() {
    const res = await fetch('/api/admin/instagram');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setPosts(data.posts || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await fetch('/api/admin/instagram', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || 'Could not create post');
      return;
    }
    setMsg('Instagram post added to carousel');
    form.reset();
    load();
  }

  async function onUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    fd.set('id', editing.id);
    const res = await fetch('/api/admin/instagram', { method: 'PUT', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || 'Update failed');
      return;
    }
    setMsg('Post updated');
    setEditing(null);
    load();
  }

  async function toggle(p: IgPost) {
    await fetch('/api/admin/instagram', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: p.id,
        permalink: p.permalink,
        media_type: p.media_type,
        caption: p.caption,
        poster_src: p.poster_src,
        video_src: p.video_src,
        is_active: p.is_active ? 0 : 1,
        sort_order: p.sort_order,
      }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Remove this post from the carousel?')) return;
    await fetch(`/api/admin/instagram?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <AdminNav title="Instagram" username="admin" />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <form onSubmit={onCreate} className="grid gap-3 border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <h2 className="font-display text-2xl md:col-span-2">Add carousel post</h2>
          <p className="text-sm text-white/60 md:col-span-2">
            Paste a post or reel URL (<code className="text-ist-teal-light">/p/…</code> or{' '}
            <code className="text-ist-teal-light">/reel/…</code>) for the official Instagram embed
            (videos play in-site). Optionally upload a poster and/or video file for native HTML5
            playback instead of the embed.
          </p>
          <input
            name="permalink"
            required
            placeholder="https://www.instagram.com/p/XXXX/ or /reel/XXXX/"
            className="border border-white/15 bg-black/20 px-3 py-2 md:col-span-2"
          />
          <input name="caption" placeholder="Caption (optional)" className="border border-white/15 bg-black/20 px-3 py-2" />
          <select name="media_type" defaultValue="" className="border border-white/15 bg-black/20 px-3 py-2">
            <option value="">Auto-detect type</option>
            <option value="image">Image</option>
            <option value="carousel">Carousel</option>
            <option value="video">Video</option>
            <option value="reel">Reel</option>
          </select>
          <label className="text-sm text-white/70">
            Poster image
            <input name="poster" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
          </label>
          <label className="text-sm text-white/70">
            Native video (optional)
            <input name="video" type="file" accept="video/*" className="mt-1 block w-full text-sm" />
          </label>
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            placeholder="Sort order"
            className="border border-white/15 bg-black/20 px-3 py-2"
          />
          <button
            type="submit"
            className="w-fit bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep md:col-span-2"
          >
            Add to carousel
          </button>
          {msg && <p className="text-sm text-ist-teal-light md:col-span-2">{msg}</p>}
        </form>

        {editing && (
          <form onSubmit={onUpdate} className="grid gap-3 border border-ist-gold/40 bg-white/5 p-5 md:grid-cols-2">
            <h2 className="font-display text-2xl md:col-span-2">Edit · {editing.id}</h2>
            <input
              name="permalink"
              required
              defaultValue={editing.permalink}
              className="border border-white/15 bg-black/20 px-3 py-2 md:col-span-2"
            />
            <input
              name="caption"
              defaultValue={editing.caption || ''}
              placeholder="Caption"
              className="border border-white/15 bg-black/20 px-3 py-2"
            />
            <select
              name="media_type"
              defaultValue={editing.media_type}
              className="border border-white/15 bg-black/20 px-3 py-2"
            >
              <option value="image">Image</option>
              <option value="carousel">Carousel</option>
              <option value="video">Video</option>
              <option value="reel">Reel</option>
            </select>
            <label className="text-sm text-white/70">
              Replace poster
              <input name="poster" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
            </label>
            <label className="text-sm text-white/70">
              Replace video
              <input name="video" type="file" accept="video/*" className="mt-1 block w-full text-sm" />
            </label>
            <input
              name="sort_order"
              type="number"
              defaultValue={editing.sort_order}
              className="border border-white/15 bg-black/20 px-3 py-2"
            />
            <input type="hidden" name="is_active" value={editing.is_active ? '1' : '0'} />
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep">
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-white/10 border border-white/10">
          {posts.map((p) => (
            <div key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="h-20 w-20 shrink-0 overflow-hidden bg-black/30">
                {p.poster_src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.poster_src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wider text-white/40">
                    {p.media_type}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-ist-teal-light">
                  {p.is_active ? 'Active' : 'Hidden'} · {p.media_type} · order {p.sort_order}
                  {p.video_src ? ' · native video' : ''}
                </p>
                <p className="mt-1 truncate text-sm text-white/90">{p.caption || p.id}</p>
                <a
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block truncate text-xs text-white/45 hover:text-ist-teal-light"
                >
                  {p.permalink}
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggle(p)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  {p.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="p-6 text-sm text-white/50">No Instagram posts yet. Add a post or reel URL above.</p>
          )}
        </div>
      </main>
    </>
  );
}
