
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';

const BrainGames: React.FC<{ onComplete: (score: number) => void; darkMode: boolean; mode?: string }> = ({ onComplete, darkMode, mode = 'Memory Game' }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'IDLE' | 'SHOWING' | 'USER_TURN' | 'GAMEOVER'>('IDLE');
  const [sessionTime, setSessionTime] = useState(0);

  // Stroop Mode States
  const [stroopWord, setStroopWord] = useState("");
  const [stroopColorId, setStroopColorId] = useState(0);
  const [roundCount, setRoundCount] = useState(0);

  // Quick Tap States
  const [targetId, setTargetId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const isMemory = mode === 'Memory Game';
  const isStroop = mode === 'Mental Focus';
  const isQuickTap = mode === 'Quick Tap';

  const colorLabels = ["RED", "BLUE", "GREEN", "YELLOW"];
  const colorClasses = ["bg-rose-600", "bg-blue-600", "bg-emerald-600", "bg-amber-500"];
  const textColors = ["text-rose-500", "text-blue-500", "text-emerald-500", "text-amber-500"];

  useEffect(() => {
    let interval: any;
    if (gameState !== 'IDLE' && gameState !== 'GAMEOVER') {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
        if (isQuickTap && gameState === 'USER_TURN') {
          setTimeLeft(prev => {
            if (prev <= 0.1) {
              setGameState('GAMEOVER');
              return 0;
            }
            return prev - 0.1;
          });
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, isQuickTap]);

  const startNewGame = () => {
    setScore(0);
    setRoundCount(0);
    setSessionTime(0);
    if (isMemory) {
      const first = Math.floor(Math.random() * 4);
      setSequence([first]);
      setGameState('SHOWING');
      playSequence([first]);
    } else if (isStroop) {
      startStroopRound();
    } else if (isQuickTap) {
      setGameState('USER_TURN');
      setScore(0);
      setTimeLeft(15.0); // 15 seconds total
    }
  };

  const spawnTarget = () => {
    const nextTarget = Math.floor(Math.random() * 4);
    setTargetId(nextTarget);
    setActiveButton(nextTarget);
  };

  const startStroopRound = () => {
    setGameState('USER_TURN');
    const colorId = Math.floor(Math.random() * 4);
    const wordId = Math.floor(Math.random() * 4);
    setStroopColorId(colorId);
    setStroopWord(colorLabels[wordId]);
    setActiveButton(null);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true);
    setGameState('SHOWING');
    for (const num of seq) {
      setActiveButton(num);
      await new Promise(r => setTimeout(r, 600));
      setActiveButton(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsPlaying(false);
    setUserSequence([]);
    setGameState('USER_TURN');
  };

  const handleInput = (id: number) => {
    if (gameState !== 'USER_TURN') return;

    if (isMemory) {
      const nextUserSeq = [...userSequence, id];
      setUserSequence(nextUserSeq);

      if (id !== sequence[nextUserSeq.length - 1]) {
        setGameState('GAMEOVER');
        return;
      }

      if (nextUserSeq.length === sequence.length) {
        setScore(score + 1);
        const nextSequence = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSequence);
        setTimeout(() => playSequence(nextSequence), 1000);
      }
    } else if (isStroop) {
      if (id === stroopColorId) {
        const nextScore = score + 10;
        const nextRound = roundCount + 1;
        setScore(nextScore);
        setRoundCount(nextRound);

        if (nextRound >= 10) {
          setGameState('GAMEOVER');
        } else {
          startStroopRound();
        }
      } else {
        setGameState('GAMEOVER');
      }
    } else if (isQuickTap) {
      setScore(prev => prev + 1);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] p-6 h-screen flex flex-col resolve-ui overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-[#020617] text-white' : 'bg-[#f8fdfe] text-[#1a365d]'}`}>
      <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onComplete(0)}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
          >
            <Icons.Back />
            Exit Drill
          </button>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1">{mode}</h1>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Protocol: {isMemory ? 'NS-COG-BRAVO' : isQuickTap ? 'NS-COG-REFLEX' : 'NS-COG-STROOP'}</p>
          </div>
        </div>
        <div className="flex gap-12 text-right">
          <div>
            <span className="block text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">{isQuickTap ? 'Time Remaining' : 'Session time'}</span>
            <span className={`text-4xl font-black tracking-tighter ${isQuickTap && timeLeft < 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
              {isQuickTap ? timeLeft.toFixed(1) : `00:${sessionTime < 10 ? `0${sessionTime}` : sessionTime}`}
            </span>
          </div>
          <div>
            <span className="block text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">{isMemory ? 'Complexity' : 'Focus Score'}</span>
            <span className="text-4xl font-black text-blue-500 tracking-tighter">
              {isMemory ? score + 1 : score}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col justify-center items-center py-4">
        {isQuickTap && gameState === 'USER_TURN' && (
          <div className="mb-12 text-center animate-in fade-in zoom-in duration-300">
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#48c1cf] mb-2">Frequency Test Active</p>
            <h2 className="text-4xl font-[950] tracking-tighter">TAP AS FAST AS POSSIBLE</h2>
          </div>
        )}

        <div className={`w-full max-w-sm ${isQuickTap ? 'flex justify-center' : 'grid grid-cols-2 gap-4 sm:gap-8'}`}>
          {isQuickTap ? (
            <button
              onClick={() => handleInput(0)}
              disabled={gameState !== 'USER_TURN'}
              className={`w-64 h-64 rounded-full transition-all duration-75 transform active:scale-90 shadow-[0_0_50px_rgba(72,193,207,0.3)] border-8 border-white group flex flex-col items-center justify-center bg-gradient-to-br from-[#48c1cf] to-[#1a365d] ${gameState !== 'USER_TURN' ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:brightness-110'
                }`}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-active:scale-125 transition-transform duration-75">
                <Icons.Activity className="text-white" size={32} />
              </div>
              <span className="text-white font-[1000] text-xl tracking-tighter uppercase mb-2">TAP HERE</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </button>
          ) : (
            [0, 1, 2, 3].map((id) => (
              <button
                key={id}
                onClick={() => handleInput(id)}
                disabled={gameState !== 'USER_TURN'}
                className={`aspect-square rounded-[2rem] sm:rounded-[3rem] transition-all duration-300 transform active:scale-95 shadow-2xl border-4 ${activeButton === id ? 'scale-105 brightness-150 ring-8 ring-white/20 border-white' : 'border-white/5 opacity-40 grayscale-[0.5]'
                  } ${colorClasses[id]}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{colorLabels[id]}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-12 text-center w-full max-w-md">
          {gameState === 'IDLE' && (
            <button
              onClick={startNewGame}
              className="bg-blue-600 text-white px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:scale-105 transition-all active:scale-95 border-b-4 border-blue-800"
            >
              Initialize Assessment
            </button>
          )}

          {gameState === 'SHOWING' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping mb-2"></div>
              <p className="font-black text-xs tracking-[0.5em] uppercase text-blue-500">
                {isMemory ? 'Observing Pattern Sequence...' : 'Intake Phase Active...'}
              </p>
            </div>
          )}

          {gameState === 'USER_TURN' && (
            <div className="flex flex-col items-center gap-4">
              {isStroop ? (
                <div className="mb-8 text-center animate-in zoom-in-50 duration-300">
                  <p className="text-[10px] font-black tracking-[0.5em] uppercase text-slate-500 mb-4">Identify Ink Color</p>
                  <h2 className={`text-7xl font-[950] tracking-tighter ${textColors[stroopColorId]}`}>
                    {stroopWord}
                  </h2>
                </div>
              ) : isMemory ? (
                <p className="font-black text-xs tracking-[0.5em] uppercase text-emerald-500">Replication Phase Active</p>
              ) : null}
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="animate-in zoom-in-95 duration-300 glass-medical p-8 rounded-[3rem] border border-white/10 shadow-2xl w-full">
              <p className="text-rose-500 font-black text-2xl mb-2 tracking-tighter">Drill Concluded</p>
              <p className="text-slate-400 font-medium mb-6 text-sm leading-relaxed">
                {isMemory ? 'Neural sequence mismatch detected.' : isQuickTap ? 'Reflex window closed.' : 'Cognitive interference limit reached.'} Clinical metrics finalized.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => onComplete(isMemory ? Math.min(score * 10, 100) : Math.min(score, 100))} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl">Finalize & Exit</button>
                <button onClick={startNewGame} className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white/10 transition-colors">Repeat Protocol</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainGames;
