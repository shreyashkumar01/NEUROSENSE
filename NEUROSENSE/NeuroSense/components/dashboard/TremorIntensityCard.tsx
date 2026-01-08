import { Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { SessionResult, TherapyType } from '../../types';

interface TremorIntensityCardProps {
  history: SessionResult[];
}

const TremorIntensityCard: React.FC<TremorIntensityCardProps> = ({ history }) => {
  const tremorHistory = history
    .filter(h => h.type === TherapyType.BODY)
    .slice(-10)
    .map((h, i) => ({ x: i + 1, y: 100 - h.score })); // Invert: better score means lower tremor

  const currentIntensity = tremorHistory.length > 0 ? tremorHistory[tremorHistory.length - 1].y : 0;

  return (
    <div className="dashboard-card card-emerald">
      <div className="dashboard-card-header">
        <Activity className="w-4 h-4" />
        <span>Tremor Intensity</span>
      </div>

      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={tremorHistory.length > 0 ? tremorHistory : [{ x: 0, y: 0 }]} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="tremorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, 100]} />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#tremorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-[10px] text-muted-foreground mt-1">
        Current Stability: <span className="text-foreground font-bold">{100 - currentIntensity}%</span>
      </div>
    </div>
  );
};

export default TremorIntensityCard;
