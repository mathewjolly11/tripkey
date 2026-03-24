'use client';

import { useEffect, useState } from 'react';
import { getAdminStats, getScanActivity, type AdminStats } from '@/lib/admin/data';

const emptyStats: AdminStats = {
  totalTourists: 0,
  totalProviders: 0,
  totalBookings: 0,
  totalScans: 0,
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [scanActivity, setScanActivity] = useState<
    Array<{ id: string; tourist_name: string | null; booking_title: string | null; status: string; scan_time: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      const [statsRes, scansRes] = await Promise.all([getAdminStats(), getScanActivity(20)]);

      setStats(statsRes.data);
      setScanActivity(
        scansRes.data.map((scan) => ({
          id: scan.id,
          tourist_name: scan.tourist_name,
          booking_title: scan.booking_title,
          status: scan.status,
          scan_time: scan.scan_time,
        })),
      );

      setError(statsRes.error || scansRes.error);
      setLoading(false);
    };

    loadAnalytics();
  }, []);

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">Platform metrics and scan activity timeline.</p>
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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Scan Activity</h2>
        <div className="space-y-2">
          {scanActivity.length === 0 && <p className="text-sm text-slate-500">No scans available.</p>}
          {scanActivity.map((scan) => (
            <div key={scan.id} className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-sm font-medium text-slate-900">
                {scan.tourist_name || 'Unknown tourist'} · {scan.booking_title || 'No booking title'}
              </p>
              <p className="text-xs text-slate-500">
                {scan.status} · {new Date(scan.scan_time).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
