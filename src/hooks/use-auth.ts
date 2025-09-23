import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { AxiosResponse, AxiosError } from 'axios';
import { AuthApiInstance } from "@/lib/apis";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: 'admin';
};

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse extends ApiResponse<{
  user: AuthUser;
  token: string;
}> {}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  clearError: () => void;
}

const TOKEN_KEY = "portfolio-admin-token";
const TOKEN_EXPIRY_DAYS = 7;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      setUser: (user) => set({ user }),
      
      setToken: (token) => {
        set({ token });
        if (token) {
          Cookies.set(TOKEN_KEY, token, { 
            path: "/", 
            expires: TOKEN_EXPIRY_DAYS,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });
        } else {
          Cookies.remove(TOKEN_KEY, { path: "/" });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthApiInstance.post<LoginResponse>('/login', credentials);
          
          if (response.data.success && response.data.data) {
            const { user, token } = response.data.data;
            
            // Set token in cookies
            Cookies.set(TOKEN_KEY, token, { 
              path: "/", 
              expires: TOKEN_EXPIRY_DAYS,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });
            
            // Update axios instance default headers
            AuthApiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
          } else {
            throw new Error(response.data.message || 'Login failed');
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({ 
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
          
          // Remove token from cookies on error
          Cookies.remove(TOKEN_KEY, { path: "/" });
          delete AuthApiInstance.defaults.headers.common['Authorization'];
          
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          // Remove token from cookies
          Cookies.remove(TOKEN_KEY, { path: "/" });
          
          // Remove authorization header from axios
          delete AuthApiInstance.defaults.headers.common['Authorization'];
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear the state even if there's an error
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      validateToken: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }
        
        try {
          // Set authorization header
          AuthApiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await AuthApiInstance.get<ApiResponse<{ admin: { email: string } }>>('/validate');
          
          if (response.data.success) {
            set({ isAuthenticated: true });
            return true;
          } else {
            // Token is invalid
            get().logout();
            return false;
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          get().logout();
          return false;
        }
      },
    }),
    {
      name: "portfolio-admin-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      
      // Rehydrate the store and validate token on app load
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          // Set the authorization header if token exists
          AuthApiInstance.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          
          // Validate token on rehydration
          state.validateToken();
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
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    validateToken,
    setLoading,
    clearError,
  } = useAuthStore();

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    validateToken,
    setLoading,
    clearError,
  };
};

// Additional hooks for specific use cases
export const useAuthLoading = () => {
  return useAuthStore((state) => state.isLoading);
};

export const useAuthError = () => {
  return useAuthStore((state) => state.error);
};

export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};

// Initialize axios interceptor for handling auth errors
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

AuthApiInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AuthAxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);