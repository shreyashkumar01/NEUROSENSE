
import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { UserRole } from '../types';

interface AuthPortalProps {
    role: UserRole;
    authMode: 'LOGIN' | 'REGISTER';
    setAuthMode: (mode: 'LOGIN' | 'REGISTER' | null) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isAuthenticating: boolean;
    authError: string | null;
    onSwitchRole: (role: UserRole) => void;
    onGoogleLogin: () => void;
    darkMode: boolean;
}

const AuthPortal: React.FC<AuthPortalProps> = ({
    role,
    authMode,
    setAuthMode,
    onSubmit,
    isAuthenticating,
    authError,
    onSwitchRole,
    onGoogleLogin,
    darkMode
}) => {
    const isDoctor = role === UserRole.DOCTOR;
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 ${darkMode ? 'dark bg-[#000000]' : 'bg-slate-50'}`}>
            {/* Background pattern and effects */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Decorative orbs */}
                <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[150px] rounded-full transition-all duration-1000 animate-pulse ${isDoctor ? 'bg-emerald-500/10' : 'bg-blue-600/10'}`}></div>
                <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-all duration-1000 ${isDoctor ? 'bg-amber-500/10' : 'bg-cyan-500/10'}`}></div>

                {/* Neural Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
            </div>

            {/* Back to Home Control */}
            <button
                onClick={() => setAuthMode(null)}
                className="absolute top-6 left-6 sm:top-10 sm:left-10 z-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-xl border-2 border-blue-900/20 dark:border-2 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:scale-110 active:scale-95 transition-all group"
            >
                <Icons.Logout size={18} className="rotate-180 transition-transform group-hover:-translate-x-1" />
            </button>

            {/* Main Portal Container: Responsive stacking for mobile/desktop */}
            <div className={`relative z-10 w-full max-w-[1200px] flex flex-col lg:flex-row items-center gap-10 md:gap-16 lg:gap-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out`}>

                {/* Brand Identity / Welcome Text */}
                <div className="flex-1 text-center lg:text-left px-2 sm:px-0 mb-8 lg:mb-0">
                    <div className="inline-flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4 py-2 rounded-full bg-slate-100/50 dark:bg-white/5 border-2 border-blue-900/20 dark:border-2 dark:border-white/10 backdrop-blur-sm">
                        <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full shadow-lg ${isDoctor ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}></div>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-500 dark:text-slate-400">{isDoctor ? 'DOCTOR PORTAL' : 'PATIENT PORTAL'}</span>
                    </div>

                    <h1 className="text-3xl sm:text-6xl lg:text-7xl xl:text-8xl font-[1000] tracking-[-0.04em] leading-[0.9] sm:leading-tight text-slate-900 dark:text-white mb-6 sm:mb-8 transition-all duration-700">
                        {authMode === 'LOGIN' ? 'Welcome' : 'Join the'} <br />
                        <span className={`pb-1 sm:pb-2 block text-transparent bg-clip-text bg-gradient-to-b ${isDoctor ? 'from-emerald-400 to-emerald-900 font-black' : 'from-blue-400 to-[#1a365d]'}`}>
                            {authMode === 'LOGIN' ? 'Back' : 'Network'}
                        </span>
                    </h1>

                    <p className="hidden sm:block text-lg font-medium text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed lg:mx-0 mx-auto">
                        Precision healthcare powered by <span className="font-black text-slate-900 dark:text-white tracking-tighter">NeuroSense AI</span>.
                        {isDoctor ? ' Access clinical telemetry and patient dashboard.' : ' Start your personalized neurological recovery journey.'}
                    </p>
                </div>

                {/* Authentication form container */}
                <div className={`w-full max-w-[480px] p-6 s:p-8 sm:p-10 lg:p-12 rounded-[2.5rem] sm:rounded-[4rem] backdrop-blur-[60px] transition-all duration-700 ${darkMode
                    ? 'bg-white/5 border-2 border-white/10 shadow-2xl'
                    : 'bg-white border-2 border-slate-200 shadow-xl'
                    }`}>

                    <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
                        <h2 className="text-3xl sm:text-4xl font-[1000] tracking-tight text-slate-900 dark:text-white">
                            {authMode === 'LOGIN' ? 'Login' : 'Register'}
                        </h2>
                    </div>

                    {authError && (
                        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center rounded-xl sm:rounded-2xl animate-in shake duration-500">
                            {authError}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
                        {authMode === 'REGISTER' && (
                            <div className="group">
                                <input
                                    name="name"
                                    required
                                    className="w-full h-12 sm:h-14 px-5 sm:px-6 bg-blue-100/40 dark:bg-white/5 border-2 border-slate-900/10 dark:border-2 dark:border-white/10 rounded-xl sm:rounded-2xl text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                    placeholder="Legal Professional Name"
                                />
                            </div>
                        )}

                        <div className="group">
                            <input
                                name="email"
                                required
                                type="email"
                                className="w-full h-12 sm:h-14 px-5 sm:px-6 bg-blue-100/40 dark:bg-white/5 border-2 border-slate-900/10 dark:border-2 dark:border-white/10 rounded-xl sm:rounded-2xl text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                placeholder="Network ID / Email"
                            />
                        </div>

                        {authMode === 'REGISTER' && isDoctor && (
                            <div className="group">
                                <input
                                    name="licenseId"
                                    required
                                    className="w-full h-12 sm:h-14 px-5 sm:px-6 bg-slate-100 dark:bg-white/5 border border-rose-400/20 dark:border-white/10 rounded-xl sm:rounded-2xl text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                    placeholder="Physician License PIN"
                                />
                            </div>
                        )}

                        <div className="group relative">
                            <input
                                name="password"
                                required
                                type={showPassword ? 'text' : 'password'}
                                className="w-full h-12 sm:h-14 pl-5 sm:pl-6 pr-12 sm:pr-14 bg-blue-100/40 dark:bg-white/5 border-2 border-slate-900/10 dark:border-2 dark:border-white/10 rounded-xl sm:rounded-2xl text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                placeholder="Secure Access Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className={`w-full h-14 sm:h-16 rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-xs font-[1000] tracking-[0.15em] sm:tracking-[0.2em] text-white uppercase shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 ${isDoctor
                                ? 'bg-gradient-to-b from-emerald-400 to-emerald-900 shadow-emerald-900/40'
                                : 'bg-gradient-to-b from-blue-400 to-[#1a365d] shadow-[#1a365d]/40'
                                }`}
                        >
                            {isAuthenticating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {authMode === 'LOGIN' ? 'VERIFY & ENTER' : 'INITIALIZE ACCOUNT'}
                                    <Icons.Back size={14} className="rotate-180" />
                                </>
                            )}
                        </button>

                        {!isDoctor && authMode === 'LOGIN' && (
                            <>
                                <div className="flex items-center gap-3 py-2 sm:py-4">
                                    <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10"></div>
                                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
                                    <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10"></div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onGoogleLogin}
                                    className="w-full h-12 sm:h-14 px-5 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-blue-900/20 dark:border-2 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black text-slate-600 dark:text-slate-300 tracking-widest uppercase"
                                >
                                    <Icons.Google size={18} />
                                    CONTINUE WITH GOOGLE
                                </button>
                            </>
                        )}
                    </form>

                    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-slate-200 dark:border-white/10">
                        <button
                            onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                            className="text-[11px] sm:text-[12px] font-[1000] text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                            {authMode === 'LOGIN' ? 'CREATE PROFILE' : 'EXISTING USER'}
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-current rounded-full"></div>
                        </button>

                        <button
                            onClick={() => onSwitchRole(isDoctor ? UserRole.PATIENT : UserRole.DOCTOR)}
                            className={`w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest border-2 transition-all ${isDoctor
                                ? 'bg-blue-500/5 border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white'
                                : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                }`}
                        >
                            SWITCH HUB: {isDoctor ? 'PATIENT' : 'DOCTOR'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AuthPortal;
