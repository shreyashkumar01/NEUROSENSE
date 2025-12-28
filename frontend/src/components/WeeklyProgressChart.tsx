import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', movement: 65, speech: 70, cognitive: 60, mood: 85 },
  { day: 'Tue', movement: 68, speech: 72, cognitive: 62, mood: 87 },
  { day: 'Wed', movement: 70, speech: 75, cognitive: 65, mood: 88 },
  { day: 'Thu', movement: 72, speech: 78, cognitive: 66, mood: 89 },
  { day: 'Fri', movement: 73, speech: 80, cognitive: 67, mood: 90 },
  { day: 'Sat', movement: 75, speech: 82, cognitive: 68, mood: 90 },
  { day: 'Sun', movement: 75, speech: 82, cognitive: 68, mood: 90 },
];

export default function WeeklyProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="day" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'oklch(var(--card))',
            border: '1px solid oklch(var(--border))',
            borderRadius: '0.5rem'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="movement" 
          stroke="oklch(var(--chart-1))" 
          strokeWidth={2}
          dot={{ fill: 'oklch(var(--chart-1))' }}
        />
        <Line 
          type="monotone" 
          dataKey="speech" 
          stroke="oklch(var(--chart-2))" 
          strokeWidth={2}
          dot={{ fill: 'oklch(var(--chart-2))' }}
        />
        <Line 
          type="monotone" 
          dataKey="cognitive" 
          stroke="oklch(var(--chart-3))" 
          strokeWidth={2}
          dot={{ fill: 'oklch(var(--chart-3))' }}
        />
        <Line 
          type="monotone" 
          dataKey="mood" 
          stroke="oklch(var(--chart-4))" 
          strokeWidth={2}
          dot={{ fill: 'oklch(var(--chart-4))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}