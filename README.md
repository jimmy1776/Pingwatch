# PingWatch

![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![Stripe](https://img.shields.io/badge/Billing-Stripe-635BFF?logo=stripe&logoColor=white)

**Know when your site goes down — before your users do.**

PingWatch monitors your websites around the clock and sends you an email the moment something goes wrong — and again when it recovers. Add a URL and PingWatch handles the rest.

**[Live demo →](https://pingwatch2.vercel.app)**

---

## Features

- Monitors URLs on a configurable schedule and records status + response time
- Detects down/up transitions and sends email alerts via Resend
- Tracks full incident history with duration
- Multi-tenant: users belong to organizations, teammates share a dashboard
- Role-based access control (owner / admin / member) with invite flow
- Stripe-gated plans enforced per org

## Architecture

```
User request  →  Next.js Route Handlers
                       ↓
                  Prisma ORM  →  Supabase Postgres

Vercel Cron  →  /api/cron/ping  →  fetches all due monitors
                       ↓
            Upstash Redis (last-known status cache)
                       ↓
            Resend  (email alert on state change)

Stripe Webhooks  →  subscription state  →  plan enforcement
```

## Plans

| Plan     | Price  | Monitors  | Check Interval |
|----------|--------|-----------|----------------|
| Free     | $0     | 3 URLs    | Every 5 min    |
| Pro      | $9/mo  | 20 URLs   | Every 1 min    |
| Business | $29/mo | Unlimited | Every 30 sec   |

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| Backend | Next.js Route Handlers |
| Database | Supabase (hosted Postgres) + Prisma ORM |
| Auth | JWT (`jose`) + bcrypt, httpOnly cookie sessions |
| Background jobs | Vercel Cron → `/api/cron/ping` |
| Email | Resend |
| Billing | Stripe Checkout + Webhooks |
| Cache | Upstash Redis |
| Deploy | Vercel |

## How It Works

**Multi-tenancy:** Each user registers into an organization. Monitors belong to orgs, not individual users. Teammates share the same dashboard and monitor pool. Plan limits apply at the org level.

**Pinger:** A Vercel Cron job fires on a schedule and hits `/api/cron/ping`. That route fetches all active monitors due for a check, records the result in `MonitorCheck`, and compares against the last-known status cached in Upstash Redis to detect transitions cheaply without extra DB reads.

**Incident detection:** When a monitor flips from up → down, an `Incident` row is created and an alert email goes out via Resend. When it recovers, the incident is resolved and a second email is sent.

**Billing:** Stripe Checkout handles plan upgrades. Webhooks are the source of truth for subscription state — the app never trusts client-side signals.

## Getting Started

```bash
git clone https://github.com/jimmy1776/Pingwatch
cd Pingwatch
npm install
cp .env.example .env.local   # fill in your keys
npx prisma migrate dev
npm run dev
```

See `.env.example` for all required environment variables.
