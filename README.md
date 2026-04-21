# PABSEC Events Platform

Official events and meetings management platform for the **Parliamentary Assembly of the Black Sea Economic Cooperation (PABSEC)**.

Supports **English**, **Russian**, and **Turkish**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL |
| i18n | next-intl (EN / RU / TR) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and fill in DATABASE_URL and other secrets

# 3. Set up the database
npm run db:push          # push schema to DB (dev)
npm run db:seed          # seed sample data

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/en` by default.

### Database commands

```bash
npm run db:migrate    # create and apply a new migration
npm run db:studio     # open Prisma Studio (GUI)
npm run db:generate   # regenerate Prisma client after schema change
```

## Project Structure

```
pabsec-events-platform/
├── app/
│   ├── [locale]/            # Localised pages (en / ru / tr)
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Home page
│   │   └── events/
│   │       ├── page.tsx     # Events list
│   │       └── [id]/        # Event detail + registration
│   └── api/
│       ├── events/          # GET /api/events
│       ├── registrations/   # POST /api/registrations
│       └── health/          # GET /api/health
├── components/
│   ├── ui/                  # Button, Card, Badge, Input
│   ├── layout/              # Navbar, Footer
│   └── events/              # EventCard, RegistrationForm
├── lib/
│   ├── db.ts                # Prisma singleton
│   ├── utils.ts             # cn(), formatDate()
│   └── i18n/                # next-intl config
├── messages/                # en.json  ru.json  tr.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── database/                # Raw SQL reference (kept for docs)
└── docs/                    # Project documentation
```

## Adding a Translation Key

1. Add the key to `messages/en.json`, `messages/ru.json`, and `messages/tr.json`.
2. Use it in a server component with `getTranslations()` or in a client component with `useTranslations()`.

## Environment Variables

See `.env.example` for the full list. The only required variable to run locally is `DATABASE_URL`.

## Deployment

The app is a standard Next.js application and can be deployed to:
- **Vercel** — zero-config, set `DATABASE_URL` in project settings
- **Docker** — build with `npm run build`, serve with `npm start`
- Any Node.js 18+ host

---

PABSEC © 2025. All rights reserved.
