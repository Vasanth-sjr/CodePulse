import React, { useState, useEffect, useRef } from 'react';
import CodePulseLogo from '../components/CodePulseLogo';
import { useTheme } from '../context/ThemeContext';

/* ─── DATA ─── */
const scopeCards = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Developer Impact Analysis',
    desc: 'Fair, data-driven contribution scores beyond simple commit counts.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Requirement Mapping',
    desc: 'AI maps commits to business goals using NLP semantic similarity.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    title: 'Knowledge Risk Detection',
    desc: 'Catch bus-factor risks before they hurt — identify knowledge silos.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI Insights',
    desc: 'Intelligent recommendations powered by Gemini AI analysis.',
  },
];

const futureItems = [
  { icon: '🧠', title: 'AI Code Explanation Layer', desc: 'Natural-language explanations for every commit and pull request.' },
  { icon: '📈', title: 'Predictive Developer Risk Analysis', desc: 'Forecast burnout and turnover risks before they happen.' },
  { icon: '🤝', title: 'Team Optimization Recommendations', desc: 'AI-suggested team structures for maximum velocity.' },
  { icon: '💓', title: 'Real-time Engineering Health Score', desc: 'Live dashboards tracking codebase and team health metrics.' },
];

const teamMembers = [
  { initials: 'SV', name: 'SJR Vasanth', color: 'from-blue-500 to-cyan-500' },
  { initials: 'KM', name: 'Kiranraj M', color: 'from-purple-500 to-pink-500' },
  { initials: 'TK', name: 'Trilok KR', color: 'from-orange-500 to-red-500' },
  { initials: 'GR', name: 'GokulJayandan R S', color: 'from-emerald-500 to-teal-500' },
  { initials: 'AK', name: 'Arjun Thakku Kumarakannan', color: 'from-rose-500 to-fuchsia-500' },
  { initials: 'HB', name: 'Harries Babu Rekha', color: 'from-amber-500 to-yellow-500' },
];

