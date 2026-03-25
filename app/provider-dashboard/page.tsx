'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getScanHistory } from '../../lib/provider-scan-history';
import { tripKeyAlert } from '@/lib/alerts';

function ProviderDashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalScans: 0,
    todayScans: 0,
    lastScanAt: 'No scans yet',
  });

  useEffect(() => {
    if (user?.role === 'provider' && user?.verification_status !== 'approved') {
      router.replace('/provider-onboarding');
      return;
    }

    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        const history = await getScanHistory(user.id);
        const today = new Date().toDateString();
        const todayScans = history.filter((item) => new Date(item.scan_time).toDateString() === today).length;
        const lastScanAt = history.length > 0
          ? new Date(history[0].scan_time).toLocaleString()
          : 'No scans yet';

        setStats({
          totalScans: history.length,
          todayScans,
          lastScanAt,
        });
      } catch (err) {
        console.error('Failed to fetch scan stats:', err);
        setStats({
          totalScans: 0,
          todayScans: 0,
          lastScanAt: 'Unable to load',
        });
      }
    };

    fetchStats();
  }, [router, user?.id, user?.role, user?.verification_status]);

  const handleLogout = async () => {
    const result = await tripKeyAlert.signOutConfirm();
    if (result.isConfirmed) {
      tripKeyAlert.loading('Signing out...');
      try {
        await Promise.race([
          signOut(),
          new Promise((resolve) => setTimeout(resolve, 1200)),
        ]);

        router.replace('/login?loggedOut=1');
        router.refresh();
      } catch (error) {
        await tripKeyAlert.error('Sign Out Failed', (error as Error).message || 'Could not sign out.');
      } finally {
        tripKeyAlert.close();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-sky-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sky-600">Provider Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your services and requests</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-600 capitalize">{user?.provider_type || 'Service Provider'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-base p-6 mb-8 border border-sky-100 bg-gradient-to-r from-sky-50 to-white">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Provider Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-sky-100 bg-white p-4">
              <p className="text-xs text-gray-500 mb-1">Provider Name</p>
              <p className="font-semibold text-gray-900">{user?.name || 'N/A'}</p>
            </div>
            <div className="rounded-lg border border-sky-100 bg-white p-4">
              <p className="text-xs text-gray-500 mb-1">Provider Type</p>
              <p className="font-semibold text-gray-900 capitalize">{user?.provider_type || 'Not specified'}</p>
            </div>
            <div className="rounded-lg border border-sky-100 bg-white p-4">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-900 break-all">{user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card-base p-6 border-l-4 border-sky-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Scans</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalScans}</p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 16V8m6 8V5m6 11v-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card-base p-6 border-l-4 border-sky-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Today&apos;s Scans</p>
                <p className="text-3xl font-bold text-sky-600">{stats.todayScans}</p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4l2-3h6l2 3h4v12H3z" />
                  <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card-base p-6 border-l-4 border-sky-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Last Scan</p>
                <p className="text-sm font-semibold text-gray-900">{stats.lastScanAt}</p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-base p-8 border border-sky-100">
            <p className="text-xs uppercase tracking-wide text-sky-600 font-semibold mb-2">Scan TripKey QR</p>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Open Camera Scanner</h3>
            <p className="text-gray-600 mb-6">
              Scan tourist TripKey QR codes and automatically open the verification result page.
            </p>
            <Link
              href="/provider-dashboard/scan"
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 text-white px-5 py-3 font-semibold hover:bg-sky-600 transition"
            >
              Start Scanning
            </Link>
          </div>

          <div className="card-base p-8 border border-sky-100">
            <p className="text-xs uppercase tracking-wide text-sky-600 font-semibold mb-2">Scan History</p>
            <h3 className="text-xl font-bold text-gray-900 mb-3">View Previous Scans</h3>
            <p className="text-gray-600 mb-6">
              Check previously scanned QR results, timestamps, and decoded tourist details.
            </p>
            <Link
              href="/provider-dashboard/history"
              className="inline-flex items-center justify-center rounded-lg border-2 border-sky-500 text-sky-600 px-5 py-3 font-semibold hover:bg-sky-50 transition"
            >
              Open History
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProviderDashboard() {
  return (
    <ProtectedRoute allowedRoles={['provider', 'admin']}>
      <ProviderDashboardContent />
    </ProtectedRoute>
  );
}
