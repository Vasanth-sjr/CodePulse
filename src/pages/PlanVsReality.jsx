import React, { useState, useEffect } from 'react';
import { CheckCircle, Link, ClipboardList, AlertCircle, XCircle } from 'lucide-react';
import { getPlanVsReality } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

const STATUS_COLORS = {
  complete: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Complete' },
  partial: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Partial' },
  'not started': { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200', label: 'Not Started' },
};

export default function PlanVsReality() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const repoId = localStorage.getItem('codepulse_repo_id');
    if (!repoId) {
      setError('No repository connected. Go to Setup to connect a repo.');
      setLoading(false);
      return;
    }

    getPlanVsReality(parseInt(repoId))
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.detail || err.message || 'Failed to load plan vs reality data');
        setLoading(false);
      });
  }, []);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800">Plan vs Reality</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          <ClipboardList className="text-4xl mb-4 mx-auto text-gray-300" />
          <p className="text-lg font-medium text-gray-800 mb-2">No Data Available</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const issues = data?.issues || [];
  const hasData = issues.length > 0;

  const stats = [
    { label: 'Total Tasks', value: data?.totalTasks || 0, icon: <ClipboardList className="inline-block w-4 h-4" />, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: data?.completed || 0, icon: <CheckCircle className="inline-block w-4 h-4" />, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Partial', value: data?.partial || 0, icon: <AlertCircle className="inline-block w-4 h-4" />, color: 'from-amber-500 to-amber-600' },
    { label: 'Not Started', value: data?.notStarted || 0, icon: <XCircle className="inline-block w-4 h-4" />, color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800">Plan vs Reality</h1>
        <p className="text-sm text-gray-400 mt-1">Jira issues matched against GitHub commits</p>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center animate-fade-in text-gray-500">
          <Link className="text-4xl mb-4 mx-auto text-gray-300" />
          <p className="text-lg font-medium text-gray-800 mb-2">No Jira Data</p>
          <p className="text-sm">{data?.message || 'Connect Jira from the Setup page to see plan vs reality analysis.'}</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 opacity-0 animate-slide-up stagger-${i + 1}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{s.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-lg`}>
                    {s.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completion Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-0 animate-slide-up stagger-5">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Completion Overview</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-100">
                  {data.totalTasks > 0 && (
                    <>
                      <div
                        className="h-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${(data.completed / data.totalTasks) * 100}%` }}
                      />
                      <div
                        className="h-full bg-amber-400 transition-all duration-700"
                        style={{ width: `${(data.partial / data.totalTasks) * 100}%` }}
                      />
                      <div
                        className="h-full bg-red-400 transition-all duration-700"
                        style={{ width: `${(data.notStarted / data.totalTasks) * 100}%` }}
                      />
                    </>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                {data.totalTasks > 0 ? Math.round((data.completed / data.totalTasks) * 100) : 0}% done
              </span>
            </div>
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-gray-400">Complete</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <span className="text-xs text-gray-400">Partial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-xs text-gray-400">Not Started</span>
              </div>
            </div>
          </div>

          {/* Issues Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden opacity-0 animate-slide-up stagger-6">
            <h2 className="text-sm font-semibold text-gray-600 px-6 pt-6 mb-4">Issue Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Issue</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Summary</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Assignee</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Commits</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Confidence</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue, idx) => {
                    const statusStyle = STATUS_COLORS[issue.completionStatus] || STATUS_COLORS['not started'];
                    return (
                      <tr
                        key={issue.key || idx}
                        className={`border-t border-gray-50 transition-colors hover:bg-gray-50/50 ${idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 text-blue-600 border border-blue-200">
                            {issue.key}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{issue.summary}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{issue.assignee}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{issue.status}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 font-medium">
                          {issue.matchedCommits?.length || 0}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium ${
                            issue.confidence >= 0.5 ? 'text-emerald-500'
                              : issue.confidence > 0 ? 'text-amber-500'
                              : 'text-red-400'
                          }`}>
                            {issue.confidence > 0 ? `${Math.round(issue.confidence * 100)}%` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                            {statusStyle.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
