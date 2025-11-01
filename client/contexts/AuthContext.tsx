import React, { createContext, useContext, useState, useEffect } from "react";
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ID } from "@/config/admin";
import { getAllUsersAsync } from "@/lib/relations";
import { supabase } from "@/lib/supabase";

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

  // Bootstrap from Supabase Auth session if configured
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user?.id) {
          // Enrich from directory
          try {
            const users = await getAllUsersAsync();
            const email = session.user.email ?? '';
            const remote = users.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase() || u.auth_uid === session.user.id);
            if (remote) {
              setUser({
                id: remote.id,
                email: remote.email || email,
                displayName: remote.displayName || session.user.user_metadata?.full_name || email,
                role: (remote.role as UserRole) || 'user',
                createdAt: new Date().toISOString(),
                qualifications: remote.qualifications,
                yearsOfExperience: remote.yearsOfExperience,
                vetted: remote.vetted,
              });
            }
          } catch {}
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    if (supabase) {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          setUser(null);
        }
      });
      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    }
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    // Admin shortcut (dev only) — ensure we resolve a real DB UUID and role_id
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      try {
        const res = await fetch('/api/users/upsert', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: ADMIN_EMAIL, full_name: 'Administrator', role: 'admin', metadata: {} })
        });
        if (res.ok) {
          const data = await res.json();
          const id = data?.user?.id as string | undefined;
          const adminProfile: UserProfile = {
            id: id || ADMIN_ID,
            email: ADMIN_EMAIL,
            displayName: 'Administrator',
            role: 'admin',
            createdAt: new Date().toISOString(),
          };
          setUser(adminProfile);
          return;
        }
      } catch {}
      // Fallback to legacy id if server unavailable
      const adminProfile: UserProfile = {
        id: ADMIN_ID,
        email: ADMIN_EMAIL,
        displayName: 'Administrator',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setUser(adminProfile);
      return;
    }

    // 1) Prefer Supabase Auth
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        // Enrich from directory for role and profile
        try {
          const users = await getAllUsersAsync();
          const remote = users.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase() || u.auth_uid === data.user!.id);
          if (!remote) {
            // If no app user row, create one
            try {
              await fetch('/api/users/upsert', {
                method: 'POST', headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email, full_name: data.user.user_metadata?.full_name, auth_uid: data.user.id, role: 'user', metadata: {} })
              });
            } catch {}
          }
          const merged = remote ? {
            id: remote.id,
            email: remote.email || email,
            displayName: remote.displayName || data.user.user_metadata?.full_name || email,
            role: (remote.role as UserRole) || 'user',
            createdAt: new Date().toISOString(),
            qualifications: remote.qualifications,
            yearsOfExperience: remote.yearsOfExperience,
            vetted: remote.vetted,
            recoveryGoals: [],
          } as UserProfile : {
            id: data.user.id,
            email,
            displayName: data.user.user_metadata?.full_name || email,
            role: 'user',
            createdAt: new Date().toISOString(),
          } as UserProfile;
          setUser(merged);
          return;
        } catch {}
      }
    }

    throw new Error("Invalid email or password");
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ) => {
    if (supabase) {
      // Use server-backed registration (admin API) to auto-confirm email for PoC
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: displayName,
          role,
          metadata: {
            qualifications: [],
            yearsOfExperience: 0,
            vetted: false,
            sponsorMotivation: "",
            recoveryGoals: []
          }
        })
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) throw new Error(body?.error || 'Failed to register user');
      // sign in to establish session
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !signInData?.user) throw new Error(signInError?.message || 'Failed to sign in after registration');
      // Build profile
      const userProfile: UserProfile = {
        id: body?.user?.id || signInData.user.id,
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
      return;
    }
  };

  const logout = () => {
    (async () => { try { if (supabase) await supabase.auth.signOut(); } catch {} })();
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
