import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { listMonths } from '@/lib/data';
import { formatMonthRo, monthKey } from '@/lib/months';
import { formatBytes } from '@/lib/utils';
import Link from 'next/link';
import { FileText, ArrowUpRight } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  const monthsList = await listMonths(userId);
  const totalDocs = monthsList.reduce((acc, m) => acc + Number(m.docCount), 0);
  const totalSize = monthsList.reduce((acc, m) => acc + Number(m.totalSize), 0);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
      <div className="mb-12 sm:mb-16">
        <div className="text-xs tracking-[0.2em] uppercase text-ink-400 mb-3">
          Pagina întâi · Sumar
        </div>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] font-normal max-w-4xl">
          Salut, {session.user.name?.split(' ')[0] ?? 'prietene'}.
          <br />
          <em className="text-accent not-italic" style={{ fontVariationSettings: '"opsz" 144, "wght" 500' }}>
            {monthsList.length} {monthsList.length === 1 ? 'lună' : 'luni'}
          </em>
          {' '}în arhivă.
        </h1>

        <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl">
          <Stat label="Documente" value={String(totalDocs)} />
          <Stat label="Spațiu" value={formatBytes(totalSize)} />
          <Stat label="Luni active" value={String(monthsList.filter((m) => Number(m.docCount) > 0).length)} />
        </div>
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl">Luni</h2>
          <span className="text-xs tracking-wider uppercase text-ink-400">
            Generate automat în prima zi
          </span>
        </div>

        <ul className="hairline">
          {monthsList.map((m, i) => {
            const docCount = Number(m.docCount);
            const size = Number(m.totalSize);
            return (
              <li
                key={m.id}
                className="border-b border-cream-200 rise"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <Link
                  href={`/m/${monthKey(m.monthStart)}`}
                  className="grid grid-cols-12 items-center py-5 sm:py-7 gap-4 group lift"
                >
                  <div className="col-span-12 sm:col-span-5 flex items-baseline gap-4">
                    <span className="font-mono text-xs text-ink-400 tabular-nums w-12">
                      {String(monthsList.length - i).padStart(2, '0')}
                    </span>
                    <span className="font-display text-2xl sm:text-3xl group-hover:text-accent transition-colors">
                      {formatMonthRo(m.monthStart)}
                    </span>
                  </div>
                  <div className="col-span-6 sm:col-span-3 flex items-center gap-2 text-sm text-ink-400">
                    <FileText size={14} className="opacity-50" />
                    <span className="tabular-nums">{docCount}</span>
                    <span>{docCount === 1 ? 'document' : 'documente'}</span>
                  </div>
                  <div className="col-span-4 sm:col-span-3 text-sm text-ink-400 tabular-nums">
                    {size > 0 ? formatBytes(size) : '—'}
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <ArrowUpRight
                      size={20}
                      className="text-ink-100 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {monthsList.length === 0 && (
          <div className="py-16 text-center text-ink-400">
            Nicio lună încă. Se generează automat în prima zi.
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs tracking-wider uppercase text-ink-400 mb-1">{label}</div>
      <div className="font-display text-3xl sm:text-4xl tabular-nums">{value}</div>
    </div>
  );
}
