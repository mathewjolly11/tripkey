import { Booking, ProviderType, supabase } from '@/lib/supabase';

export interface CreateBookingInput {
  userId: string;
  type: ProviderType;
  title: string;
  bookingDate: string;
  bookingReference?: string;
  ticketFile?: File | null;
}

const TICKETS_BUCKET = 'tickets';

export async function fetchUserBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('booking_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createBooking(input: CreateBookingInput): Promise<{ booking: Booking | null; warning?: string }> {
  let ticketUrl: string | null = null;
  let warning: string | undefined;

  if (input.ticketFile) {
    const extension = input.ticketFile.name.split('.').pop() || 'bin';
    const fileName = `${input.userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(TICKETS_BUCKET)
        .upload(fileName, input.ticketFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        warning = `Ticket upload failed: ${uploadError.message}`;
      } else {
        // Upload succeeded, get public URL
        const { data: publicData } = supabase.storage.from(TICKETS_BUCKET).getPublicUrl(fileName);
        if (publicData && publicData.publicUrl) {
          ticketUrl = publicData.publicUrl;
        } else {
          warning = 'Could not generate public URL for image';
        }
      }
    } catch (err) {
      console.error('Ticket upload exception:', err);
      warning = `Ticket upload failed: ${(err as Error).message}`;
    }
  }

  try {
    const bookingData = {
      user_id: input.userId,
      type: input.type,
      title: input.title,
      booking_date: input.bookingDate,
      booking_reference: input.bookingReference || null,
      ticket_url: ticketUrl,
      status: 'upcoming',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select('*')
      .single();

    if (error) {
      console.error('Booking insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return { booking: data, warning };
  } catch (err) {
    console.error('Booking creation exception:', err);
    throw new Error(`Failed to create booking: ${(err as Error).message}`);
  }
}

export async function updateBookingVerification(
  bookingId: string,
  status: 'approved' | 'rejected',
  providerId: string
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      verification_status: status,
      verified_by: providerId,
      verified_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update booking verification: ${error.message}`);
  }

  return data;
}
