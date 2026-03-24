'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminStats, getBookingsMonitor, getScanActivity, type AdminStats } from '@/lib/admin/data';

const emptyStats: AdminStats = {
  totalTourists: 0,
  totalProviders: 0,
  totalBookings: 0,
  totalScans: 0,
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentBookings, setRecentBookings] = useState<Array<{ id: string; title: string; booking_date: string }>>([]);
  const [recentScans, setRecentScans] = useState<Array<{ id: string; tourist_name: string | null; status: string; scan_time: string }>>([]);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError(null);

      const [statsRes, bookingsRes, scansRes] = await Promise.all([
        getAdminStats(),
        getBookingsMonitor(5),
        getScanActivity(5),
      ]);

      setStats(statsRes.data);
      setRecentBookings(
        bookingsRes.data.map((booking) => ({
          id: booking.id,
          title: booking.title,
          booking_date: booking.booking_date,
        })),
      );
      setRecentScans(
        scansRes.data.map((scan) => ({
          id: scan.id,
          tourist_name: scan.tourist_name,
          status: scan.status,
          scan_time: scan.scan_time,
        })),
      );

      setError(statsRes.error || bookingsRes.error || scansRes.error);
      setLoading(false);
    };

    loadOverview();
  }, []);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-500 to-cyan-500 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold md:text-3xl">TripKey Admin Console</h1>
        <p className="mt-2 text-sm text-sky-50 md:text-base">
          Operations hub for platform users, provider approvals, booking quality, and scan monitoring.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Tourists</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalTourists}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Verified Providers</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalProviders}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Bookings</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalBookings}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Scan Events</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalScans}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Operational Priorities</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Review provider approvals and missing profile details.</li>
            <li>Investigate rejected bookings and repeated verification failures.</li>
            <li>Track scan errors by provider category and time of day.</li>
            <li>Keep booking to scan conversion healthy across all providers.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/admin/users"
              className="block rounded-lg border border-sky-200 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
            >
              Open Users
            </Link>
            <Link
              href="/admin/providers"
              className="block rounded-lg border border-sky-200 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
            >
              Review Providers
            </Link>
            <Link
              href="/admin/bookings"
              className="block rounded-lg border border-sky-200 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
            >
              Monitor Bookings
            </Link>
            <Link
              href="/admin/analytics"
              className="block rounded-lg border border-sky-200 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              View all
            </Link>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {recentBookings.length === 0 && <li>No recent bookings.</li>}
            {recentBookings.map((booking) => (
              <li key={booking.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="font-medium">{booking.title}</p>
                <p className="text-slate-500">{new Date(booking.booking_date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Scan Activity</h2>
            <Link href="/admin/analytics" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              View analytics
            </Link>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {recentScans.length === 0 && <li>No scan activity.</li>}
            {recentScans.map((scan) => (
              <li key={scan.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="font-medium">{scan.tourist_name || 'Unknown tourist'}</p>
                <p className="text-slate-500">
                  {scan.status} · {new Date(scan.scan_time).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
