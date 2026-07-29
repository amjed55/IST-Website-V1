import type { Career } from '@/lib/content';
import { careersEmail } from '@/lib/content';
import { getCareer, listCareers, type DbCareer } from '@/lib/db';

function parseLines(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    /* fall through */
  }
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function dbCareerToCareer(row: DbCareer): Career {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    department: row.department || undefined,
    summary: row.summary,
    schedule: row.schedule || undefined,
    location: row.location || undefined,
    deadline: row.deadline,
    startDate: row.start_date || undefined,
    contract: row.contract || undefined,
    applyEmail: row.apply_email || careersEmail,
    applySubject: row.apply_subject,
    responsibilities: parseLines(row.responsibilities_json),
    requirements: parseLines(row.requirements_json),
    imageSrc: row.image_src || undefined,
    isActive: Boolean(row.is_active),
  };
}

/** Active openings for the public site. */
export function listPublicCareers(): Career[] {
  return listCareers(true).map(dbCareerToCareer);
}

export function getCareerById(id: string | null | undefined): Career | undefined {
  if (!id) return undefined;
  const row = getCareer(id);
  if (!row || !row.is_active) return undefined;
  return dbCareerToCareer(row);
}

/** Admin / apply helpers — includes inactive when requested. */
export function getCareerByIdAny(id: string | null | undefined): Career | undefined {
  if (!id) return undefined;
  const row = getCareer(id);
  if (!row) return undefined;
  return dbCareerToCareer(row);
}
