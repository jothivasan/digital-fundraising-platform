import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import type { Profile } from "../types";
import { supabase } from "../lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  updateProfile: (updates: {
    name?: string;
    avatar_url?: string;
  }) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Supabase's onAuthStateChange listener is the canonical way to manage session state.
    // It fires an initial event with the current session ('INITIAL_SESSION'),
    // and then for any subsequent changes (e.g., 'SIGNED_IN', 'SIGNED_OUT').
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // A separate effect to fetch the profile data whenever the user state changes.
  // This has been refactored to be more robust against race conditions
  // in async operations and unmounted components.
  useEffect(() => {
    if (user) {
      setLoading(true);
      let isMounted = true;

      const fetchProfile = async () => {
        try {
          const { data, error, status } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // Supabase postgrest error convention: status 406 means no rows found,
          // which is not a server error for this use case.
          if (error && status !== 406) {
            throw error;
          }

          if (isMounted) {
            setProfile(data);
            // FIX: Make role check case-insensitive to handle variations like 'Admin'.
            setIsAdmin(data?.role?.toLowerCase() === "admin");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          if (isMounted) {
            setProfile(null);
            setIsAdmin(false);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchProfile();

      return () => {
        isMounted = false;
      };
    } else {
      // If there's no user, clear the profile and stop loading.
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    }
    // State will be cleared automatically by the onAuthStateChange listener.
  };

  const updateProfile = async (updates: {
    name?: string;
    avatar_url?: string;
  }) => {
    if (!user) {
      throw new Error("User must be logged in to update profile");
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      throw error;
    }

    // Update local profile state
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const changePassword = async (newPassword: string) => {
    if (!user) {
      throw new Error("User must be logged in to change password");
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAdmin,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
