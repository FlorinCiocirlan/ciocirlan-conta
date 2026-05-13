import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid lg:grid-cols-5">
        <div className="hidden lg:flex lg:col-span-3 bg-ink-700 text-cream-50 p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 12px, #FDFBF6 12px, #FDFBF6 13px)'
            }}
          />
          <div className="relative">
            <div className="text-xs tracking-[0.2em] uppercase text-cream-200/60">
              Arhivă · An {new Date().getFullYear()}
            </div>
          </div>
          <div className="relative">
            <h1 className="font-display text-5xl xl:text-7xl leading-[0.95] font-normal">
              Documentele tale,<br />
              <em className="text-accent-light not-italic font-display" style={{ fontVariationSettings: '"opsz" 144, "wght" 500' }}>
                la timp,
              </em>
              <br />
              fără WhatsApp.
            </h1>
            <p className="mt-8 text-lg text-cream-200/80 max-w-md leading-relaxed">
              O lună nouă, generată automat în prima zi. Tu încarci, contabila primește un link.
              Atât.
            </p>
          </div>
          <div className="relative flex items-end justify-between text-xs tracking-wider uppercase text-cream-200/50">
            <span>Volumul I</span>
            <span>—</span>
            <span>Privat · Securizat</span>
          </div>
        </div>

        <div className="lg:col-span-2 flex items-center justify-center p-8 sm:p-12 bg-cream-50">
          <div className="w-full max-w-sm rise">
            <div className="text-xs tracking-[0.2em] uppercase text-ink-400 mb-2">
              Autentificare
            </div>
            <h2 className="font-display text-4xl mb-10 leading-tight">
              Bine ai revenit.
            </h2>
            <LoginForm />
            <div className="hairline mt-10 pt-6 text-sm text-ink-400">
              Cont nou? <a href="/register" className="text-accent underline underline-offset-4 decoration-1 hover:decoration-2">Înregistrează-te</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
