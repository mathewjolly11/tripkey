'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { tripKeyAlert } from '@/lib/alerts';

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

function clearOAuthSignupContext() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(OAUTH_SIGNUP_CONTEXT_KEY);
}

function getRoleRedirect(role?: string, verificationStatus?: string | null) {
  if (role === 'provider' || verificationStatus) return '/provider-onboarding';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loading } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (loading || handledRef.current) return;
      handledRef.current = true;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        clearOAuthSignupContext();
        router.replace('/login');
        router.refresh();
        return;
      }

      const url = new URL(window.location.href);
      const oauthContext = getOAuthSignupContext();
      const mode = url.searchParams.get('mode') || 'login';
      const roleParam = url.searchParams.get('role');
      const providerTypeParam = url.searchParams.get('provider_type');

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role, provider_type, name, verification_status')
        .eq('id', session.user.id)
        .maybeSingle();

      const requestedRole = (mode === 'signup'
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
      const isProviderSignup = mode === 'signup' && requestedRole === 'provider';
      const role = requestedRole as 'tourist' | 'provider' | 'admin';
      const verificationStatus = isProviderSignup
        ? 'pending'
        : existingProfile?.verification_status || 'approved';
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
          verification_status: verificationStatus,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.error('Failed to upsert profile in callback:', error);
      }

      clearOAuthSignupContext();
      if (mode === 'signup' && session.user.email) {
        const roleLabel = requestedRole === 'tourist'
          ? 'Traveler'
          : requestedRole === 'provider'
          ? 'Service Provider'
          : 'Administrator';

        fetch('/api/notifications/account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'registration',
            email: session.user.email,
            name,
            roleLabel,
          }),
        }).catch(() => undefined);
      }
      tripKeyAlert.loading('Loading your dashboard...');
      router.replace(getRoleRedirect(requestedRole, verificationStatus));
      router.refresh();
      setTimeout(() => {
        tripKeyAlert.close();
      }, 1200);
    };

    handleCallback();
  }, [loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
