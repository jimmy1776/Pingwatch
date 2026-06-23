'use client'
import { useState } from 'react'

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Could not open billing portal')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Manage Billing'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
