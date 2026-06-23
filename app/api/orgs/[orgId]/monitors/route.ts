import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireOrgRole } from '@/lib/dal'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  await requireOrgRole('member', orgId)

  const monitors = await db.monitor.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      url: true,
      intervalSecs: true,
      active: true,
      createdAt: true,
      checks: {
        take: 1,
        orderBy: { checkedAt: 'desc' },
        select: { ok: true, statusCode: true, latencyMs: true, checkedAt: true },
      },
    },
  })

  return Response.json(monitors)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  await requireOrgRole('admin', orgId)

  const { url, intervalSecs } = await req.json()

  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'url is required' }, { status: 400 })
  }
  try {
    new URL(url)
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (![30, 60, 300].includes(intervalSecs)) {
    return Response.json({ error: 'intervalSecs must be 30, 60, or 300' }, { status: 400 })
  }

  const subscription = await db.subscription.findUnique({ where: { orgId } })
  const plan = subscription?.plan ?? 'free'
  const limits: Record<string, number> = { free: 3, pro: 20, business: Infinity }
  const monitorCount = await db.monitor.count({ where: { orgId } })

  if (monitorCount >= limits[plan]) {
    return Response.json(
      { error: `Your ${plan} plan allows a maximum of ${limits[plan]} monitors. Upgrade to add more.` },
      { status: 403 }
    )
  }

  const monitor = await db.monitor.create({
    data: { url, intervalSecs, orgId },
    select: { id: true, url: true, intervalSecs: true, active: true, createdAt: true },
  })

  return Response.json(monitor, { status: 201 })
}
