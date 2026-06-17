'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddMonitorForm({ orgId }: { orgId: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [intervalSecs, setIntervalSecs] = useState(60);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit() {
        const res = await fetch(`/api/orgs/${orgId}/monitors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, intervalSecs }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error);
            return;
        }

        setOpen(false);
        setUrl('');
        setError(null);
        router.refresh();
    }

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
                + Add Monitor
            </button>
            {open && (
                <div className="absolute right-8 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-5 w-80 z-10">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">New Monitor</h3>
                    <div className="flex flex-col gap-3">
                        <input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <select
                            value={intervalSecs}
                            onChange={(e) => setIntervalSecs(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={30}>Every 30 seconds</option>
                            <option value={60}>Every 1 minute</option>
                            <option value={300}>Every 5 minutes</option>
                        </select>
                        {error && <p className="text-red-500 text-xs">{error}</p>}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setOpen(false)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
