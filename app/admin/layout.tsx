'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const adminNavItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/providers', label: 'Providers' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/analytics', label: 'Analytics' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    const confirmed = window.confirm('Sign out from admin panel?');
    if (!confirmed) return;

    await signOut();
    router.replace('/');
    router.refresh();
  };

  return (
    <ProtectedRoute allowedRoles={['admin']} fallbackRoute="/dashboard">
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <aside className="h-fit w-full max-w-xs rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 border-b border-slate-200 pb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">TripKey Admin</p>
              <p className="mt-1 text-sm text-slate-600">{user?.name || user?.email || 'Administrator'}</p>
            </div>

            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleSignOut}
              className="mt-6 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Sign Out
            </button>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
