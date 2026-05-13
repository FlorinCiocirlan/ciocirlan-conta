'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Eroare la înregistrare.');
      setLoading(false);
      return;
    }

    await signIn('credentials', { email, password, redirect: false });
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-xs tracking-wider uppercase text-ink-400 block mb-2">Nume</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-transparent border-b border-ink-100 focus:border-accent outline-none py-2 text-lg font-display transition-colors"
        />
      </div>
      <div>
        <label className="text-xs tracking-wider uppercase text-ink-400 block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-transparent border-b border-ink-100 focus:border-accent outline-none py-2 text-lg font-display transition-colors"
        />
      </div>
      <div>
        <label className="text-xs tracking-wider uppercase text-ink-400 block mb-2">
          Parolă <span className="text-ink-100">— min. 8 caractere</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full bg-transparent border-b border-ink-100 focus:border-accent outline-none py-2 text-lg font-display transition-colors"
        />
      </div>
      {error && (
        <div className="text-sm text-accent-dark border-l-2 border-accent pl-3 py-1">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink-700 text-cream-50 py-3.5 px-6 text-sm tracking-wider uppercase font-medium hover:bg-ink-900 disabled:opacity-50 transition-colors lift"
      >
        {loading ? 'Se creează…' : 'Creează cont'}
      </button>
    </form>
  );
}
