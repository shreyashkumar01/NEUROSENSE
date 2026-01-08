import { Mic } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { SessionResult, TherapyType } from '../../types';

interface SpeechClarityCardProps {
  history: SessionResult[];
}

const SpeechClarityCard: React.FC<SpeechClarityCardProps> = ({ history }) => {
  const speechHistory = history
    .filter(h => h.type === TherapyType.SPEECH)
    .slice(-10)
    .map((h, i) => ({ x: i + 1, y: h.score }));

  const currentClarity = speechHistory.length > 0 ? speechHistory[speechHistory.length - 1].y : 0;

  return (
    <div className="dashboard-card card-indigo">
      <div className="dashboard-card-header">
        <Mic className="w-4 h-4" />
        <span>Speech Clarity</span>
      </div>

      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={speechHistory.length > 0 ? speechHistory : [{ x: 0, y: 0 }]} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="speechGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, 100]} />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#speechGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-[10px] text-muted-foreground mt-1">
        Current: <span className="text-foreground font-bold">{currentClarity}%</span>
      </div>
    </div>
  );
};

export default SpeechClarityCard;
