
import React from 'react';
import { TherapyType, SessionResult } from '../types';
import { Icons } from '../components/Icons';
import { isToday } from '../utils/date-helpers';

interface TherapyLibraryProps {
  onStartTherapy: (type: TherapyType, exerciseName?: string) => void;
  therapyHistory: SessionResult[];
  darkMode: boolean;
}

const TherapyLibrary: React.FC<TherapyLibraryProps> = ({ onStartTherapy, therapyHistory, darkMode }) => {
  const categories = [
    {
      id: TherapyType.BODY,
      title: 'Body Movement',
      icon: <Icons.Body />,
      exercises: [
        { name: 'Grip Strength', desc: 'Open and close your hand to build strength.' },
        { name: 'Arm Stretch', desc: 'Simple shoulder and elbow movement tracking.' }
      ]
    },
    {
      id: TherapyType.SPEECH,
      title: 'Speech Practice',
      icon: <Icons.Mic />,
      exercises: [
        { name: 'Clear Speaking', desc: 'Repeat simple words to practice clarity.' },
        { name: 'Voice Control', desc: 'Practice holding long vowel sounds.' },
        { name: 'Speak & Score', desc: 'Interactive word repetition & clarity score.' }
      ]
    },
    {
      id: TherapyType.BRAIN,
      title: 'Brain Training',
      icon: <Icons.Brain />,
      exercises: [
        { name: 'Memory Game', desc: 'Remember and repeat simple patterns.' },
        { name: 'Mental Focus', desc: 'Clinical color-word interference test.' },
        { name: 'Quick Tap', desc: 'High-speed reaction assessment.' }
      ]
    },
    {
      id: TherapyType.MENTAL,
      title: 'Mind & Mood',
      icon: <Icons.Activity />,
      exercises: [
        { name: 'Daily Check-in', desc: 'Quick questions about how you feel today.' }
      ]
    }
  ];

  const totalPossible = categories.length;
  const completedToday = categories.filter(cat =>
    therapyHistory.some(s => isToday(s.timestamp) && s.type === cat.id)
  ).length;
  const progressPercent = Math.round((completedToday / totalPossible) * 100);

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] animate-in fade-in duration-1000">
      {/* Immersive Panoramic Header */}
      <header className="relative w-full overflow-hidden bg-slate-100/50 backdrop-blur-xl dark:bg-[#050505] border-b-2 border-slate-950/20 dark:border-white/5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 p-6 sm:p-10 md:p-16 lg:p-24 flex flex-col lg:flex-row lg:items-center justify-between gap-8 sm:gap-12 max-w-[1800px] mx-auto">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4 sm:mb-6">
              <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-[#48c1cf] rounded-full shadow-[0_0_15px_rgba(72,193,207,0.5)]"></div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-[#48c1cf] dark:text-cyan-400">RECOVERY PROTOCOL</span>
            </div>
            <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-[1000] tracking-[-0.04em] mb-4 sm:mb-6 text-[#1a365d] dark:text-white leading-[0.9]">
              RECOVERY <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48c1cf] to-[#10b981]">HUB</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg sm:text-2xl font-medium max-w-2xl leading-relaxed lg:mx-0 mx-auto">
              Precision neurological restoration systems. <br className="hidden md:block" />
              Tailored biological recovery trajectories for neural optimization.
            </p>
          </div>

          <div className="flex items-center gap-6 sm:gap-10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl p-6 sm:p-10 rounded-[2rem] sm:rounded-[4rem] border-2 border-white/40 dark:border-white/10 shadow-2xl relative overflow-hidden group mx-auto lg:mx-0 w-full sm:w-auto">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 transform group-hover:rotate-6 transition-transform duration-700">
              <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_15px_rgba(72,193,207,0.3)]">
                <circle cx="50%" cy="50%" r="44%" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-white/5" />
                <circle
                  cx="50%" cy="50%" r="44%"
                  fill="none"
                  stroke="url(#progressGradientHub)"
                  strokeWidth="10"
                  strokeDasharray="276"
                  strokeDashoffset={276 - (276 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1500 ease-in-out"
                />
                <defs>
                  <linearGradient id="progressGradientHub" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#48c1cf" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-4xl font-[1000] tracking-tighter text-[#1a365d] dark:text-white leading-none">{progressPercent}%</span>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#48c1cf] mt-1 sm:mt-2">Cycle</span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col justify-center flex-1">
              <p className="text-[9px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400 mb-1 sm:mb-2">NEURAL LOAD</p>
              <p className="text-3xl sm:text-5xl font-[1000] text-[#1a365d] dark:text-white leading-none tracking-tighter mb-2 sm:mb-4">
                {completedToday}<span className="text-xl sm:text-2xl opacity-20 mx-1 sm:mx-2">/</span>{totalPossible}
              </p>
              <div className="inline-block self-start px-4 sm:px-5 py-1.5 sm:py-2 bg-[#48c1cf]/10 dark:bg-white/5 border border-[#48c1cf]/20 dark:border-white/10 rounded-full">
                <p className="text-[8px] sm:text-[10px] font-black text-[#48c1cf] dark:text-cyan-400 uppercase tracking-widest italic leading-none">Units Operational</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Experimental Grid: Fluid & Dynamic */}
      <div className="max-w-[1800px] mx-auto p-6 sm:p-10 md:p-16 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`group p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] border-2 transition-all duration-500 ${darkMode
              ? 'bg-[#080808] border-white/10 hover:border-cyan-500/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]'
              : 'bg-slate-50 backdrop-blur-xl border-slate-950/20 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_40px_80px_-25px_rgba(0,0,0,0.15)]'
              }`}
          >
            <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#48c1cf] to-[#10b981] text-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                {cat.icon}
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-[1000] tracking-tight text-[#1a365d] dark:text-white">{cat.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Module {cat.id} Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {cat.exercises.map((ex, i) => {
                const isDone = therapyHistory.some(s => isToday(s.timestamp) && s.type === cat.id);
                return (
                  <button
                    key={i}
                    onClick={() => !isDone && onStartTherapy(cat.id, ex.name)}
                    className={`w-full text-left p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 transition-all duration-300 group/btn flex items-center justify-between gap-4 ${isDone
                      ? 'bg-emerald-500/5 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/10'
                      : 'hover:border-[#48c1cf] hover:bg-[#48c1cf]/5'
                      } ${!isDone && (darkMode ? 'border-white/5 bg-white/[0.01]' : 'border-slate-300 bg-slate-100/50 backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg')}`}
                  >
                    <div className="flex-1">
                      <p className={`font-black text-base sm:text-lg mb-1 sm:mb-2 transition-colors duration-300 ${isDone ? 'text-emerald-500' : 'text-[#1a365d] dark:text-white'}`}>
                        {ex.name}
                      </p>
                      <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{ex.desc}</p>
                    </div>

                    <div className="flex-shrink-0">
                      {isDone ? (
                        <div className="flex items-center gap-2 sm:gap-3 bg-emerald-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-500/20 border border-emerald-400/30 transform scale-100 sm:scale-110">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                          <span className="text-white font-black text-[9px] sm:text-xs uppercase tracking-widest">VERIFIED</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-white/5 text-[#48c1cf] flex items-center justify-center opacity-100 lg:opacity-0 group-hover/btn:opacity-100 translate-x-0 lg:translate-x-4 lg:group-hover/btn:translate-x-0 transition-all duration-300">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapyLibrary;
