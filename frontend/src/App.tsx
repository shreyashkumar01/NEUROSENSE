import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetIsCallerDoctor } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from './pages/LandingPage';
import ProfileSetup from './components/ProfileSetup';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    isFetched: profileFetched 
  } = useGetCallerUserProfile();
  
  const { data: isDoctor, isLoading: isDoctorLoading } = useGetIsCallerDoctor();

  // Show loading screen during authentication and profile loading
  if (loginStatus === 'initializing' || loginStatus === 'logging-in') {
    return <LoadingScreen message="Connecting to NEUROSENSE..." />;
  }

  // Not authenticated - show landing page
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LandingPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Authenticated but profile loading
  if (profileLoading || isDoctorLoading) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  // Authenticated but no profile - show profile setup
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;
  
  if (showProfileSetup) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ProfileSetup />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Authenticated with profile - show appropriate dashboard
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {isDoctor ? <DoctorDashboard /> : <PatientDashboard />}
      <Toaster />
    </ThemeProvider>
  );
}