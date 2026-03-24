'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { extractTouristTokenFromQrUrl, tryParseTripKeyPayload, addScanRecord } from '@/lib/provider-scan-history';
import { updateBookingVerification } from '@/lib/bookings';
import { Booking, supabase } from '@/lib/supabase';
import { tripKeyAlert } from '@/lib/alerts';

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
  const [verifying, setVerifying] = useState(false);

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

        // Record the scan in the database
        if (user?.id) {
          const scanStatus = matchedBooking ? 'valid' : 'no_booking';
          await addScanRecord({
            provider_id: user.id,
            tourist_id: token || null,
            booking_id: matchedBooking?.id || null,
            status: scanStatus,
            tourist_name: tourist?.name || null,
            tourist_email: tourist?.email || null,
            booking_type: matchedBooking?.type || null,
            booking_title: matchedBooking?.title || null,
            raw_payload: payload || null,
          });
        }
      } catch (err) {
        setError((err as Error).message);

        // Record failed scan
        if (user?.id) {
          await addScanRecord({
            provider_id: user.id,
            tourist_id: null,
            booking_id: null,
            status: 'invalid',
            tourist_name: null,
            tourist_email: null,
            booking_type: null,
            booking_title: null,
            raw_payload: payload || null,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    runVerification();
  }, [parsed.touristId, tokenFromUrl, user?.provider_type, user?.id, payload]);

  const handleApprove = async () => {
    if (!booking || !user?.id) return;

    setVerifying(true);
    tripKeyAlert.loading('Approving booking...');

    try {
      await updateBookingVerification(booking.id, 'approved', user.id);
      tripKeyAlert.close();
      await tripKeyAlert.success('Booking Approved', `Booking "${booking.title}" has been verified and approved.`);
      setBooking({ ...booking, verification_status: 'approved' });
    } catch (err) {
      tripKeyAlert.close();
      await tripKeyAlert.error('Error', (err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!booking || !user?.id) return;

    setVerifying(true);
    tripKeyAlert.loading('Rejecting booking...');

    try {
      await updateBookingVerification(booking.id, 'rejected', user.id);
      tripKeyAlert.close();
      await tripKeyAlert.success('Booking Rejected', `Booking "${booking.title}" has been rejected.`);
      setBooking({ ...booking, verification_status: 'rejected' });
    } catch (err) {
      tripKeyAlert.close();
      await tripKeyAlert.error('Error', (err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  const hasValidBooking = Boolean(booking);
  const isAlreadyVerified = booking?.verification_status && booking.verification_status !== 'pending';

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
                <>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Confirmation Image</h3>
                    {booking?.ticket_url ? (
                      <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                        {booking.ticket_url.toLowerCase().endsWith('.pdf') ? (
                          <a
                            href={booking.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition font-semibold"
                          >
                            📄 View PDF
                          </a>
                        ) : (
                          <img
                            src={booking.ticket_url}
                            alt="Booking confirmation"
                            className="max-h-96 rounded-lg border border-sky-300"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-600">
                        No image provided
                      </div>
                    )}
                  </div>

                  {!isAlreadyVerified && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                      <p className="text-amber-800 font-semibold mb-4">Verify the booking image and take action:</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleApprove}
                          disabled={verifying}
                          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={verifying}
                          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {isAlreadyVerified && (
                    <div
                      className={`rounded-lg p-4 mb-8 ${
                        booking.verification_status === 'approved'
                          ? 'bg-green-50 border border-green-200 text-green-700'
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}
                    >
                      <p className="font-semibold">
                        {booking.verification_status === 'approved'
                          ? '✓ Already Approved'
                          : '✗ Already Rejected'}
                      </p>
                    </div>
                  )}
                </>
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
