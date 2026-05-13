import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents, months, type DocumentCategory } from '@/lib/db/schema';

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
  'application/pdf',
]);

const MAX_SIZE = 20 * 1024 * 1024;

const VALID_CATEGORIES: DocumentCategory[] = [
  'facturi_emise',
  'facturi_primite',
  'bonuri',
  'extrase_bancare',
  'altele',
];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  const monthId = form.get('monthId');
  const category = form.get('category');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fișier lipsă' }, { status: 400 });
  }
  if (typeof monthId !== 'string' || typeof category !== 'string') {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category as DocumentCategory)) {
    return NextResponse.json({ error: 'Categorie invalidă' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fișierul depășește 20 MB' }, { status: 400 });
  }
  const mime = file.type || 'application/octet-stream';
  if (!ALLOWED_MIMES.has(mime) && !file.name.match(/\.(heic|heif|pdf|jpg|jpeg|png|webp|gif)$/i)) {
    return NextResponse.json({ error: 'Tip fișier neacceptat' }, { status: 400 });
  }

  const [month] = await db
    .select()
    .from(months)
    .where(and(eq(months.id, monthId), eq(months.userId, session.user.id)))
    .limit(1);

  if (!month) return NextResponse.json({ error: 'Lună inexistentă' }, { status: 404 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `users/${session.user.id}/${monthId}/${category}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: 'public',
    contentType: mime,
    addRandomSuffix: true,
  });

  await db.insert(documents).values({
    monthId,
    userId: session.user.id,
    category: category as DocumentCategory,
    filename: file.name,
    blobUrl: blob.url,
    blobPathname: blob.pathname,
    mimeType: mime,
    sizeBytes: file.size,
  });

  return NextResponse.json({ ok: true, url: blob.url });
}

export const runtime = 'nodejs';
