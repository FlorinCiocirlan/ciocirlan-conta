import { notFound } from 'next/navigation';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { shareLinks, documents, months, users, CATEGORY_LABELS, type DocumentCategory, type Document } from '@/lib/db/schema';
import { formatMonthRo } from '@/lib/months';
import { formatBytes } from '@/lib/utils';
import { FileText, Download, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const [link] = await db
    .select({
      id: shareLinks.id,
      userId: shareLinks.userId,
      monthId: shareLinks.monthId,
      expiresAt: shareLinks.expiresAt,
      revokedAt: shareLinks.revokedAt,
    })
    .from(shareLinks)
    .where(eq(shareLinks.token, token))
    .limit(1);

  if (!link) notFound();

  const now = new Date();
  const isExpired = link.expiresAt.getTime() < now.getTime();
  const isRevoked = !!link.revokedAt;

  if (isExpired || isRevoked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-xs tracking-[0.2em] uppercase text-ink-400 mb-3">Link inactiv</div>
          <h1 className="font-display text-4xl mb-4">
            {isExpired ? 'Linkul a expirat.' : 'Link revocat.'}
          </h1>
          <p className="text-ink-400">
            Roagă persoana care ți-a trimis linkul să genereze unul nou.
          </p>
        </div>
      </div>
    );
  }

  const [owner] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, link.userId))
    .limit(1);

  await db
    .update(shareLinks)
    .set({
      lastAccessedAt: now,
      accessCount: sql`${shareLinks.accessCount} + 1`,
    })
    .where(eq(shareLinks.id, link.id));

  let monthLabel: string | null = null;
  let docs: Document[] = [];

  if (link.monthId) {
    const [m] = await db.select().from(months).where(eq(months.id, link.monthId)).limit(1);
    if (m) {
      monthLabel = formatMonthRo(m.monthStart);
      docs = await db
        .select()
        .from(documents)
        .where(eq(documents.monthId, link.monthId))
        .orderBy(desc(documents.createdAt));
    }
  } else {
    docs = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, link.userId))
      .orderBy(desc(documents.createdAt));
  }

  const grouped: Record<DocumentCategory, Document[]> = {
    facturi_emise: [],
    facturi_primite: [],
    bonuri: [],
    extrase_bancare: [],
    altele: [],
  };
  for (const d of docs) grouped[d.category].push(d);

  const totalSize = docs.reduce((a, d) => a + Number(d.sizeBytes), 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-cream-200 bg-cream-50/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <span className="font-display text-xl font-medium">Arhivă PFA</span>
          <span className="text-xs tracking-wider uppercase text-ink-400">
            Vizualizare partajată
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="mb-12">
          <div className="text-xs tracking-[0.2em] uppercase text-ink-400 mb-3">
            Documente partajate
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] font-normal">
            {monthLabel ?? 'Arhivă completă'}
          </h1>
          <p className="mt-5 text-ink-400">
            Trimis de <strong>{owner?.name ?? owner?.email ?? 'utilizator'}</strong>
            {' · '}
            <span className="inline-flex items-baseline gap-1.5">
              <Calendar size={13} />
              Expiră {link.expiresAt.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-xl">
            <div>
              <div className="text-xs tracking-wider uppercase text-ink-400 mb-1">Documente</div>
              <div className="font-display text-3xl tabular-nums">{docs.length}</div>
            </div>
            <div>
              <div className="text-xs tracking-wider uppercase text-ink-400 mb-1">Mărime totală</div>
              <div className="font-display text-3xl tabular-nums">{formatBytes(totalSize)}</div>
            </div>
          </div>
        </div>

        {docs.length === 0 ? (
          <div className="py-16 text-center text-ink-400 italic">
            Nu există documente încarcate.
          </div>
        ) : (
          <div className="space-y-10">
            {(['facturi_emise', 'facturi_primite', 'bonuri', 'extrase_bancare', 'altele'] as DocumentCategory[]).map(
              (cat) =>
                grouped[cat].length > 0 && (
                  <section key={cat}>
                    <div className="flex items-baseline gap-4 mb-4">
                      <h2 className="font-display text-2xl">{CATEGORY_LABELS[cat]}</h2>
                      <span className="text-xs tracking-wider uppercase text-ink-400 tabular-nums">
                        {grouped[cat].length}
                      </span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-cream-200">
                      {grouped[cat].map((doc) => (
                        <li key={doc.id} className="bg-cream-50 p-4 flex gap-3 items-center group">
                          <div className="flex-shrink-0 w-12 h-12 bg-cream-100 flex items-center justify-center border border-cream-200 overflow-hidden">
                            {doc.mimeType.startsWith('image/') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={doc.blobUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <FileText size={18} className="text-ink-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" title={doc.filename}>
                              {doc.filename}
                            </div>
                            <div className="text-xs text-ink-400 mt-0.5">
                              {formatBytes(doc.sizeBytes)}
                            </div>
                          </div>
                          <a
                            href={doc.blobUrl}
                            download={doc.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-ink-700 text-cream-50 px-3 py-2 text-xs tracking-wider uppercase hover:bg-ink-900 transition-colors"
                          >
                            <Download size={12} />
                            Descarcă
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
