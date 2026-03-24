'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBookingsMonitor } from '@/lib/admin/data';
import type { Booking } from '@/lib/supabase';
import { tripKeyAlert } from '@/lib/alerts';

const PAGE_SIZE = 10;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Booking['type']>('all');
  const [page, setPage] = useState(1);

  const pendingCount = bookings.filter((booking) => (booking.verification_status || 'pending') === 'pending').length;
  const approvedCount = bookings.filter((booking) => booking.verification_status === 'approved').length;
  const rejectedCount = bookings.filter((booking) => booking.verification_status === 'rejected').length;

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      const result = await getBookingsMonitor();
      setBookings(result.data);
      setError(result.error);
      setLoading(false);
    };

    loadBookings();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, verificationFilter, typeFilter]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        booking.title.toLowerCase().includes(query) ||
        (booking.booking_reference || '').toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query);

      const verification = booking.verification_status || 'pending';
      const matchesVerification = verificationFilter === 'all' || verification === verificationFilter;
      const matchesType = typeFilter === 'all' || booking.type === typeFilter;

      return matchesQuery && matchesVerification && matchesType;
    });
  }, [bookings, searchQuery, verificationFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const paginatedBookings = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportBookingsCsv = () => {
    const rows = filteredBookings.map((booking) => ({
      id: booking.id,
      title: booking.title,
      type: booking.type,
      bookingDate: booking.booking_date,
      bookingReference: booking.booking_reference || '',
      status: booking.status,
      verificationStatus: booking.verification_status || 'pending',
      createdAt: booking.created_at,
    }));

    const headers = ['id', 'title', 'type', 'bookingDate', 'bookingReference', 'status', 'verificationStatus', 'createdAt'];
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
    link.setAttribute('download', 'tripkey-bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    void tripKeyAlert.success('Export Complete', 'Bookings data downloaded as CSV.');
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Bookings Control</h1>
        <p className="mt-1 text-sm text-slate-600">Track booking quality, operational status, and verification outcomes.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Bookings</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : bookings.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{loading ? '...' : pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{loading ? '...' : approvedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">{loading ? '...' : rejectedCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title, reference, or booking ID"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
          />
          <select
            value={verificationFilter}
            onChange={(event) => setVerificationFilter(event.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
          >
            <option value="all">All Verification</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as 'all' | Booking['type'])}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
          >
            <option value="all">All Types</option>
            <option value="hotel">Hotel</option>
            <option value="transport">Transport</option>
            <option value="attraction">Attraction</option>
          </select>
        </div>

        <button
          onClick={exportBookingsCsv}
          className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Booking</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  Loading bookings...
                </td>
              </tr>
            )}
            {!loading && filteredBookings.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  No bookings found.
                </td>
              </tr>
            )}
            {!loading &&
              paginatedBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{booking.title}</p>
                    <p className="text-xs text-slate-500">Ref: {booking.booking_reference || '-'}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{booking.type}</td>
                  <td className="px-4 py-3 text-slate-700">{new Date(booking.booking_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        booking.verification_status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : booking.verification_status === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {booking.verification_status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
        <p className="text-slate-600">
          Showing {filteredBookings.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
          {Math.min(page * PAGE_SIZE, filteredBookings.length)} of {filteredBookings.length}
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
    </section>
  );
}
