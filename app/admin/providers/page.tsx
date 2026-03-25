'use client';

import { useEffect, useMemo, useState } from 'react';
import { approveProvider, getProviderQueue } from '@/lib/admin/data';
import type { ProviderType, User } from '@/lib/supabase';
import { tripKeyAlert } from '@/lib/alerts';

const PAGE_SIZE = 10;
const ACTION_TIMEOUT_MS = 2500;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

export default function AdminProvidersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [page, setPage] = useState(1);

  const approvedCount = users.filter((user) => user.role === 'provider' || user.verification_status === 'approved').length;
  const pendingCount = users.filter((user) => user.verification_status === 'pending').length;

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

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        (user.name || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const isApproved = user.role === 'provider' || user.verification_status === 'approved';
      const isPending = user.verification_status === 'pending';
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'approved' && isApproved) || (statusFilter === 'pending' && isPending);

      return matchesQuery && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportProvidersCsv = () => {
    const rows = filteredUsers.map((user) => ({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      providerType: user.provider_type || '',
      verificationStatus: user.verification_status || '',
      verificationDocument: user.verification_document_url || '',
      createdAt: user.created_at,
    }));

    const headers = ['id', 'name', 'email', 'role', 'providerType', 'verificationStatus', 'verificationDocument', 'createdAt'];
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tripkey-provider-onboarding.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    void tripKeyAlert.success('Export Complete', 'Provider onboarding data downloaded as CSV.');
  };

  const handleApprove = async (userId: string, providerType: ProviderType) => {
    const selectedUser = users.find((user) => user.id === userId);
    const confirmResult = await tripKeyAlert.confirm(
      'Approve Provider',
      `Approve ${selectedUser?.name || selectedUser?.email || 'this user'} as ${providerType}?`,
    );

    if (!confirmResult.isConfirmed) {
      return;
    }

    setBusyUserId(userId);
    tripKeyAlert.loading('Updating provider role...');
    const result = await withTimeout(approveProvider(userId, providerType), ACTION_TIMEOUT_MS);
    tripKeyAlert.close();
    setBusyUserId(null);

    if (!result) {
      await tripKeyAlert.error('Request Timeout', 'Provider update is taking too long. Please try again.');
      return;
    }

    if (result.error) {
      setError(result.error);
      await tripKeyAlert.error('Approval Failed', result.error);
      return;
    }

    await tripKeyAlert.success('Provider Approved', `User approved as ${providerType} provider.`);
    await loadProviders();
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Provider Onboarding</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review accounts requesting provider access and assign verified provider categories.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Candidates</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : users.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Approval</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{loading ? '...' : pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approved Providers</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{loading ? '...' : approvedCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, email, or ID"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'approved' | 'pending')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <button
          onClick={exportProvidersCsv}
          className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Current Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Provider Type</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Verification</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Document</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={7}>
                  Loading provider queue...
                </td>
              </tr>
            )}
            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={7}>
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              paginatedUsers.map((user) => {
                const isApproved = user.role === 'provider' || user.verification_status === 'approved';
                const isPending = user.verification_status === 'pending';
                const hasDocument = Boolean(user.verification_document_url);

                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{user.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-slate-700">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          isApproved ? 'bg-emerald-100 text-emerald-700' : isPending ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isApproved ? 'approved' : isPending ? 'pending' : 'unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-700">{user.provider_type || '-'}</td>
                    <td className="px-4 py-3">
                      {user.verification_status ? (
                        <span className="capitalize text-slate-700">{user.verification_status}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {hasDocument ? (
                        <a
                          href={user.verification_document_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-700 font-semibold"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-slate-400">No document</span>
                      )}
                    </td>
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
                              disabled={busyUserId === user.id || !hasDocument}
                              className="rounded-lg border border-sky-200 px-2.5 py-1.5 text-xs font-semibold capitalize text-sky-700 transition hover:bg-sky-50 disabled:opacity-60"
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

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
        <p className="text-slate-600">
          Showing {filteredUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
          {Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="font-medium text-slate-700">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
