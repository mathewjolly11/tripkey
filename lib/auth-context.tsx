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

function clearOAuthSignupContext() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(OAUTH_SIGNUP_CONTEXT_KEY);
}

function getOAuthSignupContext(): OAuthSignupContext | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(OAUTH_SIGNUP_CONTEXT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as OAuthSignupContext;
    const isRecent = Date.now() - parsed.createdAt < 10 * 60 * 1000;
    if (!isRecent) {
      clearOAuthSignupContext();
      return null;
    }
    return parsed;
  } catch {
    clearOAuthSignupContext();
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
  requestPasswordReset: (email: string) => Promise<{ error: null | string }>;
  deleteAccount: () => Promise<{ error: null | string }>;
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
        return;
      }
      throw new Error(`Profile upsert failed: ${error.message}`);
    }
  };

  const fetchProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return (data as User | null) || null;
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

          const profile = await fetchProfile(session.user.id);

          if (profile) {
            setUser(profile);
          } else {
            // Keep app usable even if profile row is delayed.
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] ||
                'TripKey User',
              role: (oauthContext?.mode === 'signup' ? oauthContext.role : 'tourist') || 'tourist',
              provider_type: oauthContext?.providerType,
              created_at: new Date().toISOString(),
            });
          }

          clearOAuthSignupContext();
        } else {
          clearOAuthSignupContext();
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

          const profile = await fetchProfile(session.user.id);
          if (profile) {
            setUser(profile);
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] ||
                'TripKey User',
              role: (oauthContext?.mode === 'signup' ? oauthContext.role : 'tourist') || 'tourist',
              provider_type: oauthContext?.providerType,
              created_at: new Date().toISOString(),
            });
          }

          clearOAuthSignupContext();
          return;
        }

        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser(profile);
        }
      } else {
        setUser(null);
        clearOAuthSignupContext();
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
        options: {
          data: {
            name,
            role,
            provider_type: role === 'provider' ? (providerType || 'hotel') : null,
          }
        }
      });

      if (signUpError) {
        return { error: signUpError.message };
      }

      if (!data.user) {
        return { error: 'Signup failed: User not created' };
      }

      // Wait a bit for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create user profile in profiles table
      // Using upsert to handle cases where profile might already exist from trigger
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        name,
        role,
        provider_type: role === 'provider' ? (providerType || 'hotel') : null,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

      if (profileError) {
        // Log but don't fail if it's just a conflict issue
        console.error('Profile upsert error:', profileError);
        // Only fail if it's not a duplicate key error
        if (!profileError.message.includes('duplicate') && !profileError.message.includes('already exists')) {
          return { error: `Profile creation failed: ${profileError.message}` };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: null | string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await upsertProfileFromSessionUser(data.user, 'tourist');
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
      clearOAuthSignupContext();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ error: null | string }> => {
    try {
      const response = await fetch('/api/account/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        return { error: payload?.error || 'Unable to send reset email.' };
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const deleteAccount = async (): Promise<{ error: null | string }> => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      const accessToken = currentSession?.access_token;
      if (!accessToken) {
        return { error: 'No active session found.' };
      }

      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        return { error: payload?.error || 'Failed to delete account.' };
      }

      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      clearOAuthSignupContext();

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
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
    requestPasswordReset,
    deleteAccount,
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
