# PingWatch

**Know when your site goes down — before your users do.**

PingWatch monitors your websites around the clock and sends you an email the moment something goes wrong — and again when it recovers. You add a URL, and PingWatch handles the rest.

## What it does

- Pings your URLs on a schedule and records the status and response time
- Detects when a site goes down and sends you an email alert immediately
- Sends a second email when the site comes back up
- Tracks incident history so you can see past outages and how long they lasted

## How organizations work

When you register, PingWatch creates an organization for you automatically. Monitors belong to the organization, not to you personally. You can invite teammates to your org so everyone shares the same dashboard and sees the same monitors. Plan limits apply to the org as a whole — a Pro org gets 20 monitors total, shared across all members.

## Plans

| Plan     | Price  | Monitors  | Check Interval |
|----------|--------|-----------|----------------|
| Free     | $0     | 3 URLs    | Every 5 min    |
| Pro      | $9/mo  | 20 URLs   | Every 1 min    |
| Business | $29/mo | Unlimited | Every 30 sec   |

## Tech stack

- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Backend:** Next.js Route Handlers
- **Database:** Supabase (hosted Postgres) + Prisma ORM
- **Auth:** JWT + bcrypt
- **Background jobs:** Vercel Cron
- **Email:** Resend
- **Billing:** Stripe Checkout + Webhooks
- **Cache:** Upstash Redis
- **Deploy:** Vercel

## Live demo

[pingwatch2.vercel.app](https://pingwatch2.vercel.app)
