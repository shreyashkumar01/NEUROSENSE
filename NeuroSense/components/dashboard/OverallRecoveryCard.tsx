import { Activity } from 'lucide-react';
import { SessionResult } from '../../types';

interface OverallRecoveryCardProps {
  history: SessionResult[];
}

const OverallRecoveryCard: React.FC<OverallRecoveryCardProps> = ({ history }) => {
  const score = history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)
    : 0;

  const getStatus = (s: number) => {
    if (s >= 80) return { label: 'Excellent', color: 'text-status-good' };
    if (s >= 60) return { label: 'Good', color: 'text-status-good' };
    if (s >= 40) return { label: 'Fair', color: 'text-status-warning' };
    return { label: 'Critical', color: 'text-status-critical' };
  };

  const status = getStatus(score);

  return (
    <div className="dashboard-card card-cyan">
      <div className="dashboard-card-header">
        <Activity className="w-4 h-4" />
        <span>Overall Recovery</span>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative w-28 h-28">
          {/* Gauge background */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background arc */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(220 50% 20%)"
              strokeWidth="12"
              strokeDasharray="198 66"
              strokeLinecap="round"
            />
            {/* Gradient arc */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(0 84% 60%)" />
                <stop offset="33%" stopColor="hsl(38 92% 50%)" />
                <stop offset="66%" stopColor="hsl(48 96% 53%)" />
                <stop offset="100%" stopColor="hsl(142 71% 45%)" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeDasharray={`${(score / 100) * 198} ${264 - (score / 100) * 198}`}
              strokeLinecap="round"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{score}</span>
            <span className={`text-[10px] font-medium uppercase tracking-widest ${status.color}`}>{status.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallRecoveryCard;
