import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { redirect } from "next/navigation";

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      login: (userData, token) => {
        set({ isLoading: true });

        try {
          // Set the cookie
          Cookies.set("token", token, { path: "/", expires: 30 });

          // Verify the token is actually set before proceeding
          const verifyToken = () => {
            const storedToken = Cookies.get("token");

            if (storedToken) {
              // Token is confirmed set, update state and redirect
              set({
                user: userData,
                token,
                isAuthenticated: true,
                isLoading: false,
              });

              if (userData.role === "ADMIN") {
                redirect("/dashboard");
              } else {
                redirect("/waiting");
              }
            } else {
              setTimeout(verifyToken, 100);
            }
          };

          verifyToken();
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ isLoading: true });
        try {
          Cookies.remove("token", { path: "/" });

          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
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
    }
  )
);

export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
  } = useAuthStore();

  const loginUser = async (userData: User, token: string) => {
    try {
      setLoading(true);
      storeLogin(userData, token);
      if (userData.role === "ADMIN") {
        redirect("/dashboard");
      } else {
        redirect("/waiting");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      storeLogout();
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    loginUser,
    logout,
    setLoading,
  };
};

export const useAuthLoading = () => {
  const isLoading = useAuthStore((state) => state.isLoading);
  return isLoading;
};
