
import React, { useState, useEffect } from 'react';
import { UserRole, TherapyType, PatientProfile, DoctorProfile, SessionResult, UserAccount, Connection, ConnectionStatus } from './types';
import Navigation from './components/Navigation';
import PatientDashboard from './views/PatientDashboard';
import BodyTherapy from './views/BodyTherapy';
import SpeechTherapy from './views/SpeechTherapy';
import BrainGames from './views/BrainGames';
import DoctorDashboard from './views/DoctorDashboard';
import ProgressStats from './views/ProgressStats';
import TherapyLibrary from './views/TherapyLibrary';
import ProfileView from './views/ProfileView';
import DoctorConnect from './views/DoctorConnect';

// Core Framework & Component Architecture
import LandingPage from './views/LandingPage';
import AuthPortal from './views/AuthPortal';
import MentalHealthView from './views/MentalHealthView';
import PatientChatView from './views/PatientChatView';
import DoctorChatView from './views/DoctorChatView';

import { dataService } from './services/supabase.service';
import { supabase } from './lib/supabase';
import { CallProvider } from './components/CallContext';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(() => {
    try {
      return localStorage.getItem('ns_role') as UserRole || null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('ns_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('ns_theme');
    return savedTheme === null ? true : savedTheme === 'dark';
  });
  const [currentView, setView] = useState('dashboard');
  const [activeExercise, setActiveExercise] = useState<TherapyType | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeGameMode, setActiveGameMode] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [globalDoctors, setGlobalDoctors] = useState<DoctorProfile[]>([]);
  const [allConnections, setAllConnections] = useState<Connection[]>([]);
  const [history, setHistory] = useState<SessionResult[]>([]);

  // Synchronize telemetry with the database
  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch history based on role
      const historyPromise = user.role === UserRole.DOCTOR
        ? dataService.getAllSessions()
        : dataService.getPatientHistory(user.id);

      const [hist, conns, allUsers] = await Promise.all([
        historyPromise,
        dataService.getConnections(),
        dataService.getAllUsers()
      ]);
      setHistory(hist);
      setAllConnections(conns);
      setAccounts(allUsers);
      setGlobalDoctors(allUsers.filter(u => u.role === UserRole.DOCTOR) as DoctorProfile[]);
    } catch (err) {
      console.error('Error fetching real-time data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('ns_user', JSON.stringify(user));
      localStorage.setItem('ns_role', user.role);
      fetchData();
      const interval = setInterval(fetchData, 5000); // Polling interval for real-time updates
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ns_theme', darkMode ? 'dark' : 'light');

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen for Supabase auth state changes (Google OAuth redirect)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !user) {
        try {
          console.log('Google OAuth detected, syncing user...');
          // Sync Google user to our database and get complete profile
          const fullProfile = await dataService.syncGoogleUser(session.user, selectedRole || UserRole.PATIENT);

          // Validate role: If user is a Doctor but trying to login via Patient mode
          if (fullProfile.role === UserRole.DOCTOR && (selectedRole === UserRole.PATIENT || !selectedRole)) {
            console.log('Doctor trying to login via Patient mode - blocking');
            await supabase.auth.signOut(); // Sign out from Supabase
            setAuthError('This account is registered as a Doctor. Please use the Doctor portal and login with your email and password.');
            return;
          }

          console.log('User synced:', fullProfile);
          setUser(fullProfile);
          setRole(fullProfile.role);
          setAuthMode(null);
          setSelectedRole(null);
        } catch (err) {
          console.error('Google auth sync error:', err);
          setAuthError('Failed to sync Google account. Please try again.');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [selectedRole, user]);

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim().toLowerCase();
    const password = (formData.get('password') as string).trim();

    try {
      if (authMode === 'LOGIN') {
        const result = await dataService.login(email, password);

        // Authentication logic
        if (!result) {
          setAuthError("Database connection error. Please try again.");
        } else if ('error' in result) {
          // Specific error types
          if (result.error === 'EMAIL_NOT_FOUND') {
            setAuthError("Account not found. Please check your email or register.");
          } else if (result.error === 'WRONG_PASSWORD') {
            setAuthError("Incorrect password. Please try again.");
          }
        } else {
          // Valid credential set: Apply role-based access control
          if (result.role === selectedRole) {
            setUser(result);
            setRole(result.role);
            setAuthMode(null);
          } else {
            setAuthError(`This account is registered as a ${result.role}, not a ${selectedRole}.`);
          }
        }
      } else {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const phoneInput = formData.get('phone') as string;
        const licenseIdInput = formData.get('licenseId') as string;

        const { validateEmail, validatePassword, validatePhoneNumber, validateLicenseId } = await import('./utils/validation');

        // Email Validation
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          setAuthError(emailValidation.error || "Invalid email format");
          setIsAuthenticating(false);
          return;
        }

        // Password Validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          setAuthError(passwordValidation.error || "Invalid password");
          setIsAuthenticating(false);
          return;
        }

        // Phone Validation (Optional check if provided)
        let validPhone = "N/A";
        if (phoneInput) {
          const phoneValidation = validatePhoneNumber(phoneInput);
          if (!phoneValidation.isValid) {
            setAuthError(phoneValidation.error || "Invalid phone number");
            setIsAuthenticating(false);
            return;
          }
          validPhone = phoneValidation.value;
        }

        // License ID Validation (Required for Doctors)
        if (selectedRole === UserRole.DOCTOR) {
          const licenseValidation = validateLicenseId(licenseIdInput);
          if (!licenseValidation.isValid) {
            setAuthError(licenseValidation.error || "Invalid license ID");
            setIsAuthenticating(false);
            return;
          }
        }

        const userId = `UID-${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
        const newUser: UserAccount = {
          id: userId,
          name: formData.get('name') as string,
          email: email,
          password: password,
          phone: validPhone,
          role: selectedRole!,
          startDate: new Date().toISOString(),
          licenseId: formData.get('licenseId') as string || undefined,
          diagnosis: formData.get('diagnosis') as string || (selectedRole === UserRole.PATIENT ? "Neuro-Recovery" : undefined),
          isVerified: selectedRole === UserRole.DOCTOR,
          caseId: selectedRole === UserRole.PATIENT ? `NS-${Math.floor(Math.random() * 90000)}` : undefined
        };

        await dataService.register(newUser);
        setUser(newUser);
        setRole(selectedRole);
        setAuthMode(null);
      }
    } catch (err: any) {
      setAuthError(err.message || "Data sync error.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await dataService.signInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || "Google Login failed.");
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('ns_user');
      localStorage.removeItem('ns_role');
      setUser(null);
      setRole(null);
      setSelectedRole(null);
      setAuthMode(null);
      setView('dashboard');
      setIsLoggingOut(false);
    }, 1000);
  };

  const handleCompleteExercise = async (score: number, feedback: string) => {
    if (!activeExercise || !user) return;
    const newResult: SessionResult = {
      patientId: user.id,
      timestamp: new Date().toISOString(),
      type: activeExercise,
      exerciseName: activeGameMode || undefined,
      score,
      feedback
    };

    try {
      await dataService.saveSession(newResult);
      setHistory(prev => [newResult, ...prev]);
      setActiveExercise(null);
      setView('progress');
    } catch (err) {
      console.error('Session save failed:', err);
      // Fallback to optimistic UI
      setHistory(prev => [newResult, ...prev]);
      setActiveExercise(null);
      setView('progress');
    }
  };

  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-[999] bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center transition-all duration-1000">
        <div className="w-16 h-16 border-[3px] border-prism-accent border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-[950] text-prism-dark dark:text-white tracking-tighter uppercase mb-3">Ending Session</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">Securing your data and logging out safely...</p>
      </div>
    );
  }

  // Application routing: Conditional rendering based on active state
  if (activeGameMode === 'Speak & Score') return <SpeechTherapy onComplete={handleCompleteExercise} onAbort={() => { setActiveExercise(null); setActiveGameMode(null); }} darkMode={darkMode} mode="speak-score" />;
  if (activeExercise === TherapyType.BODY) return <BodyTherapy onComplete={handleCompleteExercise} darkMode={darkMode} />;
  if (activeExercise === TherapyType.SPEECH) return <SpeechTherapy onComplete={handleCompleteExercise} onAbort={() => { setActiveExercise(null); setActiveGameMode(null); }} darkMode={darkMode} mode="articulation" />;
  if (activeExercise === TherapyType.BRAIN) return <BrainGames onComplete={(score: number) => handleCompleteExercise(score, "Cognitive assessment finalized.")} darkMode={darkMode} mode={activeGameMode || 'Memory Game'} />;
  if (activeExercise === TherapyType.MENTAL) return <MentalHealthView onComplete={handleCompleteExercise} darkMode={darkMode} />;

  // Separate Landing Page
  if (!role && !authMode) {
    return (
      <LandingPage
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSelectRole={(r) => { setSelectedRole(r); setAuthMode('LOGIN'); }}
      />
    );
  }

  // Separate Auth Portals
  if (!role && authMode) {
    return (
      <AuthPortal
        role={selectedRole!}
        authMode={authMode}
        setAuthMode={setAuthMode}
        onSubmit={handleAuthSubmit}
        isAuthenticating={isAuthenticating}
        authError={authError}
        onSwitchRole={(r) => setSelectedRole(r)}
        onGoogleLogin={handleGoogleLogin}
        darkMode={darkMode}
      />
    );
  }

  const renderView = () => {
    if (role === UserRole.DOCTOR) {
      if (currentView === 'profile') {
        return <ProfileView
          profile={user as DoctorProfile}
          onLogout={handleLogout}
          darkMode={darkMode}
          onUpdate={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('ns_user', JSON.stringify(updatedUser));
          }}
        />;
      }
      if (currentView === 'chat') {
        return <DoctorChatView profile={user as DoctorProfile} connections={allConnections} accounts={accounts} darkMode={darkMode} />;
      }
      return (
        <DoctorDashboard
          activeTab={currentView === 'dashboard' ? 'patients' : currentView}
          history={history}
          connections={allConnections}
          onAcceptConnection={async (connId: string) => {
            try {
              await dataService.updateConnectionStatus(connId, ConnectionStatus.CONNECTED);
              setAllConnections(prev => prev.map(c => c.id === connId ? { ...c, status: ConnectionStatus.CONNECTED } : c));
            } catch (err) {
              console.error('Handshake authorization failed:', err);
            }
          }}
          darkMode={darkMode}
          currentUser={user as DoctorProfile}
          accounts={accounts}
          setView={setView}
        />
      );
    }
    switch (currentView) {
      case 'dashboard': return <PatientDashboard profile={user as PatientProfile} history={history} onStartTherapy={(t: TherapyType, name?: string) => { setActiveExercise(t); setActiveGameMode(name || null); }} darkMode={darkMode} />;
      case 'chat': return <PatientChatView profile={user as PatientProfile} connections={allConnections} accounts={accounts} darkMode={darkMode} />;
      case 'connect': return <DoctorConnect doctors={globalDoctors} connections={allConnections} onRequest={async (dId: string) => {
        const newC: Connection = { id: `C-${Date.now()}`, patientId: user!.id, doctorId: dId, status: ConnectionStatus.PENDING, timestamp: new Date().toISOString() };
        try {
          await dataService.requestConnection(newC);
          setAllConnections([...allConnections, newC]);
        } catch (err) {
          console.error('Connection request failed:', err);
          // Fallback
          setAllConnections([...allConnections, newC]);
        }
      }} patientId={user?.id || ''} />;
      case 'therapy': return <TherapyLibrary onStartTherapy={(t: TherapyType, name?: string) => { setActiveExercise(t); setActiveGameMode(name || null); }} therapyHistory={history} darkMode={darkMode} />;
      case 'progress': return <ProgressStats history={history} darkMode={darkMode} />;
      case 'profile': return <ProfileView
        profile={user as PatientProfile}
        onLogout={handleLogout}
        darkMode={darkMode}
        onUpdate={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('ns_user', JSON.stringify(updatedUser));
        }}
      />;
      default: return <PatientDashboard profile={user as PatientProfile} history={history} onStartTherapy={(t: TherapyType, name?: string) => { setActiveExercise(t); setActiveGameMode(name || null); }} darkMode={darkMode} />;
    }
  };

  // ... 

  return (
    <div className={`min-h-screen bg-white dark:bg-[#000000] transition-all duration-300 ${role === UserRole.DOCTOR ? 'theme-doctor' : 'theme-patient'}`}>
      <CallProvider currentUser={user}>
        {role && (
          <Navigation role={role!} currentView={currentView} setView={setView} onLogout={handleLogout} darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />
        )}
        <main className={`${currentView === 'therapy' ? 'w-full' : 'max-w-full lg:max-w-[1500px] mx-auto'} min-h-screen pb-12`}>
          <div className={currentView === 'therapy' ? 'w-full' : 'p-3 sm:p-5 md:p-8 lg:p-10'}>
            {renderView()}
          </div>
        </main>
      </CallProvider>
    </div>
  );
};

export default App;
