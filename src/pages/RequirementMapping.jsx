import React, { useState, useEffect } from 'react';
import { Link, Brain } from 'lucide-react';
import { getDashboardSummary } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export default function RequirementMapping() {
  const [requirements, setRequirements] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const repoId = localStorage.getItem('codepulse_repo_id');
    if (!repoId) {
      setError('No repository connected yet. Go to Setup to connect a repo.');
      setLoading(false);
      return;
    }

    getDashboardSummary(parseInt(repoId))
      .then(data => {
        const mappings = data.requirement_mapping || [];
        const mapped = mappings.map((m, i) => ({
          id: i + 1,
          title: m.requirement,
          confidence: Math.round(m.confidence),
          matchedCount: m.matched_commits,
          commits: (m.commits || []).map(c => ({
            hash: c.sha?.startsWith('#') ? c.sha : `#${c.sha}`,
            message: c.message,
            dev: c.author,
            date: formatRelativeDate(c.date),
            similarity: Math.round(c.match_score),
          })),
        }));
        setRequirements(mapped);
        if (mapped.length > 0) setSelectedReq(mapped[0]);
        setLoading(false);
      })
      .catch(err => {
        setError(err.detail || err.message || 'Failed to load requirement mapping data');
        setLoading(false);
      });
  }, []);

  if (loading) return <SkeletonLoader />;

  if (error || requirements.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800">Requirement Traceability Engine</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          <Link className="text-4xl mb-4 mx-auto text-gray-300" />
          <p className="text-lg font-medium text-gray-800 mb-2">No Requirements Mapped</p>
          <p className="text-sm">{error || 'Add business requirements in the Setup page to see AI-powered traceability.'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 bg-emerald-50 border border-emerald-200">
              <Brain className="inline-block w-4 h-4 mr-1 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">How it works</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                NLP Sentence Transformers analyze semantic similarity between requirement text and commit messages, enabling automatic traceability without manual tagging.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800">Requirement Traceability Engine</h1>
        <p className="text-sm text-gray-400 mt-1">AI matches business requirements to actual commits using NLP similarity</p>
      </div>

      {/* Main two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Requirements list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Business Requirements</h2>
          {requirements.map((req, i) => (
            <button
              key={req.id}
              onClick={() => setSelectedReq(req)}
              className={`w-full text-left bg-white rounded-2xl border p-4 opacity-0 animate-slide-up stagger-${i + 1} transition-all duration-200 ${
                selectedReq?.id === req.id
                  ? 'border-emerald-400 shadow-md shadow-emerald-100/50'
                  : 'border-gray-100 shadow-sm hover:border-emerald-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-800 leading-snug">{req.title}</h3>
                <span className="flex-shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  {req.confidence}%
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-400">
                  {req.matchedCount} commits matched
                </span>
                <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${req.confidence}%` }}
                  ></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right — Matched commits */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-gray-400 font-medium uppercase tracking-wider">Matched Commits</h2>
            <span className="text-xs text-gray-400">{selectedReq?.commits.length || 0} results</span>
          </div>

          {selectedReq && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in" key={selectedReq.id}>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <h3 className="text-sm font-semibold text-gray-800">{selectedReq.title}</h3>
                <span className="ml-auto text-xs font-semibold text-emerald-600">{selectedReq.confidence}% confidence</span>
              </div>

              <div className="space-y-4">
                {selectedReq.commits.map((commit, i) => (
                  <div
                    key={commit.hash}
                    className={`flex items-start gap-4 p-3 rounded-lg transition-all opacity-0 animate-slide-up stagger-${i + 1} bg-gray-50/60 border border-gray-100 hover:border-emerald-200`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-mono font-semibold bg-white text-emerald-600 border border-emerald-200">
                        {commit.hash}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 font-medium">{commit.message}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400">{commit.dev}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{commit.date}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        commit.similarity >= 90
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {commit.similarity}% match
                      </span>
                    </div>
                  </div>
                ))}
                {selectedReq.commits.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No matching commits found</p>
                )}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 opacity-0 animate-slide-up stagger-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 bg-emerald-50 border border-emerald-200">
                <Brain className="inline-block w-4 h-4 mr-1 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">How it works</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  NLP Sentence Transformers analyze semantic similarity between requirement text and commit messages, enabling automatic traceability without manual tagging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
