import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arhivă PFA — Documente contabile',
  description: 'Gestionează lunar documentele contabile pentru PFA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <main className="app-content">{children}</main>
      </body>
    </html>
  );
}
