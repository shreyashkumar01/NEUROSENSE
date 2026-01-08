
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Icons } from './Icons';

interface NavigationProps {
  role: UserRole;
  currentView: string;
  setView: (view: string) => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ role, currentView, setView, onLogout, darkMode, toggleTheme }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const patientTabs = [
    { id: 'dashboard', icon: <Icons.Home />, label: 'Hub' },
    { id: 'therapy', icon: <Icons.Therapy />, label: 'Recovery' },
    { id: 'chat', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>, label: 'Chat' },
    { id: 'connect', icon: <Icons.Activity />, label: 'Link' },
    { id: 'progress', icon: <Icons.Stats />, label: 'Data' },
  ];

  const doctorTabs = [
    { id: 'dashboard', icon: <Icons.Home />, label: 'Dashboard' },
    { id: 'patients', icon: <Icons.User />, label: 'Cohort' },
    { id: 'chat', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>, label: 'Chat' },
    { id: 'alerts', icon: <Icons.Activity />, label: 'Alerts' },
    { id: 'reports', icon: <Icons.Stats />, label: 'Reports' },
  ];

  const activeId = (role === UserRole.DOCTOR && currentView === 'dashboard') ? 'patients' : currentView;
  const tabs = role === UserRole.PATIENT ? patientTabs : doctorTabs;

  return (
    <>
      {/* 1. Hamburger Button (Floating Top-Right, Square) */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed top-6 right-6 z-[200] p-4 bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 hover:scale-105 transition-all active:scale-95 group"
        aria-label="Open Menu"
      >
        <div className="space-y-1.5 flex flex-col items-end">
          <span className="block w-6 h-[2px] bg-current transition-all duration-300 group-hover:w-8 group-hover:bg-blue-600 dark:group-hover:bg-cyan-400"></span>
          <span className="block w-4 h-[2px] bg-current transition-all duration-300 group-hover:w-8 group-hover:bg-blue-600 dark:group-hover:bg-cyan-400"></span>
          <span className="block w-6 h-[2px] bg-current transition-all duration-300 group-hover:w-8 group-hover:bg-blue-600 dark:group-hover:bg-cyan-400"></span>
        </div>
      </button>

      {/* 2. Enhanced Overlay (Backdrop) */}
      <div
        className={`fixed inset-0 z-[210] bg-[#020408]/60 backdrop-blur-md transition-opacity duration-500 ease-out ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* 3. Floating Drawer (Square, No Rounded Corners) */}
      <div className={`fixed top-4 bottom-4 right-4 z-[220] w-[calc(100vw-2rem)] sm:w-[450px] bg-slate-50/95 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] dark:bg-[#080d1a] dark:shadow-none border-2 border-slate-950/20 dark:border-white/10 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col overflow-hidden ${isDrawerOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'}`}>

        {/* Drawer Header: Brand & Close */}
        <div className="flex-none p-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-4 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors group order-last"
          >
            <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setView('dashboard'); setIsDrawerOpen(false); }}>
            <div className="p-3 bg-blue-500/10 dark:bg-white/10 text-blue-600 dark:text-white shadow-sm">
              <Icons.Logo size={28} />
            </div>
            <div className="flex flex-col items-start text-left">
              <h2 className="text-2xl font-[1000] uppercase tracking-tighter text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">NeuroSense</h2>
            </div>
          </div>
        </div>

        {/* Drawer Body: Navigation Menu */}
        <div className="flex-grow overflow-y-auto py-8 px-0">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setView(tab.id);
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-start gap-6 px-10 py-6 transition-all duration-300 border-l-[6px] group relative
                     ${isActive
                      ? 'bg-blue-500/10 text-blue-600 border-blue-600 shadow-[0_15px_30px_-10px_rgba(37,99,235,0.15)] backdrop-blur-md dark:bg-white/10 dark:text-white dark:border-white dark:shadow-none'
                      : 'text-slate-500 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 border-transparent'}
                   `}
                >
                  <div className={`relative z-10 w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {tab.icon}
                  </div>
                  <span className={`relative z-10 font-[900] uppercase tracking-[0.15em] text-sm flex-grow text-left transition-all duration-300 ${isActive ? 'translate-x-1' : ''}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer: User & System (Stacked, Square) */}
        <div className="flex-none p-0 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5 border-b border-slate-100 dark:border-white/5">

            {/* Profile */}
            <button
              onClick={() => { setView('profile'); setIsDrawerOpen(false); }}
              className={`flex items-center justify-start gap-6 px-10 py-5 transition-all border-2 ${currentView === 'profile' ? 'text-emerald-600 bg-emerald-500/5 border-emerald-600 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.1)] dark:text-white dark:bg-white/5 dark:border-white/20' : 'text-slate-500 border-transparent dark:text-white'}`}
            >
              <div className="flex items-center justify-center w-6 h-6">
                <Icons.User size={18} />
              </div>
              <span className="font-bold text-[10px] uppercase tracking-widest flex-grow text-left">User Profile</span>
              {currentView === 'profile' && <div className="w-2 h-2 bg-current rounded-full"></div>}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-start gap-6 px-10 py-5 transition-all hover:bg-white dark:hover:bg-white/5 text-slate-500 dark:text-white hover:text-slate-900"
            >
              <div className="flex items-center justify-center w-6 h-6">
                {darkMode ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
              </div>
              <span className="font-bold text-[10px] uppercase tracking-widest flex-grow text-left">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={() => { onLogout(); setIsDrawerOpen(false); }}
            className="w-full flex items-center justify-center gap-3 p-8 text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-all group"
          >
            <span className="font-black text-xs uppercase tracking-[0.2em]">Terminate Session</span>
            <Icons.Logout size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </>
  );
};

export default Navigation;
