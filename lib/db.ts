import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { events as seedEvents, educationPrograms, communityPrograms, notices } from './content';

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

let _db: Database.Database | null = null;

function schema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
      value TEXT NOT NULL
    );
  `);
}

function seed(db: Database.Database) {
  const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get() as { c: number };
  if (adminCount.c === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'ist-admin-2026';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
  }

  const eventCount = db.prepare('SELECT COUNT(*) as c FROM events').get() as { c: number };
  if (eventCount.c === 0) {
    const insert = db.prepare(`
      INSERT INTO events (id, title, date_label, summary, badge, location, status, recurring, details_json, schedule_kind, sort_order)
      VALUES (@id, @title, @date_label, @summary, @badge, @location, @status, @recurring, @details_json, @schedule_kind, @sort_order)
    `);
    seedEvents.forEach((e, i) => {
      insert.run({
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
        sort_order: i,
      });
    });
  }

  const programCount = db.prepare('SELECT COUNT(*) as c FROM programs').get() as { c: number };
  if (programCount.c === 0) {
    const insert = db.prepare(`
      INSERT INTO programs (id, category, title, summary, schedule, tags_json, sort_order)
      VALUES (@id, @category, @title, @summary, @schedule, @tags_json, @sort_order)
    `);
    educationPrograms.forEach((p, i) => {
      insert.run({
        id: p.id,
        category: 'education',
        title: p.title,
        summary: p.summary,
        schedule: p.schedule || null,
        tags_json: p.tags ? JSON.stringify(p.tags) : null,
        sort_order: i,
      });
    });
    communityPrograms.forEach((p, i) => {
      insert.run({
        id: p.id,
        category: 'community',
        title: p.title,
        summary: p.summary,
        schedule: p.schedule || null,
        tags_json: p.tags ? JSON.stringify(p.tags) : null,
        sort_order: i,
      });
    });
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
