'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { tripKeyAlert } from '@/lib/alerts';

function ProviderScanPageContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const hasScannedRef = useRef(false);

  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      if (!mounted) return;

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('tripkey-qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText: string) => {
            if (hasScannedRef.current || !user?.id) return;
            hasScannedRef.current = true;

            // Redirect to verify page immediately (don't wait to stop scanner)
            router.push(`/provider-dashboard/verify?payload=${encodeURIComponent(decodedText)}`);

            // Stop scanner in background without blocking
            setTimeout(() => {
              if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {
                  // Silently ignore stop errors
                });
              }
            }, 100);
          },
          () => {
            // Ignore per-frame decode failures.
          }
        );

        if (mounted) {
          setIsStarting(false);
        }
      } catch (err) {
        if (mounted) {
          setError((err as Error).message || 'Unable to access camera scanner.');
          setIsStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {
          // no-op cleanup
        });
      }
    };
  }, [router, user?.id]);

  const handleSignOut = async () => {
    const result = await tripKeyAlert.signOutConfirm();
    if (result.isConfirmed) {
      await signOut();
      router.push('/');
      await tripKeyAlert.success('Signed Out', 'You have been successfully signed out.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <header className="bg-white border-b border-sky-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sky-600">Scan TripKey QR</h1>
            <p className="text-sm text-gray-600">Use your camera to verify tourist passes</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/provider-dashboard/history" className="px-4 py-2 border-2 border-sky-300 rounded-lg text-sky-700 hover:bg-sky-50 transition">
              History
            </Link>
            <button onClick={handleSignOut} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="card-base border border-sky-100 p-6 mb-6">
          <p className="text-sm text-gray-600">
            Provider: <span className="font-semibold text-gray-900">{user?.name || 'N/A'}</span> ·
            Type: <span className="font-semibold text-gray-900 capitalize"> {user?.provider_type || 'N/A'}</span>
          </p>
        </div>

        <div className="card-base p-6 border border-sky-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Camera Scanner</h2>

          {isStarting && <p className="text-gray-600 mb-4">Starting camera...</p>}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4 mb-4">
              {error}
            </div>
          )}

          <div id="tripkey-qr-reader" className="w-full max-w-lg mx-auto overflow-hidden rounded-xl border border-sky-100"></div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/provider-dashboard" className="px-4 py-2 rounded-lg border-2 border-sky-500 text-sky-700 hover:bg-sky-50 transition">
              Back to Dashboard
            </Link>
            <Link href="/provider-dashboard/history" className="px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition">
              View Scan History
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProviderScanPage() {
  return (
    <ProtectedRoute allowedRoles={['provider', 'admin']} fallbackRoute="/dashboard">
      <ProviderScanPageContent />
    </ProtectedRoute>
  );
}
