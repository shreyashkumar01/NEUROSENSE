
import React, { useRef, useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { azureVisionService } from '../services/azure-vision.service';
import { azureHelpers } from '../utils/azure-helpers';

const BodyTherapy: React.FC<{ onComplete: (score: number, feedback: string) => void; darkMode: boolean }> = ({ onComplete, darkMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isPhaseComplete, setIsPhaseComplete] = useState(false);
  const [sessionId] = useState(() => `BIO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
  const isDark = darkMode;

  useEffect(() => {
    let interval: any;
    if (timer > 0 && !feedback && !loading) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsPhaseComplete(true);
    }
    return () => clearInterval(interval);
  }, [timer, feedback, loading]);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function setupCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          currentStream = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Camera access denied");
        }
      }
    }
    setupCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);

    try {
      // 1. Capture current frame from video node
      const context = canvasRef.current.getContext('2d');
      if (context && videoRef.current) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      // 2. Prepare data for Azure AI Hub
      const imageBlob = await azureHelpers.canvasToBlob(canvasRef.current);

      // 3. Initiate Azure Kinematic Telemetry
      const result = await azureVisionService.analyzePose(imageBlob);

      // 4. Map Azure AI outputs to Clinical UI
      setFeedback({
        score: result.stability,
        feedback: result.stability > 70
          ? "Kinetic stability verified. Motion pathways aligned with clinical baseline."
          : "Subtle motor fluctuation detected. Correlating with bilateral tremor parameters.",
        asymmetryDetected: result.tremor > 20
      });
    } catch (err) {
      console.error('Kinematic analysis failure:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] p-8 h-screen flex flex-col resolve-ui overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#f8fdfe] text-[#1a365d]'}`}>
      <header className={`flex justify-between items-center mb-10 border-b pb-8 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="flex items-center gap-6">
          <button
            onClick={() => onComplete(0, "Protocol terminated.")}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5m7 7-7-7 7-7" /></svg>
            Abort Protocol
          </button>
          <div className={`h-8 w-[1px] ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1">Kinematic Telemetry</h1>
            <p className="text-slate-500 clinical-mono text-[9px] font-bold uppercase tracking-[0.3em]">SENSOR: NS-MOTOR-HD</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-[#48c1cf] uppercase tracking-widest mb-1">Session ID</p>
          <p className={`clinical-mono text-sm font-bold ${isDark ? 'text-white/40' : 'text-slate-300'}`}>{sessionId}</p>
        </div>
      </header>

      <div className="relative flex-grow min-h-[400px] group">
        <div className={`absolute inset-0 rounded-[3.5rem] overflow-hidden shadow-2xl border transition-colors duration-300 ${isDark ? 'bg-[#050505] border-white/10' : 'bg-white border-slate-200'}`}>
          <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-contain mirror transition-opacity duration-700 ${isDark ? 'opacity-70' : 'opacity-90'}`} />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/5 rounded-[4rem] pointer-events-none">
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[#48c1cf] rounded-tl-3xl"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-[#48c1cf] rounded-tr-3xl"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-[#48c1cf] rounded-bl-3xl"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[#48c1cf] rounded-br-3xl"></div>
          </div>

          {loading && (
            <div className={`absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center z-50 ${isDark ? 'bg-black/90' : 'bg-white/80'}`}>
              <div className="w-14 h-14 border-4 border-[#48c1cf] border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-[10px] font-black tracking-[0.5em] uppercase text-[#48c1cf] animate-pulse">Analyzing Bio-Mesh Dynamics...</p>
            </div>
          )}

          {!isPhaseComplete && !feedback && (
            <div className="absolute top-8 right-8 z-[60]">
              <div className={`px-6 py-4 rounded-[2rem] border backdrop-blur-xl flex items-center gap-4 ${isDark ? 'bg-black/50 border-white/10' : 'bg-white/50 border-slate-200'}`}>
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-white/5" />
                    <circle cx="20" cy="20" r="18" fill="none" stroke="#48c1cf" strokeWidth="3" strokeDasharray={113} strokeDashoffset={113 - (113 * (30 - timer)) / 30} className="transition-all duration-300" />
                  </svg>
                  <span className="text-xs font-black clinical-mono">{timer}</span>
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#48c1cf]">Activity Phase</p>
                  <p className="text-[10px] font-bold opacity-60">Maintain steady motion</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {feedback && (
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-lg backdrop-blur-xl p-8 rounded-[2.5rem] animate-in slide-in-from-bottom-8 duration-700 shadow-2xl border z-[60] ${isDark ? 'bg-black/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Stability Confirmed</span>
              </div>
              <div className={`px-6 py-2 rounded-2xl font-black text-2xl tracking-tighter ${isDark ? 'bg-white text-black' : 'bg-[#1a365d] text-white'}`}>{feedback.score}%</div>
            </div>

            <p className={`text-lg font-medium leading-relaxed mb-8 italic ${isDark ? 'text-slate-100' : 'text-[#1a365d]'}`}>"{feedback.feedback}"</p>

            <button
              onClick={() => onComplete(feedback.score, feedback.feedback)}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl active:scale-[0.98] transition-all shimmer ${isDark ? 'bg-white text-black' : 'bg-[#48c1cf] text-white'}`}
            >
              COMMIT KINEMATIC DATA
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-8 pb-10">
        <button
          onClick={captureAndAnalyze}
          disabled={loading || !isPhaseComplete}
          className={`relative w-28 h-28 rounded-full border-8 flex items-center justify-center shadow-2xl active:scale-[0.85] transition-all group ${!isPhaseComplete ? 'opacity-30 grayscale cursor-not-allowed' : ''
            } ${isDark ? 'bg-white border-white/10 text-black' : 'bg-[#1a365d] border-[#48c1cf]/20 text-white'}`}
        >
          <div className={`w-10 h-10 border-[5px] rounded-xl group-hover:scale-110 transition-transform ${isDark ? 'border-black' : 'border-[#48c1cf]'}`}></div>
          {!loading && !feedback && isPhaseComplete && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.3em] text-[#48c1cf] animate-bounce">Initiate Capture Sequence</div>
          )}
          {!isPhaseComplete && !feedback && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Activity Phase: {timer}s Required</div>
          )}
        </button>
        <canvas ref={canvasRef} width="400" height="300" className="hidden" />
      </div>
    </div>
  );
};

export default BodyTherapy;
