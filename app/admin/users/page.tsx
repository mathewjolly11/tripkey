'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAllUsers } from '@/lib/admin/data';
import type { User } from '@/lib/supabase';
import { tripKeyAlert } from '@/lib/alerts';

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all');
  const [page, setPage] = useState(1);

  const totalAdmins = users.filter((user) => user.role === 'admin').length;
  const totalProviders = users.filter((user) => user.role === 'provider').length;
  const totalTourists = users.filter((user) => user.role === 'tourist').length;

  const roleBadgeClass = (role: User['role']) => {
    if (role === 'admin') return 'bg-violet-100 text-violet-700 border-violet-200';
    if (role === 'provider') return 'bg-sky-100 text-sky-700 border-sky-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const result = await getAllUsers();
      setUsers(result.data);
      setError(result.error);
      setLoading(false);
    };

    loadUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        (user.name || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesQuery && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportUsersCsv = () => {
    const rows = filteredUsers.map((user) => ({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      providerType: user.provider_type || '',
      createdAt: user.created_at,
    }));

    const headers = ['id', 'name', 'email', 'role', 'providerType', 'createdAt'];
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
    link.setAttribute('download', 'tripkey-users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    void tripKeyAlert.success('Export Complete', 'Users data downloaded as CSV.');
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Users Directory</h1>
        <p className="mt-1 text-sm text-slate-600">
          Complete user inventory across tourists, providers, and administrators.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : users.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tourists</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : totalTourists}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Providers</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : totalProviders}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Admins</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : totalAdmins}</p>
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
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as 'all' | User['role'])}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500"
          >
            <option value="all">All Roles</option>
            <option value="tourist">Tourist</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          onClick={exportUsersCsv}
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
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Provider Type</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  Loading users...
                </td>
              </tr>
            )}
            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold uppercase text-slate-600">
                        {(user.name || user.email || 'U').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name || 'Unknown User'}</p>
                        <p className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${roleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{user.provider_type || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <p>{new Date(user.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500">{new Date(user.created_at).toLocaleTimeString()}</p>
                  </td>
                </tr>
              ))}
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
