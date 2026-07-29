import { NextResponse } from 'next/server';
import { listPrograms } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const category = new URL(req.url).searchParams.get('category') || undefined;
  const rows = listPrograms(category || undefined);
  const programs = rows.map((p) => ({
    id: p.id,
    category: p.category,
    title: p.title,
    summary: p.summary,
    schedule: p.schedule || undefined,
    tags: p.tags_json ? (JSON.parse(p.tags_json) as string[]) : undefined,
    imageSrc: p.image_src || undefined,
  }));
  return NextResponse.json({ programs });
}
