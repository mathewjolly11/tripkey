'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const OAUTH_SIGNUP_CONTEXT_KEY = 'tripkey_oauth_signup_context';

function getOAuthSignupContext() {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(OAUTH_SIGNUP_CONTEXT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      mode: 'login' | 'signup';
      role?: 'tourist' | 'provider' | 'admin';
      providerType?: 'hotel' | 'transport' | 'attraction';
      createdAt: number;
    };

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

function getRoleRedirect(role?: string) {
  if (role === 'provider') return '/provider-dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loading } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      if (loading) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      const url = new URL(window.location.href);
      const oauthContext = getOAuthSignupContext();
      const mode = url.searchParams.get('mode') || 'login';
      const roleParam = url.searchParams.get('role');
      const providerTypeParam = url.searchParams.get('provider_type');

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role, provider_type, name')
        .eq('id', session.user.id)
        .maybeSingle();

      const role = (mode === 'signup'
        ? roleParam || oauthContext?.role || existingProfile?.role || session.user.user_metadata?.role || 'tourist'
        : existingProfile?.role || session.user.user_metadata?.role || 'tourist') as 'tourist' | 'provider' | 'admin';
      const providerType =
        mode === 'signup'
          ? providerTypeParam ||
            oauthContext?.providerType ||
            existingProfile?.provider_type ||
            session.user.user_metadata?.provider_type ||
            'hotel'
          : existingProfile?.provider_type || session.user.user_metadata?.provider_type || 'hotel';
      const name =
        existingProfile?.name ||
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        session.user.email?.split('@')[0] ||
        'TripKey User';

      // Ensure OAuth users always have a profile row.
      const { error } = await supabase.from('profiles').upsert(
        {
          id: session.user.id,
          email: session.user.email,
          name,
          role,
          provider_type: role === 'provider' ? providerType : null,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.error('Failed to upsert profile in callback:', error);
      }

      router.push(getRoleRedirect(role));
    };

    handleCallback();
  }, [loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing your sign in...</p>
      </div>
    </div>
  );
}
