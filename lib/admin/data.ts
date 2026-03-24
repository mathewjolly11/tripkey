import { supabase, type Booking, type ProviderType, type Scan, type User } from '@/lib/supabase';

export interface AdminStats {
  totalTourists: number;
  totalProviders: number;
  totalBookings: number;
  totalScans: number;
}

export interface AdminResult<T> {
  data: T;
  error: string | null;
}

export async function getAdminStats(): Promise<AdminResult<AdminStats>> {
  const [touristsRes, providersRes, bookingsRes, scansRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'tourist'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'provider'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('scans').select('id', { count: 'exact', head: true }),
  ]);

  const firstError =
    touristsRes.error || providersRes.error || bookingsRes.error || scansRes.error;

  return {
    data: {
      totalTourists: touristsRes.count || 0,
      totalProviders: providersRes.count || 0,
      totalBookings: bookingsRes.count || 0,
      totalScans: scansRes.count || 0,
    },
    error: firstError ? firstError.message : null,
  };
}

export async function getAllUsers(): Promise<AdminResult<User[]>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, role, provider_type, created_at')
    .order('created_at', { ascending: false });

  return {
    data: (data || []) as User[],
    error: error ? error.message : null,
  };
}

export async function getProviderQueue(): Promise<AdminResult<User[]>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, role, provider_type, created_at')
    .in('role', ['tourist', 'provider'])
    .order('created_at', { ascending: false });

  return {
    data: (data || []) as User[],
    error: error ? error.message : null,
  };
}

export async function approveProvider(
  userId: string,
  providerType: ProviderType = 'hotel',
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'provider', provider_type: providerType })
    .eq('id', userId);

  return { error: error ? error.message : null };
}

export async function getBookingsMonitor(limit = 100): Promise<AdminResult<Booking[]>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, user_id, type, title, booking_date, booking_reference, status, verification_status, verified_by, verified_at, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  return {
    data: (data || []) as Booking[],
    error: error ? error.message : null,
  };
}

export async function getScanActivity(limit = 100): Promise<AdminResult<Scan[]>> {
  const { data, error } = await supabase
    .from('scans')
    .select('id, provider_id, tourist_id, booking_id, scan_time, status, tourist_name, tourist_email, booking_type, booking_title, raw_payload, created_at')
    .order('scan_time', { ascending: false })
    .limit(limit);

  return {
    data: (data || []) as Scan[],
    error: error ? error.message : null,
  };
}
