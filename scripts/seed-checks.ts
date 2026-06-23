/**
 * Populates demo MonitorCheck history for all existing monitors in the first org.
 * Run once: npx ts-node --skip-project scripts/seed-checks.ts
 *
 * Requires DATABASE_URL in your local .env
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const DAYS = 7
const INTERVAL_MINS = 5
const CHECKS_PER_DAY = (24 * 60) / INTERVAL_MINS // 288

async function main() {
  const monitors = await db.monitor.findMany({ select: { id: true, url: true, orgId: true } })

  if (monitors.length === 0) {
    console.log('No monitors found. Add some monitors via the dashboard first.')
    return
  }

  console.log(`Seeding check history for ${monitors.length} monitor(s)...`)

  for (const monitor of monitors) {
    const checks = []
    const incidents: { monitorId: string; startedAt: Date; resolvedAt: Date }[] = []

    const now = Date.now()
    const totalChecks = DAYS * CHECKS_PER_DAY

    // Simulate one ~45-minute outage 3 days ago
    const outageStart = now - 3 * 24 * 60 * 60 * 1000
    const outageEnd = outageStart + 45 * 60 * 1000

    for (let i = totalChecks; i >= 0; i--) {
      const checkedAt = new Date(now - i * INTERVAL_MINS * 60 * 1000)
      const ts = checkedAt.getTime()
      const duringOutage = ts >= outageStart && ts <= outageEnd

      const ok = !duringOutage
      const latencyMs = ok ? Math.floor(Math.random() * 180 + 80) : null // 80–260ms when up
      const statusCode = ok ? 200 : null

      checks.push({ monitorId: monitor.id, ok, statusCode, latencyMs, checkedAt })
    }

    await db.monitorCheck.createMany({ data: checks, skipDuplicates: true })

    // Create the incident row
    incidents.push({
      monitorId: monitor.id,
      startedAt: new Date(outageStart),
      resolvedAt: new Date(outageEnd),
    })
    await db.incident.createMany({ data: incidents, skipDuplicates: true })

    console.log(`  ✓ ${monitor.url} — ${checks.length} checks, 1 incident seeded`)
  }

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
