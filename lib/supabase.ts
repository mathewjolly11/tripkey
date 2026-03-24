import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for authentication
export type UserRole = 'tourist' | 'provider' | 'admin';
export type ProviderType = 'hotel' | 'transport' | 'attraction';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  provider_type?: ProviderType;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  type: ProviderType;
  title: string;
  booking_date: string;
  ticket_url?: string | null;
  status: string;
  created_at: string;
}
