
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { getCurrentUser, loginMock, logoutMock } from '../lib/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  session: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password?: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to derive profile from Supabase session
  const mapSessionToProfile = (session: any): UserProfile | null => {
      if (!session?.user) return null;
      const email = session.user.email || '';
      // Determine role from metadata or email convention
      let role = UserRole.USER;
      if (session.user.user_metadata?.role) {
          role = session.user.user_metadata.role;
      } else if (email.includes('admin')) {
          role = UserRole.ADMIN;
      }

      return {
          id: session.user.id,
          email: email,
          name: session.user.user_metadata?.full_name || email.split('@')[0],
          role: role,
          avatarUrl: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${email}`
      };
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                setSession(session);
                setUserProfile(mapSessionToProfile(session));
            }
        } catch (error) {
            console.error("Error checking session:", error);
        }
      } else {
        // Fallback: Local Mock Session
        const localUser = getCurrentUser();
        if (localUser && mounted) {
           setSession({ user: localUser }); // Mock session object
           setUserProfile(localUser);
        }
      }
      if (mounted) setLoading(false);
    };

    initializeAuth();

    // Listener for Supabase auth changes
    let authListener: any = null;
    if (isSupabaseConfigured() && supabase) {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setUserProfile(mapSessionToProfile(session));
                setLoading(false);
            }
        });
        authListener = data;
    }

    return () => {
        mounted = false;
        if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password?: string, role: UserRole = UserRole.USER) => {
     if (isSupabaseConfigured() && supabase) {
         if (!password) {
             throw new Error("Password is required for Supabase authentication.");
         }
         const { error } = await supabase.auth.signInWithPassword({
             email,
             password
         });
         if (error) throw error;
     } else {
         // Mock Login wrapper
         const user = loginMock(email, role);
         setSession({ user });
         setUserProfile(user);
     }
  };

  const signOut = async () => {
     if (isSupabaseConfigured() && supabase) {
         await supabase.auth.signOut();
     } else {
         logoutMock();
     }
     setSession(null);
     setUserProfile(null);
  };

  const isAdmin = userProfile?.role === UserRole.ADMIN || userProfile?.role === UserRole.SUPER_ADMIN;

  return (
    <AuthContext.Provider value={{ session, userProfile, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
