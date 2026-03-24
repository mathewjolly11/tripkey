'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { clearProviderScanHistory, getProviderScanHistory, ProviderScanRecord } from '@/lib/provider-scan-history';

function ProviderHistoryPageContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<ProviderScanRecord[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    setRecords(getProviderScanHistory(user.id));
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleClearHistory = () => {
    if (!user?.id) return;
    clearProviderScanHistory(user.id);
    setRecords([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <header className="bg-white border-b border-sky-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sky-600">Scan History</h1>
            <p className="text-sm text-gray-600">Previously scanned TripKey QR records</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/provider-dashboard/scan" className="px-4 py-2 rounded-lg border-2 border-sky-300 text-sky-700 hover:bg-sky-50 transition">
              Scan
            </Link>
            <button onClick={handleSignOut} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="card-base border border-sky-100 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-600">Provider Name</p>
              <p className="font-semibold text-gray-900">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Provider Type</p>
              <p className="font-semibold text-gray-900 capitalize">{user?.provider_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="font-semibold text-gray-900">{records.length}</p>
            </div>
            <button onClick={handleClearHistory} className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition">
              Clear History
            </button>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="card-base p-10 text-center border border-sky-100">
            <p className="text-gray-600 mb-4">No scan history yet.</p>
            <Link href="/provider-dashboard/scan" className="px-5 py-3 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition">
              Start Scanning
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="card-base p-5 border border-sky-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Scanned At</p>
                    <p className="font-semibold text-gray-900">{new Date(record.scannedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tourist ID</p>
                    <p className="font-semibold text-gray-900 break-all">{record.touristId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tourist Email</p>
                    <p className="font-semibold text-gray-900 break-all">{record.touristEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tourist Role</p>
                    <p className="font-semibold text-gray-900">{record.touristRole || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Raw Payload</p>
                  <p className="text-xs text-gray-700 break-all bg-sky-50 border border-sky-100 rounded-lg p-3">{record.rawPayload}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProviderHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={['provider', 'admin']} fallbackRoute="/dashboard">
      <ProviderHistoryPageContent />
    </ProtectedRoute>
  );
}
