import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  sessionTimeout: number | null;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);

  // Enhanced session management with timeout tracking
  const updateSessionTimeout = useCallback((session: Session | null) => {
    if (session?.expires_at) {
      setSessionTimeout(session.expires_at * 1000); // Convert to milliseconds
    } else {
      setSessionTimeout(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh failed:', error);
        return;
      }
      updateSessionTimeout(session);
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }, [updateSessionTimeout]);

  useEffect(() => {
    // Set up auth state listener FIRST with enhanced security logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Security: Log authentication events (without sensitive data)
        if (event === 'SIGNED_IN') {
          console.log('User signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Session token refreshed');
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        updateSessionTimeout(session);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      updateSessionTimeout(session);
    });

    return () => subscription.unsubscribe();
  }, [updateSessionTimeout]);

  const signOut = async () => {
    try {
      // Clear sensitive data before sign out
      setSessionTimeout(null);
      await supabase.auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    sessionTimeout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};