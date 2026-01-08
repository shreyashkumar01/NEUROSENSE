
import React, { useState } from 'react';
import { mentalHealthService } from '../services/mental-health.service';

interface MentalHealthViewProps {
    onComplete: (score: number, feedback: string) => void;
    darkMode: boolean;
}

const MentalHealthView: React.FC<MentalHealthViewProps> = ({ onComplete, darkMode }) => {
    const [step, setStep] = useState(0);
    const [responses, setResponses] = useState<number[]>([]);
    const isDark = darkMode;

    const questions = [
        { q: "In the last month, how often have you felt that you were unable to control the important things in your life?", cat: "STRESS" },
        { q: "In the last month, how often have you felt confident about your ability to handle your personal problems?", cat: "STRESS" },
        { q: "In the last month, how often have you felt that things were going your way?", cat: "STRESS" },
        { q: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?", cat: "STRESS" }
    ];

    const handleResponse = (val: number) => {
        const nextResponses = [...responses, val];
        if (step < questions.length - 1) {
            setResponses(nextResponses);
            setStep(step + 1);
        } else {
            // Complete Assessment
            const score = mentalHealthService.calculateStressScore(nextResponses);
            const severity = mentalHealthService.getSeverity(score);
            const feedback = mentalHealthService.generateSummary({
                type: 'STRESS',
                score,
                severity,
                timestamp: new Date().toISOString(),
                responses: {}
            });
            onComplete(score, feedback);
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] p-8 h-screen flex flex-col resolve-ui transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#f8fdfe] text-[#1a365d]'}`}>
            <header className={`flex justify-between items-center mb-12 border-b pb-8 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onComplete(0, "Assessment terminated.")}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5m7 7-7-7 7-7" /></svg>
                        Abort Protocol
                    </button>
                    <div className={`h-8 w-[1px] ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight leading-none mb-1">Psychological Profiling</h1>
                        <p className="text-slate-500 clinical-mono text-[9px] uppercase tracking-[0.3em] font-bold">NODE: NS-PSY-CORE-1.0</p>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
                <div className="mb-20 w-full">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <span className="text-[#48c1cf] text-[10px] font-black uppercase tracking-[0.4em]">Question {step + 1} of {questions.length}</span>
                        </div>
                        <span className="clinical-mono text-sm opacity-30">{Math.round(((step + 1) / questions.length) * 100)}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${((step + 1) / questions.length) * 100}%` }}></div>
                    </div>
                </div>

                <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-300">
                    <h2 className={`text-3xl md:text-4xl font-black leading-tight tracking-tight ${isDark ? 'text-white' : 'text-[#1a365d]'}`}>
                        {questions[step].q}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
                    {[0, 1, 2, 3, 4].map((val) => (
                        <button
                            key={val}
                            onClick={() => handleResponse(val)}
                            className={`py-8 rounded-3xl border-2 transition-all active:scale-95 group ${isDark
                                    ? 'bg-[#0a0a0a] border-white/5 hover:border-[#48c1cf] text-white'
                                    : 'bg-white border-slate-100 hover:border-[#48c1cf] shadow-sm text-[#1a365d]'
                                }`}
                        >
                            <span className="block text-2xl font-black mb-1 group-hover:text-[#48c1cf]">{val}</span>
                            <span className="text-[9px] uppercase font-black tracking-widest opacity-40">
                                {val === 0 ? 'Never' : val === 4 ? 'Very Often' : ''}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MentalHealthView;
