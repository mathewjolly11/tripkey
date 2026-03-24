'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Booking, supabase } from '@/lib/supabase';
import { tripKeyAlert } from '@/lib/alerts';

function TouristDashboardHome() {
  const { user, loading, isAuthenticated, signOut, requestPasswordReset, deleteAccount } = useAuth();
  const router = useRouter();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [fetchingBookings, setFetchingBookings] = useState(true);
  const [accountActionLoading, setAccountActionLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return;

      try {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('booking_date', { ascending: true })
          .limit(3);

        setRecentBookings(data || []);
      } catch (err) {
        console.error('Failed to load bookings:', err);
        setRecentBookings([]);
      } finally {
        setFetchingBookings(false);
      }
    };

    loadBookings();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    const result = await tripKeyAlert.signOutConfirm();
    if (result.isConfirmed) {
      await signOut();
      router.push('/');
      await tripKeyAlert.success('Signed Out', 'You have been successfully signed out.');
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setAccountActionLoading(true);
    tripKeyAlert.loading('Sending reset email...');

    const { error } = await requestPasswordReset(user.email);

    tripKeyAlert.close();
    setAccountActionLoading(false);

    if (error) {
      await tripKeyAlert.error('Could not send reset email', error);
      return;
    }

    await tripKeyAlert.success(
      'Reset Email Sent',
      'Check your inbox for the password reset link. SMTP must be configured in Supabase.',
    );
  };

  const handleDeleteAccount = async () => {
    const result = await tripKeyAlert.confirm(
      'Delete Account?',
      'This permanently deletes your TripKey account and all related access. This cannot be undone.',
    );

    if (!result.isConfirmed) return;

    setAccountActionLoading(true);
    tripKeyAlert.loading('Deleting account...');

    const { error } = await deleteAccount();

    tripKeyAlert.close();
    setAccountActionLoading(false);

    if (error) {
      await tripKeyAlert.error('Delete Failed', error);
      return;
    }

    await tripKeyAlert.success('Account Deleted', 'Your account has been deleted successfully.');
    router.replace('/');
    router.refresh();
  };

  const upcomingCount = recentBookings.filter((booking) => booking.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-sky-100 sticky top-0 z-40">
        <div className="container-max">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">TripKey</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="btn-outline px-5 py-2 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-max py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Card */}
          <div className="lg:col-span-2">
            <div className="card-base">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome, {user.name}! 👋
                  </h1>
                  <p className="text-gray-600">Your tourist dashboard for managing your complete trip in one place</p>
                </div>
              </div>

              {/* User Details */}
              <div className="bg-gradient-sky-light p-6 rounded-lg border border-sky-200 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Profile</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Type</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-sky-500 text-white text-sm font-semibold rounded-full capitalize">
                        Tourist
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <h3 className="font-semibold text-gray-900 mb-4">Tourist Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/bookings" className="p-4 border-2 border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all">
                  <p className="font-semibold text-gray-900 mb-1">📚 My Bookings</p>
                  <p className="text-sm text-gray-600">See all hotel, transport, and attraction reservations</p>
                </Link>
                <Link href="/dashboard/add-booking" className="p-4 border-2 border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all">
                  <p className="font-semibold text-gray-900 mb-1">➕ Add Booking</p>
                  <p className="text-sm text-gray-600">Add a new booking and optionally upload your ticket</p>
                </Link>
                <Link href="/dashboard/my-qr" className="p-4 border-2 border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all">
                  <p className="font-semibold text-gray-900 mb-1">🎟️ My QR Pass</p>
                  <p className="text-sm text-gray-600">View your TripKey QR to verify bookings instantly</p>
                </Link>
                <div className="p-4 border-2 border-gray-300 rounded-lg bg-white">
                  <p className="font-semibold text-gray-900 mb-1">🧭 Travel Status</p>
                  <p className="text-sm text-gray-600">{upcomingCount} upcoming bookings in your account</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Bookings</h3>
                {fetchingBookings ? (
                  <p className="text-sm text-gray-600">Loading recent bookings...</p>
                ) : recentBookings.length === 0 ? (
                  <p className="text-sm text-gray-600">No bookings yet. Add your first one from Add Booking.</p>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="p-3 rounded-lg border border-sky-100 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{booking.title}</p>
                          <span className="px-2 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold capitalize">{booking.status}</span>
                        </div>
                        <p className="text-xs text-gray-600 capitalize mb-2">{booking.type} • {new Date(booking.booking_date).toLocaleDateString()}</p>
                        {booking.verification_status && (
                          <div className={`px-2 py-1 rounded text-xs font-semibold capitalize inline-block ${
                            booking.verification_status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : booking.verification_status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {booking.verification_status === 'approved' && '✓ Verified'}
                            {booking.verification_status === 'rejected' && '✗ Rejected'}
                            {booking.verification_status === 'pending' && '⏳ Pending Review'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card-base bg-gradient-sky-light border-2 border-sky-200">
              <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Account Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Email Verified</span>
                </div>
              </div>

              <hr className="my-4 border-sky-300" />

              <p className="text-xs text-gray-600 leading-relaxed">
                Welcome to TripKey! Start by exploring the features and setting up your profile.
              </p>

              <Link href="/dashboard/add-booking" className="btn-primary w-full mt-4 inline-block text-center">
                Add First Booking
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="card-base mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Recent Bookings</p>
                  <p className="font-semibold text-gray-900">{recentBookings.length}</p>
                </div>
              </div>
            </div>

            <div className="card-base mt-6 border-2 border-sky-100">
              <h3 className="font-semibold text-gray-900 mb-4">Account Security</h3>
              <div className="space-y-3">
                <button
                  onClick={handlePasswordReset}
                  disabled={accountActionLoading}
                  className="w-full rounded-lg border-2 border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Change Password (Email Link)
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={accountActionLoading}
                  className="w-full rounded-lg border-2 border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete My Account
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-600">
                Password reset uses SMTP email delivery from Supabase Auth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['tourist']} fallbackRoute="/">
      <TouristDashboardHome />
    </ProtectedRoute>
  );
}
