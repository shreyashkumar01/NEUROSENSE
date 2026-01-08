
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { azureSpeechService } from '../services/azure-speech.service';
import { getDailyWords, getDailyProgress, updateDailyProgress } from '../data/speech-dictionary';

interface SpeechTherapyProps {
  onComplete: (score: number, feedback: string) => void;
  onAbort: () => void;
  darkMode: boolean;
  mode?: 'articulation' | 'speak-score';
}

const SpeechTherapy: React.FC<SpeechTherapyProps> = ({ onComplete, onAbort, darkMode, mode = 'articulation' }) => {
  const isSpeakScore = mode === 'speak-score';
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sessionId] = useState(() => `SES-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isDark = darkMode;

  // Speak & Score Specific State
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<any[]>([]);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [hasBegun, setHasBegun] = useState(false);

  const defaultPhrase = "Neural rehabilitation requires consistent articulation practice";
  const targetPhrase = isSpeakScore ? (words[currentIndex] || "Loading...") : defaultPhrase;
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isSpeakScore) {
      const progress = getDailyProgress();
      if (progress >= 10) {
        setDailyCompleted(true);
      } else {
        const dailyWords = getDailyWords();
        setWords(dailyWords);
        setCurrentIndex(progress);
      }
    }
  }, [isSpeakScore]);

  // Auto-Start Flow when word changes or game begins
  useEffect(() => {
    if (hasBegun && targetPhrase && !result && !loading && !isRecording) {
      const timer = setTimeout(() => {
        speakAndStart();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, hasBegun, result]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakAndStart = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetPhrase);
    utterance.rate = 0.85; // Slightly slower for better clarity
    utterance.onend = () => {
      // Add a safety delay so the app doesn't hear itself
      setTimeout(() => {
        if (!dailyCompleted && hasBegun) {
          startCapture();
        }
      }, 1200);
    };
    window.speechSynthesis.speak(utterance);
  };

  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        setLoading(true);
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
          const analysisResult = await azureSpeechService.analyzeSpeech(audioBlob, targetPhrase);

          const processedResult = {
            clarityScore: analysisResult.clarityScore,
            accuracyScore: analysisResult.pronunciationScore,
            word: targetPhrase,
            feedback: analysisResult.accuracyScore === 0
              ? "No valid speech detected. Please speak clearly into the microphone."
              : (analysisResult.clarityScore > 75 ? "Professional articulation detected." : "Precision below threshold. Focus on phonemes.")
          };

          setResult(processedResult);
          if (isSpeakScore) {
            setSessionResults(prev => [...prev, processedResult]);
            // Auto-advance after 4 seconds
            setTimeout(() => nextWord(analysisResult.accuracyScore), 4000);
          }
        } catch (err) {
          console.error('Speech analysis failure:', err);
        } finally {
          setLoading(false);
          setIsRecording(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Auto-stop after 5 seconds of listening
      recordingTimeoutRef.current = setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
          }
        }
      }, 5000);

    } catch (err) {
      alert("Microphone node authorization required.");
    }
  };

  const stopRecordingManually = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    }
  };

  const nextWord = (lastScore?: number) => {
    const nextIdx = currentIndex + 1;
    if (isSpeakScore) {
      updateDailyProgress(nextIdx);
    }

    if (nextIdx < 10 && (isSpeakScore || mode === 'articulation')) {
      setCurrentIndex(nextIdx);
      setResult(null);
    } else {
      const avgAccuracy = isSpeakScore
        ? Math.round(sessionResults.reduce((acc, curr) => acc + curr.accuracyScore, 0) / sessionResults.length)
        : (lastScore || 0);
      onComplete(avgAccuracy, isSpeakScore ? "All 10 daily words processed. Training quota complete." : "Articulatory drill finalized.");
    }
  };

  if (dailyCompleted) {
    return (
      <div className={`fixed inset-0 z-[100] p-8 h-screen flex flex-col items-center justify-center transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#f8fdfe] text-[#1a365d]'}`}>
        <div className="text-center max-w-md bg-emerald-500/10 p-12 rounded-[3.5rem] border border-emerald-500/20 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30">
            <Icons.Activity className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Quota Complete</h2>
          <p className="text-slate-500 font-medium mb-12">Authorized medical limit reached: 10/10 words processed for today.</p>
          <button
            onClick={onAbort}
            className="w-full py-6 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all"
          >
            EXIT TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] p-8 h-screen flex flex-col overflow-y-auto resolve-ui transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#f8fdfe] text-[#1a365d]'}`}>
      <header className={`flex justify-between items-center mb-12 border-b pb-8 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="flex items-center gap-6">
          <button
            onClick={onAbort}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
          >
            <Icons.Back size={18} />
            Abort Protocol
          </button>
          <div className={`h-8 w-[1px] ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1">{isSpeakScore ? 'Speak & Score (V3)' : 'Articulatory Precision'}</h1>
            <p className="text-slate-500 clinical-mono text-[9px] uppercase tracking-[0.3em] font-bold">STATE: {isRecording ? 'CAPTURING AUDIO' : 'IDLE'}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-8">
          {isSpeakScore && (
            <div className="text-right">
              <p className="text-[10px] font-black text-[#BEF264] uppercase tracking-widest mb-1">Daily Words</p>
              <p className={`clinical-mono text-sm font-bold ${isDark ? 'text-white/40' : 'text-slate-300'}`}>{currentIndex + 1} / 10</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-black text-[#48c1cf] uppercase tracking-widest mb-1">Session ID</p>
            <p className={`clinical-mono text-sm font-bold ${isDark ? 'text-white/40' : 'text-slate-300'}`}>{sessionId}</p>
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center space-y-12 pb-20">
        {!hasBegun && (
          <div className="text-center">
            <h2 className="text-5xl font-black mb-8 tracking-tighter">Ready for Daily Quota?</h2>
            <button
              onClick={() => setHasBegun(true)}
              className="px-12 py-6 bg-[#48c1cf] text-white rounded-3xl font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:scale-105 transition-all"
            >
              INITIALIZE AUTO-GAME
            </button>
          </div>
        )}

        {hasBegun && !result && (
          <div className="text-center max-w-2xl animate-in fade-in duration-500">
            <p className="text-[#48c1cf] text-[10px] font-black uppercase tracking-[0.4em] mb-6">Listen & Repeat</p>
            <h2 className={`text-6xl lg:text-7xl font-black leading-tight tracking-tighter mb-10 ${isDark ? 'text-white' : 'text-[#1a365d]'}`}>
              "{targetPhrase}"
            </h2>
            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center justify-center gap-6">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{isRecording ? 'System Listening...' : 'Synthesizing Audio...'}</span>
              </div>

              {isRecording && (
                <button
                  onClick={stopRecordingManually}
                  className="px-8 py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-600 hover:text-white transition-all animate-in slide-in-from-bottom-4"
                >
                  STOP RECORDING NOW
                </button>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-10 h-10 border-4 border-[#48c1cf] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#48c1cf] font-black text-[10px] tracking-[0.5em] uppercase">Validating Voice Quality...</p>
          </div>
        )}

        {result && (
          <div className={`w-full max-w-2xl p-12 rounded-[3.5rem] animate-in zoom-in-95 duration-500 shadow-2xl border ${isDark ? 'bg-[#050505] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#48c1cf] mb-2">Clarity Feedback</p>
                <p className={`text-5xl font-black ${result.accuracyScore === 0 ? 'text-rose-500' : ''}`}>{result.clarityScore}%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">Articular Accuracy</p>
                <p className={`text-5xl font-black ${result.accuracyScore === 0 ? 'text-rose-500' : ''}`}>{result.accuracyScore}%</p>
              </div>
            </div>

            <p className="text-center italic text-slate-500 mb-8 font-medium">"{result.feedback}"</p>
            <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#BEF264] animate-progress-fast"></div>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-center mt-4 text-slate-400">Auto-advancing to next block...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechTherapy;
