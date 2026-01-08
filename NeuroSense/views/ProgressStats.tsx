
import React from 'react';
import { SessionResult } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ProgressStatsProps {
  history: SessionResult[];
  darkMode: boolean;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ history, darkMode }) => {
  const chartData = [...history].reverse().map(h => ({
    time: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: h.score,
    type: h.type,
    exercise: h.exerciseName || h.type
  }));

  const stats = [
    { label: 'Total Trials', value: history.length },
    { label: 'Average Output', value: `${history.length > 0 ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0}%` },
    { label: 'Clinical Adherence', value: '94.8%' },
    { label: 'Delta Progression', value: '+12.4%' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 resolve-ui">
      <header className="px-2">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-1 sm:w-1.5 h-6 bg-[#48c1cf] rounded-full"></div>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#48c1cf]">Longitudinal Analytics</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 text-[#1a365d] dark:text-white">Recovery Telemetry</h1>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed">Cross-modality performance data synchronized from active recovery nodes.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#050505] p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-lg">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 sm:mb-2">{s.label}</p>
            <p className="text-2xl sm:text-3xl font-black text-[#1a365d] dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="bg-white dark:bg-[#050505] p-6 sm:p-8 lg:p-12 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl">
        <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-8 sm:mb-12 text-[#48c1cf]">Kinematic Quality Progression</h2>
        <div className="h-[300px] sm:h-[400px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#48c1cf" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#48c1cf" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#fff', border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`, borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: '800', color: '#48c1cf' }}
                />
                <Area type="monotone" dataKey="score" stroke="#48c1cf" fillOpacity={1} fill="url(#colorScore)" strokeWidth={4} dot={{ r: 6, fill: '#48c1cf', strokeWidth: 3, stroke: darkMode ? '#000' : '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Insufficient telemetry data for longitudinal visualization.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProgressStats;
