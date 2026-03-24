'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { tripKeyAlert } from '@/lib/alerts';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setReady(!!session);
    };

    bootstrap();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (submitLockRef.current || submitting) {
      return;
    }

    if (password.length < 6) {
      await tripKeyAlert.warning('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      await tripKeyAlert.warning('Password Mismatch', 'Passwords do not match.');
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    tripKeyAlert.loading('Updating password...');

    let updateError: Error | null = null;

    // Retry briefly when another auth request temporarily holds Supabase's lock.
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase.auth.updateUser({ password });
      if (!error) {
        updateError = null;
        break;
      }

      const message = error.message || '';
      const isLockError =
        message.includes('auth-token') &&
        (message.toLowerCase().includes('stole it') || message.toLowerCase().includes('lock'));

      if (!isLockError || attempt === 2) {
        updateError = new Error(message);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }

    tripKeyAlert.close();
    setSubmitting(false);
    submitLockRef.current = false;

    if (updateError) {
      await tripKeyAlert.error('Update Failed', updateError.message);
      return;
    }

    await tripKeyAlert.success('Password Updated', 'Your password was updated successfully.');
    router.replace('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-sky-100 bg-white p-6 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Set New Password</h1>
        <p className="mb-6 text-sm text-gray-600">
          Use the secure reset link from your email to update your password.
        </p>

        {!ready ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            No active password reset session found. Please open the latest reset link from your email.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-900">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-900">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-5 inline-block text-sm font-medium text-sky-600 hover:text-sky-700">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
