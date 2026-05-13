'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Mail, X } from 'lucide-react';

interface Props {
  monthId: string;
  monthLabel: string;
}

export function ShareDialog({ monthId, monthLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setSending(true);
    setError(null);
    setEmailSent(false);

    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthId,
        recipientEmail: email || null,
        expiresInDays,
        sendEmail: !!email,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Eroare la generare');
      setSending(false);
      return;
    }

    setShareUrl(data.url);
    if (data.emailSent) setEmailSent(true);
    setSending(false);
  }

  function copyUrl() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setOpen(false);
    setTimeout(() => {
      setShareUrl(null);
      setEmail('');
      setEmailSent(false);
      setError(null);
    }, 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-accent text-cream-50 px-5 py-3 text-sm tracking-wider uppercase hover:bg-accent-dark transition-colors lift"
      >
        <Share2 size={16} />
        Trimite contabilei
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={reset}
        >
          <div
            className="bg-cream-50 max-w-md w-full p-6 sm:p-8 shadow-paper-lg relative rise"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={reset}
              className="absolute top-4 right-4 text-ink-400 hover:text-accent transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-xs tracking-[0.2em] uppercase text-ink-400 mb-2">
              Partajare
            </div>
            <h3 className="font-display text-3xl mb-6">{monthLabel}</h3>

            {!shareUrl ? (
              <div className="space-y-5">
                <div>
                  <label className="text-xs tracking-wider uppercase text-ink-400 block mb-2">
                    Email contabilă <span className="text-ink-100 normal-case">(opțional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contabila@example.com"
                    className="w-full bg-transparent border-b border-ink-100 focus:border-accent outline-none py-2 text-base font-display transition-colors"
                  />
                  <p className="text-xs text-ink-400 mt-1">
                    Dacă lași gol, primești doar linkul pe care îl poți trimite pe WhatsApp.
                  </p>
                </div>

                <div>
                  <label className="text-xs tracking-wider uppercase text-ink-400 block mb-2">
                    Linkul expiră în
                  </label>
                  <div className="flex gap-2">
                    {[7, 30, 90].map((d) => (
                      <button
                        key={d}
                        onClick={() => setExpiresInDays(d)}
                        className={
                          'flex-1 py-2 text-sm border transition-colors ' +
                          (expiresInDays === d
                            ? 'border-accent bg-accent text-cream-50'
                            : 'border-ink-100 hover:border-ink-400')
                        }
                      >
                        {d} zile
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-accent-dark border-l-2 border-accent pl-3 py-1">
                    {error}
                  </div>
                )}

                <button
                  onClick={generate}
                  disabled={sending}
                  className="w-full bg-ink-700 text-cream-50 py-3 px-6 text-sm tracking-wider uppercase font-medium hover:bg-ink-900 disabled:opacity-50 transition-colors lift"
                >
                  {sending ? 'Se generează…' : email ? 'Generează și trimite' : 'Generează link'}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {emailSent && (
                  <div className="flex items-start gap-2 text-sm bg-cream-100 border-l-2 border-moss pl-3 py-2">
                    <Mail size={16} className="text-moss flex-shrink-0 mt-0.5" />
                    <span>Email trimis la <strong>{email}</strong>.</span>
                  </div>
                )}

                <div>
                  <label className="text-xs tracking-wider uppercase text-ink-400 block mb-2">
                    Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 bg-cream-100 border border-ink-100 px-3 py-2 text-sm font-mono truncate"
                    />
                    <button
                      onClick={copyUrl}
                      className="inline-flex items-center gap-1.5 bg-ink-700 text-cream-50 px-3 py-2 text-sm hover:bg-ink-900 transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copiat' : 'Copiază'}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-ink-400">
                  Trimite-l pe WhatsApp sau oriunde — contabila poate descărca toate documentele
                  fără cont.
                </div>

                <button
                  onClick={reset}
                  className="w-full border border-ink-100 py-2.5 text-sm hover:border-ink-400 transition-colors"
                >
                  Închide
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
