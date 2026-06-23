# PingWatch — Build Progress

## Step 1 — Project Scaffold ✅
- Next.js app created with Tailwind CSS
- Supabase Postgres connected
- Prisma schema defined (`prisma/schema.prisma`) — all models: User, Organization, OrgMember, Monitor, MonitorCheck, Incident, Subscription, AlertContact, Invite
- `prisma.config.ts` set up for Prisma 7
- Prisma client generated

## Step 2 — Auth ✅
- `lib/db.ts` — Prisma singleton (safe for hot reloads in dev)
- `lib/session.ts` — stateless JWT sessions using `jose`; cookie is httpOnly, 7-day expiry; stores `userId` + `orgId`
- `lib/dal.ts` — Data Access Layer; `verifySession` (redirects if no session), `getCurrentUser` (returns user from DB)
- `app/api/auth/register/route.ts` — creates User + Organization + OrgMember (owner) + free Subscription in a single transaction, then sets session cookie
- `app/api/auth/login/route.ts` — verifies password with bcrypt, looks up org membership, sets session cookie
- `app/api/auth/logout/route.ts` — deletes session cookie
- `app/api/auth/me/route.ts` — returns current user from session
- `proxy.ts` — route protection (Next.js 16 replacement for middleware.ts); redirects unauthenticated users to /login, authenticated users away from /login and /register

## Step 3 — Orgs + Invite Flow + Roles ✅
- `lib/dal.ts` — `requireOrgRole(minimumRole, orgId)` checks membership and rank (member < admin < owner); redirects to /dashboard if unauthorized
- `app/api/orgs/[orgId]/route.ts` — `GET` returns org details + member list (requires member role)
- `app/api/orgs/[orgId]/invites/route.ts` — `POST` creates a 48-hour invite token, emails it via Resend (requires admin role)
- `app/api/invites/accept/route.ts` — `POST` validates token, adds user as member, deletes token; returns `orgId` of the joined org
- `app/api/auth/switch-org/route.ts` — `POST` verifies membership then re-issues session cookie with new `orgId`
- `app/invite/accept/page.tsx` — UI page linked from invite email; calls accept then switch-org, redirects to dashboard

## Step 4 — Monitor CRUD ✅
- `app/api/orgs/[orgId]/monitors/route.ts`
  - `GET` — lists all org monitors with latest check status (requires member)
  - `POST` — validates URL and interval; enforces plan monitor limits and per-plan interval limits (requires admin)
- `app/api/orgs/[orgId]/monitors/[monitorId]/route.ts`
  - `GET` — returns monitor + last 50 checks + last 10 incidents (requires member)
  - `PATCH` — updates url / intervalSecs / active; validates each field; verifies monitor belongs to org (requires admin)
  - `DELETE` — deletes checks and incidents first in a transaction, then the monitor (requires admin); returns 204

## Step 5 — Background Pinger ✅
- `app/api/cron/ping/route.ts` — Vercel Cron calls this daily (`vercel.json`)
  - Verifies `CRON_SECRET` bearer token (skipped if env var not set, for local dev)
  - Loads all active monitors with their most recent check
  - Filters to only monitors whose `intervalSecs` has elapsed since last check
  - Fetches each URL with a 10-second `AbortController` timeout
  - Records a `MonitorCheck` row with status code, latency, and ok flag
- **Note:** Cron runs daily on Vercel Hobby tier. Vercel Pro is required for per-minute scheduling.

## Step 6 — Incident Detection + Email Alerts ✅
- Incident detection runs inside the pinger (same route handler)
  - DOWN: if `!ok` and no open incident → creates `Incident` row, sends down alert email
  - RECOVERY: if `ok` and open incident exists → sets `resolvedAt`, sends recovery email
- Emails are sent via Resend to `AlertContact` rows for the org
- Falls back to the org owner's email if no `AlertContact` rows exist — alerts work out of the box
- `alertSent` flag set to `true` on the incident after the down alert is sent

## Step 7 — Dashboard UI ✅
- `app/dashboard/page.tsx` — monitor table with URL, status badge, latency, interval, and actions
  - Status badge: UP (green) / DOWN (red) / Paused (gray) / No data
  - Paused monitors shown at reduced opacity
  - Upgrade section shown for free/inactive plans; "Manage Billing" link shown for paid plans
- `app/dashboard/MonitorActions.tsx` — client component; Pause/Resume toggle + Delete button per row
- `app/dashboard/ManageBillingButton.tsx` — client component; opens Stripe billing portal
- `app/dashboard/AddMonitorForm.tsx` — dropdown form to create a monitor with URL + interval picker
- `app/dashboard/incidents/page.tsx` — incident history table with monitor URL, start time, duration, and resolved/ongoing badge

## Step 8 — Stripe Billing ✅
- `app/api/stripe/checkout/route.ts` — creates a Checkout session for pro or business; pre-fills customer email; stores `orgId` in metadata
- `app/api/stripe/webhook/route.ts` — verifies Stripe signature; handles:
  - `checkout.session.completed` — upserts Subscription row from checkout metadata
  - `customer.subscription.updated` — syncs plan/status changes (upgrades, downgrades)
  - `customer.subscription.deleted` — marks subscription as canceled; plan gates revert to free limits
- `app/api/stripe/portal/route.ts` — creates a Stripe Billing Portal session so users can cancel or update payment
- `app/dashboard/upgradeButton.tsx` — calls checkout endpoint and redirects to Stripe

## Step 9 — Plan Enforcement ✅
- Monitor count limits enforced in `POST /api/orgs/[orgId]/monitors`: free → 3, pro → 20, business → unlimited
- Interval limits enforced per plan: free → 300s only, pro → 60s+, business → 30s+
- Canceled subscriptions treated as free (status check: `active` or `trialing` required)

## Step 10 — Deploy ✅
- `vercel.json` — cron job defined at `/api/cron/ping` on a daily schedule (Hobby tier limit)
- `package.json` — `build` script runs `prisma generate && next build` so Prisma client is generated on Vercel
- `.env.example` — all required environment variables documented with comments
- Deploy target: Vercel (frontend + API + cron) + Supabase (Postgres)
