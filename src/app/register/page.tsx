import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 sm:p-12 bg-cream-50">
      <div className="w-full max-w-sm rise">
        <div className="text-xs tracking-[0.2em] uppercase text-ink-400 mb-2">
          Cont nou
        </div>
        <h2 className="font-display text-4xl mb-2 leading-tight">
          Începem.
        </h2>
        <p className="text-ink-400 mb-10">
          Un singur cont, pentru tot anul fiscal.
        </p>
        <RegisterForm />
        <div className="hairline mt-10 pt-6 text-sm text-ink-400">
          Ai deja cont? <a href="/login" className="text-accent underline underline-offset-4 decoration-1 hover:decoration-2">Autentifică-te</a>
        </div>
      </div>
    </div>
  );
}
