import { createContext, useContext, useState, ReactNode } from "react";
import { useApi } from "../lib/api";
import { useAuth } from "./AuthContext";

// ----------------------
// Types
// ----------------------

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface UserContextType {
  isUpdating: boolean;
  updateProfile: (data: UpdateProfilePayload) => Promise<boolean>;
  changePassword: (data: ChangePasswordPayload) => Promise<boolean>;
}

// ----------------------
// Context
// ----------------------

const UserContext = createContext<UserContextType | undefined>(undefined);

// ----------------------
// Provider
// ----------------------

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const api = useApi();
  const { user, updateUserProfile } = useAuth(); // ✅ Get updateUserProfile helper

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // ----------------------
  // Update Profile
  // ----------------------

  const updateProfile = async (data: UpdateProfilePayload): Promise<boolean> => {
    try {
      setIsUpdating(true);

      const res = await api.put("/users/profile", data);

      /*
        Backend should return updated user:
        {
          success: true,
          user: { _id, name, email, phone, role, address }
        }
      */

      if (res.data?.user) {
        // ✅ Method 1: Dispatch custom event (for backward compatibility)
        window.dispatchEvent(
          new CustomEvent("auth:user:update", {
            detail: res.data.user
          })
        );

        // ✅ Method 2: Direct update via AuthContext helper (immediate sync)
        updateUserProfile({
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone,
          address: res.data.user.address
        });
      }

      return true;
    } catch (err) {
      console.error("Profile update failed", err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // ----------------------
  // Change Password
  // ----------------------

  const changePassword = async (
    data: ChangePasswordPayload
  ): Promise<boolean> => {
    try {
      setIsUpdating(true);

      await api.put("/users/change-password", data);

      return true;
    } catch (err) {
      console.error("Password change failed", err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        isUpdating,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ----------------------
// Hook
// ----------------------

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};
