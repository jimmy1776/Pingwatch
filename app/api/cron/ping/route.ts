import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TIMEOUT_MS = 10_000

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const now = new Date()

  const monitors = await db.monitor.findMany({
    where: { active: true },
    select: {
      id: true,
      url: true,
      intervalSecs: true,
      orgId: true,
      checks: {
        take: 1,
        orderBy: { checkedAt: 'desc' },
        select: { checkedAt: true },
      },
    },
  })

  // Only ping monitors whose interval has elapsed since the last check
  const due = monitors.filter((m) => {
    const last = m.checks[0]
    if (!last) return true
    return now.getTime() >= last.checkedAt.getTime() + m.intervalSecs * 1000
  })

  for (const monitor of due) {
    const start = Date.now()
    let ok = false
    let statusCode: number | null = null

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
      const res = await fetch(monitor.url, { signal: controller.signal })
      clearTimeout(timer)
      statusCode = res.status
      ok = res.ok
    } catch {
      ok = false
    }

    const latencyMs = Date.now() - start

    await db.monitorCheck.create({
      data: { monitorId: monitor.id, ok, statusCode, latencyMs },
    })

    const openIncident = await db.incident.findFirst({
      where: { monitorId: monitor.id, resolvedAt: null },
    })

    const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    if (!ok && !openIncident) {
      const incident = await db.incident.create({ data: { monitorId: monitor.id } })
      const emails = await getAlertEmails(monitor.orgId)
      if (emails.length > 0) {
        await resend.emails.send({
          from,
          to: emails,
          subject: `[DOWN] ${monitor.url}`,
          html: `<p>Your monitor for <strong>${monitor.url}</strong> is down.</p><p>We'll notify you when it recovers.</p>`,
        })
        await db.incident.update({ where: { id: incident.id }, data: { alertSent: true } })
      }
    }

    if (ok && openIncident) {
      await db.incident.update({ where: { id: openIncident.id }, data: { resolvedAt: now } })
      const emails = await getAlertEmails(monitor.orgId)
      if (emails.length > 0) {
        await resend.emails.send({
          from,
          to: emails,
          subject: `[RECOVERED] ${monitor.url}`,
          html: `<p>Your monitor for <strong>${monitor.url}</strong> has recovered and is back online.</p>`,
        })
      }
    }
  }

  return Response.json({ checked: due.length })
}

async function getAlertEmails(orgId: string): Promise<string[]> {
  const contacts = await db.alertContact.findMany({ where: { orgId } })
  if (contacts.length > 0) return contacts.map((c) => c.email)
  // Fall back to org owner's email if no alert contacts configured
  const owner = await db.orgMember.findFirst({
    where: { orgId, role: 'owner' },
    select: { user: { select: { email: true } } },
  })
  return owner?.user.email ? [owner.user.email] : []
}
