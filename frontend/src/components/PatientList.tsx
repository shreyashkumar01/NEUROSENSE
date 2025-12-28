import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Brain, MessageSquare, Smile, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { PatientProfile } from '../backend';

interface PatientListProps {
  patients: PatientProfile[];
  searchQuery: string;
  isLoading: boolean;
}

export default function PatientList({ patients, searchQuery, isLoading }: PatientListProps) {
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredPatients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {searchQuery ? 'No patients found matching your search.' : 'No patients assigned yet.'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredPatients.map((patient, index) => {
        // Mock health indicators - in production, these would come from backend
        const healthStatus = index % 3 === 0 ? 'attention' : index % 2 === 0 ? 'good' : 'excellent';
        const metrics = {
          movement: 70 + Math.floor(Math.random() * 30),
          speech: 65 + Math.floor(Math.random() * 35),
          cognitive: 60 + Math.floor(Math.random() * 40),
          mood: 75 + Math.floor(Math.random() * 25),
        };

        return (
          <div
            key={index}
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {patient.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{patient.name}</h3>
                <Badge 
                  variant={healthStatus === 'attention' ? 'destructive' : 'outline'}
                  className={healthStatus === 'excellent' ? 'bg-accent/20 text-accent' : ''}
                >
                  {healthStatus === 'attention' ? 'Needs Attention' : healthStatus === 'good' ? 'Good' : 'Excellent'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {metrics.movement}%
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {metrics.speech}%
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  {metrics.cognitive}%
                </span>
                <span className="flex items-center gap-1">
                  <Smile className="h-3 w-3" />
                  {metrics.mood}%
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}