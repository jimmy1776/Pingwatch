'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  monitorId: string
  orgId: string
  active: boolean
}

export default function MonitorActions({ monitorId, orgId, active }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleActive() {
    setLoading(true)
    await fetch(`/api/orgs/${orgId}/monitors/${monitorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    setLoading(false)
    router.refresh()
  }

  async function deleteMonitor() {
    if (!confirm('Delete this monitor? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/orgs/${orgId}/monitors/${monitorId}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleActive}
        disabled={loading}
        className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors disabled:opacity-50 ${
          active
            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {active ? 'Pause' : 'Resume'}
      </button>
      <button
        onClick={deleteMonitor}
        disabled={loading}
        className="text-xs px-2.5 py-1 rounded-md font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}
