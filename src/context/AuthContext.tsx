import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useApi } from "../lib/api";

// ----------------------
// Types
// ----------------------

export type UserRole = "customer" | "admin";

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface AuthUser {
  id: string;
  _id?: string; // ✅ Backend might use _id
  name: string;
  email: string;
  phone?: string; // ✅ Added phone
  role: UserRole;
  address?: UserAddress; // ✅ Added address
}

interface LoginResponse {
  success: boolean;
  error?: string;
}

// ✅ NEW: Forgot password response type
interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ✅ NEW: Reset password response type
interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  auth: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<AuthUser>) => void; // ✅ Added helper
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>; // ✅ NEW
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<ResetPasswordResponse>; // ✅ NEW
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

      // ✅ Transform backend user to frontend format
      const backendUser = res.data.user;
      const transformedUser: AuthUser = {
        id: backendUser._id || backendUser.id,
        _id: backendUser._id,
        name: backendUser.name,
        email: backendUser.email,
        phone: backendUser.phone,
        role: backendUser.role,
        address: backendUser.address ? {
          street: backendUser.address.street,
          city: backendUser.address.city,
          state: backendUser.address.state,
          pincode: backendUser.address.pincode,
          country: backendUser.address.country
        } : undefined
      };

      setUser(transformedUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  // ✅ Listen for user profile updates from UserContext
  useEffect(() => {
    const handler = (e: any) => {
      const updatedUser = e.detail;

      // ✅ Merge updates with existing user
      setUser(prev => {
        if (!prev) return null;

        return {
          ...prev,
          id: updatedUser._id || updatedUser.id || prev.id,
          _id: updatedUser._id || prev._id,
          name: updatedUser.name || prev.name,
          email: updatedUser.email || prev.email,
          phone: updatedUser.phone || prev.phone,
          role: updatedUser.role || prev.role,
          address: updatedUser.address ? {
            street: updatedUser.address.street,
            city: updatedUser.address.city,
            state: updatedUser.address.state,
            pincode: updatedUser.address.pincode,
            country: updatedUser.address.country
          } : prev.address
        };
      });
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

      // ✅ Transform backend user to frontend format
      const backendUser = res.data.user;
      const transformedUser: AuthUser = {
        id: backendUser._id || backendUser.id,
        _id: backendUser._id,
        name: backendUser.name,
        email: backendUser.email,
        phone: backendUser.phone,
        role: backendUser.role,
        address: backendUser.address ? {
          street: backendUser.address.street,
          city: backendUser.address.city,
          state: backendUser.address.state,
          pincode: backendUser.address.pincode,
          country: backendUser.address.country
        } : undefined
      };

      setUser(transformedUser);
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
  // ✅ Update user profile locally (syncs with UserContext)
  // --------------------
  const updateUserProfile = (updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  };

  // --------------------
  // ✅ NEW: Forgot Password (Send OTP)
  // --------------------
  const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const res = await api.post("/auth/forgot-password", { email });

      return {
        success: true,
        message: res.data.message || "OTP sent to your email"
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to send OTP"
      };
    }
  };

  // --------------------
  // ✅ NEW: Reset Password (Verify OTP + Set New Password)
  // --------------------
  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> => {
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });

      return {
        success: true,
        message: res.data.message || "Password reset successful"
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to reset password"
      };
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
        logout,
        updateUserProfile, // ✅ Exposed
        forgotPassword, // ✅ NEW
        resetPassword // ✅ NEW
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
