import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import AddMonitorForm from './AddMonitorForm'
import UpgradeButton from './upgradeButton'
import LogoutButton from './LogoutButton'
import MonitorActions from './MonitorActions'
import ManageBillingButton from './ManageBillingButton'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const monitors = await db.monitor.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
    include: {
      checks: {
        orderBy: { checkedAt: 'desc' },
        take: 1,
      },
    },
  })

  const subscription = await db.subscription.findUnique({ where: { orgId: session.orgId } })
  const isActiveSub = subscription?.status === 'active' || subscription?.status === 'trialing'
  const plan = isActiveSub ? (subscription?.plan ?? 'free') : 'free'

  function formatInterval(secs: number) {
    if (secs < 60) return `${secs}s`
    return `${secs / 60}m`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">PingWatch</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-full capitalize">{plan}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/incidents" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Incidents
          </Link>
          {isActiveSub && plan !== 'free' && <ManageBillingButton />}
          <LogoutButton />
          <AddMonitorForm orgId={session.orgId} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Monitors</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">URL</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Latency</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Interval</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monitors.map((monitor) => {
                const latest = monitor.checks[0]
                const isUp = latest?.ok ?? null
                return (
                  <tr
                    key={monitor.id}
                    className={`hover:bg-gray-50 transition-colors ${!monitor.active ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{monitor.url}</td>
                    <td className="px-6 py-4">
                      {!monitor.active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          Paused
                        </span>
                      ) : isUp === null ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          No data
                        </span>
                      ) : isUp ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          UP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          DOWN
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {latest?.latencyMs != null ? `${latest.latencyMs}ms` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatInterval(monitor.intervalSecs)}
                    </td>
                    <td className="px-6 py-4">
                      <MonitorActions monitorId={monitor.id} orgId={session.orgId} active={monitor.active} />
                    </td>
                  </tr>
                )
              })}
              {monitors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                    No monitors yet. Click &quot;+ Add Monitor&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(!isActiveSub || plan === 'free') && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Upgrade your plan</h3>
            <p className="text-sm text-gray-500 mb-4">Get more monitors and faster check intervals.</p>
            <div className="flex gap-3">
              <UpgradeButton plan="pro" />
              <UpgradeButton plan="business" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
