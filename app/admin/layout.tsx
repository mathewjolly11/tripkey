'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { tripKeyAlert } from '@/lib/alerts';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentSectionLabel = useMemo(() => {
    const matched = adminNavItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    return matched?.label || 'Overview';
  }, [pathname]);

  const handleSignOut = async () => {
    const result = await tripKeyAlert.signOutConfirm();
    if (!result.isConfirmed) return;

    tripKeyAlert.loading('Signing out...');
    try {
      await Promise.race([
        signOut(),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);

      router.replace('/login?loggedOut=1');
      router.refresh();
    } catch (error) {
      await tripKeyAlert.error('Sign Out Failed', (error as Error).message || 'Could not sign out.');
    } finally {
      tripKeyAlert.close();
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']} fallbackRoute="/dashboard">
      <div className="min-h-screen bg-slate-100 text-slate-900">
        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="flex min-h-screen">
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white px-4 py-6 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="mb-6 border-b border-slate-200 pb-4">
              <Link href="/admin" className="inline-flex items-center">
                <div className="relative h-20 w-20">
                  <Image
                    src="/tripkeylogobg.png"
                    alt="TripKey"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            <nav className="space-y-1.5">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm'
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
              className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Sign Out
            </button>
          </aside>

          <div className="w-full min-w-0">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
                  aria-label="Open navigation"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Dashboard</p>
                  <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{currentSectionLabel}</h1>
                </div>

                <div className="hidden w-full max-w-xs sm:block">
                  <input
                    type="search"
                    placeholder="Search admin"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                </div>
              </div>
            </header>

            <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
