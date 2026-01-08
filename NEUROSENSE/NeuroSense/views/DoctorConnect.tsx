
import React from 'react';
import { DoctorProfile, Connection, ConnectionStatus } from '../types';
import { Icons } from '../components/Icons';

interface DoctorConnectProps {
  doctors: DoctorProfile[];
  connections: Connection[];
  onRequest: (doctorId: string) => void;
  patientId: string;
}

const DoctorConnect: React.FC<DoctorConnectProps> = ({ doctors, connections, onRequest, patientId }) => {
  const getConnectionStatus = (doctorId: string) => {
    return connections.find(c => c.doctorId === doctorId && c.patientId === patientId);
  };


  return (
    <div className="space-y-12 resolve-ui">
      <header>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-6 bg-[#48c1cf] rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#48c1cf]">Physician Registry</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight mb-2 text-[#1a365d] dark:text-white">Clinical Directory</h1>
        <p className="text-slate-500 text-lg">Initialize a secure telemetry link with an authorized neuro-specialist.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-medical rounded-[3rem]">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No authorized physicians currently online.</p>
          </div>
        ) : (
          doctors.map((dr) => {
            const status = getConnectionStatus(dr.id);
            return (
              <div key={dr.id} className="bg-white dark:bg-[#050505] p-10 rounded-[3rem] border border-white/5 shadow-lg group hover:border-[#48c1cf] transition-all flex flex-col relative overflow-hidden">

                <div className="flex items-center gap-6 mb-8">
                  {/* Dynamic Avatar */}
                  <div className="flex-shrink-0 w-20 h-20 bg-[#f0f7f8] dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#48c1cf] border border-white/10 group-hover:bg-[#48c1cf] group-hover:text-white transition-all overflow-hidden relative">
                    {dr.avatarUrl ? (
                      <img src={dr.avatarUrl} alt={dr.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black">{dr.name.charAt(0)}</span>
                    )}
                  </div>

                  {/* Name & Badge */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-black text-[#1a365d] dark:text-white tracking-tighter leading-none">{dr.name}</h3>
                      {dr.isVerified && (
                        <div className="flex-shrink-0 animate-in zoom-in-50 duration-300 text-[#1DA1F2]" title="Verified Physician">
                          <Icons.Verified size={20} />
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Neuro-Specialist</p>
                  </div>
                </div>

                <div className="w-full pt-8 border-t border-white/5 mt-auto">
                  {status?.status === ConnectionStatus.CONNECTED ? (
                    <div className="w-full py-5 bg-emerald-500/10 text-emerald-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-center border border-emerald-500/20">
                      TELEMETRY LINK ACTIVE
                    </div>
                  ) : status?.status === ConnectionStatus.PENDING ? (
                    <div className="w-full py-5 bg-amber-500/10 text-amber-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-center border border-amber-500/20">
                      HANDSHAKE PENDING
                    </div>
                  ) : (
                    <button
                      onClick={() => onRequest(dr.id)}
                      className="w-full py-5 bg-[#48c1cf] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg active:scale-95 transition-all hover:brightness-110 shimmer"
                    >
                      ESTABLISH BIO-LINK
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DoctorConnect;
