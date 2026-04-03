import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodePulseLogo from '../components/CodePulseLogo';
import LandingNavbar from '../components/LandingNavbar';
import { useTheme } from '../context/ThemeContext';

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA — NO API CALLS
   ═══════════════════════════════════════════════════════════════ */

const dashboardTabs = [
  {
    id: 'insights',
    label: 'Developer Insights',
    icon: '📊',
  },
  {
    id: 'plan',
    label: 'Plan vs Reality',
    icon: '📋',
  },
  {
    id: 'risk',
    label: 'Risk Detection',
    icon: '⚠️',
  },
];

const problemPoints = [
  { icon: '❌', text: 'No real developer visibility' },
  { icon: '❌', text: "Metrics don't show impact" },
  { icon: '❌', text: 'Jira ≠ Reality' },
  { icon: '❌', text: 'Knowledge silos go undetected' },
];

const solutionPoints = [
  { icon: '✅', text: 'AI-driven developer insights' },
  { icon: '✅', text: 'Real impact tracking' },
  { icon: '✅', text: 'Business alignment scoring' },
  { icon: '✅', text: 'Proactive risk detection' },
];

const workflowSteps = [
  { icon: '🔗', title: 'GitHub Data', desc: 'Commits, PRs, file changes ingested automatically' },
  { icon: '🧠', title: 'AI Analysis Engine', desc: 'NLP + Gemini-powered deep code analysis' },
  { icon: '📋', title: 'Jira Mapping', desc: 'Plan vs reality alignment via semantic matching' },
  { icon: '💡', title: 'Insight Generation', desc: 'Impact scores, risks, and recommendations' },
  { icon: '📊', title: 'Dashboard + Alerts', desc: 'Interactive dashboards and email reports' },
];

const featureCards = [
  { icon: '📊', title: 'Developer Impact Intelligence', desc: 'Fair, data-driven contribution scoring beyond simple commit counts.' },
  { icon: '🔗', title: 'Requirement Traceability', desc: 'AI maps commits to business goals using NLP semantic similarity.' },
  { icon: '⚠️', title: 'Bus Factor Intelligence', desc: 'Detect single points of failure and knowledge concentration risks.' },
  { icon: '💡', title: 'Engineering Decision Engine', desc: 'AI-powered recommendations for team health and code quality.' },
];

const futureItems = [
  { icon: '🧠', title: 'Predictive Risk Intelligence', desc: 'Forecast burnout and turnover risks before they happen.' },
  { icon: '🔍', title: 'AI Code Explanation Layer', desc: 'Natural-language explanations for every commit and PR.' },
  { icon: '💓', title: 'Engineering Health Score', desc: 'Real-time dashboards tracking codebase and team health.' },
];

const teamMembers = [
  { initials: 'SV', name: 'SJR Vasanth', color: 'from-green-500 to-emerald-500' },
  { initials: 'KM', name: 'Kiranraj M', color: 'from-purple-500 to-pink-500' },
  { initials: 'TK', name: 'Trilok KR', color: 'from-orange-500 to-red-500' },
  { initials: 'GR', name: 'GokulJayandan R S', color: 'from-emerald-500 to-teal-500' },
  { initials: 'AK', name: 'Arjun Thakku Kumarakannan', color: 'from-rose-500 to-fuchsia-500' },
  { initials: 'HB', name: 'Harries Babu Rekha', color: 'from-amber-500 to-yellow-500' },
];

/* ═══════════════════════════════════════════════════════════════
   UTILITY HOOKS
   ═══════════════════════════════════════════════════════════════ */

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ═══════════════════════════════════════════════════════════════
   SECTION WRAPPER (scroll reveal)
   ═══════════════════════════════════════════════════════════════ */

