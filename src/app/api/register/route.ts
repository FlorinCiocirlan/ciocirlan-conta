import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Date invalide.' }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const normEmail = email.toLowerCase();

  const [existing] = await db.select().from(users).where(eq(users.email, normEmail)).limit(1);
  if (existing) {
    return NextResponse.json({ error: 'Există deja un cont cu acest email.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email: normEmail, passwordHash });

  return NextResponse.json({ ok: true });
}
