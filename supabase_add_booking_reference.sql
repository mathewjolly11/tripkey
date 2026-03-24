-- Add booking_reference field to bookings table
-- This stores the external booking confirmation number from hotels/providers

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_reference TEXT;

-- Add index for faster lookups by booking reference
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
