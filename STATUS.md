# PingWatch — Build Progress

## Step 1 — Project Scaffold ✅
- Next.js app created with Tailwind CSS
- Supabase Postgres connected
- Prisma schema defined (`prisma/schema.prisma`) — all models: User, Organization, OrgMember, Monitor, MonitorCheck, Incident, Subscription, AlertContact
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

## Step 3 — Orgs + Invite Flow + Roles 🔄
- [x] Org context — `orgId` stored in JWT session; register and login both set it
- [ ] Role guards — helper functions in DAL to check owner/admin/member before allowing actions
- [ ] Invite flow — create invite token, accept invite, add user to org as member

## Steps 4–10 — Not started
4. Monitor CRUD
5. Background pinger (Vercel Cron)
6. Incident detection + email alerts (Resend)
7. Dashboard UI
8. Stripe billing
9. Plan enforcement
10. Deploy (Vercel + Supabase)
