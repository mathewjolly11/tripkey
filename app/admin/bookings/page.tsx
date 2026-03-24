'use client';

import { useEffect, useState } from 'react';
import { getBookingsMonitor } from '@/lib/admin/data';
import type { Booking } from '@/lib/supabase';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Monitor Bookings</h1>
        <p className="mt-1 text-sm text-slate-600">Track booking status and verification state.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
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
            {!loading && bookings.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  No bookings found.
                </td>
              </tr>
            )}
            {!loading &&
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{booking.title}</p>
                    <p className="text-xs text-slate-500">Ref: {booking.booking_reference || '-'}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{booking.type}</td>
                  <td className="px-4 py-3 text-slate-700">{new Date(booking.booking_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 capitalize text-slate-700">{booking.status}</td>
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
    </section>
  );
}
