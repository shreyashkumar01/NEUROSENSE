import { Hand } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { SessionResult, TherapyType } from '../../types';

interface HandAccuracyCardProps {
  history: SessionResult[];
}

const HandAccuracyCard: React.FC<HandAccuracyCardProps> = ({ history }) => {
  const bodyHistory = history
    .filter(h => h.type === TherapyType.BODY)
    .slice(-10)
    .map((h, i) => ({ x: i + 1, y: h.score }));

  const currentScore = bodyHistory.length > 0 ? bodyHistory[bodyHistory.length - 1].y : 0;

  return (
    <div className="dashboard-card card-amber">
      <div className="dashboard-card-header">
        <Hand className="w-4 h-4" />
        <span>Hand Accuracy</span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">Latest Bio-Metric</span>
          <span className="text-lg font-black">{currentScore}%</span>
        </div>

        <div className="h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bodyHistory.length > 0 ? bodyHistory : [{ x: 0, y: 0 }]} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <YAxis hide domain={[0, 100]} />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 3 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-right text-[8px] font-bold text-muted-foreground mt-2 uppercase tracking-[0.2em]">Kinematic Sync Active</div>
    </div>
  );
};

export default HandAccuracyCard;
