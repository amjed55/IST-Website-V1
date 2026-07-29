import Link from 'next/link';
import { requireAdminPage } from '@/lib/auth';
import { AdminNav } from '@/components/AdminNav';
import {
  getSiteSettings,
  listAnnouncements,
  listAuditLogs,
  listEvents,
  listMedia,
  listPrograms,
  listAdmins,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await requireAdminPage();
  const events = listEvents();
  const programs = listPrograms();
  const media = listMedia();
  const announcements = listAnnouncements(false);
  const users = listAdmins();
  const logs = listAuditLogs(8);
  const settings = getSiteSettings();

  const cards = [
    { label: 'Events', value: events.length, href: '/admin/events' },
    { label: 'Programs', value: programs.length, href: '/admin/programs' },
    { label: 'Pictures', value: media.length, href: '/admin/media' },
    { label: 'Announcements', value: announcements.length, href: '/admin/announcements' },
    { label: 'Users', value: users.length, href: '/admin/users' },
    { label: 'Audit logs', value: logs.length, href: '/admin/logs' },
  ];

  return (
    <>
      <AdminNav title="Dashboard" username={session.username} />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <p className="text-white/60">
          Manage site content, users, and maintenance. Prayer times sync from the central Prayer Clock.
          {settings.maintenance_mode === '1' && (
            <span className="ml-2 text-ist-gold">Maintenance mode is ON.</span>
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="border border-white/10 bg-white/5 p-5 transition hover:border-ist-teal/50 hover:bg-white/10"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ist-teal-light">
                {c.label}
              </p>
              <p className="mt-3 font-display text-4xl text-white">{c.value}</p>
            </Link>
          ))}
        </div>

        <section className="border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Recent changes</h2>
            <Link href="/admin/logs" className="text-sm text-ist-teal-light hover:underline">
              View all →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-wrap gap-x-3 border-b border-white/5 py-2 text-white/70">
                <span className="text-white/40">{log.created_at}</span>
                <span className="text-ist-teal-light">{log.username}</span>
                <span className="uppercase text-ist-gold/90">{log.action}</span>
                <span>
                  {log.entity_type}
                  {log.entity_id ? ` · ${log.entity_id}` : ''}
                </span>
                {log.detail && <span className="text-white/50">{log.detail}</span>}
              </li>
            ))}
            {logs.length === 0 && <li className="text-white/40">No changes yet.</li>}
          </ul>
        </section>
      </main>
    </>
  );
}
