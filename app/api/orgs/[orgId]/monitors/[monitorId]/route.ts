import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireOrgRole } from '@/lib/dal'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string; monitorId: string }> }
) {
  const { orgId, monitorId } = await params
  await requireOrgRole('member', orgId)

  const monitor = await db.monitor.findFirst({
    where: { id: monitorId, orgId },
    select: {
      id: true,
      url: true,
      intervalSecs: true,
      active: true,
      createdAt: true,
      checks: {
        take: 50,
        orderBy: { checkedAt: 'desc' },
        select: { id: true, ok: true, statusCode: true, latencyMs: true, checkedAt: true },
      },
      incidents: {
        take: 10,
        orderBy: { startedAt: 'desc' },
        select: { id: true, startedAt: true, resolvedAt: true },
      },
    },
  })

  if (!monitor) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(monitor)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; monitorId: string }> }
) {
  const { orgId, monitorId } = await params
  await requireOrgRole('admin', orgId)

  const monitor = await db.monitor.findFirst({ where: { id: monitorId, orgId } })
  if (!monitor) return Response.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.url !== undefined) {
    if (typeof body.url !== 'string') {
      return Response.json({ error: 'url must be a string' }, { status: 400 })
    }
    try { new URL(body.url) } catch {
      return Response.json({ error: 'Invalid URL' }, { status: 400 })
    }
    data.url = body.url
  }

  if (body.intervalSecs !== undefined) {
    if (![30, 60, 300].includes(body.intervalSecs)) {
      return Response.json({ error: 'intervalSecs must be 30, 60, or 300' }, { status: 400 })
    }
    data.intervalSecs = body.intervalSecs
  }

  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') {
      return Response.json({ error: 'active must be a boolean' }, { status: 400 })
    }
    data.active = body.active
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 })
  }

  const updated = await db.monitor.update({
    where: { id: monitorId },
    data,
    select: { id: true, url: true, intervalSecs: true, active: true, createdAt: true },
  })

  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string; monitorId: string }> }
) {
  const { orgId, monitorId } = await params
  await requireOrgRole('admin', orgId)

  const monitor = await db.monitor.findFirst({ where: { id: monitorId, orgId } })
  if (!monitor) return Response.json({ error: 'Not found' }, { status: 404 })

  await db.$transaction([
    db.monitorCheck.deleteMany({ where: { monitorId } }),
    db.incident.deleteMany({ where: { monitorId } }),
    db.monitor.delete({ where: { id: monitorId } }),
  ])

  return new Response(null, { status: 204 })
}
