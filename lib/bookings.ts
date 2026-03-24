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

    const { error: uploadError } = await supabase.storage
      .from(TICKETS_BUCKET)
      .upload(fileName, input.ticketFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!uploadError) {
      const { data: publicData } = supabase.storage.from(TICKETS_BUCKET).getPublicUrl(fileName);
      ticketUrl = publicData.publicUrl;
    } else {
      warning = `Ticket upload skipped: ${uploadError.message}`;
    }
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      booking_date: input.bookingDate,
      booking_reference: input.bookingReference || null,
      ticket_url: ticketUrl,
      status: 'upcoming',
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { booking: data, warning };
}
