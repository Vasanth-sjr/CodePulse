import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { getDeveloperSkills } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const DEV_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];

export default function SkillIntelligence() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const repoId = localStorage.getItem('codepulse_repo_id');
    if (!repoId) {
      setError('No repository connected yet. Go to Setup to connect a repo.');
      setLoading(false);
      return;
    }

    getDeveloperSkills(parseInt(repoId))
      .then(data => {
        setDevelopers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.detail || err.message || 'Failed to load skill data');
        setLoading(false);
      });
  }, []);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in p-6 bg-[#F4FBF8] min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Skill Intelligence</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          <Brain className="text-4xl mb-4 mx-auto text-gray-300" />
          <p className="text-lg font-medium text-gray-800 mb-2">No Data Available</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Aggregate global team skills from developer data
  const skillMap = {};
  developers.forEach(dev => {
    (dev.skills || []).forEach(s => {
      if (!skillMap[s.skill]) skillMap[s.skill] = { total: 0, count: 0 };
      skillMap[s.skill].total += s.percentage;
      skillMap[s.skill].count += 1;
    });
  });

  const teamSkills = Object.entries(skillMap)
    .map(([skill, data]) => ({
      skill,
      score: Math.round(data.total / data.count),
      upskill: Math.round((data.total / data.count) * 0.3) // mocked upskilling offset
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const radarData = teamSkills.map(s => ({
    domain: s.skill.substring(0, 10),
    score: s.score
  }));

  const topStrength = teamSkills.length > 0 ? teamSkills[0] : null;
  const topGap = teamSkills.length > 0 ? teamSkills[teamSkills.length - 1] : null;

  return (
    <div className="p-6 bg-[#F4FBF8] min-h-screen max-w-screen-xl mx-auto space-y-6 animate-fade-in block">
      
      {/* Page Title Row */}
      <div className="flex items-start justify-between mb-6">
         <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Skill Intelligence</h1>
            <p className="text-sm text-gray-400 mt-1">Developer expertise mapped from code contributions</p>
         </div>
      </div>

      {/* Two-Card Row */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-5">
         
         {/* Card 1 — Top Proficiency Clusters */}
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-0 animate-slide-up stagger-1">
            <div className="flex items-center justify-between mb-1">
               <h2 className="text-base font-semibold text-gray-800">Top Proficiency Clusters</h2>
               <div className="bg-emerald-50 text-emerald-600 text-xs font-medium rounded-lg px-3 py-1.5 border border-emerald-100">Overall</div>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 mb-6">Average team score across core technologies</p>
            
            <div className="space-y-0">
               {teamSkills.map((ts, i) => (
                  <div key={ts.skill} className="mb-5 last:mb-0">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{ts.skill}</span>
                        <span className="text-sm font-semibold text-gray-800">{ts.score}%</span>
                     </div>
                     <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
                        <div className="absolute left-0 top-0 h-full bg-emerald-600 rounded-full z-10" style={{ width: `${ts.score}%` }}></div>
                        <div className="absolute left-0 top-0 h-full bg-emerald-300 rounded-full z-0" style={{ width: `${Math.min(100, ts.score + ts.upskill)}%` }}></div>
                     </div>
                  </div>
               ))}
               {teamSkills.length === 0 && <p className="text-xs text-gray-400">No skill data available.</p>}
            </div>

            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
               <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <div className="w-3 h-3 rounded-sm bg-emerald-600"></div> Expertise
               </div>
               <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <div className="w-3 h-3 rounded-sm bg-emerald-300"></div> Upskilling
               </div>
            </div>
         </div>

         {/* Card 2 — Global Distribution */}
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-0 animate-slide-up stagger-2">
            <h2 className="text-base font-semibold text-gray-800">Global Distribution</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">Competency distribution across domains</p>
            
            {radarData.length > 0 ? (
               <div className="flex justify-center flex-col items-center">
                  <RadarChart cx={130} cy={110} outerRadius={85} width={260} height={220} data={radarData}>
                    <PolarGrid stroke="#E5E7EB" strokeWidth={1} />
                    <PolarAngleAxis
                      dataKey="domain"
                      tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Radar
                      dataKey="score"
                      stroke="#059669"
                      strokeWidth={2}
                      fill="#10B981"
                      fillOpacity={0.12}
                      dot={{ fill: '#059669', r: 3, strokeWidth: 0 }}
                    />
                  </RadarChart>
                  
                  <div className="space-y-2.5 mt-2 pt-4 border-t border-gray-100 w-full">
                     {topStrength && (
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                              <span className="text-xs text-gray-500 font-medium">Core Strength ({topStrength.skill})</span>
                           </div>
                           <span className="text-xs font-semibold text-emerald-600">{topStrength.score}%</span>
                        </div>
                     )}
                     {topGap && topGap !== topStrength && (
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                              <span className="text-xs text-gray-500 font-medium">Growth Area ({topGap.skill})</span>
                           </div>
                           <span className="text-xs font-semibold text-red-400">{topGap.score}%</span>
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <p className="text-xs text-gray-400 flex items-center justify-center h-[200px]">Insufficient global domain data</p>
            )}
         </div>

      </div>

      {/* Developer Skill Index Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-0 animate-slide-up stagger-3">
         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">Developer Skill Index</h2>
            <div className="flex items-center gap-2">
               <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
               </button>
               <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                     <th className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-6 py-3 text-left">DEVELOPER</th>
                     <th className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-6 py-3 text-left">CORE SKILLSET</th>
                     <th className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-6 py-3 text-left">PROFICIENCY INDEX</th>
                  </tr>
               </thead>
               <tbody>
                  {developers.map((dev, i) => {
                     const initials = dev.name ? dev.name.split(/[\s_-]/).map(n=>n[0]).join('').toUpperCase().slice(0,2) : '??';
                     const devSkills = dev.skills || [];
                     const avgProficiency = devSkills.length > 0 ? Math.round(devSkills.reduce((a, s) => a + s.percentage, 0) / devSkills.length) : 0;
                     const color = DEV_COLORS[i % DEV_COLORS.length];

                     return (
                        <tr key={dev.name || i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full flex-shrink-0 text-white text-sm font-semibold flex items-center justify-center" style={{ backgroundColor: color }}>
                                    {initials}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{dev.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">Contributor</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                                 {devSkills.slice(0, 3).map(skill => (
                                    <span key={skill.skill} className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                                       {skill.skill}
                                    </span>
                                 ))}
                                 {devSkills.length === 0 && <span className="text-xs text-gray-400">-</span>}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${avgProficiency}%` }}></div>
                                 </div>
                                 <span className="text-sm font-semibold text-gray-800">{(avgProficiency / 10).toFixed(1)}</span>
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
