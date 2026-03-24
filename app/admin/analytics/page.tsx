'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAdminStats, getScanActivity, type AdminStats } from '@/lib/admin/data';

const PAGE_SIZE = 10;

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'invalid' | 'no_booking'>('all');
  const [page, setPage] = useState(1);

  const validScans = scanActivity.filter((scan) => scan.status === 'valid').length;
  const invalidScans = scanActivity.filter((scan) => scan.status === 'invalid').length;
  const noBookingScans = scanActivity.filter((scan) => scan.status === 'no_booking').length;

  const statusBadge = (status: string) => {
    if (status === 'valid') return 'bg-emerald-100 text-emerald-700';
    if (status === 'invalid') return 'bg-rose-100 text-rose-700';
    return 'bg-amber-100 text-amber-700';
  };

  const statusDistribution = [
    { label: 'Valid', key: 'valid', count: validScans, color: 'bg-emerald-500' },
    { label: 'Invalid', key: 'invalid', count: invalidScans, color: 'bg-rose-500' },
    { label: 'No Booking', key: 'no_booking', count: noBookingScans, color: 'bg-amber-500' },
  ];
  const maxDistributionValue = Math.max(...statusDistribution.map((item) => item.count), 1);

  const activityByDay = useMemo(() => {
    const counters: Record<string, number> = {};
    for (const item of scanActivity) {
      const day = new Date(item.scan_time).toLocaleDateString();
      counters[day] = (counters[day] || 0) + 1;
    }

    return Object.entries(counters)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
      .slice(-7);
  }, [scanActivity]);

  const maxDayCount = Math.max(...activityByDay.map((item) => item.count), 1);

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

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const filteredScans = useMemo(() => {
    return scanActivity.filter((scan) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        (scan.tourist_name || '').toLowerCase().includes(query) ||
        (scan.booking_title || '').toLowerCase().includes(query) ||
        scan.id.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || scan.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [scanActivity, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredScans.length / PAGE_SIZE));
  const paginatedScans = filteredScans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportScansCsv = () => {
    const rows = filteredScans.map((scan) => ({
      id: scan.id,
      touristName: scan.tourist_name || '',
      bookingTitle: scan.booking_title || '',
      status: scan.status,
      scanTime: scan.scan_time,
    }));

    const headers = ['id', 'touristName', 'bookingTitle', 'status', 'scanTime'];
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tripkey-scan-analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">Cross-platform metrics for users, bookings, and verification scan quality.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Tourists</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalTourists}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Providers</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalProviders}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Bookings</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalBookings}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Scans</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalScans}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Valid Scans</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{loading ? '...' : validScans}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Invalid Scans</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">{loading ? '...' : invalidScans}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">No Booking Scans</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{loading ? '...' : noBookingScans}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Scan Status Distribution</h2>
          <div className="space-y-4">
            {statusDistribution.map((item) => (
              <div key={item.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${(item.count / maxDistributionValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">7-Day Scan Trend</h2>
          <div className="space-y-3">
            {activityByDay.length === 0 && <p className="text-sm text-slate-500">Not enough data to build trend.</p>}
            {activityByDay.map((item) => (
              <div key={item.day} className="grid grid-cols-[84px_1fr_32px] items-center gap-3 text-sm">
                <span className="text-slate-600">{item.day}</span>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${(item.count / maxDayCount) * 100}%` }}
                  />
                </div>
                <span className="text-right font-medium text-slate-700">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Scan Activity Table</h2>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search tourist, booking, or scan ID"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 lg:w-72"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | 'valid' | 'invalid' | 'no_booking')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
            >
              <option value="all">All Status</option>
              <option value="valid">Valid</option>
              <option value="invalid">Invalid</option>
              <option value="no_booking">No Booking</option>
            </select>
            <button
              onClick={exportScansCsv}
              className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Tourist</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Booking</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Scan Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-slate-500">
                    Loading scan activity...
                  </td>
                </tr>
              )}
              {!loading && filteredScans.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-slate-500">
                    No scan activity found.
                  </td>
                </tr>
              )}
              {!loading &&
                paginatedScans.map((scan) => (
                  <tr key={scan.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{scan.tourist_name || 'Unknown tourist'}</td>
                    <td className="px-4 py-3 text-slate-700">{scan.booking_title || 'No booking title'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadge(scan.status)}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{new Date(scan.scan_time).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-slate-600">
            Showing {filteredScans.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, filteredScans.length)} of {filteredScans.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-medium text-slate-700">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
