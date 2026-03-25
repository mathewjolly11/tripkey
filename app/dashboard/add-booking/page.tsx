'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProviderType } from '@/lib/supabase';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { createBooking } from '@/lib/bookings';
import { tripKeyAlert } from '@/lib/alerts';
import { compressImage, formatFileSize } from '@/lib/file-compression';

function AddBookingPageContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [type, setType] = useState<ProviderType>('hotel');
  const [bookingId, setBookingId] = useState('');
  const [title, setTitle] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [compressedFileSize, setCompressedFileSize] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleSignOut = async () => {
    const result = await tripKeyAlert.signOutConfirm();
    if (result.isConfirmed) {
      await signOut();
      router.push('/');
      await tripKeyAlert.success('Signed Out', 'You have been successfully signed out.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarning(null);

    if (!user?.id) {
      await tripKeyAlert.error('Error', 'You must be logged in.');
      return;
    }

    // Check file size (warn if > 5MB) - image is now optional
    if (ticketFile && ticketFile.size > 5 * 1024 * 1024) {
      const result = await tripKeyAlert.confirm(
        'Large File',
        `This file is ${formatFileSize(ticketFile.size)}. Upload may take longer. Continue?`
      );
      if (!result.isConfirmed) return;
    }

    setSubmitting(true);
    let fileToUpload = ticketFile;

    try {
      if (ticketFile) {
        tripKeyAlert.loading('Compressing image...');
        // Compress image before upload
        if (ticketFile.type.startsWith('image/')) {
          fileToUpload = await compressImage(ticketFile);
          setCompressedFileSize(fileToUpload.size);
        }
        tripKeyAlert.loading('Uploading image and creating booking...');
      } else {
        tripKeyAlert.loading('Creating booking...');
      }

      const result = await createBooking({
        userId: user.id,
        type,
        title: title.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} Booking`,
        bookingDate: bookingDate || new Date().toISOString().split('T')[0],
        bookingReference: bookingReference.trim() || bookingId.trim() || undefined,
        ticketFile: fileToUpload,
      });

      tripKeyAlert.close();
      setSubmitting(false);

      if (result.warning) {
        tripKeyAlert.warning('Warning', result.warning);
      }

      tripKeyAlert.success('Booking Created!', `Your ${type} booking has been successfully created.`);

      // Navigate after a brief delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/dashboard/bookings');
    } catch (err) {
      tripKeyAlert.close();
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      await tripKeyAlert.error('Error Creating Booking', errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
      <nav className="bg-white border-b border-sky-100 sticky top-0 z-40">
        <div className="container-max h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sky-600 font-semibold">← Dashboard</Link>
            <h1 className="text-xl font-bold text-gray-900">Add Booking</h1>
          </div>
          <button onClick={handleSignOut} className="btn-outline px-4 py-2 text-sm">Sign Out</button>
        </div>
      </nav>

      <main className="container-max py-10">
        <div className="max-w-xl card-base">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Booking</h2>
          <p className="text-gray-600 mb-2">Add a new booking. Upload an image to help providers verify your booking.</p>
          <p className="text-sm text-gray-500 mb-6"><span className="text-red-500">*</span> Required fields</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-900 mb-2">
                Booking Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as ProviderType)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none"
                required
              >
                <option value="hotel">Hotel</option>
                <option value="transport">Transport</option>
                <option value="attraction">Attraction</option>
              </select>
            </div>

            <div>
              <label htmlFor="bookingId" className="block text-sm font-semibold text-gray-900 mb-2">
                Booking ID <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="bookingId"
                type="text"
                placeholder="e.g., BKG-12345, #ABC123"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">A unique identifier or reference number for this booking</p>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                Booking Title <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Example: Marina Bay Hotel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="bookingDate" className="block text-sm font-semibold text-gray-900 mb-2">
                Booking Date <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="bookingDate"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="bookingReference" className="block text-sm font-semibold text-gray-900 mb-2">
                Booking Reference/Confirmation Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="bookingReference"
                type="text"
                placeholder="e.g., BKG-12345, #ABC123"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the booking confirmation number from the hotel/service</p>
            </div>

            <div>
              <label htmlFor="ticket" className="block text-sm font-semibold text-gray-900 mb-2">
                Booking Image <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="ticket"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  setTicketFile(e.target.files?.[0] || null);
                  setCompressedFileSize(null);
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Upload confirmation screenshot/image from the service provider (PDF, PNG, JPG)</p>
              {ticketFile && (
                <div className="text-xs text-sky-600 mt-2">
                  <p>Original: {ticketFile.name} ({formatFileSize(ticketFile.size)})</p>
                  {compressedFileSize && compressedFileSize < ticketFile.size && (
                    <p className="text-green-600">Compressed: {formatFileSize(compressedFileSize)} (saves {formatFileSize(ticketFile.size - compressedFileSize)})</p>
                  )}
                </div>
              )}
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
            {warning && <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm">{warning}</div>}

            <div className="flex gap-3 pt-2">
              <Link href="/dashboard/bookings" className="btn-secondary flex-1 text-center py-3">Cancel</Link>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Booking'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function AddBookingPage() {
  return (
    <ProtectedRoute allowedRoles={['tourist']} fallbackRoute="/">
      <AddBookingPageContent />
    </ProtectedRoute>
  );
}
