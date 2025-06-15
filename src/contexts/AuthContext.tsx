
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Profile = {
  first_name: string | null;
  last_name: string | null;
};

type Role = 'admin';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: Role[];
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch profile
        const { data: profileData } = await (supabase as any)
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData as any);

        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);
        
        if (rolesData) {
          const userRoles = rolesData.map((r: { role: Role }) => r.role);
          setRoles(userRoles);
        } else {
          setRoles([]);
        }
        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          setRoles([]);
        }
      } else {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    // Set initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    profile,
    roles,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
