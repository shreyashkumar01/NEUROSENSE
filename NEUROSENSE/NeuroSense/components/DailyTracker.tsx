
import React from 'react';
import { Icons } from './Icons';
import { SessionResult, TherapyType } from '../types';
import { isToday, getLast7Days } from '../utils/date-helpers';

interface DailyTrackerProps {
    history: SessionResult[];
    tasks: { title: string; type: TherapyType }[];
    darkMode: boolean;
}

const DailyTracker: React.FC<DailyTrackerProps> = ({ history, tasks, darkMode }) => {
    const last7Days = getLast7Days();

    // Calculate completion for each day in history
    const getDayStatus = (dateStr: string) => {
        const daySessions = history.filter(s => s.timestamp.startsWith(dateStr));
        if (daySessions.length === 0) return 'empty';
        if (daySessions.length >= 3) return 'full';
        return 'partial';
    };

    const todayCompletions = tasks.map(task => ({
        ...task,
        completed: history.some(s => isToday(s.timestamp) && s.type === task.type)
    }));

    const allDone = todayCompletions.every(t => t.completed);

    return (
        <div className={`p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] backdrop-blur-3xl transition-all duration-300 ${darkMode ? 'bg-[#080808] border-white/10' : 'bg-slate-50 border-slate-950/20'}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black tracking-tight mb-1">Daily Protocol</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Checklist</p>
                </div>
                {allDone && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                        <Icons.Activity size={14} />
                        Quota Verified
                    </div>
                )}
            </div>

            {/* Mini Calendar */}
            <div className="flex justify-between items-center mb-10 px-2">
                {last7Days.map((day, idx) => {
                    const status = getDayStatus(day.date);
                    const isCurrent = isToday(day.date);
                    return (
                        <div key={idx} className="flex flex-col items-center gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-[#BEF264]' : 'text-slate-400'}`}>
                                {day.day}
                            </span>
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 border ${status === 'full' ? 'bg-emerald-500 border-emerald-400 text-white' :
                                status === 'partial' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' :
                                    'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-300'
                                } ${isCurrent ? 'ring-2 ring-[#BEF264] ring-offset-4 ring-offset-white dark:ring-offset-[#080808]' : ''}`}>
                                {status === 'full' ? <Icons.Activity size={16} /> :
                                    status === 'partial' ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> : null}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Checklist */}
            <div className="space-y-4">
                {todayCompletions.map((task, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${task.completed
                            ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                            : (darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100/50 border-slate-950/10 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)]')
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                                {task.completed ? <Icons.Activity size={14} /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                            </div>
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest ${task.completed ? 'text-emerald-500' : (darkMode ? 'text-white' : 'text-slate-900')}`}>
                                    {task.title}
                                </p>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                                    {task.completed ? 'Telemetry Verified' : 'Pending Acquisition'}
                                </p>
                            </div>
                        </div>
                        {task.completed && (
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">LOCKED</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Daily Progress</span>
                    <span>{Math.round((todayCompletions.filter(t => t.completed).length / tasks.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div
                        className="h-full bg-[#BEF264] transition-all duration-1000"
                        style={{ width: `${(todayCompletions.filter(t => t.completed).length / tasks.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default DailyTracker;
