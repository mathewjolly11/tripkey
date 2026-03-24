'use client';

import { useEffect, useState } from 'react';
import { approveProvider, getProviderQueue } from '@/lib/admin/data';
import type { ProviderType, User } from '@/lib/supabase';

export default function AdminProvidersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadProviders = async () => {
    setLoading(true);
    const result = await getProviderQueue();
    setUsers(result.data);
    setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleApprove = async (userId: string, providerType: ProviderType) => {
    setBusyUserId(userId);
    const result = await approveProvider(userId, providerType);
    setBusyUserId(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    await loadProviders();
  };

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Approve Providers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Approve tourists as providers and assign provider type.
        </p>
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
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Current Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Provider Type</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  Loading provider queue...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              users.map((user) => {
                const isApproved = user.role === 'provider';

                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{user.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-slate-700">{user.email}</td>
                    <td className="px-4 py-3 capitalize text-slate-700">{user.role}</td>
                    <td className="px-4 py-3 capitalize text-slate-700">{user.provider_type || '-'}</td>
                    <td className="px-4 py-3">
                      {isApproved ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Approved
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(['hotel', 'transport', 'attraction'] as ProviderType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => handleApprove(user.id, type)}
                              disabled={busyUserId === user.id}
                              className="rounded-md border border-sky-200 px-2.5 py-1 text-xs font-medium capitalize text-sky-700 hover:bg-sky-50 disabled:opacity-60"
                            >
                              {busyUserId === user.id ? 'Saving...' : `Approve ${type}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
