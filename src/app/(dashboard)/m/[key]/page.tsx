import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { parseMonthKey, formatMonthRo, currentMonthStart } from '@/lib/months';
import { ensureMonth, getDocumentsByCategory } from '@/lib/data';
import { CATEGORY_LABELS, type DocumentCategory } from '@/lib/db/schema';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CategorySection } from '@/components/category-section';
import { ShareDialog } from '@/components/share-dialog';

export default async function MonthPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  const { key } = await params;
  const monthStart = parseMonthKey(key);
  if (!monthStart) notFound();

  const current = currentMonthStart();
  if (monthStart.getTime() > current.getTime()) notFound();

  const month = await ensureMonth(userId, monthStart);
  const grouped = await getDocumentsByCategory(month.id);

  const isCurrent = monthStart.getTime() === current.getTime();
  const categories: DocumentCategory[] = [
    'facturi_emise',
    'facturi_primite',
    'bonuri',
    'extrase_bancare',
    'altele',
  ];

  const totalDocs = Object.values(grouped).reduce((a, list) => a + list.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-ink-400 hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Toate lunile
      </Link>

      <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-end">
        <div className="lg:col-span-2">
          <div className="text-xs tracking-[0.2em] uppercase text-ink-400 mb-3 flex items-center gap-3">
            <span>Capitolul curent</span>
            {isCurrent && (
              <span className="inline-flex items-center gap-1.5 text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                În desfășurare
              </span>
            )}
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.9] font-normal">
            {formatMonthRo(monthStart).split(' ')[0]}
            <br />
            <em className="text-ink-400 not-italic" style={{ fontVariationSettings: '"opsz" 144, "wght" 400' }}>
              {monthStart.getUTCFullYear()}
            </em>
          </h1>
          <div className="mt-6 text-ink-400">
            <span className="tabular-nums">{totalDocs}</span>{' '}
            {totalDocs === 1 ? 'document încarcat' : 'documente încarcate'}
          </div>
        </div>

        <div className="flex lg:justify-end">
          <ShareDialog monthId={month.id} monthLabel={formatMonthRo(monthStart)} />
        </div>
      </div>

      <div className="space-y-10 sm:space-y-14">
        {categories.map((cat) => (
          <CategorySection
            key={cat}
            monthId={month.id}
            category={cat}
            label={CATEGORY_LABELS[cat]}
            documents={grouped[cat]}
          />
        ))}
      </div>
    </div>
  );
}
