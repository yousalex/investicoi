
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

import { plans } from '../lib/planData';

interface UserProfile {
  id: string;
  email: string;
  plan: 'gratuito' | 'mensual' | 'trimestral' | 'semestral' | 'anual';
  plan_expires_at?: string;
  daily_usage_count: number;
  last_usage_reset: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  signup: (email: string, password: string) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  canUseService: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signup = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    
    if (data) {
      setProfile(data);
      // Sync data to Google Sheets in background
      supabase.functions.invoke('sync-to-sheets').catch(console.error);
    } else {
      // Si no existe el perfil, intentar crearlo
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          plan: 'gratuito',
          daily_usage_count: 0,
          last_usage_reset: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating profile:', createError);
      } else {
        setProfile(newProfile);
      }
    }
  };

  const canUseService = async (): Promise<boolean> => {
    if (!user || !profile) return false;

    // Paid plan users have unlimited usage
    if (profile.plan !== 'gratuito') {
      return true;
    }

    // Logic for free plan users
    const currentPlanData = plans.find(p => p.id === profile.plan);
    if (!currentPlanData) {
      console.error("Plan data not found for current plan:", profile.plan);
      return false;
    }

    if (profile.daily_usage_count >= currentPlanData.dailyUsage) {
      console.log(`User on plan '${profile.plan}' exceeded daily usage limit.`);
      return false;
    }
    
    const { error } = await supabase.rpc('increment_usage', {
      user_id: user.id
    });
    
    if (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }

    await refreshProfile();
    return true;
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        
        // Fetch profile after auth state changes
        if (session?.user) {
          refreshProfile();
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        refreshProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      session, 
      profile, 
      login, 
      signup, 
      logout, 
      refreshProfile,
      canUseService 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
