import { Link } from 'react-router-dom';

const STEPS = [
  { icon: '📦', step: '01', title: 'Submit', desc: 'Describe your scrap and submit a pickup request.' },
  { icon: '💰', step: '02', title: 'Get Quoted', desc: 'Our admin reviews and sends you a fair price quote.' },
  { icon: '🏦', step: '03', title: 'Get Paid', desc: 'Accept the quote, we collect & you receive your payment.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/70 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">ScrapBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 text-sm font-semibold bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-green-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/40 border border-green-700/50 text-green-400 text-xs font-semibold mb-6 tracking-wide uppercase">
            ♻ Digital Scrap Management
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            <span className="text-white">Turning Waste </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              Into Value
            </span>
            <br />
            <span className="text-white">— Digitally</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            ScrapBridge connects households, collectors, and buyers in one seamless platform
            — making scrap disposal easy, fair, and cashless.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              id="hero-login"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/register"
              id="hero-register"
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-green-900/40"
            >
              Register Free →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-900/50 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-400">Three simple steps to turn your scrap into cash.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ icon, step, title, desc }) => (
              <div
                key={step}
                className="relative bg-gray-900 border border-gray-700/60 rounded-2xl p-7 hover:border-green-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20 group"
              >
                <span className="absolute top-5 right-6 text-gray-700 text-xs font-mono font-bold">{step}</span>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-gray-800/50">
        © {new Date().getFullYear()} ScrapBridge. All rights reserved.
      </footer>
    </div>
  );
}
