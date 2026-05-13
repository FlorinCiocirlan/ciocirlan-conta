# Arhivă PFA — Aplicație documente contabile

Aplicație web pentru gestionarea documentelor contabile lunare ale unui PFA. Generează automat o lună nouă la data de 1, permite upload-ul documentelor (cu poză de pe telefon sau fișiere), și partajarea lor cu contabila prin link sau email.

## Tehnologii

- **Next.js 15** (App Router) + TypeScript
- **Neon Postgres** (DB serverless)
- **Vercel Blob** (storage fișiere)
- **Auth.js v5** (autentificare email + parolă)
- **Resend** (trimitere emailuri cu link de partajare)
- **Tailwind CSS** (styling)
- Deploy pe **Vercel**

## Cum funcționează

1. **Tu** îți faci cont cu email + parolă pe `/register`.
2. Pe dashboard vezi toate lunile. **Luna curentă** apare automat — în prima zi a fiecărei luni, când deschizi aplicația, se generează automat.
3. Intri într-o lună, încarci documente pe categorii (Facturi emise / primite, Bonuri, Extrase, Altele). De pe telefon poți face direct **poză la bon**.
4. Apeși **„Trimite contabilei"** → generezi un link (cu expirare 7/30/90 zile). Îi trimiți linkul fie automat pe email (prin Resend), fie îl copiezi și îl trimiți pe WhatsApp.
5. Contabila deschide linkul → vede și descarcă toate documentele, fără să își facă cont.

---

## Environment Variables necesare pe Vercel

Adaugă-le în **Vercel → Settings → Environment Variables**:

| Variabilă | De unde o iei |
|---|---|
| `DATABASE_URL` | Neon → Connection string |
| `AUTH_SECRET` | Rulează: `openssl rand -base64 32` |
| `AUTH_URL` | URL-ul tău Vercel, ex: `https://ciocirlan-conta.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Același URL Vercel |
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` (pentru test) |
| `BLOB_READ_WRITE_TOKEN` | Auto-adăugat de Vercel după ce creezi Blob store |

## Migrații DB (obligatoriu după primul deploy)

Rulează o dată de pe mașina ta locală cu `DATABASE_URL` setat:

```bash
npm install
npm run db:migrate
```

Creează tabelele: `users`, `months`, `documents`, `share_links`.

Apoi mergi pe `https://your-app.vercel.app/register` și îți faci contul.

---

## Structura proiectului

```
src/
├── app/
│   ├── (dashboard)/       # rute protejate
│   │   ├── dashboard/     # lista lunilor
│   │   └── m/[key]/       # detaliile unei luni
│   ├── share/[token]/     # vizualizare publică pentru contabilă
│   ├── login/, register/  # auth
│   └── api/               # API routes
├── components/            # UI components
├── lib/                   # auth, db, email, utils
└── middleware.ts          # protecție rute
```

## Comenzi

```bash
npm run dev          # development local
npm run build        # build producție
npm run db:migrate   # aplică migrațiile pe Neon
npm run db:push      # push schema direct (dev rapid)
```
