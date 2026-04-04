import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { getRecommendations } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

const priorityConfig = {
  High: {
    badge: 'badge-high',
    border: 'border-l-red-500',
    glow: 'hover:shadow-card-hover',
  },
  Medium: {
    badge: 'badge-medium',
    border: 'border-l-amber-500',
    glow: 'hover:shadow-card-hover',
  },
  Low: {
    badge: 'badge-low',
    border: 'border-l-emerald-500',
    glow: 'hover:shadow-card-hover',
  },
};

function MarkdownBold({ text }) {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-gray-800 font-semibold">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const repoId = localStorage.getItem('codepulse_repo_id');
    if (!repoId) {
      setError('No repository connected yet. Go to Setup to connect a repo.');
      setLoading(false);
      return;
    }

    getRecommendations(parseInt(repoId))
      .then(data => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.detail || err.message || 'Failed to load recommendations');
        setLoading(false);
      });
  }, []);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800">AI Recommendations</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          <Lightbulb className="text-4xl mb-4 mx-auto text-gray-300" />
          <p className="text-lg font-medium text-gray-800 mb-2">No Data Available</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800">AI Recommendations</h1>
        <p className="text-sm text-gray-400 mt-1">Actionable insights to improve team health and code quality</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in">
        {['High', 'Medium', 'Low'].map(p => {
          const count = recommendations.filter(r => r.priority === p).length;
          const cfg = priorityConfig[p];
          return (
            <div key={p} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{p} Priority</p>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>{count}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-4">
        {recommendations.map((rec, i) => {
          const cfg = priorityConfig[rec.priority] || priorityConfig.Low;
          return (
            <div
              key={i}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 ${cfg.border} ${cfg.glow} opacity-0 animate-slide-up stagger-${Math.min(i + 1, 8)}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0 mt-0.5">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">{rec.title}</h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${cfg.badge}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    <MarkdownBold text={rec.text} />
                  </p>
                  {rec.category && (
                    <span className="inline-block mt-3 text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-400">
                      {rec.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
