"use client";

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simply check if token exists in the store
    // The axios interceptor will handle invalid tokens automatically
    if (token) {
      console.log('Auth initialized with token');
    }
    
    setIsInitialized(true);
  }, []);

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
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    // Token will be automatically set in axios headers by zustand persist
    // If token is invalid, the axios interceptor will clear auth on 401
    if (token) {
      console.log('Auth initialized with token');
    }
  }, [token]);

  return <>{children}</>;
}