import { redirect } from 'next/navigation';

export default async function EnglishContentFallback({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  redirect(`/${slug.map(encodeURIComponent).join('/')}`);
}
