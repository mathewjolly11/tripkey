'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { tripKeyAlert } from '@/lib/alerts';

function roleRedirect(role?: string, verificationStatus?: string | null) {
  if (role === 'provider' || verificationStatus) return '/provider-onboarding';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const { signIn, signInWithGoogle, requestPasswordReset, isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      tripKeyAlert.loading('Redirecting...');
      router.replace(roleRedirect(user?.role, user?.verification_status));
      router.refresh();
      setTimeout(() => {
        tripKeyAlert.close();
      }, 800);
    }
  }, [authLoading, isAuthenticated, router, user?.role, user?.verification_status]);

  useEffect(() => {
    const loggedOut = searchParams.get('loggedOut');
    if (loggedOut === '1') {
      tripKeyAlert.success('Logout Successful', 'You have been signed out.');
      router.replace('/login');
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    tripKeyAlert.loading('Signing in...');

    const { error } = await signIn(email, password);

    if (error) {
      tripKeyAlert.close();
      setError(error);
      setSubmitting(false);
      await tripKeyAlert.error('Sign In Failed', error);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        tripKeyAlert.close();
        setSubmitting(false);
        router.replace('/dashboard');
        router.refresh();
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, verification_status')
        .eq('id', user.id)
        .maybeSingle();

      tripKeyAlert.close();
      await tripKeyAlert.success('Welcome!', `Signed in successfully as ${user.email}`);
      setSubmitting(false);
      tripKeyAlert.loading('Redirecting...');
      router.replace(roleRedirect(profile?.role, profile?.verification_status || null));
      router.refresh();
      setTimeout(() => {
        tripKeyAlert.close();
      }, 800);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      await tripKeyAlert.info('Enter Your Email', 'Please enter your email first, then click Forgot Password again.');
      return;
    }

    setSendingReset(true);
    tripKeyAlert.loading('Sending reset email...');

    const { error } = await requestPasswordReset(email);

    tripKeyAlert.close();
    setSendingReset(false);

    if (error) {
      await tripKeyAlert.error('Reset Failed', error);
      return;
    }

    await tripKeyAlert.success(
      'Reset Email Sent',
      'Check your inbox for the reset link. SMTP must be configured in Supabase Auth.',
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center justify-center rounded-2xl bg-white shadow-2xl px-6 py-3 transform hover:scale-105 transition-transform duration-300">
              <div className="relative h-12 w-40">
                <Image
                  src="/tripkeylogobg.png"
                  alt="TripKey"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Welcome Back</h1>
          <p className="text-blue-100 text-lg">Sign in to your TripKey account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset || submitting || authLoading}
                className="text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {sendingReset ? 'Sending...' : 'Forgot password?'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
              <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || authLoading}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-sm font-medium text-gray-500">or continue with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={async () => {
              setError('');
              setSubmitting(true);
              const { error } = await signInWithGoogle();
              if (error) {
                setError(error);
                setSubmitting(false);
                await tripKeyAlert.error('Sign In Failed', error);
              }
            }}
            disabled={submitting || authLoading}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-4 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-gray-700 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="group-hover:text-gray-900 transition-colors">
              {submitting ? 'Connecting...' : 'Sign in with Google'}
            </span>
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-white text-base">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold underline hover:text-blue-100 transition-colors">
              Create one
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
