-- Add verification status to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_verification_status ON bookings(verification_status);
CREATE INDEX IF NOT EXISTS idx_bookings_verified_by ON bookings(verified_by);
