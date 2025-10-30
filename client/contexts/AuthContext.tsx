import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "user" | "sponsor" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  // Sponsor-specific fields
  qualifications?: string[];
  yearsOfExperience?: number;
  vetted?: boolean;
  // User-specific fields
  recoveryGoals?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("sobrUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("sobrUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call - in production, call your backend
    const users = JSON.parse(localStorage.getItem("sobrUsers") || "[]");
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password,
    );

    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    const userProfile: UserProfile = {
      id: foundUser.id,
      email: foundUser.email,
      displayName: foundUser.displayName,
      role: foundUser.role,
      createdAt: foundUser.createdAt,
      qualifications: foundUser.qualifications,
      yearsOfExperience: foundUser.yearsOfExperience,
      vetted: foundUser.vetted,
      recoveryGoals: foundUser.recoveryGoals,
    };

    setUser(userProfile);
    localStorage.setItem("sobrUser", JSON.stringify(userProfile));
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ) => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("sobrUsers") || "[]");
    if (users.some((u: any) => u.email === email)) {
      throw new Error("Email already registered");
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password, // In production, never store plain passwords!
      displayName,
      role,
      createdAt: new Date().toISOString(),
      qualifications: [],
      yearsOfExperience: 0,
      vetted: false,
      recoveryGoals: [],
    };

    users.push(newUser);
    localStorage.setItem("sobrUsers", JSON.stringify(users));

    // Log them in after registration
    const userProfile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      createdAt: newUser.createdAt,
      qualifications: newUser.qualifications,
      yearsOfExperience: newUser.yearsOfExperience,
      vetted: newUser.vetted,
      recoveryGoals: newUser.recoveryGoals,
    };

    setUser(userProfile);
    localStorage.setItem("sobrUser", JSON.stringify(userProfile));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sobrUser");
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("sobrUser", JSON.stringify(updatedUser));

      // Also update in users database
      const users = JSON.parse(localStorage.getItem("sobrUsers") || "[]");
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem("sobrUsers", JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
