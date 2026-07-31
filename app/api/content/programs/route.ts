import { NextResponse } from 'next/server';
import { listPrograms, listProgramsByHub } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const hub = searchParams.get('hub') || undefined;
  const rows = hub ? listProgramsByHub(hub) : listPrograms(category || undefined);
  const programs = rows.map((p) => ({
    id: p.id,
    category: p.category,
    title: p.title,
    summary: p.summary,
    schedule: p.schedule || undefined,
    tags: p.tags_json ? (JSON.parse(p.tags_json) as string[]) : undefined,
    imageSrc: p.image_src || undefined,
    hub: p.hub || undefined,
  }));
  return NextResponse.json({ programs });
}
