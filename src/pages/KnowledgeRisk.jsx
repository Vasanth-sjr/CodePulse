import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { 
  ScatterChart, Scatter, ZAxis, ResponsiveContainer, Cell,
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie
} from 'recharts';
import { getKnowledgeRisks } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

const DEV_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];

const getRiskClass = (risk) => {
  if (risk === 'HIGH') return 'badge-high';
  if (risk === 'MEDIUM') return 'badge-medium';
  return 'badge-low';
};

const getOwnershipColor = (risk) => {
  if (risk === 'HIGH') return 'from-red-500 to-red-600';
  if (risk === 'MEDIUM') return 'from-amber-400 to-amber-500';
  return 'from-emerald-500 to-emerald-600';
};

export default function KnowledgeRisk() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const repoId = localStorage.getItem('codepulse_repo_id');
    if (!repoId) {
      setError('No repository connected yet. Go to Setup to connect a repo.');
      setLoading(false);
      return;
    }

    getKnowledgeRisks(parseInt(repoId))
      .then(data => {
        const devColorMap = {};
        let colorIdx = 0;

        const mapped = data.map((mod, i) => {
          const ownerName = mod.top_developer;
          if (!devColorMap[ownerName]) {
            devColorMap[ownerName] = DEV_COLORS[colorIdx % DEV_COLORS.length];
            colorIdx++;
          }

          (mod.all_developers || []).forEach(d => {
            if (!devColorMap[d.name]) {
              devColorMap[d.name] = DEV_COLORS[colorIdx % DEV_COLORS.length];
              colorIdx++;
            }
          });

          return {
            id: i + 1,
            name: mod.module.charAt(0).toUpperCase() + mod.module.slice(1),
            risk: mod.risk_level,
            owner: mod.top_developer,
            ownerColor: devColorMap[ownerName],
            ownership: Math.round(mod.ownership_pct),
            totalCommits: mod.total_commits,
            allDevelopers: (mod.all_developers || []).map(d => ({
              ...d,
              color: devColorMap[d.name] || '#3B82F6',
            })),
          };
        });

        setModules(mapped);
        setLoading(false);
      })
      .catch(err => {
        setError(err.detail || err.message || 'Failed to load knowledge risk data');
        setLoading(false);
      });
  }, []);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in p-6 bg-[#F4FBF8] min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Knowledge Concentration Risk</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          <AlertTriangle className="text-4xl mb-4 mx-auto text-gray-300" />
          <p className="text-lg font-medium text-gray-800 mb-2">No Data Available</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const highCount = modules.filter(m => m.risk === 'HIGH').length;
  const medCount = modules.filter(m => m.risk === 'MEDIUM').length;
  const lowCount = modules.filter(m => m.risk === 'LOW').length;

  // Derive data for Card 1 (BarChart)
  const chartData = modules.slice(0, 6).map(m => ({
    name: m.name.substring(0, 8) + (m.name.length > 8 ? '..' : ''),
    high: m.risk === 'HIGH' ? m.ownership : 0,
    medium: m.risk === 'MEDIUM' ? m.ownership : 0,
    low: m.risk === 'LOW' ? m.ownership : 0,
  }));

  // Derive data for Card 2 (Risk by Category)
  const categoryData = [
    { name: 'High Ownership (Silos)', count: highCount, color: 'bg-red-400', pct: modules.length ? (highCount / modules.length) * 100 : 0 },
    { name: 'Concentrated Knowledge', count: medCount, color: 'bg-amber-300', pct: modules.length ? (medCount / modules.length) * 100 : 0 },
    { name: 'Shared Ownership', count: lowCount, color: 'bg-emerald-400', pct: modules.length ? (lowCount / modules.length) * 100 : 0 },
  ];

  // Derive data for Card 3 (Score)
  const riskScore = modules.length > 0 ? Math.round(modules.reduce((a, m) => a + m.ownership, 0) / modules.length) : 0;
  
  const highRiskModules = modules.filter(m => m.risk === 'HIGH').sort((a,b) => b.ownership - a.ownership);
  const alertsList = highRiskModules.length > 0 ? highRiskModules : modules.slice(0, 4);

  return (
    <div className="grid grid-cols-[1fr_260px] gap-5 p-6 bg-[#F4FBF8] min-h-screen">
      
      {/* LEFT COLUMN - Main Content */}
      <div className="flex flex-col opacity-0 animate-slide-up stagger-1">
        
        {/* Top Row — Three Cards */}
        <div className="grid grid-cols-[1fr_1fr_240px] gap-4 mb-5">
           
           {/* Card 1 — Risk Distribution */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-semibold text-gray-700">Risk Distribution</h2>
                 <div className="border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-500">Modules</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                    <Bar dataKey="high" stackId="a" fill="#10B981" radius={[0,0,0,0]} />
                    <Bar dataKey="medium" stackId="a" fill="#6EE7B7" radius={[0,0,0,0]} />
                    <Bar dataKey="low" stackId="a" fill="#D1FAE5" radius={[4,4,0,0]} />
                 </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3">
                 <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>High</div>
                 <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]"></div>Medium</div>
                 <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2.5 h-2.5 rounded-full bg-[#D1FAE5]"></div>Low</div>
              </div>
           </div>

           {/* Card 2 — Risk by Category */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-semibold text-gray-700">Risk by Category</h2>
                 <div className="border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-500">All Time</div>
              </div>
              <div className="flex flex-col justify-center h-[200px]">
                 {categoryData.map((cat, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600 font-medium">{cat.name}</span>
                          <span className="text-xs text-gray-400">{Math.round(cat.pct)}% {cat.count}/{modules.length}</span>
                       </div>
                       <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Card 3 — Overall Risk Score */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center">
              <h2 className="text-sm font-semibold text-gray-700 self-start mb-3">Overall Risk Score</h2>
              <div className="relative">
                 <PieChart width={180} height={110}>
                    <Pie
                      data={[{ value: riskScore }, { value: 100 - riskScore }]}
                      cx={90} cy={100}
                      startAngle={180} endAngle={0}
                      innerRadius={60} outerRadius={80}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#F3F4F6" />
                    </Pie>
                 </PieChart>
                 <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
                    <p className="text-2xl font-bold text-gray-800">{riskScore}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Risk Score</p>
                 </div>
              </div>
              <p className="text-xs text-emerald-500 font-medium text-center mt-3">-4% vs last week</p>

              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2 self-start">High Risk Modules</h3>
              <div className="w-full space-y-0">
                 {highRiskModules.slice(0, 2).map((mod, idx) => (
                    <div key={idx} className="flex items-center justify-between w-full py-2 border-b border-gray-50 last:border-0">
                       <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold flex flex-shrink-0 items-center justify-center" style={{ backgroundColor: `${mod.ownerColor}20`, color: mod.ownerColor }}>
                             {mod.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="ml-2">
                             <p className="text-xs text-gray-700 font-medium truncate max-w-[80px]">{mod.name}</p>
                             <p className="text-[10px] text-gray-400 truncate max-w-[80px]">{mod.owner}</p>
                          </div>
                       </div>
                       <p className="text-sm font-semibold text-gray-700">{mod.ownership}<span className="text-[10px] text-gray-400 ml-0.5">%</span></p>
                    </div>
                 ))}
                 {highRiskModules.length === 0 && <p className="text-xs text-gray-400 py-2">No high risks found.</p>}
              </div>
           </div>
        </div>

        {/* Full-Width Table — Module Risk Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-0">
           <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Module Risk Analysis</h2>
              <div className="border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-500">This Month</div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-50">
                    <tr>
                       <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 text-left">Module / Owner</th>
                       <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 text-left">Category</th>
                       <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 text-center">Ownership %</th>
                       <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 text-center">Commits</th>
                       <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 text-center">Bus Factor</th>
                       <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 text-left">Risk Score</th>
                    </tr>
                 </thead>
                 <tbody>
                    {modules.map((mod, i) => (
                       <tr key={mod.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${mod.ownerColor}20`, color: mod.ownerColor }}>
                                   {mod.owner.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                   <p className="text-sm text-gray-800 font-medium truncate">{mod.name}</p>
                                   <p className="text-xs text-gray-400 truncate">{mod.owner}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">Core Code</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center font-medium">{mod.ownership}%</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">{mod.totalCommits}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">{mod.allDevelopers.length} devs</td>
                          <td className="px-4 py-3">
                             <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium inline-block ${
                                mod.risk === 'HIGH' ? 'bg-red-50 text-red-500' :
                                mod.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-500' :
                                'bg-emerald-50 text-emerald-600'
                             }`}>
                                {mod.risk}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Show 1 to {modules.length} of {modules.length} results</span>
              <div className="flex gap-1">
                 <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                 </button>
                 <button className="w-7 h-7 rounded-lg flex items-center justify-center text-xs bg-emerald-500 text-white">1</button>
                 <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                 </button>
              </div>
           </div>
        </div>

      </div>

      {/* RIGHT COLUMN - Sidebar Panels */}
      <div className="flex flex-col opacity-0 animate-slide-up stagger-2">
         {/* Risk Alerts */}
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Risk Alerts</h2>
            <div className="space-y-3">
               {alertsList.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                     <div className="w-8 h-8 rounded-full flex-shrink-0 text-xs font-semibold flex items-center justify-center" style={{ backgroundColor: `${alert.ownerColor}20`, color: alert.ownerColor }}>
                        {alert.name.substring(0, 1).toUpperCase()}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium truncate">{alert.owner}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{alert.name} knowledge silo</p>
                        <div className="flex justify-end mt-1">
                           <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${
                               alert.risk === 'HIGH' ? 'bg-red-50 text-red-500' :
                               alert.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-500' :
                               'bg-emerald-50 text-emerald-600'
                           }`}>
                              {alert.risk} RISK
                           </span>
                        </div>
                     </div>
                  </div>
               ))}
               {alertsList.length === 0 && <p className="text-xs text-gray-400">No active alerts.</p>}
            </div>
         </div>
      </div>

    </div>
  );
}
