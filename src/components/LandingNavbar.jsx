import React, { useState, useEffect, useRef, memo } from 'react';
import CodePulseLogo from './CodePulseLogo';
import { useTheme } from '../context/ThemeContext';

const platformDropdown = [
  { icon: '📊', label: 'Developer Intelligence', desc: 'Impact scoring beyond commit counts' },
  { icon: '📋', label: 'Plan vs Reality', desc: 'Jira issues matched to GitHub commits' },
  { icon: '🧠', label: 'Skill Intelligence', desc: 'Expertise mapped from code contributions' },
  { icon: '⚠️', label: 'Risk Detection', desc: 'Identify single points of failure' },
];

const navLinks = [
  { label: 'Platform', href: '#platform', hasDropdown: true },
  { label: 'Features', href: '#features' },
  { label: 'Resources', href: '#how-it-works' },
  { label: 'Demo', href: '#demo-preview' },
];

function LandingNavbar({ onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDropdownEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };
  const handleDropdownLeave = () => {
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  return (
    <nav
      id="landing-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-dark-900/85 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
            : 'bg-white/85 backdrop-blur-xl border-b border-black/5 shadow-lg shadow-black/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Left: Logo */}
          <a href="#" className="flex items-center gap-2.5 flex-shrink-0" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); }}>
            <CodePulseLogo size={32} />
            <span className="text-xl font-bold gradient-text">CodePulse</span>
          </a>

          {/* Center: Nav links (desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div
                  key={link.label}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? 'text-slate-300 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {link.label}
                    <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Dropdown */}
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 rounded-xl border transition-all duration-200 origin-top ${
                      dropdownOpen
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none'
                    } ${
                      isDark
                        ? 'bg-dark-800/95 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/40'
                        : 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-2xl shadow-black/10'
                    }`}
                  >
                    <div className="p-2">
                      {platformDropdown.map((item) => (
                        <a
                          key={item.label}
                          href="#features"
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-white/5'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="text-xl mt-0.5 flex-shrink-0">{item.icon}</span>
                          <div>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.desc}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* Right: Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            {/* Login */}
            <button
              onClick={() => onNavigate('setup')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            {/* Get Started */}
            <button
              onClick={() => onNavigate('setup')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:scale-105"
            >
              Get Started
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            className={`lg:hidden p-2 rounded-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`lg:hidden border-t ${isDark ? 'bg-dark-900/95 border-white/5' : 'bg-white/95 border-gray-100'} backdrop-blur-xl`}>
          <div className="px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { onNavigate('setup'); setMobileOpen(false); }}
              className="w-full mt-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default memo(LandingNavbar);
