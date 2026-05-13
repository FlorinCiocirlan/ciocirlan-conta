import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-cream-200 bg-cream-50/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-baseline gap-3">
            <span className="font-display text-2xl font-medium tracking-tight">Arhivă PFA</span>
            <span className="text-xs tracking-[0.2em] uppercase text-ink-400 hidden sm:inline">
              Anul {new Date().getFullYear()}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-400 hidden sm:inline">{session.user.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <button
                type="submit"
                className="text-xs tracking-wider uppercase text-ink-400 hover:text-accent transition-colors"
              >
                Ieșire
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-cream-200 py-6 text-center text-xs tracking-wider uppercase text-ink-400">
        <span>Arhivă PFA · Privat · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
