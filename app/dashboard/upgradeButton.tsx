'use client';
import { useState } from 'react';

export default function UpgradeButton({ plan }: { plan: 'pro' | 'business' }) {
    const [loading, setLoading] = useState(false);

    async function handleUpgrade() {
        setLoading(true);
        const res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
        });

        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        }
        setLoading(false);
    }

    const isPro = plan === 'pro';

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                isPro
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
        >
            {loading ? 'Redirecting...' : isPro ? 'Upgrade to Pro — $9/mo' : 'Upgrade to Business — $29/mo'}
        </button>
    );
}
