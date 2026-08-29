import { User, UserRole } from "../types";
import { STORAGE_KEYS } from "../constants";
import { supabase } from "../lib/supabaseClient";

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  /**
   * Log in user with Supabase Auth or role session persistence.
   */
  async login(role: UserRole, username?: string, email?: string, password?: string): Promise<User> {
    let mockUser: User = {
      id: role === "WARKARI" ? "user-warkari" : "user-authority",
      name: username || (role === "WARKARI" ? "विठ्ठल भक्त (Warkari Pilgrim)" : "Control Room Chief Officer"),
      role: role,
      contactNo: role === "WARKARI" ? "+91 99887 76655" : "+91 22 22024243",
    };

    // If email and password provided, try Supabase Auth
    if (email && password && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          mockUser = {
            id: data.user.id,
            name: username || data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
            role: (data.user.user_metadata?.role as UserRole) || role,
            contactNo: data.user.phone || "+91 98220 00000",
          };
        }
      } catch (err) {
        console.warn("Supabase Auth fallback to session login:", err);
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUTH_ROLE, mockUser.role);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(mockUser));
    }

    return mockUser;
  },

  /**
   * Sign out current user.
   */
  async logout(): Promise<void> {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_ROLE);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  getCurrentRole(): UserRole | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_ROLE) as UserRole | null;
  },
};