/* ─── SCROLL ANIMATION HOOK ─── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── FLIP CARD ─── */
function FlipCard({ front, back, className = '' }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`hp-flip-container cursor-pointer ${className}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className={`hp-flip-inner ${flipped ? 'hp-flipped' : ''}`}>
        <div className="hp-flip-front glass-card p-8 flex flex-col items-center justify-center text-center h-full">
          {front}
        </div>
        <div className="hp-flip-back glass-card p-8 flex flex-col items-center justify-center text-center h-full">
          {back}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION WRAPPER ─── */
function Section({ id, children, className = '' }) {
  const [ref, visible] = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-20 transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </section>
  );
}

/* ─── MAIN PAGE ─── */
export default function HomePage({ onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${isDark ? 'bg-dark-900' : 'bg-gradient-to-br from-gray-50 to-emerald-50/30'}`}>

      {/* ═══ FLOATING BLOBS ═══ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className={`hp-blob hp-blob-1 ${isDark ? 'bg-blue-600' : 'bg-green-400'}`} />
        <div className={`hp-blob hp-blob-2 ${isDark ? 'bg-purple-600' : 'bg-emerald-400'}`} />
        <div className={`hp-blob hp-blob-3 ${isDark ? 'bg-cyan-600' : 'bg-teal-400'}`} />
      </div>

      {/* ═══ NAVBAR ═══ */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: isDark ? 'rgba(15,17,23,0.75)' : 'rgba(248,250,249,0.75)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 py-4">
          <div className="flex items-center gap-2.5">
            <CodePulseLogo size={34} />
            <span className="text-xl font-bold gradient-text">CodePulse</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#about" className={`hidden md:inline text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>About</a>
            <a href="#scope" className={`hidden md:inline text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Scope</a>
            <a href="#future" className={`hidden md:inline text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Future</a>
            <a href="#team" className={`hidden md:inline text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Team</a>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-dark-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button
              onClick={() => onNavigate('setup')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-105 ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/20' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/20'}`}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <header className="relative z-10 flex flex-col items-center justify-center text-center px-6 md:px-8 pt-24 pb-20 min-h-[80vh]">
        <div className="hp-hero-entrance">
          <div className="mb-8">
            <CodePulseLogo size={80} />
          </div>
          <h1 className={`text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Code<span className="gradient-text">Pulse</span>
            <span className={`block text-2xl sm:text-3xl md:text-4xl font-semibold mt-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              AI-Powered Developer Intelligence
            </span>
          </h1>
          <p className={`text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Transform raw GitHub data into actionable engineering intelligence. Understand impact, reduce risks, and align development with business goals — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              id="hero-get-started-btn"
              onClick={() => onNavigate('setup')}
              className={`group relative px-10 py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/25'}`}
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <a
              href="#about"
              className={`px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hp-scroll-indicator">
          <svg className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* ═══ ABOUT (FLIP CARD) ═══ */}
      <Section id="about">
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          About <span className="gradient-text">CodePulse</span>
        </h2>
        <div className="flex justify-center">
          <FlipCard
            className="w-full max-w-lg h-72"
            front={
              <>
                <div className="mb-4">
                  <CodePulseLogo size={48} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>About CodePulse</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Click to learn more</p>
              </>
            }
            back={
              <>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${isDark ? 'bg-blue-500/15' : 'bg-green-500/15'}`}>💡</div>
                <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  CodePulse transforms raw GitHub data into actionable engineering intelligence, helping teams understand impact, reduce risks, and align development with business goals.
                </p>
              </>
            }
          />
        </div>
      </Section>

      {/* ═══ SCOPE ═══ */}
      <Section id="scope">
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What We <span className="gradient-text">Cover</span>
        </h2>
        <p className={`text-center text-sm mb-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Core capabilities that power engineering intelligence</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {scopeCards.map((card, i) => (
            <div
              key={card.title}
              className="glass-card p-6 flex flex-col items-center text-center hp-scope-card group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400' : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600'}`}>
                {card.icon}
              </div>
              <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{card.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ FUTURE ASPECTS ═══ */}
      <Section id="future">
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Future <span className="gradient-text">Aspects</span>
        </h2>
        <p className={`text-center text-sm mb-14 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>What's coming next to CodePulse</p>
        <div className="relative">
          {/* Timeline line */}
          <div className={`absolute left-6 md:left-1/2 top-0 bottom-0 w-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <div className="space-y-12">
            {futureItems.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={item.title} className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}>
                  {/* Dot */}
                  <div className={`absolute left-6 md:left-1/2 w-3 h-3 rounded-full -translate-x-1/2 z-10 ring-4 ${isDark ? 'bg-blue-500 ring-dark-900' : 'bg-green-500 ring-gray-50'}`} />
                  {/* Spacer (hidden on mobile) */}
                  <div className="hidden md:block md:w-1/2" />
                  {/* Card */}
                  <div className={`ml-14 md:ml-0 ${isLeft ? 'md:pl-10' : 'md:pr-10'} md:w-1/2`}>
                    <div className="glass-card p-6 hp-scope-card group" style={{ animationDelay: `${i * 0.12}s` }}>
                      <div className="flex items-start gap-4">
                        <span className="text-2xl flex-shrink-0">{item.icon}</span>
                        <div>
                          <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══ TEAM ═══ */}
      <Section id="team">
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Our <span className="gradient-text">Team</span>
        </h2>
        <p className={`text-center text-sm mb-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>The minds behind CodePulse</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {teamMembers.map((member) => (
            <FlipCard
              key={member.name}
              className="h-48"
              front={
                <>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-xl font-bold text-white mb-3 shadow-lg`}>
                    {member.initials}
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Click to reveal</p>
                </>
              }
              back={
                <>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-sm font-bold text-white mb-3`}>
                    {member.initials}
                  </div>
                  <p className={`text-sm font-semibold leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.name}</p>
                </>
              }
            />
          ))}
        </div>
      </Section>

      {/* ═══ CTA BANNER ═══ */}
      <Section id="cta" className="pb-10">
        <div className={`glass-card p-10 md:p-14 text-center gradient-border`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ready to transform your engineering insights?
          </h2>
          <p className={`text-sm mb-8 max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Connect your repository and let CodePulse deliver actionable intelligence in minutes.
          </p>
          <button
            onClick={() => onNavigate('setup')}
            className={`px-10 py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/25'}`}
          >
            Get Started — It's Free
          </button>
        </div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <footer className={`relative z-10 border-t py-8 text-center ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <CodePulseLogo size={22} />
          <span className={`text-sm font-semibold gradient-text`}>CodePulse</span>
        </div>
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          © 2026 CodePulse · AI-Powered Developer Intelligence
        </p>
      </footer>
    </div>
  );
}
