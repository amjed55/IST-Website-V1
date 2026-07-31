'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

type User = {
  id: number;
  username: string;
  display_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ display_name: '', role: 'admin', password: '' });

  async function load() {
    const res = await fetch('/api/admin/users');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: fd.get('username'),
        password: fd.get('password'),
        displayName: fd.get('displayName'),
        role: fd.get('role'),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || 'Could not create user');
      return;
    }
    setMsg('User created');
    e.currentTarget.reset();
    load();
  }

  async function saveEdit(id: number) {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        displayName: editForm.display_name,
        role: editForm.role,
        password: editForm.password || undefined,
      }),
    });
    if (!res.ok) {
      setMsg('Could not update user');
      return;
    }
    setMsg('User updated');
    setEditId(null);
    load();
  }

  async function remove(id: number) {
    if (!confirm('Delete this admin user?')) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || 'Could not delete');
      return;
    }
    setMsg('User deleted');
    load();
  }

  return (
    <>
      <AdminNav title="Users" username="admin" />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <form onSubmit={onCreate} className="grid gap-3 border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <h2 className="font-display text-2xl md:col-span-2">Add admin user</h2>
          <input name="username" required placeholder="Username" className="border border-white/15 bg-black/20 px-3 py-2" />
          <input name="displayName" placeholder="Display name" className="border border-white/15 bg-black/20 px-3 py-2" />
          <input name="password" type="password" required minLength={6} placeholder="Password (min 6)" className="border border-white/15 bg-black/20 px-3 py-2" />
          <select name="role" className="border border-white/15 bg-black/20 px-3 py-2">
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
          <button type="submit" className="bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep md:col-span-2">
            Create user
          </button>
          {msg && <p className="text-sm text-ist-teal-light md:col-span-2">{msg}</p>}
        </form>

        <div className="divide-y divide-white/10 border border-white/10">
          {users.map((u) => (
            <div key={u.id} className="p-4">
              {editId === u.id ? (
                <div className="grid gap-2 md:grid-cols-3">
                  <input
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className="border border-white/15 bg-black/20 px-3 py-2"
                    placeholder="Display name"
                  />
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="border border-white/15 bg-black/20 px-3 py-2"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="border border-white/15 bg-black/20 px-3 py-2"
                    placeholder="New password (optional)"
                  />
                  <div className="flex gap-2 md:col-span-3">
                    <button type="button" onClick={() => saveEdit(u.id)} className="bg-ist-gold px-3 py-1.5 text-xs font-semibold text-ist-green-deep">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditId(null)} className="border border-white/20 px-3 py-1.5 text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-display text-xl">{u.display_name || u.username}</h3>
                    <p className="text-sm text-white/55">
                      @{u.username} · {u.role} · updated {u.updated_at}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(u.id);
                        setEditForm({
                          display_name: u.display_name || '',
                          role: u.role,
                          password: '',
                        });
                      }}
                      className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(u.id)}
                      className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
