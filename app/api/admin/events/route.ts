import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { listEvents, writeAudit } from '@/lib/data';
import { dbGet, dbRun } from '@/lib/database';
import { saveUploadedImage } from '@/lib/uploads';
import { readCalendarFields } from '@/lib/calendar-admin';

async function guard() {
  return getAdminSession();
}

function parseDetails(raw: unknown) {
  if (Array.isArray(raw)) return JSON.stringify(raw);
  if (typeof raw === 'string' && raw.trim()) {
    return JSON.stringify(
      raw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  return null;
}

function optionalText(value: unknown) {
  return value === null || value === undefined || value === '' ? null : String(value);
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ events: await listEvents() });
}

export async function POST(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  let body: Record<string, unknown> = {};
  let imageSrc: string | null = null;

  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    body = Object.fromEntries(fd.entries());
    const file = fd.get('poster') || fd.get('image');
    if (file instanceof File && file.size > 0) {
      imageSrc = await saveUploadedImage(file, String(body.title || 'event'));
    }
  } else {
    body = await req.json();
    imageSrc = (body.imageSrc || body.image_src || null) as string | null;
  }
  const calendar = readCalendarFields(body);
  if (calendar.error) {
    return NextResponse.json({ error: calendar.error }, { status: 400 });
  }

  const id =
    String(body.id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-') || `event-${Date.now()}`;

  const hubRaw = String(body.hub || '').trim().toLowerCase();
  const hub = hubRaw === 'youth' || hubRaw === 'sisters' || hubRaw === 'seniors' ? hubRaw : null;

  await dbRun(
      `INSERT INTO events
       (id, title, date_label, summary, badge, location, status, recurring, details_json,
        schedule_kind, image_src, starts_at, ends_at, hub, sort_order, calendar_enabled,
        recurrence_rule, recurrence_until, venue, published, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      id,
      String(body.title || 'Untitled'),
      String(body.dateLabel || body.date_label || ''),
      String(body.summary || ''),
      optionalText(body.badge),
      optionalText(body.location),
      body.status === 'past' ? 'past' : 'upcoming',
      calendar.recurring ||
        (body.recurring === true || body.recurring === 'on' || body.recurring === '1' ? 1 : 0),
      parseDetails(body.details),
      optionalText(body.scheduleKind || body.schedule_kind),
      imageSrc,
      calendar.startsAt,
      calendar.endsAt,
      hub,
      Number(body.sortOrder ?? body.sort_order ?? 0),
      calendar.calendarEnabled,
      calendar.recurrenceRule,
      calendar.recurrenceUntil,
      calendar.venue,
      calendar.published,
    ],
  );

  await writeAudit(session.username, 'create', 'event', id, String(body.title || id));
  return NextResponse.json({ ok: true, id, imageSrc });
}

export async function PUT(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  let body: Record<string, unknown> = {};
  let imageSrc: string | null | undefined;

  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    body = Object.fromEntries(fd.entries());
    const file = fd.get('poster') || fd.get('image');
    if (file instanceof File && file.size > 0) {
      imageSrc = await saveUploadedImage(file, String(body.title || body.id || 'event'));
    } else if (body.image_src || body.imageSrc) {
      imageSrc = String(body.imageSrc || body.image_src);
    }
  } else {
    body = await req.json();
    if ('imageSrc' in body || 'image_src' in body) {
      imageSrc = (body.imageSrc || body.image_src || null) as string | null;
    }
  }
  const calendar = readCalendarFields(body);
  if (calendar.error) {
    return NextResponse.json({ error: calendar.error }, { status: 400 });
  }

  const id = String(body.id || '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const existing = await dbGet<{ image_src: string | null }>(
    'SELECT image_src FROM events WHERE id = ?',
    [id],
  );
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const finalImage = imageSrc === undefined ? existing.image_src : imageSrc;

  const hubRaw = String(body.hub || '').trim().toLowerCase();
  const hub = hubRaw === 'youth' || hubRaw === 'sisters' || hubRaw === 'seniors' ? hubRaw : null;

  await dbRun(
      `UPDATE events SET
        title = ?, date_label = ?, summary = ?, badge = ?, location = ?, status = ?,
        recurring = ?, details_json = ?, schedule_kind = ?, image_src = ?,
        starts_at = ?, ends_at = ?, hub = ?, sort_order = ?, calendar_enabled = ?,
        recurrence_rule = ?, recurrence_until = ?, venue = ?, published = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
    [
      String(body.title || ''),
      String(body.dateLabel || body.date_label || ''),
      String(body.summary || ''),
      optionalText(body.badge),
      optionalText(body.location),
      body.status === 'past' ? 'past' : 'upcoming',
      calendar.recurring ||
        (body.recurring === true || body.recurring === 'on' || body.recurring === '1' ? 1 : 0),
      parseDetails(body.details),
      optionalText(body.scheduleKind || body.schedule_kind),
      finalImage,
      calendar.startsAt,
      calendar.endsAt,
      hub,
      Number(body.sortOrder ?? body.sort_order ?? 0),
      calendar.calendarEnabled,
      calendar.recurrenceRule,
      calendar.recurrenceUntil,
      calendar.venue,
      calendar.published,
      id,
    ],
  );

  await writeAudit(session.username, 'update', 'event', id, String(body.title || id));
  return NextResponse.json({ ok: true, imageSrc: finalImage });
}

export async function DELETE(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await dbRun('DELETE FROM events WHERE id = ?', [id]);
  await writeAudit(session.username, 'delete', 'event', id);
  return NextResponse.json({ ok: true });
}
