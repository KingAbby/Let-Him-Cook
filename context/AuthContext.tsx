import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabase";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check for active session
    const getSession = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error.message);
          // Clear any invalid session data
          if (mounted) {
            setSession(null);
            setUser(null);
          }
        } else if (mounted) {
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error("Session retrieval error:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);

        if (mounted) {
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);
        }        // Handle specific auth events
        if (event === "SIGNED_OUT") {
          if (mounted) {
            // On sign out, immediately clean up the session and user state
            // This helps prevent the white screen issue on iOS
            setSession(null);
            setUser(null);
            setLoading(false);
            console.log("User signed out successfully");
          }
        }

        if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed successfully");
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      // Instead of immediately signing out, let's handle this more gracefully
      if (data.user && !data.user.email_confirmed_at) {
        // If email confirmation is required, sign out after signup
        await supabase.auth.signOut();
        console.log("User signed up but needs email confirmation");
      }

      return { data, error };
    } catch (error) {
      console.error("Signup error:", error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
      }

      return { data, error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }; const signOut = async () => {
    try {
      setLoading(true);

      // First manually update the state to ensure UI updates properly
      // This helps prevent the white screen on iOS
      setUser(null);
      setSession(null);

      // Add a small delay to ensure state updates are processed
      // This helps especially on iOS where state updates sometimes need more time
      await new Promise(resolve => setTimeout(resolve, 50));

      // Then actually sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error);
        // Manual session cleanup since there's no clearSession method
        setUser(null);
        setSession(null);
      }

      console.log("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      // Force manual cleanup in case of any error
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
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
