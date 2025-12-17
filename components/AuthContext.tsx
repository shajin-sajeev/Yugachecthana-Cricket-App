
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Club } from '../types';
import { getCurrentUser, loginMock, logoutMock } from '../lib/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  session: any | null;
  userProfile: UserProfile | null;
  club: Club | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password?: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  createClub: (name: string, location: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to derive profile from Supabase session
  const mapSessionToProfile = (session: any): UserProfile | null => {
      if (!session?.user) return null;
      const email = session.user.email || '';
      const phone = session.user.phone || '';
      
      let role = UserRole.USER;
      if (session.user.user_metadata?.role) {
          role = session.user.user_metadata.role;
      }

      const identifier = email || phone;
      const metadata = session.user.user_metadata || {};

      return {
          id: session.user.id,
          email: email,
          name: metadata.full_name || identifier.split('@')[0] || 'User',
          role: role,
          clubId: metadata.clubId,
          avatarUrl: metadata.avatar_url || `https://ui-avatars.com/api/?name=${identifier}`,
          // Extended fields
          phone: phone || metadata.phone,
          battingStyle: metadata.battingStyle,
          bowlingStyle: metadata.bowlingStyle,
          primaryRole: metadata.primaryRole,
          location: metadata.location,
          bio: metadata.bio
      };
  };

  const fetchClub = (clubId: string) => {
      // Mock logic: fetch from LS
      const clubs = JSON.parse(localStorage.getItem('yugachethana_clubs') || '[]');
      const found = clubs.find((c: Club) => c.id === clubId);
      if (found) setClub(found);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted && session) {
                setSession(session);
                const profile = mapSessionToProfile(session);
                setUserProfile(profile);
                if (profile?.clubId) fetchClub(profile.clubId);
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
           if (localUser.clubId) fetchClub(localUser.clubId);
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
                const profile = mapSessionToProfile(session);
                setUserProfile(profile);
                setLoading(false);
                if (profile?.clubId) fetchClub(profile.clubId);
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
         if (user.clubId) fetchClub(user.clubId);
     }
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                  data: {
                      full_name: name,
                      phone: phone,
                      role: UserRole.USER
                  }
              }
          });
          if (error) throw error;
      } else {
          // Mock Sign Up
          const user: UserProfile = {
              id: Date.now().toString(),
              email,
              name,
              role: UserRole.USER,
              avatarUrl: `https://ui-avatars.com/api/?name=${name}`
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          setSession({ user });
          setUserProfile(user);
      }
  };

  const createClub = async (name: string, location: string) => {
      if (!userProfile) return;

      const newClub: Club = {
          id: Date.now().toString(),
          name,
          location,
          foundedYear: new Date().getFullYear().toString(),
          ownerId: userProfile.id,
          code: Math.random().toString(36).substring(7).toUpperCase()
      };

      // Mock Persistence
      const clubs = JSON.parse(localStorage.getItem('yugachethana_clubs') || '[]');
      clubs.push(newClub);
      localStorage.setItem('yugachethana_clubs', JSON.stringify(clubs));

      // Update User to SUPER_ADMIN
      const updatedUser = { ...userProfile, clubId: newClub.id, role: UserRole.SUPER_ADMIN };
      
      // Update in Session/State
      setUserProfile(updatedUser);
      setClub(newClub);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser)); // For Mock
      
      // TODO: If Supabase, await supabase.auth.updateUser({ data: { clubId: newClub.id, role: 'super_admin' } })
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
      console.log(`Updated user ${userId} to ${newRole}`);
      alert(`User role updated to ${newRole} (Simulation)`);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
      if (!userProfile) return;
      const updatedUser = { ...userProfile, ...data };
      setUserProfile(updatedUser);
      
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.auth.updateUser({
              data: {
                  full_name: data.name,
                  phone: data.phone,
                  battingStyle: data.battingStyle,
                  bowlingStyle: data.bowlingStyle,
                  primaryRole: data.primaryRole,
                  location: data.location,
                  bio: data.bio
              }
          });
          if(error) throw error;
      } else {
          // Mock save
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
  };

  const signInWithGoogle = async () => {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: window.location.origin
              }
          });
          if (error) throw error;
      } else {
          const user = loginMock('google_user@gmail.com', UserRole.USER);
          user.name = "Google User";
          user.avatarUrl = "https://lh3.googleusercontent.com/a/default-user=s96-c";
          localStorage.setItem('currentUser', JSON.stringify(user));
          setSession({ user });
          setUserProfile(user);
      }
  };

  const signInWithPhone = async (phone: string) => {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.auth.signInWithOtp({
              phone: phone
          });
          if (error) throw error;
      } else {
          console.log(`Mock OTP sent to ${phone}: 123456`);
          return; 
      }
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
      if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.auth.verifyOtp({
              phone,
              token,
              type: 'sms'
          });
          if (error) throw error;
      } else {
          if (token === '123456') {
              const user = loginMock(`${phone}@mobile.user`, UserRole.USER);
              user.name = "Mobile User";
              setSession({ user });
              setUserProfile(user);
          } else {
              throw new Error("Invalid OTP (Mock: use 123456)");
          }
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
     setClub(null);
  };

  const isAdmin = userProfile?.role === UserRole.ADMIN || userProfile?.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = userProfile?.role === UserRole.SUPER_ADMIN;

  return (
    <AuthContext.Provider value={{ 
        session, 
        userProfile, 
        club, 
        loading, 
        isAdmin, 
        isSuperAdmin, 
        signIn, 
        signUp, 
        signInWithGoogle, 
        signInWithPhone, 
        verifyPhoneOtp, 
        signOut,
        createClub,
        updateUserRole,
        updateProfile
    }}>
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
