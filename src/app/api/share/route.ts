import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { months, shareLinks, users } from '@/lib/db/schema';
import { formatMonthRo } from '@/lib/months';
import { sendShareLinkEmail } from '@/lib/email';

const schema = z.object({
  monthId: z.string().uuid().nullable().optional(),
  recipientEmail: z.string().email().nullable().optional(),
  expiresInDays: z.number().int().min(1).max(365),
  sendEmail: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Date invalide' }, { status: 400 });

  const { monthId, recipientEmail, expiresInDays, sendEmail } = parsed.data;
  let monthLabel: string | null = null;

  if (monthId) {
    const [m] = await db.select().from(months).where(and(eq(months.id, monthId), eq(months.userId, userId))).limit(1);
    if (!m) return NextResponse.json({ error: 'Lun\u0103 inexistent\u0103' }, { status: 404 });
    monthLabel = formatMonthRo(m.monthStart);
  }

  const token = randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  await db.insert(shareLinks).values({ token, userId, monthId: monthId ?? null, recipientEmail: recipientEmail ?? null, expiresAt });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const url = `${appUrl}/share/${token}`;

  let emailSent = false;
  if (sendEmail && recipientEmail) {
    const [sender] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const result = await sendShareLinkEmail({ to: recipientEmail, fromName: sender?.name ?? sender?.email ?? 'Un client', monthLabel, url, expiresAt });
    emailSent = result.ok;
  }

  return NextResponse.json({ ok: true, url, token, emailSent });
}

export const runtime = 'nodejs';
