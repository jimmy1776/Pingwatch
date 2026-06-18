import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export default async function IncidentsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const incidents = await db.incident.findMany({
        where: { monitor: { orgId: session.orgId } },
        include: { monitor: { select: { url: true } } },
        orderBy: { startedAt: 'desc' },
        take: 100,
    });

    function formatDuration(start: Date, end: Date | null) {
        if (!end) return 'Ongoing';
        const ms = end.getTime() - start.getTime();
        const mins = Math.floor(ms / 60000);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        const rem = mins % 60;
        return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        ← Back to dashboard
                    </Link>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-semibold text-gray-900">Incident History</span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700">All Incidents</h2>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Monitor</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Started</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Resolved</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {incidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{incident.monitor.url}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {incident.startedAt.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {incident.resolvedAt ? incident.resolvedAt.toLocaleString() : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDuration(incident.startedAt, incident.resolvedAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {incident.resolvedAt ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Resolved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                Ongoing
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {incidents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                                        No incidents recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
