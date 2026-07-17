// src/features/auth/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      console.log('🔍 Fetching profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return;
      }

      console.log('✅ Profile fetched:', data);
      console.log('✅ Role from profile:', data?.role);
      
      setProfile(data);
      setRole(data?.role || null);
      localStorage.setItem('userRole', data?.role || 'student');
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setRole(null);
      localStorage.removeItem('userRole');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
        localStorage.removeItem('userRole');
      }
      setLoading(false);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    role,
    isAuthenticated: !!user,
    loading,
    // ADD THESE — needed by Login.jsx
    setUser,
    setProfile,
    setRole,
    signOut,
  };

  console.log('🔍 AuthProvider value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};