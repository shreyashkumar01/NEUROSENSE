
import React, { useState, useEffect, useMemo } from 'react';
import { SessionResult, Connection, ConnectionStatus, DoctorProfile, UserAccount, TherapyType } from '../types';
import { User, Mic, Activity, Brain, Therapy, Logo, Verified, Logout } from '../components/Icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';

import OverallRecoveryCard from '../components/dashboard/OverallRecoveryCard';
import WeeklyProgressCard from '../components/dashboard/WeeklyProgressCard';
import RiskStatusCard from '../components/dashboard/RiskStatusCard';
import HandAccuracyCard from '../components/dashboard/HandAccuracyCard';
import TremorIntensityCard from '../components/dashboard/TremorIntensityCard';
import SpeechClarityCard from '../components/dashboard/SpeechClarityCard';
import RecoveryPredictionCard from '../components/dashboard/RecoveryPredictionCard';
import ChatSystem from '../components/ChatSystem';


interface DoctorProps {
  activeTab: string;
  history: SessionResult[];
  connections: Connection[];
  onAcceptConnection: (connId: string) => void;
  darkMode: boolean;
  currentUser: DoctorProfile;
  accounts: UserAccount[];
  setView: (view: string) => void;
}

const COLORS = ['#48c1cf', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardWidget: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, className?: string, isDark: boolean }> = ({ title, icon, children, className }) => (
  <div className={`flex flex-col rounded-[2rem] border transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl group bg-white border-slate-100 dark:bg-[#0f1115] dark:border-white/10 ${className || ''}`}>
    <div className="px-6 py-4 flex items-center justify-between border-b border-transparent group-hover:border-inherit transition-colors">
      <div className="flex items-center gap-3">
        <div className={`text-slate-400 group-hover:text-[#48c1cf] transition-colors`}>{icon}</div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">{title}</h3>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
    </div>
    <div className="flex-grow p-6">
      {children}
    </div>
  </div>
);

