'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/programs', label: 'Programs' },
  { href: '/admin/media', label: 'Pictures' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/careers', label: 'Careers' },
  { href: '/admin/instagram', label: 'Instagram' },
  { href: '/admin/settings', label: 'Site' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/logs', label: 'Logs' },
];

export function AdminNav({ title, username }: { title: string; username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="border-b border-white/10 bg-ist-green">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ist-gold">
            IST Administration · {username}
          </p>
          <h1 className="font-display text-2xl text-white">{title}</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-1 text-sm text-white/80">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 transition ${
                pathname === l.href ? 'bg-white/15 text-white' : 'hover:bg-white/10'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/" className="rounded-full px-3 py-1.5 text-ist-teal-light hover:bg-white/10">
            View site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
