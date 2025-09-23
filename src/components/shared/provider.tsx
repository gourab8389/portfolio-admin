"use client";

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { validateToken, token } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          await validateToken();
        } catch (error) {
          console.error('Auth validation failed:', error);
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []); // Only run once on mount

  // Don't render children until auth is initialized
  // This prevents hydration issues
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// Alternative: Minimal auth initializer that doesn't block rendering
export function AuthInitializer({ children }: AuthProviderProps) {
  const { validateToken, token } = useAuth();

  useEffect(() => {
    // Only validate if we have a token
    if (token) {
      validateToken().catch(console.error);
    }
  }, [token, validateToken]);

  return <>{children}</>;
}