const PatientMonitor: React.FC<{ patient: UserAccount, history: SessionResult[], onBack: () => void, isDark: boolean, currentUser: UserAccount }> = ({ patient, history, onBack, isDark, currentUser }) => {
  const patientHistory = history.filter(h => h.patientId === patient.id);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col transition-colors duration-300 bg-[#f4f7f9] text-[#1a365d] dark:bg-black dark:text-white">

      {/* Medical Telemetry Header */}
      <div className="flex-none z-50">
        <header className="flex items-center justify-between bio-gradient-header py-5 px-10 border-b border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
          {/* Left: Return Button */}
          <div className="flex items-center gap-6 relative z-10">
            <button onClick={onBack} className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-black/40 dark:hover:bg-black/60 transition-all text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-white/20 shadow-lg group text-slate-900 dark:text-white">
              <Logout size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
              <span>Return</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-900/10 dark:bg-white/10 mx-2"></div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">{patient.name}</h2>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] mt-1 text-emerald-600 dark:text-blue-200 opacity-80">Real-time Recovery Monitoring</p>
            </div>
          </div>

          {/* Right: Status & Session Pool */}
          <div className="hidden md:flex items-center gap-12 relative z-10">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-blue-300 mb-1">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                <span className="text-xs font-bold font-mono tracking-wider uppercase text-slate-900 dark:text-white">Connected</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-blue-300 mb-1">Session Pool</span>
              <span className="text-2xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white">{history.length} <span className="text-sm font-bold text-emerald-600 dark:text-blue-300">Units</span></span>
            </div>
          </div>

          {/* Header depth effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        </header>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto p-4 lg:p-6 pt-6">
        <div className="max-w-[1800px] mx-auto space-y-8 h-full">

          {/* Patient metrics grid */}
          <div className="flex flex-col gap-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {/* Core analytics cards */}
              <RiskStatusCard history={patientHistory} />
              <OverallRecoveryCard history={patientHistory} />
              <TremorIntensityCard history={patientHistory} />

              <div className="md:col-span-2">
                <WeeklyProgressCard history={patientHistory} />
              </div>
              <HandAccuracyCard history={patientHistory} />
              <SpeechClarityCard history={patientHistory} />

              <div className="lg:col-span-2">
                <RecoveryPredictionCard history={patientHistory} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard: React.FC<DoctorProps> = ({ activeTab, history, connections, onAcceptConnection, darkMode, currentUser, accounts, setView }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const myConnections = connections.filter(c => c.doctorId === currentUser.id);
  const pendingRequests = myConnections.filter(c => c.status === ConnectionStatus.PENDING);
  const authorizedPatients = myConnections.filter(c => c.status === ConnectionStatus.CONNECTED);

  const getPatientName = (pId: string) => {
    return accounts.find(a => a.id === pId)?.name || "Unknown Patient";
  };

  const getPatientAccount = (pId: string) => {
    return accounts.find(a => a.id === pId);
  };

  if (selectedPatientId) {
    const patient = getPatientAccount(selectedPatientId);
    if (patient) return <PatientMonitor patient={patient} history={history} onBack={() => setSelectedPatientId(null)} isDark={darkMode} currentUser={currentUser as any} />;
  }

  const renderRequestsView = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-emerald-600 dark:text-[#48c1cf]">Pending Link Requests</h2>
      {pendingRequests.length === 0 ? (
        <div className="py-20 text-center rounded-[3rem] bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
          <p className="text-slate-400 dark:text-white font-bold uppercase tracking-widest text-xs">No pending handshakes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingRequests.map(req => {
            const patient = getPatientAccount(req.patientId);
            const patientName = patient?.name || "Unknown Patient";
            return (
              <div key={req.id} className="p-8 rounded-[2.5rem] border shadow-lg flex items-center justify-between transition-all bg-white border-slate-200 dark:bg-[#0B1221] dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#48c1cf] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden flex-shrink-0">
                    {patient?.avatarUrl ? (
                      <img src={patient.avatarUrl} alt={patientName} className="w-full h-full object-cover" />
                    ) : (
                      patientName.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white mb-1">Patient Request</p>
                    <p className="text-xl font-black text-[#1a365d] dark:text-white mb-1">{patientName}</p>
                    <p className="text-[8px] font-bold text-slate-400 dark:text-white uppercase tracking-widest opacity-50 dark:opacity-100">ID: {req.patientId}</p>
                  </div>
                </div>
                <button
                  onClick={() => onAcceptConnection(req.id)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg active:scale-95 transition-all"
                >
                  AUTHORIZE LINK
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAuthorizedView = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-emerald-600 dark:text-white">Managed Patient Cohort</h2>
      {authorizedPatients.length === 0 ? (
        <div className="py-20 text-center rounded-[3rem] bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
          <p className="text-slate-400 dark:text-slate-300 font-bold uppercase tracking-widest text-xs">No authorized patients linked yet.</p>
        </div>
      ) : (
        <div className="rounded-[2.5rem] border overflow-hidden shadow-xl bg-white border-slate-200 dark:bg-[#0B1221] dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10">
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-white">Patient Identity</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-white">Patient ID</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-white">Handshake Date</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.4em] text-center text-slate-400 dark:text-white">Clinical Linkage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {authorizedPatients.map((p, i) => {
                  const patient = getPatientAccount(p.patientId);
                  const patientName = patient?.name || "Unknown Patient";
                  return (
                    <tr key={i} className="transition-colors group hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs bg-[#48c1cf]/10 text-[#48c1cf] dark:bg-white/10 dark:text-white overflow-hidden shadow-sm">
                            {patient?.avatarUrl ? (
                              <img src={patient.avatarUrl} alt={patientName} className="w-full h-full object-cover" />
                            ) : (
                              patientName.charAt(0)
                            )}
                          </div>
                          <span className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">{patientName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[10px] clinical-mono font-bold tracking-widest text-slate-400 dark:text-white">{p.patientId}</td>
                      <td className="px-8 py-5 text-xs font-semibold text-slate-400 dark:text-white text-center">{new Date(p.timestamp).toLocaleDateString()}</td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setSelectedPatientId(p.patientId)}
                            className="w-full max-w-[160px] py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:text-white text-[9px] font-[1000] uppercase tracking-widest transition-all shadow-sm hover:shadow-emerald-500/20 hover:scale-105 border border-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            <Activity size={12} />
                            <span>VIEW DASHBOARD</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col transition-colors duration-300 overflow-hidden bg-white text-slate-900 dark:bg-[#0B1121] dark:text-slate-100 dark:bg-[radial-gradient(circle_at_center,_#151e32_0%,_#0B1121_100%)]">
      {/* Background visual accents */}
      <div className="hidden dark:block ambient-blue-glow top-[-20%] left-[20%] opacity-60"></div>
      <div className="hidden dark:block ambient-blue-glow bottom-[-20%] right-[10%] opacity-40"></div>

      <div className="flex-none z-10">
        <header className="flex items-center justify-between py-5 px-10 pr-24 border-b border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-all duration-300 pill-header">
          {/* Left: Branding */}
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border shadow-lg bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-400/20">
              <Activity size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl tracking-tighter uppercase leading-none drop-shadow-md font-[900] text-slate-800 dark:font-[800] dark:text-white">Clinical Command</h1>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] mt-1 opacity-80 text-slate-500 dark:text-emerald-200">Physician's Insight & Analytics</p>
            </div>
          </div>

          {/* Right: Physician Status */}
          <div className="hidden md:flex items-center gap-12 relative z-10">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-widest mb-1 text-slate-400 dark:text-emerald-200/60">System Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                <span className="text-xs font-bold font-mono tracking-wider uppercase text-shadow-sm text-slate-700 dark:text-emerald-300">Online</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest mb-1 text-slate-400 dark:text-emerald-200/60">Authorized Physician</span>
              <span className="text-lg font-black tracking-tight drop-shadow-md text-slate-800 dark:text-white">Dr. {currentUser.name}</span>
            </div>
          </div>

          {/* Visual gradient overlay */}
          <div className="hidden dark:block absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        </header>
      </div>

      <div className="flex-grow overflow-y-auto p-6 pt-6">
        <div className="space-y-12 resolve-ui">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="dashboard-card group border-emerald-500/30 hover:border-emerald-400/60 relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 text-emerald-500/10 dark:text-white/10 pointer-events-none transition-colors duration-300">
                <User size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 relative z-10 text-emerald-600 dark:text-emerald-300">Total Linked Cohort</p>
              <p className="text-4xl font-black relative z-10 drop-shadow-md text-slate-900 dark:text-white">{authorizedPatients.length}</p>
            </div>
            <div className="dashboard-card group border-cyan-500/30 hover:border-cyan-400/60 relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 text-cyan-500/10 dark:text-white/10 pointer-events-none transition-colors duration-300">
                <Activity size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 relative z-10 text-cyan-600 dark:text-cyan-300">Pending Inbound Handshake</p>
              <p className="text-4xl font-black relative z-10 drop-shadow-md text-slate-900 dark:text-white">{pendingRequests.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
            {[
              { id: 'patients', label: 'Patient Cohort', icon: <User size={14} /> },
              { id: 'alerts', label: 'Handshake Queue', icon: <Activity size={14} />, count: pendingRequests.length },
              { id: 'reports', label: 'Clinical Synthesis', icon: <Brain size={14} /> }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const activeClass = isActive
                ? "bg-emerald-600 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] dark:bg-emerald-600/90 dark:text-white dark:border-emerald-500/50 dark:shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-105"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-emerald-500/30 dark:text-slate-400/80 dark:hover:text-white dark:hover:bg-white/5";

              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center gap-3 relative group border ${activeClass}`}
                >
                  {/* Clip Shimmer Effect here instead of parent */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"></div>}
                  </div>

                  {tab.icon}
                  <span className="relative z-10">{tab.label}</span>

                  {/* Badge outside clipped area */}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 z-20 w-5 h-5 bg-cyan-500 rounded-full text-[9px] flex items-center justify-center text-black font-black border-2 shadow-lg border-white dark:border-[#020617] animate-in zoom-in duration-300">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pb-20">
            {activeTab === 'patients' && renderAuthorizedView()}
            {activeTab === 'alerts' && renderRequestsView()}
            {activeTab === 'reports' && (
              <div className="p-10 rounded-[3rem] border shadow-xl animate-in fade-in duration-300 bg-white border-slate-200 dark:bg-[#0B1221] dark:border-white/10">
                <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter text-[#1a365d] dark:text-white">Cohort Statistical Synthesis</h2>
                <p className="text-sm font-medium leading-relaxed italic border-l-4 border-[#48c1cf] pl-6 py-2 text-slate-500 dark:text-white">
                  Aggregate reports for linked patients will appear here after kinematic data sync. System is currently analyzing 3 active recovery vectors.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
