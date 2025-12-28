import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center space-y-4">
        <img 
          src="/assets/generated/neurosense-logo.dim_300x100.png" 
          alt="NEUROSENSE" 
          className="h-12 mx-auto mb-8"
        />
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-lg">{message}</p>
      </div>
    </div>
  );
}