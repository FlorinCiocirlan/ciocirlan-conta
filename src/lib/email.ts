import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendShareLinkEmail(params: {
  to: string;
  fromName: string;
  monthLabel: string | null;
  url: string;
  expiresAt: Date;
}) {
  if (!resend) {
    console.warn('Resend not configured — skipping email send');
    return { ok: false, error: 'Email not configured' as const };
  }

  const from = process.env.RESEND_FROM_EMAIL || 'docs@example.com';
  const subject = params.monthLabel
    ? `Documente PFA — ${params.monthLabel}`
    : `Documente PFA — arhivă completă`;

  const expiresLabel = params.expiresAt.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #26231E; background: #FDFBF6;">
      <div style="border-bottom: 1px solid #E2D3A8; padding-bottom: 16px; margin-bottom: 24px;">
        <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #5A5448;">Documente PFA</div>
        <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 500;">
          ${params.monthLabel ?? 'Arhivă completă'}
        </h1>
      </div>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        ${params.fromName} ți-a trimis documentele contabile.
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 28px;">
        Apasă pe buton pentru a deschide arhiva. Linkul este valabil până la <strong>${expiresLabel}</strong>.
      </p>
      <div style="margin: 32px 0;">
        <a href="${params.url}"
           style="display: inline-block; background: #A6471C; color: #FDFBF6; text-decoration: none; padding: 14px 28px; font-family: system-ui, sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.04em;">
          Deschide arhiva →
        </a>
      </div>
      <p style="font-size: 13px; color: #5A5448; line-height: 1.6; margin: 24px 0 0;">
        Dacă butonul nu funcționează, copiază acest link în browser:<br>
        <a href="${params.url}" style="color: #A6471C; word-break: break-all;">${params.url}</a>
      </p>
      <div style="border-top: 1px solid #E2D3A8; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #5A5448;">
        Acest email a fost trimis automat. Nu răspunde la el.
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject,
      html,
    });
    return { ok: true, id: result.data?.id };
  } catch (err) {
    console.error('Resend error:', err);
    return { ok: false, error: 'Send failed' as const };
  }
}
