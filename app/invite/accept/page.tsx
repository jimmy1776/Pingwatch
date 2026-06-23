'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

function AcceptInviteForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleAccept() {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/invites/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? 'Something went wrong');
            setLoading(false);
            return;
        }

        const { orgId } = await res.json();

        // Switch session to the newly joined org
        await fetch('/api/auth/switch-org', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgId }),
        });

        router.push('/dashboard');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;ve been invited</h1>
                <p className="text-gray-500 text-sm mb-6">Accept your invitation to join PingWatch.</p>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                    {loading ? 'Accepting...' : 'Accept Invite'}
                </button>
            </div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<p className="text-center mt-20 text-gray-500">Loading...</p>}>
            <AcceptInviteForm />
        </Suspense>
    );
}
