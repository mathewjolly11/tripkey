'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { tripKeyAlert } from '@/lib/alerts';

function MyQrPageContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const touristQrUrl = useMemo(() => {
    if (!user) return '';
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const url = new URL('/tripkey-pass', baseOrigin);
    url.searchParams.set('touristToken', user.id);
    url.searchParams.set('email', user.email);
    url.searchParams.set('role', user.role);
    return url.toString();
  }, [user]);

  const qrSrc = useMemo(() => {
    const encoded = encodeURIComponent(touristQrUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encoded}`;
  }, [touristQrUrl]);

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
            <h1 className="text-xl font-bold text-gray-900">My QR Pass</h1>
          </div>
          <button onClick={handleSignOut} className="btn-outline px-4 py-2 text-sm">Sign Out</button>
        </div>
      </nav>

      <main className="container-max py-10">
        <div className="max-w-2xl mx-auto card-base text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">TripKey Unified QR</h2>
          <p className="text-gray-600 mb-6">Show this QR at partner locations to verify your account quickly.</p>

          <div className="inline-flex p-4 rounded-xl bg-white border border-sky-100 shadow-sm mb-4">
            <Image src={qrSrc} alt="TripKey QR" width={280} height={280} className="rounded-md" unoptimized />
          </div>

          <p className="text-xs text-gray-500 break-all mb-6">User ID: {user?.id}</p>
          <p className="text-xs text-gray-500 break-all mb-6">Token URL: {touristQrUrl}</p>

          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/bookings" className="btn-secondary px-5 py-2">View Bookings</Link>
            <Link href="/dashboard/add-booking" className="btn-primary px-5 py-2">Add Booking</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MyQrPage() {
  return (
    <ProtectedRoute allowedRoles={['tourist']} fallbackRoute="/">
      <MyQrPageContent />
    </ProtectedRoute>
  );
}
