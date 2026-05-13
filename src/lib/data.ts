import 'server-only';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from './db';
import { documents, months, type DocumentCategory } from './db/schema';
import { currentMonthStart } from './months';

export async function ensureMonth(userId: string, monthStart: Date) {
  const existing = await db
    .select()
    .from(months)
    .where(and(eq(months.userId, userId), eq(months.monthStart, monthStart)))
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(months)
    .values({ userId, monthStart })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  const [retry] = await db
    .select()
    .from(months)
    .where(and(eq(months.userId, userId), eq(months.monthStart, monthStart)))
    .limit(1);
  return retry!;
}

export async function ensureCurrentMonth(userId: string) {
  return ensureMonth(userId, currentMonthStart());
}

export async function listMonths(userId: string) {
  await ensureCurrentMonth(userId);

  const rows = await db
    .select({
      id: months.id,
      monthStart: months.monthStart,
      docCount: sql<number>`count(${documents.id})::int`,
      totalSize: sql<number>`coalesce(sum(${documents.sizeBytes}), 0)::bigint`,
    })
    .from(months)
    .leftJoin(documents, eq(documents.monthId, months.id))
    .where(eq(months.userId, userId))
    .groupBy(months.id)
    .orderBy(desc(months.monthStart));

  return rows;
}

export async function getMonthByStart(userId: string, monthStart: Date) {
  const [row] = await db
    .select()
    .from(months)
    .where(and(eq(months.userId, userId), eq(months.monthStart, monthStart)))
    .limit(1);
  return row;
}

export async function listDocumentsForMonth(monthId: string) {
  return db
    .select()
    .from(documents)
    .where(eq(documents.monthId, monthId))
    .orderBy(desc(documents.createdAt));
}

export async function getDocumentsByCategory(monthId: string) {
  const docs = await listDocumentsForMonth(monthId);
  const grouped: Record<DocumentCategory, typeof docs> = {
    facturi_emise: [],
    facturi_primite: [],
    bonuri: [],
    extrase_bancare: [],
    altele: [],
  };
  for (const d of docs) {
    grouped[d.category].push(d);
  }
  return grouped;
}
