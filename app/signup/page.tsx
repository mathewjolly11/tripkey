'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

function roleRedirect(role: string) {
  if (role === 'provider') return '/provider-dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export default function SignupPage() {
  const [step, setStep] = useState(1); // Step 1: Basic info, Step 2: Role selection
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('tourist');
  const [providerType, setProviderType] = useState('hotel');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

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

    const { error } = await signUp(
      email,
      password,
      name,
      role as 'tourist' | 'provider' | 'admin',
      role === 'provider' ? (providerType as 'hotel' | 'transport' | 'attraction') : undefined
    );

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.push(roleRedirect(role));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join TripKey and simplify your travels</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-sky-500' : 'bg-gray-300'}`}></div>
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-sky-500' : 'bg-gray-300'}`}></div>
        </div>

        {/* Quick Sign Up with Google */}
        {step === 1 && (
          <>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-all flex items-center justify-center gap-2 font-semibold text-gray-900 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-600">or continue with email</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
                {error}
              </div>
            )}
          </>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="card-base space-y-4">
            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-primary w-full mt-6">
              Next: Choose Your Role
            </button>
          </form>
        )}

        {/* Step 2: Role Selection */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="card-base space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                How will you use TripKey?
              </label>
              <div className="space-y-3">
                {/* Tourist Option */}
                <button
                  type="button"
                  onClick={() => setRole('tourist')}
                  className={`w-full p-4 border-2 rounded-lg transition-all ${
                    role === 'tourist'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-sky-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">🧳 Traveler</p>
                  <p className="text-sm text-gray-600 text-left">
                    Book hotels, transport, and attractions with a unified QR pass
                  </p>
                </button>

                {/* Provider Option */}
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`w-full p-4 border-2 rounded-lg transition-all ${
                    role === 'provider'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-sky-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">🏢 Service Provider</p>
                  <p className="text-sm text-gray-600 text-left">
                    Verify guests and streamline operations with instant QR scanning
                  </p>
                </button>
              </div>
            </div>

            {/* Provider Type Selection (if provider is selected) */}
            {role === 'provider' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  What type of service do you provide?
                </label>
                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none transition-colors"
                >
                  <option value="hotel">🏨 Hotel</option>
                  <option value="transport">🚕 Transport/Taxi</option>
                  <option value="attraction">🎡 Attraction/Activity</option>
                </select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

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
                }
              }}
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-all flex items-center justify-center gap-2 font-semibold text-gray-900 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Connecting...' : `Sign up with Google as ${role === 'provider' ? 'Provider' : 'Tourist'}`}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-600">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Already have an account?{' '}
            <Link href="/login" className="text-sky-500 font-semibold hover:text-sky-600">
              Sign in
            </Link>
          </p>
          <Link href="/" className="text-sm text-gray-600 hover:text-sky-500 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
