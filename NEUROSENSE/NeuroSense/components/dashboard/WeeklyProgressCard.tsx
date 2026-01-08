import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { SessionResult } from '../../types';

interface WeeklyProgressCardProps {
  history: SessionResult[];
}

const WeeklyProgressCard: React.FC<WeeklyProgressCardProps> = ({ history }) => {
  const chartData = [...history]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(entry => ({
      date: new Date(entry.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
      value: entry.score
    }));

  return (
    <div className="dashboard-card col-span-2 card-blue">
      <div className="dashboard-card-header">
        <TrendingUp className="w-4 h-4" />
        <span>Weekly Progress</span>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 10 }}
            />
            <YAxis hide domain={[0, 100]} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#progressGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyProgressCard;
