import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { notices } from './content';
import { seedAnnouncementsExtra, seedEventsExtra, seedProgramsExtra } from './seed-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'ist.db');

export type DbEvent = {
  id: string;
  title: string;
  date_label: string;
  summary: string;
  badge: string | null;
  location: string | null;
  status: 'upcoming' | 'past';
  recurring: number;
  details_json: string | null;
  schedule_kind: string | null;
  image_src: string | null;
  starts_at: string | null;
  ends_at: string | null;
  hub: string | null;
  sort_order: number;
  updated_at: string;
};

export type DbProgram = {
  id: string;
  category: 'education' | 'community' | 'service';
  title: string;
  summary: string;
  schedule: string | null;
  tags_json: string | null;
  image_src: string | null;
  hub: string | null;
  sort_order: number;
  updated_at: string;
};

export type DbMedia = {
  id: string;
  key_name: string;
  src: string;
  alt: string;
  updated_at: string;
};

export type DbAnnouncement = {
  id: number;
  message: string;
  is_active: number;
  sort_order: number;
  source: string;
  updated_at: string;
};

export type DbAdmin = {
  id: number;
  username: string;
  display_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export type DbAuditLog = {
  id: number;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  detail: string | null;
  created_at: string;
};

let _db: Database.Database | null = null;

function hasColumn(db: Database.Database, table: string, column: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return cols.some((c) => c.name === column);
}

function ensureColumn(db: Database.Database, table: string, column: string, defSql: string) {
  if (hasColumn(db, table, column)) return;
  try {
    // SQLite only allows constant defaults on ADD COLUMN — keep defSql simple (e.g. TEXT).
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${defSql}`);
  } catch (err) {
    // Ignore race / already-added; rethrow unexpected failures
    const msg = err instanceof Error ? err.message : String(err);
    if (!/duplicate column|already exists/i.test(msg)) {
      console.warn(`[db] ensureColumn ${table}.${column}:`, msg);
    }
  }
}

function schema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date_label TEXT NOT NULL,
      summary TEXT NOT NULL,
      badge TEXT,
      location TEXT,
      status TEXT NOT NULL CHECK(status IN ('upcoming','past')),
      recurring INTEGER NOT NULL DEFAULT 0,
      details_json TEXT,
      schedule_kind TEXT,
      image_src TEXT,
      starts_at TEXT,
      ends_at TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      schedule TEXT,
      tags_json TEXT,
      image_src TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      key_name TEXT NOT NULL UNIQUE,
      src TEXT NOT NULL,
      alt TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'local',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrations for older DBs — only constant-safe column defs
  ensureColumn(db, 'admins', 'display_name', 'TEXT');
  ensureColumn(db, 'admins', 'role', 'TEXT');
  ensureColumn(db, 'admins', 'updated_at', 'TEXT');
  ensureColumn(db, 'events', 'image_src', 'TEXT');
  ensureColumn(db, 'events', 'starts_at', 'TEXT');
  ensureColumn(db, 'events', 'ends_at', 'TEXT');
  ensureColumn(db, 'events', 'hub', 'TEXT');
  ensureColumn(db, 'programs', 'image_src', 'TEXT');
  ensureColumn(db, 'programs', 'hub', 'TEXT');
  ensureColumn(db, 'site_settings', 'updated_at', 'TEXT');

  // Backfill role if null after migration
  try {
    db.prepare(`UPDATE admins SET role = 'admin' WHERE role IS NULL OR role = ''`).run();
  } catch {
    /* ignore */
  }
}

function enrichDemoContent(db: Database.Database) {
  const versionRow = db.prepare(`SELECT value FROM site_settings WHERE key = 'demo_seed_version'`).get() as
    | { value: string }
    | undefined;
  const currentVersion = Number(versionRow?.value || 0);
  const TARGET_VERSION = 3;
  const refreshDemo = currentVersion < TARGET_VERSION;

  const insertEvent = db.prepare(`
    INSERT OR IGNORE INTO events
      (id, title, date_label, summary, badge, location, status, recurring, details_json, schedule_kind, starts_at, ends_at, hub, sort_order)
    VALUES
      (@id, @title, @date_label, @summary, @badge, @location, @status, @recurring, @details_json, @schedule_kind, @starts_at, @ends_at, @hub, @sort_order)
  `);
  const refreshEvent = db.prepare(`
    UPDATE events SET
      title = @title,
      date_label = @date_label,
      summary = @summary,
      badge = @badge,
      location = @location,
      status = @status,
      recurring = @recurring,
      details_json = @details_json,
      schedule_kind = @schedule_kind,
      starts_at = @starts_at,
      ends_at = @ends_at,
      hub = COALESCE(@hub, hub),
      sort_order = @sort_order,
      updated_at = datetime('now')
    WHERE id = @id
  `);

  seedEventsExtra.forEach((e, i) => {
    const row = {
      id: e.id,
      title: e.title,
      date_label: e.dateLabel,
      summary: e.summary,
      badge: e.badge || null,
      location: e.location || null,
      status: e.status,
      recurring: e.recurring ? 1 : 0,
      details_json: e.details ? JSON.stringify(e.details) : null,
      schedule_kind: e.scheduleKind || null,
      starts_at: e.startsAt || null,
      ends_at: e.endsAt || null,
      hub: e.hub || null,
      sort_order: e.sortOrder ?? i,
    };
    insertEvent.run(row);
    if (refreshDemo) refreshEvent.run(row);
    else if (e.hub) {
      db.prepare(`UPDATE events SET hub = COALESCE(hub, ?) WHERE id = ?`).run(e.hub, e.id);
    }
  });

  const insertProgram = db.prepare(`
    INSERT OR IGNORE INTO programs
      (id, category, title, summary, schedule, tags_json, hub, sort_order)
    VALUES
      (@id, @category, @title, @summary, @schedule, @tags_json, @hub, @sort_order)
  `);
  const refreshProgram = db.prepare(`
    UPDATE programs SET
      category = @category,
      title = @title,
      summary = @summary,
      schedule = @schedule,
      tags_json = @tags_json,
      hub = COALESCE(@hub, hub),
      sort_order = @sort_order,
      updated_at = datetime('now')
    WHERE id = @id
  `);

  seedProgramsExtra.forEach((p, i) => {
    const row = {
      id: p.id,
      category: p.category,
      title: p.title,
      summary: p.summary,
      schedule: p.schedule || null,
      tags_json: p.tags ? JSON.stringify(p.tags) : null,
      hub: p.hub || null,
      sort_order: p.sortOrder ?? i,
    };
    insertProgram.run(row);
    if (refreshDemo) refreshProgram.run(row);
    else if (p.hub) {
      db.prepare(`UPDATE programs SET hub = COALESCE(hub, ?) WHERE id = ?`).run(p.hub, p.id);
    }
  });

  const updateHubProgram = db.prepare(`UPDATE programs SET hub = COALESCE(hub, ?) WHERE id = ?`);
  const updateHubEvent = db.prepare(`UPDATE events SET hub = COALESCE(hub, ?) WHERE id = ?`);
  updateHubProgram.run('youth', 'youth');
  updateHubProgram.run('sisters', 'sisters');
  updateHubProgram.run('seniors', 'seniors');
  for (const id of [
    'youth-friday',
    'brothers-basketball',
    'youth-quran-circle',
    'youth-leadership',
    'youth-camp-past',
    'youth-qiyam-past',
  ]) {
    updateHubEvent.run('youth', id);
  }
  for (const id of [
    'sisters-volleyball',
    'sisters-halaqa',
    'sisters-fitness',
    'sisters-book-club',
    'sisters-iftar-past',
    'sisters-self-care',
    'sisters-retreat-past',
  ]) {
    updateHubEvent.run('sisters', id);
  }
  for (const id of ['seniors-tea', 'seniors-health', 'seniors-quran', 'seniors-outing-past']) {
    updateHubEvent.run('seniors', id);
  }

  const existing = new Set(
    (db.prepare('SELECT message FROM announcements').all() as { message: string }[]).map(
      (r) => r.message,
    ),
  );
  const insertAnn = db.prepare(
    `INSERT INTO announcements (message, is_active, sort_order, source) VALUES (?, 1, ?, 'local')`,
  );
  seedAnnouncementsExtra.forEach((msg, i) => {
    if (!existing.has(msg)) insertAnn.run(msg, 100 + i);
  });

  if (refreshDemo) {
    db.prepare(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ('demo_seed_version', ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    ).run(String(TARGET_VERSION));
  }
}

function seed(db: Database.Database) {
  const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get() as { c: number };
  if (adminCount.c === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'ist-admin-2026';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(
      `INSERT INTO admins (username, password_hash, display_name, role) VALUES (?, ?, ?, 'admin')`,
    ).run(username, hash, 'Site Admin');
  }

  const mediaCount = db.prepare('SELECT COUNT(*) as c FROM media').get() as { c: number };
  if (mediaCount.c === 0) {
    const insert = db.prepare(
      'INSERT INTO media (id, key_name, src, alt) VALUES (?, ?, ?, ?)',
    );
    const defaults: [string, string, string][] = [
      ['hero', '/images/hero.jpg', 'Empty mosque prayer hall with arched columns'],
      ['about', '/images/about.jpg', 'Holy Quran with gold calligraphy'],
      ['visit', '/images/visit.jpg', 'Ornate mosque doorway architecture'],
      ['education', '/images/education.jpg', 'Holy Quran on wooden stand'],
      ['community', '/images/community.jpg', 'Mosque exterior at golden hour'],
      ['services', '/images/services.jpg', 'Mosque mihrab with geometric tilework'],
      ['events', '/images/events.jpg', 'Illuminated mosque dome at night'],
    ];
    defaults.forEach(([key, src, alt]) => insert.run(key, key, src, alt));
  }

  const annCount = db.prepare('SELECT COUNT(*) as c FROM announcements').get() as { c: number };
  if (annCount.c === 0) {
    const insert = db.prepare(
      'INSERT INTO announcements (message, is_active, sort_order, source) VALUES (?, 1, ?, ?)',
    );
    notices.forEach((n, i) => insert.run(`${n.title}: ${n.body}`, i, 'local'));
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as c FROM site_settings').get() as { c: number };
  if (settingsCount.c === 0) {
    const insert = db.prepare(`INSERT INTO site_settings (key, value) VALUES (?, ?)`);
    insert.run('hero_eyebrow', 'Masjid Darus Salaam');
    insert.run('hero_title', 'Islamic Society of Toronto');
    insert.run(
      'hero_description',
      "Faith, knowledge, and community — serving Toronto's Muslim families since 1995.",
    );
    insert.run('maintenance_mode', '0');
    insert.run(
      'maintenance_message',
      'The website is undergoing maintenance. Please check back shortly.',
    );
  }

  enrichDemoContent(db);
}

/** Mark non-recurring events past when ends_at (or starts_at) has passed. */
export function expirePastEvents() {
  const db = getDb();
  if (!hasColumn(db, 'events', 'ends_at') && !hasColumn(db, 'events', 'starts_at')) {
    return 0;
  }
  const now = Date.now();
  const rows = db
    .prepare(
      `SELECT id, ends_at, starts_at, recurring, status FROM events WHERE status = 'upcoming' AND recurring = 0`,
    )
    .all() as {
    id: string;
    ends_at: string | null;
    starts_at: string | null;
    recurring: number;
    status: string;
  }[];

  const expire = db.prepare(
    `UPDATE events SET status = 'past', updated_at = datetime('now') WHERE id = ?`,
  );
  let count = 0;
  for (const row of rows) {
    const stamp = row.ends_at || row.starts_at;
    if (!stamp) continue;
    const t = Date.parse(stamp);
    if (!Number.isNaN(t) && t < now) {
      expire.run(row.id);
      count += 1;
    }
  }
  return count;
}

export function writeAudit(
  username: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  detail?: string | null,
) {
  getDb()
    .prepare(
      `INSERT INTO audit_logs (username, action, entity_type, entity_id, detail) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(username, action, entityType, entityId || null, detail || null);
}

export function getDb() {
  if (_db) return _db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  schema(_db);
  seed(_db);
  return _db;
}

export function listEvents(status?: 'upcoming' | 'past') {
  expirePastEvents();
  const db = getDb();
  if (status) {
    return db
      .prepare('SELECT * FROM events WHERE status = ? ORDER BY sort_order ASC, updated_at DESC')
      .all(status) as DbEvent[];
  }
  return db
    .prepare('SELECT * FROM events ORDER BY sort_order ASC, updated_at DESC')
    .all() as DbEvent[];
}

export function listPrograms(category?: string) {
  const db = getDb();
  if (category) {
    return db
      .prepare('SELECT * FROM programs WHERE category = ? ORDER BY sort_order ASC')
      .all(category) as DbProgram[];
  }
  return db.prepare('SELECT * FROM programs ORDER BY category, sort_order ASC').all() as DbProgram[];
}

export function listEventsByHub(hub: string) {
  expirePastEvents();
  return getDb()
    .prepare(
      `SELECT * FROM events WHERE hub = ? ORDER BY status ASC, sort_order ASC, updated_at DESC`,
    )
    .all(hub) as DbEvent[];
}

export function listProgramsByHub(hub: string) {
  return getDb()
    .prepare(`SELECT * FROM programs WHERE hub = ? ORDER BY sort_order ASC`)
    .all(hub) as DbProgram[];
}

export function listMedia() {
  return getDb().prepare('SELECT * FROM media ORDER BY key_name ASC').all() as DbMedia[];
}

export function getMediaByKey(key: string) {
  return getDb().prepare('SELECT * FROM media WHERE key_name = ?').get(key) as DbMedia | undefined;
}

export function listAnnouncements(activeOnly = true) {
  const db = getDb();
  if (activeOnly) {
    return db
      .prepare('SELECT * FROM announcements WHERE is_active = 1 ORDER BY sort_order ASC, id DESC')
      .all() as DbAnnouncement[];
  }
  return db
    .prepare('SELECT * FROM announcements ORDER BY sort_order ASC, id DESC')
    .all() as DbAnnouncement[];
}

export function listAdmins() {
  return getDb()
    .prepare(
      `SELECT id, username, display_name, role, created_at, updated_at FROM admins ORDER BY username ASC`,
    )
    .all() as DbAdmin[];
}

export function listAuditLogs(limit = 100) {
  return getDb()
    .prepare(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?`)
    .all(limit) as DbAuditLog[];
}

export function getSiteSettings() {
  const rows = getDb().prepare(`SELECT key, value FROM site_settings`).all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
}

export function setSiteSetting(key: string, value: string) {
  getDb()
    .prepare(
      `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    )
    .run(key, value);
}
