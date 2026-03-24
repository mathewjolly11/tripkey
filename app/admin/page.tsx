'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { tripKeyAlert } from '@/lib/alerts';

function AdminDashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalTourists: 0,
    totalProviders: 0,
    totalAdmins: 0,
    totalRequests: 0,
    completedRequests: 0,
  });

  const handleLogout = async () => {
    const result = await tripKeyAlert.signOutConfirm();
    if (result.isConfirmed) {
      await signOut();
      router.push('/');
      await tripKeyAlert.success('Signed Out', 'You have been successfully signed out.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-violet-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-violet-600">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">System administration and monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-600">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-base p-6 border-l-4 border-violet-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{adminStats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="card-base p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Tourists</p>
                <p className="text-3xl font-bold text-blue-600">{adminStats.totalTourists}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎒</span>
              </div>
            </div>
          </div>

          <div className="card-base p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Providers</p>
                <p className="text-3xl font-bold text-green-600">{adminStats.totalProviders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="card-base p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{adminStats.totalRequests}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="card-base p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Completed Requests</p>
                <p className="text-3xl font-bold text-green-600">{adminStats.completedRequests}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Functions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div className="card-base p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition text-left font-medium">
                👥 View All Users
              </button>
              <button className="w-full px-4 py-3 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition text-left font-medium">
                🔍 Search by Email
              </button>
              <button className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-left font-medium">
                🚫 Manage Banned Users
              </button>
            </div>
          </div>

          {/* System Monitoring */}
          <div className="card-base p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Monitoring</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-left font-medium">
                📊 View Analytics
              </button>
              <button className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-left font-medium">
                🔔 System Alerts
              </button>
              <button className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-left font-medium">
                📝 Activity Logs
              </button>
            </div>
          </div>

          {/* Content Moderation */}
          <div className="card-base p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Content Moderation</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition text-left font-medium">
                ⚠️ Review Flagged Content
              </button>
              <button className="w-full px-4 py-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition text-left font-medium">
                💬 Manage Reports
              </button>
              <button className="w-full px-4 py-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition text-left font-medium">
                🏷️ Spam Detection
              </button>
            </div>
          </div>

          {/* System Settings */}
          <div className="card-base p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Settings</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-left font-medium">
                ⚙️ Settings & Configuration
              </button>
              <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-left font-medium">
                🔐 Security Settings
              </button>
              <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-left font-medium">
                📧 Email Templates
              </button>
            </div>
          </div>
        </div>

        {/* Admin Info Card */}
        <div className="card-base p-8 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Administrator Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Admin Name</p>
              <p className="font-medium text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Role</p>
              <p className="font-medium text-gray-900 capitalize">Administrator</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Member Since</p>
              <p className="font-medium text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
