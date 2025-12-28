import { Card } from '@/components/ui/card';
import { Activity, Brain, MessageSquare, Smile } from 'lucide-react';

interface ProgressRingProps {
  value: number;
  max: number;
  color: string;
  icon: React.ReactNode;
  label: string;
}

function ProgressRing({ value, max, color, icon, label }: ProgressRingProps) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="progress-ring"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="mb-1">{icon}</div>
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-xs text-muted-foreground">/ {max}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-center">{label}</span>
    </div>
  );
}

export default function ProgressRings() {
  const rings = [
    {
      value: 75,
      max: 100,
      color: 'oklch(var(--chart-1))',
      icon: <Activity className="h-6 w-6 text-chart-1" />,
      label: 'Movement',
    },
    {
      value: 82,
      max: 100,
      color: 'oklch(var(--chart-2))',
      icon: <MessageSquare className="h-6 w-6 text-chart-2" />,
      label: 'Speech',
    },
    {
      value: 68,
      max: 100,
      color: 'oklch(var(--chart-3))',
      icon: <Brain className="h-6 w-6 text-chart-3" />,
      label: 'Cognitive',
    },
    {
      value: 90,
      max: 100,
      color: 'oklch(var(--chart-4))',
      icon: <Smile className="h-6 w-6 text-chart-4" />,
      label: 'Mood',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {rings.map((ring, i) => (
        <ProgressRing key={i} {...ring} />
      ))}
    </div>
  );
}