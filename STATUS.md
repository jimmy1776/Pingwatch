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

## Steps 4–10 — Not started
4. Monitor CRUD
5. Background pinger (Vercel Cron)
6. Incident detection + email alerts (Resend)
7. Dashboard UI
8. Stripe billing
9. Plan enforcement
10. Deploy (Vercel + Supabase)
