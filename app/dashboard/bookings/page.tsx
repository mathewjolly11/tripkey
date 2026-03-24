'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Booking } from '@/lib/supabase';
import { fetchUserBookings } from '@/lib/bookings';
import { tripKeyAlert } from '@/lib/alerts';

function TouristBookingsPageContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const data = await fetchUserBookings(user.id);
        setBookings(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const handleSignOut = async () => {
    const result = await tripKeyAlert.signOutConfirm();
    if (result.isConfirmed) {
      await signOut();
      router.push('/');
      await tripKeyAlert.success('Signed Out', 'You have been successfully signed out.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
      <nav className="bg-white border-b border-sky-100 sticky top-0 z-40">
        <div className="container-max h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sky-600 font-semibold">← Dashboard</Link>
            <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
          </div>
          <button onClick={handleSignOut} className="btn-outline px-4 py-2 text-sm">Sign Out</button>
        </div>
      </nav>

      <main className="container-max py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">All your hotel, transport, and attraction bookings.</p>
          <Link href="/dashboard/add-booking" className="btn-primary px-5 py-2">+ Add Booking</Link>
        </div>

        {loading && <p className="text-gray-600">Loading bookings...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && bookings.length === 0 && (
          <div className="card-base text-center py-12">
            <p className="text-gray-700 mb-4">No bookings found.</p>
            <Link href="/dashboard/add-booking" className="btn-primary px-5 py-2">Add your first booking</Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card-base">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{booking.title}</p>
                    <p className="text-sm text-gray-600 capitalize">Type: {booking.type}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                    {booking.booking_reference && (
                      <p className="text-sm text-gray-700 font-medium">Confirmation: <span className="font-bold text-sky-600">{booking.booking_reference}</span></p>
                    )}
                    {booking.ticket_url && (
                      <a href={booking.ticket_url} target="_blank" rel="noreferrer" className="text-sky-600 text-sm font-medium hover:underline">
                        View Ticket
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className="inline-flex px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold capitalize w-fit">
                      {booking.status}
                    </span>
                    {booking.verification_status && (
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold capitalize w-fit ${
                        booking.verification_status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : booking.verification_status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {booking.verification_status === 'approved' && '✓ Approved'}
                        {booking.verification_status === 'rejected' && '✗ Rejected'}
                        {booking.verification_status === 'pending' && '⏳ Pending'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TouristBookingsPage() {
  return (
    <ProtectedRoute allowedRoles={['tourist']} fallbackRoute="/">
      <TouristBookingsPageContent />
    </ProtectedRoute>
  );
}
