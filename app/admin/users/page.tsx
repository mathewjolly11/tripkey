'use client';

import { useEffect, useState } from 'react';
import { getAllUsers } from '@/lib/admin/data';
import type { User } from '@/lib/supabase';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
        <p className="mt-1 text-sm text-slate-600">View all users registered in TripKey.</p>
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
            {!loading && users.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-slate-700">{user.email}</td>
                  <td className="px-4 py-3 capitalize text-slate-700">{user.role}</td>
                  <td className="px-4 py-3 capitalize text-slate-700">{user.provider_type || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
