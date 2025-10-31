import React, { createContext, useContext, useState, useEffect } from "react";
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ID } from "@/config/admin";
import { getAllUsersAsync } from "@/lib/relations";

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
  sponsorMotivation?: string;
  // User-specific fields
  recoveryGoals?: string[];
  onboardingUrgency?: string;
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

  // DB-only: no localStorage bootstrap; session starts unauthenticated
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Admin shortcut (dev only)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminProfile: UserProfile = {
        id: ADMIN_ID,
        email: ADMIN_EMAIL,
        displayName: "Administrator",
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      setUser(adminProfile);
      return;
    }

    // 1) Try server-side login using PoC password hash
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const serverUser = data.user as { id: string; email: string; full_name?: string };

        // Merge with directory for role/vetted
        try {
          const users = await getAllUsersAsync();
          const remote = users.find((u: any) => u.email === email || u.id === serverUser.id);
          if (remote) {
            const merged: UserProfile = {
              id: remote.id || serverUser.id,
              email: serverUser.email,
              displayName: remote.displayName || serverUser.full_name || email,
              role: (remote.role as UserRole) || 'user',
              createdAt: new Date().toISOString(),
              qualifications: remote.qualifications,
              yearsOfExperience: remote.yearsOfExperience,
              vetted: remote.vetted,
              recoveryGoals: [],
            };
            setUser(merged);
            return;
          }
        } catch {}

        const minimal: UserProfile = {
          id: serverUser.id,
          email: serverUser.email,
          displayName: serverUser.full_name || email,
          role: 'user',
          createdAt: new Date().toISOString(),
        } as UserProfile;
        setUser(minimal);
        return;
      }
    } catch {}

    throw new Error("Invalid email or password");
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ) => {
    // Create user in DB and then authenticate in-memory
    const res = await fetch('/api/users/upsert', { 
      method: 'POST', 
      headers: { 'content-type': 'application/json' }, 
      body: JSON.stringify({ 
        email, 
        full_name: displayName,
        password, // server will hash and store
        role, // set role_id on server; do not store in metadata
        metadata: { 
          qualifications: [],
          yearsOfExperience: 0,
          vetted: false,
          sponsorMotivation: "",
          recoveryGoals: []
        }
      }) 
    });
    if (!res.ok) throw new Error('Failed to register user');
    const data = await res.json();
    if (!data.ok || !data.user?.id) throw new Error('Failed to register user');

    const userProfile: UserProfile = {
      id: data.user.id,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
      qualifications: [],
      yearsOfExperience: 0,
      vetted: false,
      sponsorMotivation: "",
      recoveryGoals: [],
      onboardingUrgency: undefined,
    };
    setUser(userProfile);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // Persist profile update to server
      (async () => {
        try {
          await fetch('/api/users/upsert', { 
            method: 'POST', 
            headers: { 'content-type': 'application/json' }, 
            body: JSON.stringify({ 
              id: updatedUser.id,
              email: updatedUser.email, 
              full_name: updatedUser.displayName, 
              metadata: { 
                qualifications: updatedUser.qualifications, 
                yearsOfExperience: updatedUser.yearsOfExperience,
                vetted: updatedUser.vetted,
                sponsorMotivation: updatedUser.sponsorMotivation,
                recoveryGoals: updatedUser.recoveryGoals,
                onboardingUrgency: updatedUser.onboardingUrgency
              }
            }) 
          });
        } catch (err) {
          // ignore transient errors for now
        }
      })();
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
