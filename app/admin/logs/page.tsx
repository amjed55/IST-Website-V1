'use client';

import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';

type Log = {
  id: number;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  detail: string | null;
  created_at: string;
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/logs?limit=200');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      setLogs(data.logs || []);
    })();
  }, []);

  return (
    <>
      <AdminNav title="Audit logs" username="admin" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="mb-6 text-sm text-white/60">
          Every create, update, and delete in the admin panel is recorded with user and timestamp.
        </p>
        <div className="overflow-x-auto border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-white/10">
                  <td className="whitespace-nowrap px-3 py-2 text-white/55">{log.created_at}</td>
                  <td className="px-3 py-2 font-medium text-ist-teal-light">{log.username}</td>
                  <td className="px-3 py-2 uppercase text-ist-gold/90">{log.action}</td>
                  <td className="px-3 py-2">
                    {log.entity_type}
                    {log.entity_id ? ` · ${log.entity_id}` : ''}
                  </td>
                  <td className="px-3 py-2 text-white/70">{log.detail || '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-white/40">
                    No changes logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
