import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, 
  Activity, 
  Brain, 
  MessageSquare, 
  Heart,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Video,
  Phone
} from 'lucide-react';
import ProgressRings from '../components/ProgressRings';
import WeeklyProgressChart from '../components/WeeklyProgressChart';
import TherapyChecklist from '../components/TherapyChecklist';

export default function PatientDashboard() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [offlineMode] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/neurosense-logo.dim_300x100.png" 
                alt="NEUROSENSE" 
                className="h-7"
              />
              {offlineMode && (
                <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full">
                  Offline Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Let's continue your recovery journey today</p>
        </div>

        {/* Emergency Help Button */}
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <div>
                  <p className="font-medium">Need immediate help?</p>
                  <p className="text-sm text-muted-foreground">Contact your healthcare provider or emergency services</p>
                </div>
              </div>
              <Button variant="destructive">
                <Phone className="h-4 w-4 mr-2" />
                Get Help
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Progress Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Rings */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
                <CardDescription>Your performance across key therapy areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressRings />
              </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Weekly Progress
                </CardTitle>
                <CardDescription>Track your improvement over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyProgressChart />
              </CardContent>
            </Card>

            {/* Video Exercises */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Today's Exercises
                </CardTitle>
                <CardDescription>Video-guided rehabilitation activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'Arm Stretches', duration: '10 min', completed: true },
                    { title: 'Balance Training', duration: '15 min', completed: true },
                    { title: 'Speech Exercises', duration: '12 min', completed: false },
                    { title: 'Memory Games', duration: '8 min', completed: false },
                  ].map((exercise, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      {exercise.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{exercise.title}</p>
                        <p className="text-sm text-muted-foreground">{exercise.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Daily Checklist & Stats */}
          <div className="space-y-6">
            <TherapyChecklist />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Exercises Completed</span>
                    <span className="text-sm text-muted-foreground">18/21</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Daily Streak</span>
                    <span className="text-sm font-bold text-primary">7 days 🔥</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Time</span>
                    <span className="text-sm text-muted-foreground">4h 32m</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <img 
                    src="/assets/generated/ai-assistant-avatar.dim_200x200.png" 
                    alt="AI Assistant" 
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <CardTitle className="text-lg">AI Coach</CardTitle>
                    <CardDescription>Your personal therapy assistant</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  "Great progress today! Your movement scores are improving. Let's focus on speech exercises tomorrow."
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Chat with AI Coach
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-4 w-4 text-destructive" />
            <span>
              © 2025. Built with love using{' '}
              <a 
                href="https://caffeine.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}