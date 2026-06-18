import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <header className="border-b border-gray-100 px-8 py-4 flex items-center justify-between max-w-6xl mx-auto">
                <span className="text-lg font-bold text-gray-900">PingWatch</span>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        Log in
                    </Link>
                    <Link href="/register" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Get started free
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-8 py-24 text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    Uptime monitoring for your websites
                </div>
                <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
                    Know when your site goes down — before your users do
                </h1>
                <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    PingWatch monitors your websites around the clock and sends you an email the moment something goes wrong — and again when it recovers.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link href="/register" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                        Start monitoring free
                    </Link>
                    <Link href="/login" className="text-gray-600 px-6 py-3 rounded-lg font-medium hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-300">
                        Sign in
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Instant alerts</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Get an email the moment your site goes down and another when it comes back up.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Frequent checks</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Monitors checked every 5 minutes on free, every minute on Pro, every 30 seconds on Business.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Latency tracking</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">See response times for every check so you can spot slowdowns before they become outages.</p>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="max-w-6xl mx-auto px-8 py-16">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Simple pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free */}
                    <div className="border border-gray-200 rounded-xl p-6">
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-1">Free</h3>
                            <div className="text-3xl font-bold text-gray-900">$0<span className="text-base font-normal text-gray-500">/mo</span></div>
                        </div>
                        <ul className="space-y-3 mb-6">
                            <li className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> 3 monitors</li>
                            <li className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> 5-minute checks</li>
                            <li className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> Email alerts</li>
                        </ul>
                        <Link href="/register" className="block text-center text-sm font-medium border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors">
                            Get started
                        </Link>
                    </div>
                    {/* Pro */}
                    <div className="border-2 border-indigo-600 rounded-xl p-6 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most popular</div>
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-1">Pro</h3>
                            <div className="text-3xl font-bold text-gray-900">$9<span className="text-base font-normal text-gray-500">/mo</span></div>
                        </div>
                        <ul className="space-y-3 mb-6">
                            <li className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> 20 monitors</li>
                            <li className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> 1-minute checks</li>
                            <li className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> Email alerts</li>
                        </ul>
                        <Link href="/register" className="block text-center text-sm font-medium bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 transition-colors">
                            Get started
                        </Link>
                    </div>
                    {/* Business */}
                    <div className="border border-gray-200 rounded-xl p-6">
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-1">Business</h3>
                            <div className="text-3xl font-bold text-gray-900">$29<span className="text-base font-normal text-gray-500">/mo</span></div>
                        </div>
                        <ul className="space-y-3 mb-6">
                            <li className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> Unlimited monitors</li>
                            <li className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> 30-second checks</li>
                            <li className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> Email alerts</li>
                        </ul>
                        <Link href="/register" className="block text-center text-sm font-medium border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors">
                            Get started
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 px-8 py-6 text-center text-sm text-gray-400 max-w-6xl mx-auto">
                © {new Date().getFullYear()} PingWatch. Built with Next.js, Prisma, and Stripe.
            </footer>
        </div>
    );
}
