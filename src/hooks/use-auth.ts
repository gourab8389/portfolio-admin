import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { AxiosResponse, AxiosError } from 'axios';
import { AuthApiInstance } from "@/lib/apis";

export type AuthUser = {
  id?: number;
  email: string;
  role: 'admin';
};

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions - Only for state management
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

const TOKEN_KEY = "portfolio-admin-token";
const TOKEN_EXPIRY_DAYS = 7;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (token: string, user: AuthUser) => {
        // Set token in cookies
        Cookies.set(TOKEN_KEY, token, { 
          path: "/", 
          expires: TOKEN_EXPIRY_DAYS,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Update axios instance default headers
        AuthApiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update store state
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        // Remove token from cookies
        Cookies.remove(TOKEN_KEY, { path: "/" });
        
        // Remove authorization header from axios
        delete AuthApiInstance.defaults.headers.common['Authorization'];
        
        // Clear store state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "portfolio-admin-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      
      // Rehydrate the store on app load
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          // Set the authorization header if token exists
          AuthApiInstance.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

// Hook for easier usage
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
  };
};

// Additional hooks for specific use cases
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};

// Interface for axios error response
interface AuthErrorResponse {
  status?: number;
  data?: {
    message?: string;
    success?: boolean;
  };
}

// Interface for axios error with custom response type
interface AuthAxiosError extends AxiosError {
  response?: AxiosResponse<any> & AuthErrorResponse;
}

// Initialize axios interceptor for handling auth errors
AuthApiInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AuthAxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);