const Section = memo(function Section({ id, children, className = '' }) {
  const [ref, visible] = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28 transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   HERO: STATIC DASHBOARD PREVIEW MOCK
   100% static — no API calls, no useEffect for data
   ═══════════════════════════════════════════════════════════════ */

const DeveloperInsightsMock = memo(function DeveloperInsightsMock({ isDark }) {
  const devs = [
    { name: 'Alice K.', score: 8.7, commits: 142, color: '#22c55e' },
    { name: 'Bob M.', score: 7.2, commits: 98, color: '#3b82f6' },
    { name: 'Carol S.', score: 6.5, commits: 76, color: '#8b5cf6' },
    { name: 'Dave R.', score: 5.1, commits: 45, color: '#f59e0b' },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Impact Scores</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-600'}`}>Live</span>
      </div>
      {devs.map((d) => (
        <div key={d.name} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{backgroundColor: d.color}}>
            {d.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{d.name}</span>
              <span className="text-xs font-bold" style={{color: d.color}}>{d.score}</span>
            </div>
            <div className={`w-full h-1.5 rounded-full mt-1 ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
              <div className="h-full rounded-full transition-all duration-700" style={{width: `${d.score * 10}%`, backgroundColor: d.color}} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

const PlanVsRealityMock = memo(function PlanVsRealityMock({ isDark }) {
  const tasks = [
    { name: 'User Authentication', status: 'complete', pct: 100 },
    { name: 'Payment Gateway', status: 'partial', pct: 65 },
    { name: 'Search Feature', status: 'partial', pct: 40 },
    { name: 'Admin Dashboard', status: 'not started', pct: 0 },
  ];
  const colors = { complete: '#22c55e', partial: '#f59e0b', 'not started': '#ef4444' };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Sprint Progress</span>
        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>4 tasks</span>
      </div>
      {tasks.map((t) => (
        <div key={t.name}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t.name}</span>
            <span className="text-[10px] font-semibold" style={{color: colors[t.status]}}>{t.pct}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
            <div className="h-full rounded-full transition-all duration-700" style={{width: `${t.pct}%`, backgroundColor: colors[t.status]}} />
          </div>
        </div>
      ))}
    </div>
  );
});

const RiskDetectionMock = memo(function RiskDetectionMock({ isDark }) {
  const risks = [
    { module: 'auth/', owner: 'Alice K.', risk: 'HIGH', pct: 92 },
    { module: 'payments/', owner: 'Bob M.', risk: 'MEDIUM', pct: 68 },
    { module: 'core/', owner: 'Team', risk: 'LOW', pct: 35 },
  ];
  const riskColors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Bus Factor Risk</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">1 Alert</span>
      </div>
      {risks.map((r) => (
        <div key={r.module} className={`flex items-center gap-3 p-2 rounded-lg ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: riskColors[r.risk] }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{r.module}</span>
              <span className="text-[10px] font-bold" style={{color: riskColors[r.risk]}}>{r.risk}</span>
            </div>
            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{r.pct}% by {r.owner}</span>
          </div>
        </div>
      ))}
    </div>
  );
});

const mockComponents = {
  insights: DeveloperInsightsMock,
  plan: PlanVsRealityMock,
  risk: RiskDetectionMock,
};

/* ═══════════════════════════════════════════════════════════════
   WORKFLOW ARROW SVG
   ═══════════════════════════════════════════════════════════════ */

const WorkflowArrow = memo(function WorkflowArrow({ isDark }) {
  return (
    <div className="flex justify-center py-1">
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
        <line x1="12" y1="0" x2="12" y2="24" stroke={isDark ? '#22c55e' : '#16a34a'} strokeWidth="2" className="workflow-arrow-line" />
        <polygon points="6,22 12,30 18,22" fill={isDark ? '#22c55e' : '#16a34a'} opacity="0.8" />
      </svg>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   FLIP CARD (team section)
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function HomePage({ onNavigate }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('insights');
  const tabTimerRef = useRef(null);

  // Auto-rotate hero dashboard tabs every 3 seconds
  const startAutoRotate = useCallback(() => {
    if (tabTimerRef.current) clearInterval(tabTimerRef.current);
    tabTimerRef.current = setInterval(() => {
      setActiveTab(prev => {
        const idx = dashboardTabs.findIndex(t => t.id === prev);
        return dashboardTabs[(idx + 1) % dashboardTabs.length].id;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    startAutoRotate();
    return () => { if (tabTimerRef.current) clearInterval(tabTimerRef.current); };
  }, [startAutoRotate]);

  const handleTabClick = (id) => {
    setActiveTab(id);
    startAutoRotate(); // reset timer
  };

  const ActiveMock = mockComponents[activeTab];

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${isDark ? 'bg-dark-900' : 'bg-gradient-to-br from-gray-50 to-emerald-50/30'}`}>

      {/* ═══ FLOATING BLOBS (enhanced) ═══ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className={`hp-blob hp-blob-1 ${isDark ? 'bg-green-600' : 'bg-green-400'}`} />
        <div className={`hp-blob hp-blob-2 ${isDark ? 'bg-purple-600' : 'bg-emerald-400'}`} />
        <div className={`hp-blob hp-blob-3 ${isDark ? 'bg-emerald-600' : 'bg-teal-400'}`} />
        {/* Extra floating particles */}
        <div className={`absolute w-2 h-2 rounded-full top-[20%] left-[15%] animate-float ${isDark ? 'bg-green-400/30' : 'bg-green-500/20'}`} />
        <div className={`absolute w-1.5 h-1.5 rounded-full top-[60%] right-[20%] animate-float-slow ${isDark ? 'bg-purple-400/25' : 'bg-emerald-500/20'}`} />
        <div className={`absolute w-3 h-3 rounded-full top-[40%] left-[80%] animate-float ${isDark ? 'bg-emerald-400/20' : 'bg-teal-500/15'}`} style={{animationDelay: '3s'}} />
        <div className={`absolute w-1 h-1 rounded-full top-[75%] left-[35%] animate-float-slow ${isDark ? 'bg-green-300/30' : 'bg-green-400/25'}`} style={{animationDelay: '5s'}} />
      </div>

      {/* ═══ NAVBAR ═══ */}
      <LandingNavbar onNavigate={onNavigate} />

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <header className="relative z-10 pt-28 lg:pt-36 pb-20 lg:pb-28">
        {/* Hero glows — enhanced with multiple layers */}
        <div className="hero-glow bg-green-500 top-20 left-1/2 -translate-x-1/2" aria-hidden="true" />
        <div className="hero-glow bg-purple-600 top-40 right-0 w-[300px] h-[300px]" aria-hidden="true" style={{opacity: 0.1}} />
        <div className="hero-glow bg-emerald-400 -bottom-20 left-[20%] w-[350px] h-[350px]" aria-hidden="true" style={{opacity: 0.08, animationDelay: '2s'}} />
        <div className="hero-glow bg-cyan-500 top-0 right-[30%] w-[200px] h-[200px]" aria-hidden="true" style={{opacity: 0.06, animationDelay: '4s'}} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center hp-hero-entrance">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium border ${isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              AI-Powered Developer Intelligence
            </div>

            {/* Headline */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Engineering teams track activity.
              <br />
              <span className="gradient-text-green">CodePulse tracks impact.</span>
            </h1>

            {/* Subtext */}
            <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Turn GitHub data into actionable engineering intelligence.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 lg:mb-20">
              <button
                id="hero-get-started-btn"
                onClick={() => onNavigate('setup')}
                className="group relative px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <a
                href="#how-it-works"
                className={`px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
              >
                View Demo
              </a>
            </div>

            {/* ── FLOATING DASHBOARD PREVIEW (enhanced) ── */}
            <div className="relative max-w-3xl mx-auto dashboard-preview-float group">
              {/* Outer glow ring on hover */}
              <div className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${isDark ? 'bg-green-500/10' : 'bg-green-500/5'}`} aria-hidden="true" />
              <div className={`relative glass-card-strong p-1 transition-transform duration-500 group-hover:scale-[1.02] ${isDark ? '' : '!bg-white/90'}`}>
                {/* Tab bar */}
                <div className={`flex items-center gap-1 px-4 pt-3 pb-2 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                  {dashboardTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? isDark
                            ? 'bg-green-500/15 text-green-400 border border-green-500/20 shadow-sm shadow-green-500/10'
                            : 'bg-green-50 text-green-700 border border-green-200 shadow-sm shadow-green-200/30'
                          : isDark
                            ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                  {/* Fake window controls */}
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                </div>
                {/* Tab content with smooth slide/fade */}
                <div className="p-5 min-h-[220px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <ActiveMock isDark={isDark} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              {/* Glow under the card — enhanced */}
              <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-20 rounded-full blur-3xl transition-opacity duration-500 ${isDark ? 'bg-green-500/12 group-hover:bg-green-500/18' : 'bg-green-500/8 group-hover:bg-green-500/12'}`} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 hp-scroll-indicator">
          <svg className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          PROBLEM vs SOLUTION
          ═══════════════════════════════════════════════════════ */}
      <Section id="problem-solution">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ── Problem (enhanced with red glow + more shapes) ── */}
          <div className={`relative rounded-2xl p-8 lg:p-10 overflow-hidden group ${isDark ? 'bg-dark-800/80 border border-white/5' : 'bg-white border border-gray-200 shadow-lg'}`}>
            {/* Red glow overlay */}
            <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${isDark ? 'bg-red-500/15' : 'bg-red-400/10'}`} aria-hidden="true" />
            <div className={`absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-[80px] ${isDark ? 'bg-red-500/8' : 'bg-red-300/6'}`} aria-hidden="true" />

            {/* Floating animated shapes */}
            <div className="problem-shape w-24 h-24 bg-red-500 top-2 right-2" aria-hidden="true" />
            <div className="problem-shape w-16 h-16 bg-orange-500 bottom-6 left-4" style={{animationDelay: '2s'}} aria-hidden="true" />
            <div className="problem-shape w-12 h-12 bg-yellow-500 top-1/2 right-1/4" style={{animationDelay: '4s'}} aria-hidden="true" />
            <div className="problem-shape w-8 h-8 bg-red-400 top-1/4 left-1/3" style={{animationDelay: '6s'}} aria-hidden="true" />
            <div className="problem-shape w-6 h-6 bg-orange-400 bottom-1/3 right-1/3" style={{animationDelay: '3s'}} aria-hidden="true" />

            <div className="relative z-10">
              <h3 className={`text-2xl font-bold mb-6 font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
                The <span className="text-red-400">Problem</span>
              </h3>
              <div className="space-y-4">
                {problemPoints.map((p, i) => (
                  <motion.div
                    key={p.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors duration-200 ${isDark ? 'hover:bg-red-500/5' : 'hover:bg-red-50/60'}`}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{p.icon}</span>
                    <span className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{p.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Solution (enhanced with green glow) ── */}
          <div className={`relative rounded-2xl p-8 lg:p-10 overflow-hidden border group ${isDark ? 'bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/15' : 'bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200'}`}>
            {/* Green glow overlay */}
            <div className={`absolute -top-20 -left-20 w-60 h-60 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${isDark ? 'bg-green-500/15' : 'bg-green-400/10'}`} aria-hidden="true" />
            <div className={`absolute -bottom-16 -right-16 w-40 h-40 rounded-full blur-[80px] ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-300/6'}`} aria-hidden="true" />

            <div className="relative z-10">
              <h3 className={`text-2xl font-bold mb-6 font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
                The <span className="text-green-500">Solution</span>
              </h3>
              <div className="space-y-4">
                {solutionPoints.map((p, i) => (
                  <motion.div
                    key={p.text}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.15, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                    className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors duration-200 ${isDark ? 'hover:bg-green-500/5' : 'hover:bg-green-50'}`}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{p.icon}</span>
                    <span className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{p.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS (animated workflow)
          ═══════════════════════════════════════════════════════ */}
      <Section id="how-it-works">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[10px] font-medium uppercase tracking-widest border ${isDark ? 'bg-green-500/5 text-green-400 border-green-500/15' : 'bg-green-50 text-green-600 border-green-200'}`}>Pipeline</div>
          <h2 className={`text-3xl md:text-4xl font-bold font-display mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            How It <span className="gradient-text-green">Works</span>
          </h2>
          <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            From raw GitHub data to actionable intelligence in five automated steps.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {workflowSteps.map((step, i) => (
            <React.Fragment key={step.title}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="workflow-card p-6 flex items-start gap-5 group relative">
                  {/* Step number badge */}
                  <div className={`absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${isDark ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-green-600 text-white shadow-lg shadow-green-500/20'}`}>
                    {i + 1}
                  </div>
                  {/* Icon with glow circle */}
                  <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDark ? 'bg-green-500/20' : 'bg-green-500/10'}`} />
                    <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                      {step.icon}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{step.desc}</p>
                  </div>
                </div>
              </motion.div>
              {i < workflowSteps.length - 1 && (
                <div className="flex justify-center py-2">
                  <svg width="28" height="40" viewBox="0 0 28 40" fill="none">
                    <line x1="14" y1="0" x2="14" y2="30" stroke={isDark ? '#22c55e' : '#16a34a'} strokeWidth="2" className="workflow-arrow-line" />
                    <polygon points="8,28 14,38 20,28" fill={isDark ? '#22c55e' : '#16a34a'} opacity="0.8" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES (card grid)
          ═══════════════════════════════════════════════════════ */}
      <Section id="features">
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-bold font-display mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Platform <span className="gradient-text-green">Features</span>
          </h2>
          <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Everything you need to understand engineering impact.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="glass-card-strong p-6 h-full flex flex-col items-start group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 transition-transform duration-300 group-hover:scale-110 ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                  {card.icon}
                </div>
                <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FUTURE AI TIMELINE
          ═══════════════════════════════════════════════════════ */}
      <Section id="future">
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-bold font-display mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            What's <span className="gradient-text-green">Next</span>
          </h2>
          <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Coming soon to CodePulse.
          </p>
        </div>

        <div className="relative max-w-lg mx-auto">
          {/* Timeline line */}
          <div className={`absolute left-6 top-0 bottom-0 w-px ${isDark ? 'bg-gradient-to-b from-green-500/40 via-green-500/20 to-transparent' : 'bg-gradient-to-b from-green-300 via-green-200 to-transparent'}`} />

          <div className="space-y-10">
            {futureItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex items-start gap-6 pl-2"
              >
                {/* Dot */}
                <div className={`relative z-10 w-3 h-3 rounded-full flex-shrink-0 mt-1.5 timeline-dot ${isDark ? 'bg-green-500' : 'bg-green-500'}`} style={{ boxShadow: '0 0 0 4px var(--bg-primary)' }} />
                {/* Card */}
                <div className="glass-card p-5 flex-1 hp-scope-card group">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          SEE CODEPULSE IN ACTION (replaces pricing)
          100% static — no API calls
          ═══════════════════════════════════════════════════════ */}
      <Section id="demo-preview">
        <div className="text-center mb-14">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[10px] font-medium uppercase tracking-widest border ${isDark ? 'bg-green-500/5 text-green-400 border-green-500/15' : 'bg-green-50 text-green-600 border-green-200'}`}>Live Preview</div>
          <h2 className={`text-3xl md:text-4xl font-bold font-display mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            See CodePulse in <span className="gradient-text-green">Action</span>
          </h2>
          <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            A realistic preview of what your engineering dashboard looks like.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel 1: Developer Impact Graph */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="glass-card-strong p-6 h-full group">
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Developer Impact</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-600'}`}>Live</span>
              </div>
              {/* Static bar chart mock */}
              <div className="flex items-end gap-2 h-32 mb-4">
                {[75, 55, 88, 42, 65, 72, 50].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="flex-1 rounded-t-md transition-colors duration-200"
                    style={{ background: `linear-gradient(to top, ${isDark ? '#16a34a' : '#22c55e'}, ${isDark ? '#22c55e' : '#4ade80'})`, opacity: 0.6 + (h / 250) }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <span key={d} className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>{d}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Panel 2: Risk Alerts */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12, duration: 0.5 }}>
            <div className="glass-card-strong p-6 h-full group">
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Risk Alerts</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">2 Critical</span>
              </div>
              <div className="space-y-3">
                {[
                  { mod: 'auth/', risk: 'HIGH', owner: 'Alice K.', color: '#ef4444' },
                  { mod: 'payments/', risk: 'HIGH', owner: 'Bob M.', color: '#ef4444' },
                  { mod: 'api/', risk: 'MEDIUM', owner: 'Carol S.', color: '#f59e0b' },
                  { mod: 'utils/', risk: 'LOW', owner: 'Team', color: '#22c55e' },
                ].map((r) => (
                  <div key={r.mod} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors duration-200 ${isDark ? 'bg-dark-700/50 hover:bg-dark-700/80' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{r.mod}</span>
                        <span className="text-[10px] font-bold" style={{color: r.color}}>{r.risk}</span>
                      </div>
                      <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Owner: {r.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Panel 3: Plan vs Reality Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.24, duration: 0.5 }}>
            <div className="glass-card-strong p-6 h-full group">
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Plan vs Reality</h3>
                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Sprint 14</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Auth Module', planned: 100, actual: 100 },
                  { name: 'Payment Flow', planned: 100, actual: 65 },
                  { name: 'Search API', planned: 80, actual: 40 },
                  { name: 'Dashboard UI', planned: 60, actual: 15 },
                  { name: 'Notification Svc', planned: 40, actual: 10 },
                ].map((item, i) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{item.name}</span>
                      <span className={`text-[10px] font-semibold ${item.actual >= item.planned ? 'text-green-500' : item.actual >= item.planned * 0.5 ? 'text-yellow-500' : 'text-red-400'}`}>
                        {item.actual}%
                      </span>
                    </div>
                    <div className={`relative w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                      {/* Planned (background) */}
                      <div className={`absolute inset-y-0 left-0 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-300/50'}`} style={{ width: `${item.planned}%` }} />
                      {/* Actual (foreground) */}
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.actual}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ background: item.actual >= item.planned ? '#22c55e' : item.actual >= item.planned * 0.5 ? '#f59e0b' : '#ef4444' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          TEAM (refined from existing)
          ═══════════════════════════════════════════════════════ */}
      <Section id="team">
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Our <span className="gradient-text-green">Team</span>
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

      {/* ═══════════════════════════════════════════════════════
          CTA BANNER
          ═══════════════════════════════════════════════════════ */}
      <Section id="cta" className="pb-10">
        <div className="glass-card-strong p-10 md:p-14 text-center gradient-border">
          <h2 className={`text-2xl md:text-3xl font-bold font-display mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ready to transform your engineering insights?
          </h2>
          <p className={`text-sm mb-8 max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Connect your repository and let CodePulse deliver actionable intelligence in minutes.
          </p>
          <button
            onClick={() => onNavigate('setup')}
            className="px-10 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
          >
            Get Started — It's Free
          </button>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className={`relative z-10 border-t py-8 text-center ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <CodePulseLogo size={22} />
          <span className="text-sm font-semibold gradient-text-green">CodePulse</span>
        </div>
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          © 2026 CodePulse · AI-Powered Developer Intelligence
        </p>
      </footer>
    </div>
  );
}
