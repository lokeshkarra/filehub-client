import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/api";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  storage_used?: number;
  storage_limit?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirm_password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: "lokeshkarra",
    email: "lokeshkarra@example.com",
    profile_picture: "http://127.0.0.1:8000/api/auth/profile/picture/proxy/",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login({ username, password });
      await fetchUserProfile();
      toast.success("Logged in successfully");
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, confirm_password: string) => {
    setIsLoading(true);
    try {
      await authService.register({ username, email, password, confirm_password });
      toast.success("Registration successful. Please log in.");
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info("Logged out successfully");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
