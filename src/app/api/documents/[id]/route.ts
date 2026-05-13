import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const { id } = await params;
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)))
    .limit(1);

  if (!doc) return NextResponse.json({ error: 'Inexistent' }, { status: 404 });

  try {
    await del(doc.blobUrl);
  } catch (err) {
    console.error('Blob delete failed:', err);
  }

  await db.delete(documents).where(eq(documents.id, id));
  return NextResponse.json({ ok: true });
}

export const runtime = 'nodejs';
