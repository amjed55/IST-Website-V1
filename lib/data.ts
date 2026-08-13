import 'server-only';

import { dbAll, dbGet, dbRun } from './database';
import type {
  DbAdmin,
  DbAnnouncement,
  DbAuditLog,
  DbCareer,
  DbEvent,
  DbInstagramPost,
  DbMedia,
  DbProgram,
} from './db';

export type {
  DbAdmin,
  DbAnnouncement,
  DbAuditLog,
  DbCareer,
  DbEvent,
  DbInstagramPost,
  DbMedia,
  DbProgram,
} from './db';

export async function expirePastEvents() {
  const rows = await dbAll<Pick<DbEvent, 'id' | 'ends_at' | 'starts_at'>>(
    `SELECT id, ends_at, starts_at FROM events
     WHERE status = 'upcoming' AND recurring = 0`,
  );
  const now = Date.now();
  let count = 0;
  for (const row of rows) {
    const stamp = row.ends_at || row.starts_at;
    const time = stamp ? Date.parse(stamp) : Number.NaN;
    if (!Number.isNaN(time) && time < now) {
      await dbRun(
        `UPDATE events SET status = 'past', updated_at = datetime('now') WHERE id = ?`,
        [row.id],
      );
      count += 1;
    }
  }
  return count;
}

export async function writeAudit(
  username: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  detail?: string | null,
) {
  await dbRun(
    `INSERT INTO audit_logs (username, action, entity_type, entity_id, detail)
     VALUES (?, ?, ?, ?, ?)`,
    [username, action, entityType, entityId || null, detail || null],
  );
}

export async function listEvents(status?: 'upcoming' | 'past') {
  await expirePastEvents();
  if (status) {
    return dbAll<DbEvent>(
      `SELECT * FROM events WHERE status = ? ORDER BY sort_order ASC, updated_at DESC`,
      [status],
    );
  }
  return dbAll<DbEvent>(`SELECT * FROM events ORDER BY sort_order ASC, updated_at DESC`);
}

export async function listPrograms(category?: string) {
  if (category) {
    return dbAll<DbProgram>(
      `SELECT * FROM programs WHERE category = ? ORDER BY sort_order ASC`,
      [category],
    );
  }
  return dbAll<DbProgram>(`SELECT * FROM programs ORDER BY category, sort_order ASC`);
}

export async function listEventsByHub(hub: string) {
  await expirePastEvents();
  return dbAll<DbEvent>(
    `SELECT * FROM events WHERE hub = ? ORDER BY status ASC, sort_order ASC, updated_at DESC`,
    [hub],
  );
}

export function listProgramsByHub(hub: string) {
  return dbAll<DbProgram>(
    `SELECT * FROM programs WHERE hub = ? ORDER BY sort_order ASC`,
    [hub],
  );
}

export function listMedia() {
  return dbAll<DbMedia>(`SELECT * FROM media ORDER BY key_name ASC`);
}

export function getMediaByKey(key: string) {
  return dbGet<DbMedia>(`SELECT * FROM media WHERE key_name = ?`, [key]);
}

export function listAnnouncements(activeOnly = true) {
  return dbAll<DbAnnouncement>(
    activeOnly
      ? `SELECT * FROM announcements WHERE is_active = 1 ORDER BY sort_order ASC, id DESC`
      : `SELECT * FROM announcements ORDER BY sort_order ASC, id DESC`,
  );
}

export function listAdmins() {
  return dbAll<DbAdmin>(
    `SELECT id, username, display_name, role, created_at, updated_at
     FROM admins ORDER BY username ASC`,
  );
}

export function listAuditLogs(limit = 100) {
  return dbAll<DbAuditLog>(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?`, [limit]);
}

export function listInstagramPosts(activeOnly = true) {
  return dbAll<DbInstagramPost>(
    activeOnly
      ? `SELECT * FROM instagram_posts WHERE is_active = 1 ORDER BY sort_order ASC, updated_at DESC`
      : `SELECT * FROM instagram_posts ORDER BY sort_order ASC, updated_at DESC`,
  );
}

export async function upsertLiveInstagramPosts(
  posts: {
    id: string;
    permalink: string;
    media_type: string;
    caption?: string | null;
    poster_src?: string | null;
    sort_order: number;
  }[],
) {
  await dbRun(
    `UPDATE instagram_posts SET is_active = 0, updated_at = datetime('now')
     WHERE source = 'demo'
        OR (permalink NOT LIKE '%/p/%' AND permalink NOT LIKE '%/reel/%' AND permalink NOT LIKE '%/tv/%')`,
  );

  for (const post of posts) {
    await dbRun(
      `INSERT INTO instagram_posts
       (id, permalink, media_type, caption, poster_src, video_src, is_active, sort_order, source, updated_at)
       VALUES (?, ?, ?, ?, ?, NULL, 1, ?, 'live', datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         permalink = excluded.permalink,
         media_type = excluded.media_type,
         caption = COALESCE(excluded.caption, instagram_posts.caption),
         poster_src = COALESCE(excluded.poster_src, instagram_posts.poster_src),
         is_active = 1,
         sort_order = excluded.sort_order,
         source = 'live',
         updated_at = datetime('now')`,
      [
        post.id,
        post.permalink,
        post.media_type,
        post.caption || null,
        post.poster_src || null,
        post.sort_order,
      ],
    );
  }
}

export function listCareers(activeOnly = true) {
  return dbAll<DbCareer>(
    activeOnly
      ? `SELECT * FROM careers WHERE is_active = 1 ORDER BY sort_order ASC, updated_at DESC`
      : `SELECT * FROM careers ORDER BY sort_order ASC, updated_at DESC`,
  );
}

export function getCareer(id: string) {
  return dbGet<DbCareer>(`SELECT * FROM careers WHERE id = ?`, [id]);
}

export async function getSiteSettings() {
  const rows = await dbAll<{ key: string; value: string }>(
    `SELECT key, value FROM site_settings`,
  );
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<
    string,
    string
  >;
}

export function setSiteSetting(key: string, value: string) {
  return dbRun(
    `INSERT INTO site_settings (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    [key, value],
  );
}

export async function getInstagramSyncMeta() {
  const settings = await getSiteSettings();
  return {
    syncedAt: settings.instagram_live_synced_at || null,
    source: settings.instagram_live_source || null,
  };
}

export async function setInstagramSyncMeta(source: string) {
  await setSiteSetting('instagram_live_synced_at', new Date().toISOString());
  await setSiteSetting('instagram_live_source', source);
}
