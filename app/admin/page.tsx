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
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-600">
          Central control for users, providers, bookings, and scan activity.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Tourists</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalTourists}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Providers</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalProviders}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Bookings</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalBookings}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Scans</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalScans}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              View all
            </Link>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {recentBookings.length === 0 && <li>No recent bookings.</li>}
            {recentBookings.map((booking) => (
              <li key={booking.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-medium">{booking.title}</p>
                <p className="text-slate-500">{new Date(booking.booking_date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Scan Activity</h2>
            <Link href="/admin/analytics" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              View analytics
            </Link>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {recentScans.length === 0 && <li>No scan activity.</li>}
            {recentScans.map((scan) => (
              <li key={scan.id} className="rounded-lg bg-slate-50 px-3 py-2">
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
