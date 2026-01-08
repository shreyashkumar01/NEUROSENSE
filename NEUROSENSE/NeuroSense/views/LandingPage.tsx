import React from 'react';
import { User, Activity, ArrowRight } from "lucide-react";
import { Icons } from '../components/Icons';
import { Button } from "../components/ui/button";
import GradientOrbs from "../components/GradientOrbs";
import { UserRole } from '../types';

interface LandingPageProps {
    darkMode: boolean;
    setDarkMode: (val: boolean) => void;
    onSelectRole: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ darkMode, setDarkMode, onSelectRole }) => {
    return (
        <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
            {/* Header Navigation: Branding */}
            <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-50">
                <div className="flex items-center gap-3">
                    <Icons.Logo size={32} className="text-slate-900 dark:text-white" />
                    <div className="h-4 w-[0.5px] bg-slate-900/20 dark:bg-white/20"></div>
                    <span className="font-[950] text-lg sm:text-2xl text-slate-900 dark:text-white tracking-wide">NEUROSENSE.</span>
                </div>
            </div>

            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-10 h-10 rounded-full glass-ui flex items-center justify-center text-slate-900 dark:text-white hover:scale-105 transition-all shadow-lg border border-slate-900/10 dark:border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-md"
                >
                    {darkMode ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
                </button>
            </div>

            {/* Background Effects */}
            <GradientOrbs />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 lg:py-40 w-full">
                <div className="max-w-4xl">
                    {/* Main Hero Branding: Scaling typography for all devicess */}
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold leading-[1.02] tracking-tight mb-8 font-display">
                        <span className="block animate-fade-up text-slate-900 dark:text-white drop-shadow-sm">Recover</span>
                        <span className="block animate-fade-up-delay-1 text-slate-900 dark:text-white drop-shadow-sm">Your Voice,</span>
                        <span className="block animate-fade-up-delay-2">
                            <span className="text-slate-900 dark:text-white drop-shadow-sm">Body & Mind</span>
                            <span className="text-slate-900 dark:text-white">.</span>
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-white/80 max-w-2xl mb-14 animate-fade-up-delay-3 leading-relaxed font-light">
                        Advanced AI-powered neuro-recovery at home. Regain strength and speech clarity through
                        <span className="text-slate-900 dark:text-white font-medium"> clinical motor synthesis</span>.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-5 animate-fade-up-delay-4">
                        {/* Patient Button */}
                        <Button
                            variant="hero"
                            size="hero"
                            className="group flex items-center gap-4 w-full sm:min-w-[320px] sm:w-auto rounded-full bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-[#0f172a] transition-all duration-300 p-2 pr-8 shadow-lg shadow-blue-900/5"
                            onClick={() => onSelectRole(UserRole.PATIENT)}
                        >
                            <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                <User className="w-8 h-8 text-white stroke-[2.5px]" />
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-0.5 py-1.5 px-3 rounded-2xl border border-slate-200 dark:border-transparent bg-slate-50/30 dark:bg-transparent">
                                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-wider">PATIENT</span>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Start Recovery Journey</span>
                            </div>
                        </Button>

                        {/* Doctor Button */}
                        <Button
                            variant="hero"
                            size="hero"
                            className="group flex items-center gap-4 w-full sm:min-w-[320px] sm:w-auto rounded-full bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-[#0f172a] transition-all duration-300 p-2 pr-8 shadow-lg shadow-emerald-900/5"
                            onClick={() => onSelectRole(UserRole.DOCTOR)}
                        >
                            <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                                <Activity className="w-8 h-8 text-white stroke-[2.5px]" />
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-0.5 py-1.5 px-3 rounded-2xl border border-slate-200 dark:border-transparent bg-slate-50/30 dark:bg-transparent">
                                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-wider">DOCTOR</span>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Clinical Dashboard</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingPage;
