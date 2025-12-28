import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { 
  Brain, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Globe, 
  Camera, 
  Mic, 
  Target,
  Heart,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/neurosense-logo.dim_300x100.png" 
              alt="NEUROSENSE" 
              className="h-8"
            />
          </div>
          <Button onClick={login} disabled={isLoggingIn} size="lg">
            {isLoggingIn ? 'Connecting...' : 'Get Started'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Brain className="h-4 w-4" />
            AI-Powered Digital Therapy Platform
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Your Personal
            <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Therapist
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            NEUROSENSE combines advanced AI technology with personalized rehabilitation programs 
            to help you recover faster and track your progress in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button onClick={login} disabled={isLoggingIn} size="lg" className="text-lg px-8">
              {isLoggingIn ? 'Connecting...' : 'Start Your Journey'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>

          <div className="pt-8">
            <img 
              src="/assets/generated/neurosense-dashboard-mockup.dim_1200x800.png" 
              alt="NEUROSENSE Dashboard" 
              className="rounded-xl shadow-2xl border"
            />
          </div>
        </div>
      </section>

      {/* AI Modules Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Intelligent AI Modules
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A digital therapist that learns from you every day
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="card-hover">
            <CardHeader>
              <Camera className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Camera AI</CardTitle>
              <CardDescription>
                Tracks posture and movement patterns during exercises with real-time feedback
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Mic className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Voice AI</CardTitle>
              <CardDescription>
                Evaluates speech clarity and emotional indicators for comprehensive assessment
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Cognitive AI</CardTitle>
              <CardDescription>
                Assesses memory retention and reaction times through interactive tests
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Target className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Adaptive AI</CardTitle>
              <CardDescription>
                Automatically adjusts exercise difficulty based on your performance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Prediction AI</CardTitle>
              <CardDescription>
                Identifies concerning trends and generates alerts for healthcare providers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Activity className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Comprehensive analytics showing your improvement across all therapy areas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                For Patients
              </h2>
              <div className="space-y-4">
                {[
                  'Daily therapy checklist with guided exercises',
                  'Real-time progress tracking across multiple metrics',
                  'Video-guided rehabilitation exercises',
                  'AI-powered voice feedback and motivation',
                  'Offline mode for uninterrupted therapy',
                  'Emergency help button for instant support'
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img 
                src="/assets/generated/patient-app-interface.dim_400x800.png" 
                alt="Patient App" 
                className="rounded-xl shadow-xl border mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 md:order-1">
              <img 
                src="/assets/generated/doctor-dashboard-hero.dim_800x500.png" 
                alt="Doctor Dashboard" 
                className="rounded-xl shadow-xl border"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                For Healthcare Providers
              </h2>
              <div className="space-y-4">
                {[
                  'Real-time patient monitoring dashboard',
                  'AI-generated insights and alerts',
                  'Customizable therapy plan editor',
                  'Comprehensive progress analytics',
                  'Downloadable PDF reports',
                  'Secure patient communication'
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Security & Privacy First
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your health data is protected with enterprise-grade security
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Encrypted Data</CardTitle>
                <CardDescription>End-to-end encryption for all patient information</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">HIPAA Compliant</CardTitle>
                <CardDescription>Meets healthcare privacy standards</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">GDPR Ready</CardTitle>
                <CardDescription>European data protection compliance</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Consent-Based</CardTitle>
                <CardDescription>You control who sees your data</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Development Roadmap
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our journey to revolutionize digital healthcare
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                phase: 'Phase 1: MVP',
                status: 'Completed',
                items: ['Core exercise tracking', 'Basic progress visualization', 'User authentication']
              },
              {
                phase: 'Phase 2: AI Intelligence',
                status: 'In Progress',
                items: ['Camera AI integration', 'Voice analysis', 'Cognitive testing modules']
              },
              {
                phase: 'Phase 3: Healthcare Integration',
                status: 'Q2 2025',
                items: ['Doctor dashboard', 'Communication tools', 'Report generation']
              },
              {
                phase: 'Phase 4: Enterprise Scaling',
                status: 'Q3 2025',
                items: ['Hospital partnerships', 'NGO integration', 'Multi-language support']
              }
            ].map((phase, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{phase.phase}</CardTitle>
                    <span className="text-sm font-medium text-primary">{phase.status}</span>
                  </div>
                  <CardDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {phase.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Recovery?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of patients and healthcare providers using NEUROSENSE
          </p>
          <Button 
            onClick={login} 
            disabled={isLoggingIn}
            size="lg" 
            variant="secondary"
            className="text-lg px-8"
          >
            {isLoggingIn ? 'Connecting...' : 'Get Started Today'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              <span className="text-muted-foreground">
                © 2025.
                <a 
                  href="" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                NeuroSense
                </a>
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
              <a href="#" className="hover:text-primary">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

}
