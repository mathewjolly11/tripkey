import { supabase } from './supabase';

export interface ScanRecord {
  id: string;
  provider_id: string;
  tourist_id: string | null;
  booking_id: string | null;
  scan_time: string;
  status: 'valid' | 'invalid' | 'no_booking';
  tourist_name: string | null;
  tourist_email: string | null;
  booking_type: string | null;
  booking_title: string | null;
  raw_payload: string | null;
  created_at: string;
}

export interface CreateScanParams {
  provider_id: string;
  tourist_id?: string | null;
  booking_id?: string | null;
  status: 'valid' | 'invalid' | 'no_booking';
  tourist_name?: string | null;
  tourist_email?: string | null;
  booking_type?: string | null;
  booking_title?: string | null;
  raw_payload?: string | null;
}

// Create a scan record in the database
export async function addScanRecord(params: CreateScanParams): Promise<ScanRecord | null> {
  try {
    const { data, error } = await supabase
      .from('scans')
      .insert({
        provider_id: params.provider_id,
        tourist_id: params.tourist_id || null,
        booking_id: params.booking_id || null,
        status: params.status,
        tourist_name: params.tourist_name || null,
        tourist_email: params.tourist_email || null,
        booking_type: params.booking_type || null,
        booking_title: params.booking_title || null,
        raw_payload: params.raw_payload || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding scan record:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception adding scan record:', err);
    return null;
  }
}

// Get scan history for a provider
export async function getScanHistory(providerId: string): Promise<ScanRecord[]> {
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('provider_id', providerId)
      .order('scan_time', { ascending: false })
      .limit(500);

    if (error) {
      console.error('Error fetching scan history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching scan history:', err);
    return [];
  }
}

// Clear all scan history for a provider
export async function clearScanHistory(providerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scans')
      .delete()
      .eq('provider_id', providerId);

    if (error) {
      console.error('Error clearing scan history:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception clearing scan history:', err);
    return false;
  }
}

export function extractTouristTokenFromQrUrl(rawPayload: string): string | undefined {
  try {
    const url = new URL(rawPayload);
    return (
      url.searchParams.get('touristToken') ||
      url.searchParams.get('tourist') ||
      url.searchParams.get('token') ||
      undefined
    );
  } catch {
    return undefined;
  }
}

export function tryParseTripKeyPayload(rawPayload: string): {
  touristId?: string;
  touristEmail?: string;
  touristRole?: string;
} {
  const tokenFromUrl = extractTouristTokenFromQrUrl(rawPayload);

  if (tokenFromUrl) {
    try {
      const url = new URL(rawPayload);
      return {
        touristId: tokenFromUrl,
        touristEmail: url.searchParams.get('email') || undefined,
        touristRole: url.searchParams.get('role') || undefined,
      };
    } catch {
      return { touristId: tokenFromUrl };
    }
  }

  try {
    const parsed = JSON.parse(rawPayload) as {
      tripkey_user_id?: string;
      email?: string;
      role?: string;
    };

    return {
      touristId: parsed.tripkey_user_id,
      touristEmail: parsed.email,
      touristRole: parsed.role,
    };
  } catch {
    return {};
  }
}
