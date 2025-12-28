import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LoginStatus = 'initializing' | 'logged-out' | 'logging-in' | 'logged-in';

interface InternetIdentityContextType {
  identity: any | null;
  loginStatus: LoginStatus;
  login: () => Promise<void>;
  logout: () => void;
  clear: () => void;
}

const InternetIdentityContext = createContext<InternetIdentityContextType | undefined>(undefined);

export function InternetIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<any | null>(null);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('initializing');

  useEffect(() => {
    // Check for existing identity in localStorage
    const storedIdentity = localStorage.getItem('internet-identity');
    if (storedIdentity) {
      try {
        // In a real implementation, you would restore the identity from storage
        // For now, we'll just set logged-in status
        setLoginStatus('logged-in');
      } catch (error) {
        console.error('Failed to restore identity:', error);
        localStorage.removeItem('internet-identity');
        setLoginStatus('logged-out');
      }
    } else {
      setLoginStatus('logged-out');
    }
  }, []);

  const login = async () => {
    try {
      setLoginStatus('logging-in');
      
      // Mock Internet Identity login for local development
      // In production, this would use the actual Internet Identity service
      const mockIdentity = {
        getPrincipal: () => ({
          toText: () => 'mock-principal-' + Date.now(),
        }),
      };
      
      setIdentity(mockIdentity);
      localStorage.setItem('internet-identity', 'mock');
      setLoginStatus('logged-in');
    } catch (error) {
      console.error('Login failed:', error);
      setLoginStatus('logged-out');
      throw error;
    }
  };

  const logout = () => {
    setIdentity(null);
    localStorage.removeItem('internet-identity');
    setLoginStatus('logged-out');
  };

  return (
    <InternetIdentityContext.Provider value={{ identity, loginStatus, login, logout, clear: logout }}>
      {children}
    </InternetIdentityContext.Provider>
  );
}

export function useInternetIdentity() {
  const context = useContext(InternetIdentityContext);
  if (context === undefined) {
    throw new Error('useInternetIdentity must be used within an InternetIdentityProvider');
  }
  return context;
}

