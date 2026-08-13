import 'server-only';

import postgres, { type Sql } from 'postgres';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { careers, notices } from './content';
import { seedAnnouncementsExtra, seedEventsExtra, seedProgramsExtra } from './seed-data';
import { seedInstagramPosts } from './instagram';

type Params = (string | number | boolean | null)[];

let pg: Sql | null = null;
let postgresReady: Promise<void> | null = null;

export function usesPostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function postgresClient() {
  if (!process.env.DATABASE_URL) return null;
  if (!pg) {
    pg = postgres(process.env.DATABASE_URL, {
      max: Number(process.env.DATABASE_POOL_SIZE || 10),
      idle_timeout: 20,
      connect_timeout: 15,
      ssl: process.env.DATABASE_SSL === 'require' ? 'require' : false,
    });
  }
  return pg;
}

function postgresSqliteCompat(query: string) {
  let index = 0;
  return query
    .replace(/datetime\('now'\)/gi, "(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text")
    .replace(/\?/g, () => `$${++index}`);
}

async function initializePostgres(client: Sql) {
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS admins (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text),
      updated_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text)
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date_label TEXT NOT NULL,
      summary TEXT NOT NULL,
      badge TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'upcoming',
      recurring INTEGER NOT NULL DEFAULT 0,
      details_json TEXT,
      schedule_kind TEXT,
      image_src TEXT,
      starts_at TEXT,
      ends_at TEXT,
      hub TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      calendar_enabled INTEGER NOT NULL DEFAULT 0,
      recurrence_rule TEXT,
      recurrence_until TEXT,
      venue TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text)
    );
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      schedule TEXT,
      tags_json TEXT,
      image_src TEXT,
      hub TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      calendar_enabled INTEGER NOT NULL DEFAULT 0,
      starts_at TEXT,
      ends_at TEXT,
      recurrence_rule TEXT,
      recurrence_until TEXT,
      venue TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text)
    );
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      key_name TEXT NOT NULL UNIQUE,
      src TEXT NOT NULL,
      alt TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text)
    );
    CREATE TABLE IF NOT EXISTS announcements (
      id BIGSERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'local',
      updated_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text)
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text)
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text)
    );
    CREATE TABLE IF NOT EXISTS instagram_posts (
      id TEXT PRIMARY KEY,
      permalink TEXT NOT NULL,
      media_type TEXT NOT NULL DEFAULT 'image',
      caption TEXT,
      poster_src TEXT,
      video_src TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      source TEXT,
      updated_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text)
    );
    CREATE TABLE IF NOT EXISTS careers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      department TEXT,
      summary TEXT NOT NULL,
      schedule TEXT,
      location TEXT,
      deadline TEXT NOT NULL,
      start_date TEXT,
      contract TEXT,
      apply_email TEXT NOT NULL,
      apply_subject TEXT NOT NULL,
      responsibilities_json TEXT,
      requirements_json TEXT,
      image_src TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::text)
    );
  `);

  const migrations = [
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS calendar_enabled INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_rule TEXT`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_until TEXT`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS venue TEXT`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS published INTEGER NOT NULL DEFAULT 1`,
    `ALTER TABLE programs ADD COLUMN IF NOT EXISTS calendar_enabled INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE programs ADD COLUMN IF NOT EXISTS starts_at TEXT`,
    `ALTER TABLE programs ADD COLUMN IF NOT EXISTS ends_at TEXT`,
    `ALTER TABLE programs ADD COLUMN IF NOT EXISTS recurrence_rule TEXT`,
    `ALTER TABLE programs ADD COLUMN IF NOT EXISTS recurrence_until TEXT`,
    `ALTER TABLE programs ADD COLUMN IF NOT EXISTS venue TEXT`,
    `ALTER TABLE programs ADD COLUMN IF NOT EXISTS published INTEGER NOT NULL DEFAULT 1`,
  ];
  for (const migration of migrations) await client.unsafe(migration);

  const adminRows = await client.unsafe<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count FROM admins`,
  );
  if (Number(adminRows[0]?.count || 0) === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password =
      process.env.ADMIN_PASSWORD ||
      (process.env.NODE_ENV === 'production' ? '' : 'ist-admin-local');
    if (!password) {
      throw new Error('ADMIN_PASSWORD is required when initializing PostgreSQL.');
    }
    const hash = await bcrypt.hash(password, 12);
    await client.unsafe(
      `INSERT INTO admins (username, password_hash, display_name, role) VALUES ($1, $2, $3, 'admin')`,
      [username, hash, 'Site Admin'],
    );
  }

  const settings: Record<string, string> = {
    hero_eyebrow: 'Masjid Darus Salaam',
    hero_title: 'Islamic Society of Toronto',
    hero_description:
      "Faith, knowledge, and community — serving Toronto's Muslim families since 1995.",
    maintenance_mode: '0',
    maintenance_message: 'The website is undergoing maintenance. Please check back shortly.',
  };
  for (const [key, value] of Object.entries(settings)) {
    await client.unsafe(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value],
    );
  }

  for (const event of seedEventsExtra) {
    await client.unsafe(
      `INSERT INTO events
       (id, title, date_label, summary, badge, location, status, recurring, details_json,
        schedule_kind, starts_at, ends_at, hub, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO NOTHING`,
      [
        event.id,
        event.title,
        event.dateLabel,
        event.summary,
        event.badge || null,
        event.location || null,
        event.status,
        event.recurring ? 1 : 0,
        event.details ? JSON.stringify(event.details) : null,
        event.scheduleKind || null,
        event.startsAt || null,
        event.endsAt || null,
        event.hub || null,
        event.sortOrder || 0,
      ],
    );
  }

  for (const program of seedProgramsExtra) {
    await client.unsafe(
      `INSERT INTO programs
       (id, category, title, summary, schedule, tags_json, hub, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO NOTHING`,
      [
        program.id,
        program.category,
        program.title,
        program.summary,
        program.schedule || null,
        program.tags ? JSON.stringify(program.tags) : null,
        program.hub || null,
        program.sortOrder || 0,
      ],
    );
  }

  await client.unsafe(
    `UPDATE events SET
       calendar_enabled = 1,
       starts_at = '2026-01-03T00:30:00.000Z',
       ends_at = '2026-01-03T02:30:00.000Z',
       recurrence_rule = $1,
       venue = COALESCE(location, 'Masjid Darus Salaam'),
       published = 1
     WHERE id = 'youth-friday' AND recurrence_rule IS NULL`,
    ['DTSTART;TZID=America/Toronto:20260102T193000\nRRULE:FREQ=WEEKLY;BYDAY=FR;INTERVAL=1'],
  );
  await client.unsafe(
    `UPDATE programs SET
       calendar_enabled = 1,
       starts_at = '2026-01-04T15:30:00.000Z',
       ends_at = '2026-01-04T19:00:00.000Z',
       recurrence_rule = $1,
       venue = 'Masjid Darus Salaam',
       published = 1
     WHERE id = 'sunday' AND recurrence_rule IS NULL`,
    ['DTSTART;TZID=America/Toronto:20260104T103000\nRRULE:FREQ=WEEKLY;BYDAY=SU;INTERVAL=1'],
  );

  for (const career of careers) {
    await client.unsafe(
      `INSERT INTO careers
       (id,title,type,summary,schedule,location,deadline,start_date,contract,apply_email,
        apply_subject,responsibilities_json,requirements_json,is_active,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,1,$14)
       ON CONFLICT (id) DO NOTHING`,
      [
        career.id,
        career.title,
        career.type,
        career.summary,
        career.schedule || null,
        career.location || null,
        career.deadline,
        career.startDate || null,
        career.contract || null,
        career.applyEmail,
        career.applySubject,
        JSON.stringify(career.responsibilities || []),
        JSON.stringify(career.requirements || []),
        0,
      ],
    );
  }

  const announcementMessages = [...notices.map((notice) => notice.body), ...seedAnnouncementsExtra];
  for (const [index, message] of announcementMessages.entries()) {
    await client.unsafe(
      `INSERT INTO announcements (message, is_active, sort_order, source)
       SELECT $1, 1, $2, 'seed'
       WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE message = $1)`,
      [message, index],
    );
  }

  for (const post of seedInstagramPosts) {
    await client.unsafe(
      `INSERT INTO instagram_posts
       (id,permalink,media_type,caption,poster_src,video_src,is_active,sort_order,source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'demo')
       ON CONFLICT (id) DO NOTHING`,
      [
        post.id,
        post.permalink,
        post.media_type,
        post.caption || null,
        post.poster_src || null,
        post.video_src || null,
        1,
        post.sort_order || 0,
      ],
    );
  }
}

async function ensurePostgres() {
  const client = postgresClient();
  if (!client) return null;
  postgresReady ||= initializePostgres(client);
  await postgresReady;
  return client;
}

export async function dbAll<T>(query: string, params: Params = []) {
  const client = await ensurePostgres();
  if (client) {
    return (await client.unsafe(postgresSqliteCompat(query), params)) as unknown as T[];
  }
  return getDb().prepare(query).all(...params) as T[];
}

export async function dbGet<T>(query: string, params: Params = []) {
  const rows = await dbAll<T>(query, params);
  return rows[0];
}

export async function dbRun(query: string, params: Params = []) {
  const client = await ensurePostgres();
  if (client) {
    const result = await client.unsafe(postgresSqliteCompat(query), params);
    return { changes: result.count };
  }
  const result = getDb().prepare(query).run(...params);
  return { changes: result.changes, lastInsertRowid: Number(result.lastInsertRowid) };
}
