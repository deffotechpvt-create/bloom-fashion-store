import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useApi } from "../lib/api";

// ----------------------
// Types
// ----------------------

export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface LoginResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  auth: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
}

// ----------------------
// Context
// ----------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------
// Provider
// ----------------------

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const api = useApi();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const auth = !!user;

  // --------------------
  // Restore session
  // --------------------
  const restoreSession = async () => {
    try {
      const res = await api.get("/auth/profile");

      setUser(res.data.user as AuthUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {

    const handler = (e: any) => {
      setUser(e.detail);
    };

    window.addEventListener("auth:user:update", handler);

    return () => {
      window.removeEventListener("auth:user:update", handler);
    };

  }, []);

  // --------------------
  // Login
  // --------------------
  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data.user as AuthUser);
      return { success: true };

    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || "Login failed"
      };
    }
  };

  // --------------------
  // Logout
  // --------------------
  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  // --------------------
  // Derived state
  // --------------------
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        auth,
        isAdmin,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ----------------------
// Hook
// ----------------------

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
