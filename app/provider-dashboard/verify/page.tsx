'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { extractTouristTokenFromQrUrl, tryParseTripKeyPayload } from '@/lib/provider-scan-history';
import { Booking, supabase } from '@/lib/supabase';

interface TouristProfile {
  id: string;
  name?: string;
  email?: string;
}

function ProviderVerifyPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const payload = searchParams.get('payload') || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touristToken, setTouristToken] = useState<string | null>(null);
  const [touristProfile, setTouristProfile] = useState<TouristProfile | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const parsed = tryParseTripKeyPayload(payload);
  const tokenFromUrl = extractTouristTokenFromQrUrl(payload);

  useEffect(() => {
    const runVerification = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = tokenFromUrl || parsed.touristId || null;
        setTouristToken(token);

        if (!token) {
          setLoading(false);
          return;
        }

        if (!user?.provider_type) {
          setError('Provider type is missing on this account.');
          setLoading(false);
          return;
        }

        const [{ data: tourist }, { data: matchedBooking, error: bookingError }] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', token)
            .maybeSingle(),
          supabase
            .from('bookings')
            .select('*')
            .eq('user_id', token)
            .eq('type', user.provider_type)
            .order('booking_date', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (bookingError) {
          throw new Error(bookingError.message);
        }

        setTouristProfile(tourist || null);
        setBooking(matchedBooking || null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    runVerification();
  }, [parsed.touristId, tokenFromUrl, user?.provider_type]);

  const hasValidBooking = Boolean(booking);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <header className="bg-white border-b border-sky-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-sky-600">Verification Result</h1>
          <p className="text-sm text-gray-600">Scanned TripKey QR details</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="card-base p-8 border border-sky-100">
          {loading && <p className="text-gray-600 mb-4">Verifying booking...</p>}
          {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>}

          {!loading && !error && (
            <>
              <div className={`mb-6 rounded-lg px-4 py-3 ${hasValidBooking ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'}`}>
                {hasValidBooking ? 'Status: VALID BOOKING' : 'No valid booking found for this provider.'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="rounded-lg border border-sky-100 p-4 bg-white">
                  <p className="text-xs text-gray-500 mb-1">Tourist Token</p>
                  <p className="font-semibold text-gray-900 break-all">{touristToken || 'Not found'}</p>
                </div>
                <div className="rounded-lg border border-sky-100 p-4 bg-white">
                  <p className="text-xs text-gray-500 mb-1">Provider Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{user?.provider_type || 'Not found'}</p>
                </div>
              </div>

              {hasValidBooking && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="rounded-lg border border-sky-100 p-4 bg-white">
                    <p className="text-xs text-gray-500 mb-1">Tourist Name</p>
                    <p className="font-semibold text-gray-900">{touristProfile?.name || 'Unknown Tourist'}</p>
                  </div>
                  <div className="rounded-lg border border-sky-100 p-4 bg-white">
                    <p className="text-xs text-gray-500 mb-1">Booking Title</p>
                    <p className="font-semibold text-gray-900">{booking?.title}</p>
                  </div>
                  <div className="rounded-lg border border-sky-100 p-4 bg-white">
                    <p className="text-xs text-gray-500 mb-1">Booking Date</p>
                    <p className="font-semibold text-gray-900">
                      {booking?.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-sky-100 p-4 bg-white">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="font-semibold text-green-700">VALID BOOKING</p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="rounded-lg border border-sky-100 p-4 bg-sky-50 mb-8">
            <p className="text-xs text-gray-500 mb-2">Raw Payload</p>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all">{payload || '(empty payload)'}</pre>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/provider-dashboard/scan" className="px-5 py-3 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition">
              Scan Next QR
            </Link>
            <Link href="/provider-dashboard/history" className="px-5 py-3 rounded-lg border-2 border-sky-500 text-sky-700 font-semibold hover:bg-sky-50 transition">
              View History
            </Link>
            <Link href="/provider-dashboard" className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProviderVerifyPage() {
  return (
    <ProtectedRoute allowedRoles={['provider', 'admin']} fallbackRoute="/dashboard">
      <ProviderVerifyPageContent />
    </ProtectedRoute>
  );
}
