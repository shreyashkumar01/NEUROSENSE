
import React, { useState, useMemo } from 'react';
import { UserAccount, Connection, ConnectionStatus, DoctorProfile, UserRole } from '../types';
import ChatSystem from '../components/ChatSystem';
import { Icons } from '../components/Icons';
import { dataService } from '../services/supabase.service';

interface DoctorChatViewProps {
    profile: DoctorProfile;
    connections: Connection[];
    accounts: UserAccount[];
    darkMode: boolean;
}

const DoctorChatView: React.FC<DoctorChatViewProps> = ({ profile, connections, accounts, darkMode }) => {
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [chatPreviews, setChatPreviews] = useState<Record<string, { lastMessage: string, timestamp: string, unreadCount: number }>>({});

    const connectedPatients = useMemo(() => {
        const connectedIds = connections
            .filter(c => c.status === ConnectionStatus.CONNECTED && c.doctorId === profile.id)
            .map(c => c.patientId);

        return accounts.filter(a => a.role === UserRole.PATIENT && connectedIds.includes(a.id));
    }, [connections, accounts, profile.id]);

    const fetchPreviews = async () => {
        const previews: Record<string, any> = {};
        for (const patient of connectedPatients) {
            try {
                const preview = await dataService.getChatPreview(profile.id, patient.id);
                if (preview) {
                    previews[patient.id] = preview;
                }
            } catch (err) {
                console.error(`Failed to fetch preview for ${patient.id}:`, err);
            }
        }
        setChatPreviews(previews);
    };

    React.useEffect(() => {
        fetchPreviews();
        const interval = setInterval(fetchPreviews, 5000);
        return () => clearInterval(interval);
    }, [connectedPatients]);

    const selectedPatient = useMemo(() =>
        connectedPatients.find(p => p.id === selectedPatientId),
        [connectedPatients, selectedPatientId]);

    return (
        <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Sidebar: Patient List */}
            <aside className={`w-full lg:w-80 flex-shrink-0 flex flex-col rounded-[2.5rem] border overflow-hidden transition-all duration-300 ${darkMode ? 'bg-[#050505] border-white/10' : 'bg-white border-slate-100 shadow-xl'
                }`}>
                <div className="p-8 border-b border-transparent dark:border-white/5">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500 mb-2 font-mono">Patient Cohort</h2>
                    <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">Medical Comms</p>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {connectedPatients.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                                <Icons.User size={32} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">
                                No active clinical handshakes found.
                            </p>
                        </div>
                    ) : (
                        connectedPatients.map(patient => {
                            const preview = chatPreviews[patient.id];
                            return (
                                <button
                                    key={patient.id}
                                    onClick={() => setSelectedPatientId(patient.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 group relative ${selectedPatientId === patient.id
                                        ? 'bg-emerald-600 text-white shadow-lg'
                                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-white'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md overflow-hidden flex-shrink-0 ${selectedPatientId === patient.id ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'
                                        }`}>
                                        {patient.avatarUrl ? (
                                            <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
                                        ) : (
                                            patient.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="text-left flex-grow truncate">
                                        <div className="flex items-center justify-between">
                                            <p className="font-black text-sm tracking-tight leading-none truncate">{patient.name}</p>
                                            {preview?.timestamp && (
                                                <span className={`text-[7px] font-bold opacity-50 ${selectedPatientId === patient.id ? 'text-white' : 'text-slate-400'}`}>
                                                    {new Date(preview.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className={`text-[9px] font-medium truncate flex-grow ${selectedPatientId === patient.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                {preview?.lastMessage || `No messages yet`}
                                            </p>
                                            {preview && preview.unreadCount > 0 && selectedPatientId !== patient.id && (
                                                <div className="flex-shrink-0 min-w-[18px] h-[18px] bg-rose-500 rounded-full flex items-center justify-center px-1 shadow-md ml-2 transition-all">
                                                    <span className="text-[8px] font-black text-white leading-none">{preview.unreadCount}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedPatientId === patient.id && (
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0"></div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* Main: Chat Window */}
            <main className="flex-grow min-w-0">
                {selectedPatient ? (
                    <div className="h-full">
                        <ChatSystem
                            currentUser={profile as any}
                            otherUser={selectedPatient}
                            darkMode={darkMode}
                        />
                    </div>
                ) : (
                    <div className={`h-full flex flex-col items-center justify-center text-center rounded-[3rem] border-2 border-dashed transition-all duration-300 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-inner'
                        }`}>
                        <div className="w-24 h-24 bg-white dark:bg-[#050505] rounded-[2.5rem] flex items-center justify-center text-emerald-500 shadow-2xl mb-8 transition-all">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-4">Patient Communication Portal</h3>
                        <p className="max-w-md text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-10">
                            Select a patient from your managed cohort to initialize a secure clinical communication channel.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DoctorChatView;
