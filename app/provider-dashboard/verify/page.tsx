'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
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

        const [{ data: tourist }, { data: bookings, error: bookingError }] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', token)
            .maybeSingle(),
          supabase
            .from('bookings')
            .select('*')
            .eq('user_id', token)
            .order('booking_date', { ascending: false }),
        ]);

        if (bookingError) {
          throw new Error(bookingError.message);
        }

        setTouristProfile(tourist || null);
        setAllBookings(bookings || []);

        // Filter bookings by provider type
        const matchingBookings = (bookings || []).filter(b => b.type === user?.provider_type);

        // Auto-select first matching booking
        const firstBooking = matchingBookings.length > 0 ? matchingBookings[0] : null;
        setSelectedBooking(firstBooking || null);

        // Record the scan in the database
        if (user?.id) {
          const scanStatus = firstBooking ? 'valid' : 'no_booking';
          await addScanRecord({
            provider_id: user.id,
            tourist_id: token || null,
            booking_id: firstBooking?.id || null,
            status: scanStatus,
            tourist_name: tourist?.name || null,
            tourist_email: tourist?.email || null,
            booking_type: firstBooking?.type || null,
            booking_title: firstBooking?.title || null,
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
    if (!selectedBooking || !user?.id) return;

    setVerifying(true);
    tripKeyAlert.loading('Approving booking...');

    try {
      await updateBookingVerification(selectedBooking.id, 'approved', user.id);
      tripKeyAlert.close();
      await tripKeyAlert.success('Booking Approved', `Booking "${selectedBooking.title}" has been verified and approved.`);
      await new Promise(resolve => setTimeout(resolve, 500));
      setSelectedBooking({ ...selectedBooking, verification_status: 'approved' });
      setVerifying(false);
    } catch (err) {
      tripKeyAlert.close();
      await tripKeyAlert.error('Error', (err as Error).message);
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !user?.id) return;

    setVerifying(true);
    tripKeyAlert.loading('Rejecting booking...');

    try {
      await updateBookingVerification(selectedBooking.id, 'rejected', user.id);
      tripKeyAlert.close();
      await tripKeyAlert.success('Booking Rejected', `Booking "${selectedBooking.title}" has been rejected.`);
      await new Promise(resolve => setTimeout(resolve, 500));
      setSelectedBooking({ ...selectedBooking, verification_status: 'rejected' });
      setVerifying(false);
    } catch (err) {
      tripKeyAlert.close();
      await tripKeyAlert.error('Error', (err as Error).message);
      setVerifying(false);
    }
  };

  const hasValidBooking = Boolean(selectedBooking);
  const isAlreadyVerified = selectedBooking?.verification_status && selectedBooking.verification_status !== 'pending';

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
                {hasValidBooking ? `Status: VALID ${user?.provider_type?.toUpperCase()} BOOKING` : `No ${user?.provider_type?.toUpperCase()} bookings found for this person.`}
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

              {allBookings.length > 0 && (
                <div className="mb-8">
                  {allBookings.filter(b => b.type === user?.provider_type).length > 0 ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select {user?.provider_type?.toUpperCase()} Booking to Verify ({allBookings.filter(b => b.type === user?.provider_type).length})</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {allBookings.filter(b => b.type === user?.provider_type).map((booking) => (
                          <button
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className={`p-4 rounded-lg border-2 text-left transition ${
                              selectedBooking?.id === booking.id
                                ? 'border-sky-500 bg-sky-50'
                                : 'border-gray-200 bg-white hover:border-sky-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{booking.title}</p>
                                <p className="text-sm text-gray-600 capitalize">{booking.type} • {new Date(booking.booking_date).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500 mt-1">Ref: {booking.booking_reference}</p>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  booking.verification_status === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : booking.verification_status === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {booking.verification_status || 'pending'}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-700">
                      <p className="font-semibold text-lg mb-2">No {user?.provider_type?.toUpperCase()} Bookings Found</p>
                      <p className="text-sm">This tourist does not have any {user?.provider_type} bookings to verify.</p>
                      {allBookings.length > 0 && (
                        <p className="text-xs mt-3 text-amber-600">
                          They have {allBookings.length} other booking{allBookings.length > 1 ? 's' : ''} ({allBookings.map(b => b.type).join(', ')}), but you can only verify {user?.provider_type} bookings.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {hasValidBooking && (
                <>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-sky-100 p-4 bg-white">
                        <p className="text-xs text-gray-500 mb-1">Title</p>
                        <p className="font-semibold text-gray-900">{selectedBooking?.title || '—'}</p>
                      </div>
                      <div className="rounded-lg border border-sky-100 p-4 bg-white">
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="font-semibold text-gray-900 capitalize">{selectedBooking?.type || '—'}</p>
                      </div>
                      <div className="rounded-lg border border-sky-100 p-4 bg-white">
                        <p className="text-xs text-gray-500 mb-1">Booking Date</p>
                        <p className="font-semibold text-gray-900">{selectedBooking?.booking_date ? new Date(selectedBooking.booking_date).toLocaleDateString() : '—'}</p>
                      </div>
                      <div className="rounded-lg border border-sky-100 p-4 bg-white">
                        <p className="text-xs text-gray-500 mb-1">Reference</p>
                        <p className="font-semibold text-gray-900 break-all">{selectedBooking?.booking_reference || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Confirmation Image</h3>
                    {selectedBooking?.ticket_url ? (
                      <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                        {selectedBooking.ticket_url.toLowerCase().endsWith('.pdf') ? (
                          <a
                            href={selectedBooking.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition font-semibold"
                          >
                            <span className="inline-flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              View PDF
                            </span>
                          </a>
                        ) : (
                          <div className="relative max-h-96 w-full overflow-hidden rounded-lg border border-sky-300 bg-white" style={{ aspectRatio: '4 / 3' }}>
                            <Image
                              src={selectedBooking.ticket_url}
                              alt="Booking confirmation"
                              fill
                              sizes="(max-width: 768px) 100vw, 640px"
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
                        <p className="font-semibold">No image provided</p>
                        <p className="text-sm mt-1">Tourist did not upload a confirmation image. You can verify using booking details above.</p>
                      </div>
                    )}
                  </div>

                  {!isAlreadyVerified && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                      <p className="text-amber-800 font-semibold mb-4">Verify the booking details and take action:</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleApprove}
                          disabled={verifying}
                          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </span>
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={verifying}
                          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {isAlreadyVerified && (
                    <div
                      className={`rounded-lg p-4 mb-8 ${
                        selectedBooking.verification_status === 'approved'
                          ? 'bg-green-50 border border-green-200 text-green-700'
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}
                    >
                      <p className="font-semibold inline-flex items-center gap-2">
                        {selectedBooking.verification_status === 'approved' ? (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Already Approved
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Already Rejected
                          </>
                        )}
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
