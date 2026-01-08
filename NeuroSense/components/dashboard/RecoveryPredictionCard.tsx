import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { SessionResult } from '../../types';

interface RecoveryPredictionCardProps {
  history: SessionResult[];
}

const RecoveryPredictionCard: React.FC<RecoveryPredictionCardProps> = ({ history }) => {
  const latestHistory = history.slice(-5).map((h, i) => ({
    x: `S${i + 1}`,
    value: h.score,
    isPredicted: false
  }));

  // Simple linear prediction
  const nextValue = latestHistory.length > 1
    ? Math.min(100, latestHistory[latestHistory.length - 1].value + (latestHistory[latestHistory.length - 1].value - latestHistory[0].value) / latestHistory.length)
    : latestHistory.length === 1 ? latestHistory[0].value : 0;

  const chartData = [...latestHistory, { x: 'Next', value: Math.round(nextValue), isPredicted: true }];

  const isPositiveTrend = latestHistory.length > 1 && latestHistory[latestHistory.length - 1].value >= latestHistory[0].value;

  return (
    <div className="dashboard-card h-full flex flex-col card-jade">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="dashboard-card-header mb-0">
          <TrendingUp className="w-4 h-4" />
          <span>Recovery Prediction</span>
        </div>
        {history.length > 1 && (
          <div className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${isPositiveTrend ? 'bg-jade-500/10 text-[#00d97e] border-[#00d97e]/20' : 'bg-status-warning/10 text-status-warning border-status-warning/20'}`}>
            {isPositiveTrend ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
            <span>{isPositiveTrend ? 'Optimal Path' : 'Slow Growth'}</span>
          </div>
        )}
      </div>

      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="recoveryGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00d97e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="x"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}
            />
            <YAxis hide domain={[0, 100]} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#recoveryGradient)"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.isPredicted) {
                  return <circle cx={cx} cy={cy} r={5} fill="#00d97e" stroke="white" strokeWidth={2} className="animate-pulse" />;
                }
                return <circle cx={cx} cy={cy} r={3} fill="#0f172a" stroke="#00d97e" strokeWidth={2} />;
              }}
              animationDuration={2000}
            />


          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[8px] text-center text-muted-foreground mt-2 uppercase font-bold tracking-widest italic opacity-50">Trend projection based on kinematic history</p>
    </div>
  );
};

export default RecoveryPredictionCard;
