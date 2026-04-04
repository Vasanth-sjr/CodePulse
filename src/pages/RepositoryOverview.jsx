import React, { useState, useEffect, memo } from 'react';
import { BarChart2, Inbox, Package, Users, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, AreaChart, Area, Cell 
} from 'recharts';
import { getDashboardSummary, getSprintSummary } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import ExplainModal from '../components/ExplainModal';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontSize: '12px',
        padding: '8px 12px',
      }}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-emerald-600">{payload[0].value} commits</p>
      </div>
    );
  }
  return null;
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

const DEV_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];
const STAT_COLORS = ['#10B981', '#34D399', '#6EE7B7', '#FCA5A5']; // Updated Risk Modules to #FCA5A5 based on spec

export default function RepositoryOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sprintSummary, setSprintSummary] = useState(null);
  const [sprintLoading, setSprintLoading] = useState(true);
  const [explainModal, setExplainModal] = useState(null);

  useEffect(() => {
    const repoId = localStorage.getItem('codepulse_repo_id');
    if (!repoId) {
      setError('No repository connected yet. Go to Setup to connect a repo.');
      setLoading(false);
      return;
    }

    getDashboardSummary(parseInt(repoId))
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.detail || err.message || 'Failed to load dashboard data');
        setLoading(false);
      });

    getSprintSummary(parseInt(repoId))
      .then(res => {
        setSprintSummary(res);
        setSprintLoading(false);
      })
      .catch(() => setSprintLoading(false));
  }, []);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in p-6 bg-[#F4FBF8] min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Repository Overview</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          <Inbox className="text-4xl mb-4 mx-auto text-gray-300" />
          <p className="text-lg font-medium text-gray-800 mb-2">No Data Available</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const overview = data.repo_overview;
  const repoName = overview.repo_name || localStorage.getItem('codepulse_repo_name') || 'Repository';
  const owner = repoName.split('/')[0] || 'Unknown';
  const repoBaseName = repoName.split('/')[1] || repoName;
  const init = repoBaseName.substring(0, 2).toUpperCase();

  const stats = [
    { label: 'Total Commits', value: String(overview.total_commits), icon: <BarChart2 className="inline-block w-4 h-4" />, change: `${overview.total_commits} total`, color: '#10B981' },
    { label: 'Active Developers', value: String(overview.active_developers), icon: <Users className="inline-block w-4 h-4" />, change: 'contributors', color: '#34D399' },
    { label: 'Modules Tracked', value: String(overview.modules_tracked), icon: <Package className="inline-block w-4 h-4" />, change: 'detected', color: '#6EE7B7' },
    { label: 'Risk Modules', value: String(overview.risky_modules), icon: <AlertTriangle className="inline-block w-4 h-4" />, change: overview.risky_modules > 0 ? 'Action needed' : 'All clear', color: '#FCA5A5' },
  ];

  const commitActivity = overview.commit_activity || [];
  const last7 = commitActivity.slice(-7);
  const weeklyCommits = last7.map((count, i) => ({
    day: DAY_LABELS[i % 7],
    month: `Day ${i+1}`, // For area chart
    commits: count,
    reviews: Math.floor(count * 0.3) // Dummy reviews for bar chart
  }));

  const devColorMap = {};
  let colorIdx = 0;
  (overview.recent_activity || []).forEach(item => {
    if (!devColorMap[item.author]) {
      devColorMap[item.author] = DEV_COLORS[colorIdx % DEV_COLORS.length];
      colorIdx++;
    }
  });

  const recentActivity = (overview.recent_activity || []).map((item, i) => ({
    id: i + 1,
    sha: item.sha || '',
    dev: {
      color: devColorMap[item.author] || '#3B82F6',
      initials: item.author ? item.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??',
      name: item.author
    },
    message: item.message,
    time: formatRelativeDate(item.date),
    filesChanged: item.files_changed || 0,
  }));
  
  // Calculate top contributor dummy logic based on recent activity
  const topContributor = recentActivity.length > 0 ? recentActivity[0].dev.name : 'Unknown';

  // Helper for generating calendar grid
  const today = new Date();
  const generateMonthDays = () => {
    const days = [];
    const numDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    // blanks before
    for (let i = 0; i < firstDay; i++) {
       days.push({ day: '', state: 'empty' });
    }
    
    // days in month
    for (let i = 1; i <= numDays; i++) {
       let state = 'normal';
       if (i === today.getDate()) state = 'today';
       else if (i % 5 === 0 || i % 7 === 0) state = 'active';
       days.push({ day: i, state });
    }
    return days;
  };
  const calendarDays = generateMonthDays();

  return (
    <div className="grid lg:grid-cols-[220px_1fr_260px] gap-5 p-6 bg-[#F4FBF8] min-h-screen w-full box-border" style={{ overflowX: 'hidden' }}>
      
      {/* COLUMN 1 - Left Panel */}
      <div className="flex flex-col opacity-0 animate-slide-up stagger-1">
        {/* Repo Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="w-full aspect-square rounded-xl bg-emerald-100 mb-4 flex items-center justify-center">
            <span className="text-4xl text-emerald-500 font-bold opacity-50">{init}</span>
          </div>
          <p className="text-base font-semibold text-gray-800">{repoBaseName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{owner}</p>
          
          <div className="flex gap-2 justify-center mt-3">
             <span className="bg-emerald-500 text-white text-xs rounded-full px-3 py-1 font-medium">#{overview.repo_id || '---'}</span>
             <span className="bg-emerald-50 text-emerald-600 text-xs rounded-full px-3 py-1 border border-emerald-200">main</span>
          </div>
          
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-3">
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 text-xs">Default Branch</span>
                <span className="text-gray-700 font-medium text-xs text-right">main</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 text-xs">Last Pushed</span>
                <span className="text-gray-700 font-medium text-xs text-right">2 hrs ago</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 text-xs">Visibility</span>
                <span className="text-gray-700 font-medium text-xs text-right">Public</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 text-xs">Language</span>
                <span className="text-gray-700 font-medium text-xs text-right">JavaScript</span>
             </div>
          </div>
        </div>
        
        {/* Repository Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Repository Info</h3>
          <div className="flex items-start gap-3 py-2 border-b border-gray-50">
             <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
               <svg className="text-gray-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
             </div>
             <div>
               <p className="text-xs text-gray-400">Stars count</p>
               <p className="text-sm text-gray-700 font-medium">1.2k</p>
             </div>
          </div>
          <div className="flex items-start gap-3 py-2 border-b border-gray-50">
             <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
               <svg className="text-gray-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
             </div>
             <div>
               <p className="text-xs text-gray-400">Forks count</p>
               <p className="text-sm text-gray-700 font-medium">348</p>
             </div>
          </div>
          <div className="flex items-start gap-3 py-2">
             <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
               <svg className="text-gray-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
             </div>
             <div>
               <p className="text-xs text-gray-400">Open Issues</p>
               <p className="text-sm text-gray-700 font-medium">42</p>
             </div>
          </div>
        </div>
        

      </div>

      {/* COLUMN 2 - Main Content */}
      <div className="flex flex-col min-w-0 opacity-0 animate-slide-up stagger-2">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {stats.map((s, i) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center justify-center gap-1">
               <p className="text-xs text-gray-400 font-medium text-center mb-1">{s.label}</p>
               <div className="relative">
                  <PieChart width={80} height={80}>
                     {/* Background Arc */}
                     <Pie data={[{value: 100}]} dataKey="value" cx={36} cy={36} innerRadius={26} outerRadius={36} startAngle={90} endAngle={-270} fill="#F3F4F6" isAnimationActive={false} stroke="none" />
                     {/* Foreground Arc */}
                     <Pie data={[{value: parseInt(s.value) || 0}, {value: Math.max(1, (parseInt(stats[0].value) || 100) - (parseInt(s.value) || 0)) }]} dataKey="value" cx={36} cy={36} innerRadius={26} outerRadius={36} startAngle={90} endAngle={-270} isAnimationActive={false} stroke="none">
                        <Cell fill={s.color} />
                        <Cell fill="transparent" />
                     </Pie>
                  </PieChart>
               </div>
               <p className="text-xl font-bold text-gray-800">{s.value}</p>
               <p className="text-xs text-gray-400 mt-0.5 text-center">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Performance Overview Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
           <div className="flex items-start justify-between">
              <div>
                 <h2 className="text-sm font-semibold text-gray-700">Performance Overview</h2>
                 <p className="text-4xl font-bold text-gray-800 mt-1">{overview.total_commits}</p>
                 <div className="flex items-center gap-1.5 mt-1">
                    <svg className="text-emerald-500 w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                    <span className="text-xs text-emerald-500">+12%</span>
                    <span className="text-gray-400 text-xs">compared to last year</span>
                 </div>
              </div>
              <div className="border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-500 cursor-pointer">
                 Monthly
              </div>
           </div>
           <div className="mt-4">
              <ResponsiveContainer width="100%" height={160}>
                 <AreaChart data={weeklyCommits}>
                    <defs>
                      <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="commits" stroke="#10B981" strokeWidth={2} fill="url(#commitGradient)" dot={false} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Two-column row below chart */}
        <div className="grid grid-cols-2 gap-4 mb-4">
           {/* Weekly Activity */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                 <h2 className="text-sm font-semibold text-gray-700">Weekly Activity</h2>
                 <div className="border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-500 cursor-pointer">
                    This Week
                 </div>
              </div>
              <div className="mt-2 mb-3">
                 <span className="text-3xl font-bold text-gray-800">{weeklyCommits.reduce((acc, curr) => acc + curr.commits, 0)}</span>
                 <span className="text-sm text-gray-400 font-normal ml-2">commits</span>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                 <BarChart data={weeklyCommits}>
                    <CartesianGrid vertical={false} stroke="#F9FAFB" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                    <Bar dataKey="commits" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="reviews" fill="#D1FAE5" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>

           {/* Recent Files */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                 <h2 className="text-sm font-semibold text-gray-700">Recent Files</h2>
                 <button className="text-gray-400 hover:text-gray-600 font-bold">...</button>
              </div>
              <div className="space-y-3">
                 {recentActivity.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <svg className="text-emerald-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 font-medium truncate max-w-[140px]">{item.message}</p>
                          <p className="text-xs text-gray-400">{item.filesChanged} files changed</p>
                       </div>
                    </div>
                 ))}
                 {recentActivity.length === 0 && <p className="text-xs text-gray-400">No recent files</p>}
              </div>
           </div>
        </div>

        {/* Internal Notes Row */}
        <div className="grid grid-cols-2 gap-4">
           {/* AI Summary */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700">AI Summary</h2>
              <p className="text-xs text-gray-400 mt-0.5">Updated {formatRelativeDate(new Date())}</p>
              {sprintLoading ? (
                 <div className="space-y-2 mt-2">
                    <div className="skeleton h-3 w-full"></div>
                    <div className="skeleton h-3 w-4/5"></div>
                    <div className="skeleton h-3 w-3/5"></div>
                 </div>
              ) : sprintSummary ? (
                 <p className="text-sm text-gray-600 leading-relaxed mt-2 line-clamp-3 text-ellipsis overflow-hidden" 
                    dangerouslySetInnerHTML={{ __html: sprintSummary.summary.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>') }} />
              ) : (
                 <p className="text-sm text-gray-600 leading-relaxed mt-2">No summary generated.</p>
              )}
           </div>

           {/* Top Contributor */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700">Top Contributor</h2>
              <p className="text-xs text-gray-400 mt-0.5">This week</p>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">
                 <strong className="font-semibold text-gray-800">{topContributor}</strong> has been highly active, leading feature development with consistent merges and excellent PR quality.
              </p>
           </div>
        </div>
      </div>

      {/* COLUMN 3 - Right Panel */}
      <div className="flex flex-col opacity-0 animate-slide-up stagger-3">
        {/* Calendar Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
           <div className="flex justify-between items-center pb-2">
              <h2 className="text-sm font-semibold text-gray-700">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex gap-1">
                 <button className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                 </button>
                 <button className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                 </button>
              </div>
           </div>
           
           <div className="grid grid-cols-7 gap-0.5 mt-3">
              {['S','M','T','W','T','F','S'].map(d => (
                 <div key={d} className="text-xs text-gray-400 text-center py-1">{d}</div>
              ))}
              {calendarDays.map((cal, i) => (
                 <div key={i} className={`text-xs text-center py-1.5 rounded-lg cursor-pointer ${
                    cal.state === 'empty' ? 'text-transparent' :
                    cal.state === 'today' ? 'bg-emerald-500 text-white font-semibold' :
                    cal.state === 'active' ? 'bg-emerald-50 text-emerald-600' :
                    'text-gray-600 hover:bg-gray-50'
                 }`}>
                    {cal.day}
                 </div>
              ))}
           </div>
           
           <div className="grid grid-cols-4 gap-1 mt-3 pt-3 border-t border-gray-100">
              <div className="text-center"><p className="text-xs text-gray-400">Active</p><p className="text-sm font-semibold text-gray-700">12</p></div>
              <div className="text-center"><p className="text-xs text-gray-400">Merged</p><p className="text-sm font-semibold text-gray-700">8</p></div>
              <div className="text-center"><p className="text-xs text-gray-400">Open PRs</p><p className="text-sm font-semibold text-gray-700">4</p></div>
              <div className="text-center"><p className="text-xs text-gray-400">Closed</p><p className="text-sm font-semibold text-gray-700">2</p></div>
           </div>
        </div>

        {/* Module Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-4">
           <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Module Summary</h2>
              <button className="text-gray-400 hover:text-gray-600 font-bold tracking-widest">...</button>
           </div>
           <div className="flex justify-between text-xs text-gray-400 mb-2 pb-2 border-b border-gray-100 mt-2">
              <span>Module</span>
              <span>Files</span>
           </div>
           <div className="space-y-0">
              {['auth', 'database', 'frontend', 'core', 'utils'].map((mod, i) => (
                 <div key={mod} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700 capitalize">{mod}</span>
                    <span className="text-sm text-gray-500">{15 - i * 2}</span>
                 </div>
              ))}
           </div>
           <div className="flex justify-between pt-2 mt-1">
              <span className="text-sm font-semibold text-gray-800">Total</span>
              <span className="text-sm font-semibold text-gray-800">45</span>
           </div>
        </div>
      </div>

      {/* Explain Modal */}
      {explainModal && (
        <ExplainModal
          commitSha={explainModal.sha}
          commitMessage={explainModal.message}
          repoId={localStorage.getItem('codepulse_repo_id')}
          onClose={() => setExplainModal(null)}
        />
      )}
    </div>
  );
}
