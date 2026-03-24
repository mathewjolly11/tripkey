'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, ProviderType, User, UserRole } from '@/lib/supabase';

const OAUTH_SIGNUP_CONTEXT_KEY = 'tripkey_oauth_signup_context';

interface OAuthSignupContext {
  mode: 'login' | 'signup';
  role: UserRole;
  providerType?: ProviderType;
  createdAt: number;
}

function setOAuthSignupContext(context: OAuthSignupContext) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(OAUTH_SIGNUP_CONTEXT_KEY, JSON.stringify(context));
}

function getOAuthSignupContext(): OAuthSignupContext | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(OAUTH_SIGNUP_CONTEXT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as OAuthSignupContext;
    const isRecent = Date.now() - parsed.createdAt < 10 * 60 * 1000;
    if (!isRecent) {
      window.localStorage.removeItem(OAUTH_SIGNUP_CONTEXT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole, providerType?: ProviderType) => Promise<{ error: null | string }>;
  signIn: (email: string, password: string) => Promise<{ error: null | string }>;
  signInWithGoogle: (options?: {
    role?: UserRole;
    providerType?: ProviderType;
    mode?: 'login' | 'signup';
  }) => Promise<{ error: null | string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const upsertProfileFromSessionUser = async (
    sessionUser: Session['user'],
    fallbackRole: UserRole = 'tourist',
    fallbackProviderType?: ProviderType
  ) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('role, provider_type, name')
      .eq('id', sessionUser.id)
      .maybeSingle();

    const metadata = sessionUser.user_metadata || {};
    const metadataRole = metadata.role as UserRole | undefined;
    const metadataProviderType = metadata.provider_type as ProviderType | undefined;

    const isSignupPromotion = fallbackRole === 'provider' || fallbackRole === 'admin';
    const role = isSignupPromotion
      ? fallbackRole
      : existingProfile?.role || metadataRole || fallbackRole;
    const provider_type =
      role === 'provider'
        ? (isSignupPromotion ? fallbackProviderType : undefined) ||
          (existingProfile?.provider_type as ProviderType | undefined) ||
          metadataProviderType ||
          fallbackProviderType ||
          'hotel'
        : null;
    const name =
      existingProfile?.name ||
      metadata.full_name ||
      metadata.name ||
      sessionUser.email?.split('@')[0] ||
      'TripKey User';

    const payload = {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name,
      role,
      provider_type,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      // Temporary compatibility guard: some DBs have a trigger using NEW.updated_at
      // but the profiles table might not include that column yet.
      if (error.message.includes('record "new" has no field "updated_at"')) {
        console.warn('profiles.updated_at missing in DB; skipping profile upsert update path.');
        return;
      }
      throw new Error(`Profile upsert failed: ${error.message}`);
    }
  };

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const oauthContext = getOAuthSignupContext();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);

        if (session?.user) {
          // Ensure profile exists (important for OAuth users)
          await upsertProfileFromSessionUser(
            session.user,
            oauthContext?.mode === 'signup' ? oauthContext.role : 'tourist',
            oauthContext?.providerType
          );

          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (data) {
            setUser(data);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          const oauthContext = getOAuthSignupContext();
          try {
            await upsertProfileFromSessionUser(
              session.user,
              oauthContext?.mode === 'signup' ? oauthContext.role : 'tourist',
              oauthContext?.providerType
            );
          } catch (profileError) {
            console.error(profileError);
          }
        }

        // Fetch user profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setUser(data);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    providerType?: ProviderType
  ): Promise<{ error: null | string }> => {
    try {
      // Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        return { error: signUpError.message };
      }

      if (!data.user) {
        return { error: 'Signup failed: User not created' };
      }

      // Create user profile in profiles table
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        name,
        role,
        provider_type: role === 'provider' ? (providerType || 'hotel') : null,
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        return { error: `Profile creation failed: ${profileError.message}` };
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: null | string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const signInWithGoogle = async (options?: {
    role?: UserRole;
    providerType?: ProviderType;
    mode?: 'login' | 'signup';
  }): Promise<{ error: null | string }> => {
    try {
      const role = options?.role || 'tourist';
      const providerType = options?.providerType;
      const mode = options?.mode || 'login';

      if (mode === 'signup') {
        setOAuthSignupContext({
          mode,
          role,
          providerType,
          createdAt: Date.now(),
        });
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const callbackUrl = new URL('/auth/callback', baseUrl);
      callbackUrl.searchParams.set('mode', mode);

      if (mode === 'signup') {
        callbackUrl.searchParams.set('role', role);
        if (providerType) {
          callbackUrl.searchParams.set('provider_type', providerType);
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
