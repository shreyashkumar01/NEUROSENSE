import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, CheckCircle2, Brain } from 'lucide-react';

export default function AIInsightsPanel() {
  const insights = [
    {
      type: 'alert',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'Patient Needs Attention',
      description: 'John Doe has missed 3 consecutive therapy sessions',
      time: '2 hours ago',
      variant: 'destructive' as const,
    },
    {
      type: 'improvement',
      icon: <TrendingUp className="h-4 w-4" />,
      title: 'Significant Progress',
      description: 'Sarah Smith improved speech clarity by 15% this week',
      time: '5 hours ago',
      variant: 'default' as const,
    },
    {
      type: 'milestone',
      icon: <CheckCircle2 className="h-4 w-4" />,
      title: 'Milestone Achieved',
      description: 'Mike Johnson completed 30-day therapy streak',
      time: '1 day ago',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
        <CardDescription>Automated analysis and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, i) => (
            <div key={i} className="flex gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className={`flex-shrink-0 ${
                insight.type === 'alert' ? 'text-destructive' : 
                insight.type === 'improvement' ? 'text-accent' : 
                'text-primary'
              }`}>
                {insight.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{insight.title}</p>
                  <Badge variant={insight.variant} className="text-xs">
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
                <p className="text-xs text-muted-foreground">{insight.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}