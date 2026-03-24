import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackRoute?: string;
}

/**
 * Client-side protected route wrapper for role-based access control
 * Used for additional client-side protection after middleware
 *
 * Example:
 * <ProtectedRoute allowedRoles={['provider', 'admin']}>
 *   <ProviderDashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackRoute = '/dashboard',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.push(fallbackRoute);
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, allowedRoles, router, fallbackRoute]);

  // Show loading state
  if (loading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-sky-200 border-t-sky-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
