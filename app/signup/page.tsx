'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { tripKeyAlert } from '@/lib/alerts';

function roleRedirect(role: string, verificationStatus?: string | null) {
  if (verificationStatus && verificationStatus !== 'approved') return '/provider-onboarding';
  if (role === 'provider') return '/provider-dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

function SignupPageContent() {
  const [step, setStep] = useState(1); // Step 1: Basic info, Step 2: Role selection
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('tourist');
  const [providerType, setProviderType] = useState('hotel');
  const [roleLocked, setRoleLocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const providerTypeParam = searchParams.get('provider_type');

    if (roleParam === 'provider' || roleParam === 'tourist' || roleParam === 'admin') {
      setRole(roleParam);
      setRoleLocked(true);
      if (roleParam === 'provider') {
        setStep(2);
      }
    }

    if (providerTypeParam === 'hotel' || providerTypeParam === 'transport' || providerTypeParam === 'attraction') {
      setProviderType(providerTypeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(roleRedirect(user?.role || 'tourist', user?.verification_status));
      router.refresh();
    }
  }, [authLoading, isAuthenticated, router, user?.role, user?.verification_status]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    tripKeyAlert.loading('Creating your account...');

    const resolvedRole = role;

    const { error } = await signUp(
      email,
      password,
      name,
      resolvedRole as 'tourist' | 'provider' | 'admin',
      resolvedRole === 'provider' ? (providerType as 'hotel' | 'transport' | 'attraction') : undefined
    );

    if (error) {
      tripKeyAlert.close();
      setError(error);
      setLoading(false);
      await tripKeyAlert.error('Sign Up Failed', error);
    } else {
      tripKeyAlert.close();
      const roleText = resolvedRole === 'tourist' ? 'Traveler' : resolvedRole === 'provider' ? 'Service Provider' : 'Administrator';
      await tripKeyAlert.success('Account Created!', `Welcome to TripKey, ${name}! You're now registered as a ${roleText}.`);
      setLoading(false);
      fetch('/api/notifications/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'registration',
          email,
          name,
          roleLabel: roleText,
        }),
      }).catch(() => undefined);
      tripKeyAlert.loading('Redirecting...');
      router.replace(roleRedirect(resolvedRole, resolvedRole === 'provider' ? 'pending' : null));
      router.refresh();
      setTimeout(() => {
        tripKeyAlert.close();
      }, 800);
    }
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
          <div className="flex justify-center mb-6">
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
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Create Account</h1>
          <p className="text-blue-100 text-lg">Join TripKey and simplify your travels</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-3 mb-8">
          <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-white shadow-lg' : 'bg-white/30'}`}></div>
          <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-white shadow-lg' : 'bg-white/30'}`}></div>
        </div>

        {/* Quick Sign Up with Google */}
        {step === 1 && (
          <>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={loading || authLoading}
              className="w-full bg-white/95 backdrop-blur-xl border-2 border-white/50 hover:bg-white px-4 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-gray-700 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="group-hover:text-gray-900 transition-colors">Continue with Google</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              <span className="text-sm font-medium text-white">or continue with email</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 mb-4">
                <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
          </>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6">
            {/* Full Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
              <p className="text-xs text-gray-500 ml-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                />
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
            <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
              Next: Choose Your Role
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>
        )}

        {/* Step 2: Role Selection */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                How will you use TripKey?
              </label>

              {roleLocked && (
                <p className="text-xs text-gray-500">
                  Role was selected from the signup link. Continue with the chosen role.
                </p>
              )}

              {/* Tourist Option */}
              <button
                type="button"
                onClick={() => setRole('tourist')}
                disabled={roleLocked}
                className={`w-full p-5 border-2 rounded-xl transition-all duration-200 text-left ${
                  role === 'tourist'
                    ? 'border-sky-500 bg-sky-50 shadow-lg scale-[1.02]'
                    : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6a3 3 0 016 0v1h3a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3V6z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg mb-1">Traveler</p>
                    <p className="text-sm text-gray-600">
                      Book hotels, transport, and attractions with a unified QR pass
                    </p>
                  </div>
                  {role === 'tourist' && (
                    <svg className="w-6 h-6 text-sky-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Provider Option */}
              <button
                type="button"
                onClick={() => setRole('provider')}
                disabled={roleLocked}
                className={`w-full p-5 border-2 rounded-xl transition-all duration-200 text-left ${
                  role === 'provider'
                    ? 'border-sky-500 bg-sky-50 shadow-lg scale-[1.02]'
                    : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h2m-2 4h2m4-4h2m-2 4h2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg mb-1">Service Provider</p>
                    <p className="text-sm text-gray-600">
                      Verify guests and streamline operations with instant QR scanning
                    </p>
                  </div>
                  {role === 'provider' && (
                    <svg className="w-6 h-6 text-sky-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            </div>

            {/* Provider Type Selection (if provider is selected) */}
            {role === 'provider' && (
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-semibold text-gray-700">
                  What type of service do you provide?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {providerType === 'transport' ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-1 4m0 0H5a1 1 0 01-1-1v-2a3 3 0 013-3h10a3 3 0 013 3v2a1 1 0 01-1 1h-1m-11 0a2 2 0 104 0m7 0a2 2 0 104 0M7 16h10M6 10h12l-1.5-4.5a2 2 0 00-1.9-1.5H9.4a2 2 0 00-1.9 1.5L6 10z" />
                      </svg>
                    ) : providerType === 'attraction' ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v2m0 4v2m0 4v1" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="transport">Transport/Taxi</option>
                    <option value="attraction">Attraction/Activity</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
                <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button
                type="submit"
                disabled={loading || authLoading}
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-sm font-medium text-gray-500">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={async () => {
                setError('');
                setLoading(true);
                const { error } = await signInWithGoogle({
                  mode: 'signup',
                  role: role as 'tourist' | 'provider' | 'admin',
                  providerType: role === 'provider' ? (providerType as 'hotel' | 'transport' | 'attraction') : undefined,
                });
                if (error) {
                  setError(error);
                  setLoading(false);
                  await tripKeyAlert.error('Sign Up Failed', error);
                }
              }}
              disabled={loading || authLoading}
              className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-4 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-gray-700 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="group-hover:text-gray-900 transition-colors">
                {loading ? 'Connecting...' : `Sign up with Google as ${role === 'provider' ? 'Provider' : 'Traveler'}`}
              </span>
            </button>
          </form>
        )}


        {/* Login Link */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-white text-base">
            Already have an account?{' '}
            <Link href="/login" className="font-bold underline hover:text-blue-100 transition-colors">
              Sign in
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center px-4 py-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-xl text-gray-700 font-medium">
            Loading signup...
          </div>
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
