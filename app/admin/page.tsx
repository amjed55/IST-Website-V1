import Link from 'next/link';
import { requireAdminPage } from '@/lib/auth';
import { AdminNav } from '@/components/AdminNav';
import { listAnnouncements, listEvents, listMedia, listPrograms } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await requireAdminPage();
  const events = listEvents();
  const programs = listPrograms();
  const media = listMedia();
  const announcements = listAnnouncements(false);

  const cards = [
    { label: 'Events', value: events.length, href: '/admin/events' },
    { label: 'Programs', value: programs.length, href: '/admin/programs' },
    { label: 'Pictures', value: media.length, href: '/admin/media' },
    { label: 'Announcements', value: announcements.length, href: '/admin' },
  ];

  return (
    <>
      <AdminNav title="Dashboard" username={session.username} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-white/60">
          Edit live content stored in the local SQLite database. Prayer times sync from the central
          Prayer Clock at 142.93.61.217.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </main>
    </>
  );
}
