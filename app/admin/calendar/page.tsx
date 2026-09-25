import { AdminNav } from '@/components/AdminNav';
import { CalendarView } from '@/components/CalendarView';
import { requireAdminPage } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminCalendarPage() {
  const session = await requireAdminPage();
  return (
    <>
      <AdminNav title="Calendar" username={session.username} />
      <main className="mx-auto max-w-7xl px-4 py-8 text-ist-ink">
        <CalendarView admin />
      </main>
    </>
  );
}
