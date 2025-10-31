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
    (async () => {
      const storedUser = localStorage.getItem("sobrUser");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Try to refresh from server
          try {
            const users = await getAllUsersAsync();
            const remote = users.find((u: any) => u.id === parsed.id || u.email === parsed.email);
            if (remote) {
              // Prefer the DB UUID and server-sourced fields
              const merged = { 
                ...parsed, 
                id: remote.id || parsed.id,
                displayName: remote.displayName || parsed.displayName, 
                role: remote.role || parsed.role, 
                vetted: remote.vetted ?? parsed.vetted 
              } as any;
              setUser(merged);
              localStorage.setItem("sobrUser", JSON.stringify(merged));
            } else {
              setUser(parsed);
            }
          } catch {
            setUser(parsed);
          }
        } catch (e) {
          localStorage.removeItem("sobrUser");
        }
      }
      setIsLoading(false);
    })();
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
      localStorage.setItem("sobrUser", JSON.stringify(adminProfile));
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
            localStorage.setItem('sobr_db_available', '1');
            localStorage.setItem('sobrUser', JSON.stringify(merged));
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
        localStorage.setItem('sobr_db_available', '1');
        localStorage.setItem('sobrUser', JSON.stringify(minimal));
        return;
      }
    } catch {}

    // 2) Fallback to legacy local dev users
    const localUsers = JSON.parse(localStorage.getItem("sobrUsers") || "[]");
    const foundLocal = localUsers.find((u: any) => u.email === email && u.password === password);
    if (foundLocal) {
      const baseProfile: UserProfile = {
        id: foundLocal.id,
        email: foundLocal.email,
        displayName: foundLocal.displayName,
        role: foundLocal.role,
        createdAt: foundLocal.createdAt,
        qualifications: foundLocal.qualifications,
        yearsOfExperience: foundLocal.yearsOfExperience,
        vetted: foundLocal.vetted,
        recoveryGoals: foundLocal.recoveryGoals,
      };
      setUser(baseProfile);
      localStorage.setItem('sobr_db_available', '0');
      localStorage.setItem('sobrUser', JSON.stringify(baseProfile));
      return;
    }

    throw new Error("Invalid email or password");
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
      // do not store password locally
      displayName,
      role,
      createdAt: new Date().toISOString(),
      qualifications: [],
      yearsOfExperience: 0,
      vetted: false,
      sponsorMotivation: "",
      recoveryGoals: [],
    };

    users.push(newUser);
    localStorage.setItem("sobrUsers", JSON.stringify(users));

    // Create user in DB first to get UUID
    try {
      const res = await fetch('/api/users/upsert', { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({ 
          email: newUser.email, 
          full_name: newUser.displayName,
          password, // server will hash and store
          metadata: { 
            role: newUser.role,
            qualifications: newUser.qualifications,
            yearsOfExperience: newUser.yearsOfExperience,
            vetted: newUser.vetted,
            sponsorMotivation: newUser.sponsorMotivation,
            recoveryGoals: newUser.recoveryGoals
          }
        }) 
      });
      if (!res.ok) throw new Error('Failed to create user');
      
      const data = await res.json();
      if (!data.ok || !data.user?.id) throw new Error('No user id returned');
      
      localStorage.setItem('sobr_db_available', '1');
      newUser.id = data.user.id; // Use DB-assigned UUID
    } catch (err) {
      localStorage.setItem('sobr_db_available', '0');
      throw new Error('Failed to register user - please try again');
    }

    // Log them in after registration with DB UUID
    const userProfile: UserProfile = {
      id: newUser.id, // DB-assigned UUID
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      createdAt: newUser.createdAt,
      qualifications: newUser.qualifications,
      yearsOfExperience: newUser.yearsOfExperience,
      vetted: newUser.vetted,
      sponsorMotivation: newUser.sponsorMotivation,
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

      // Persist profile update to server
      (async () => {
        try {
          const res = await fetch('/api/users/upsert', { 
            method: 'POST', 
            headers: { 'content-type': 'application/json' }, 
            body: JSON.stringify({ 
              id: updatedUser.id, // Use existing DB UUID
              email: updatedUser.email, 
              full_name: updatedUser.displayName, 
              metadata: { 
                role: updatedUser.role,
                qualifications: updatedUser.qualifications, 
                yearsOfExperience: updatedUser.yearsOfExperience,
                vetted: updatedUser.vetted,
                sponsorMotivation: updatedUser.sponsorMotivation,
                recoveryGoals: updatedUser.recoveryGoals
              }
            }) 
          });
          if (res.ok) {
            localStorage.setItem('sobr_db_available', '1');
          } else {
            localStorage.setItem('sobr_db_available', '0');
          }
        } catch (err) {
          localStorage.setItem('sobr_db_available', '0');
          // ignore but flag DB as unavailable
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
