import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetAllPatientProfiles } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Search,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  MessageSquare,
  Settings,
  Heart,
  Activity,
  Brain,
  Smile
} from 'lucide-react';
import PatientList from '../components/PatientList';
import AIInsightsPanel from '../components/AIInsightsPanel';

export default function DoctorDashboard() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: patients = [], isLoading } = useGetAllPatientProfiles();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Mock stats - in production, these would come from backend
  const stats = {
    totalPatients: patients.length,
    activeToday: Math.floor(patients.length * 0.7),
    needsAttention: Math.floor(patients.length * 0.15),
    improving: Math.floor(patients.length * 0.6),
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
              <Badge variant="outline" className="hidden sm:inline-flex">
                Healthcare Provider
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
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
          <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Monitor and support your patients' recovery journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Patients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground mt-1">Under your care</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Today
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed exercises</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Needs Attention
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.needsAttention}</div>
              <p className="text-xs text-muted-foreground mt-1">Require follow-up</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Improving
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.improving}</div>
              <p className="text-xs text-muted-foreground mt-1">Positive trends</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Patient List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Patient List</CardTitle>
                    <CardDescription>Monitor real-time health indicators</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <PatientList 
                  patients={patients} 
                  searchQuery={searchQuery}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* System Architecture Info */}
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>NEUROSENSE data flow and processing</CardDescription>
              </CardHeader>
              <CardContent>
                <img 
                  src="/assets/generated/system-architecture-diagram.dim_1000x600.png" 
                  alt="System Architecture" 
                  className="rounded-lg border w-full"
                />
                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-medium">Data Flow:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Patient exercises captured via mobile app</li>
                    <li>AI processing layer analyzes performance</li>
                    <li>Secure cloud storage with encryption</li>
                    <li>Real-time analytics and reporting</li>
                    <li>Doctor dashboard receives insights</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - AI Insights */}
          <div className="space-y-6">
            <AIInsightsPanel />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Patients
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Therapy Plans
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Security & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>End-to-end encrypted data</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>HIPAA & GDPR compliant</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Consent-based data sharing</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Role-based access control</span>
                </div>
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
              © 2025.
              <a 
                href="" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                NEUROSENSE
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
