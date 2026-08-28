"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { authService } from "../services/authService";
import { supabase } from "../lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (role: UserRole, username?: string, email?: string, password?: string) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial restore from localStorage / Supabase
    const savedUser = authService.getCurrentUser();
    const savedRole = authService.getCurrentRole();

    if (savedUser && savedRole) {
      setUser(savedUser);
      setRole(savedRole);
    }

    // Subscribe to Supabase auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const roleFromMeta = (session.user.user_metadata?.role as UserRole) || savedRole || "WARKARI";
        const authUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          role: roleFromMeta,
          contactNo: session.user.phone || "+91 98220 00000",
        };
        setUser(authUser);
        setRole(roleFromMeta);
      }
    });

    setIsLoading(false);

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (selectedRole: UserRole, username?: string, email?: string, password?: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(selectedRole, username, email, password);
      setUser(loggedUser);
      setRole(selectedRole);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const currentUser = user || {
        id: newRole === "WARKARI" ? "user-warkari" : "user-authority",
        name: newRole === "WARKARI" ? "विठ्ठल भक्त (Warkari Pilgrim)" : "Control Room Officer",
        role: newRole,
        contactNo: newRole === "WARKARI" ? "+91 99887 76655" : "+91 22 22024243",
      };
      const updatedUser = { ...currentUser, role: newRole };
      await authService.login(newRole, updatedUser.name);
      setUser(updatedUser);
      setRole(newRole);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
