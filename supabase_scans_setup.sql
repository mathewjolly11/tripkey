-- Create scans table for provider scan history tracking
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tourist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  scan_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('valid', 'invalid', 'no_booking')),
  tourist_name TEXT,
  tourist_email TEXT,
  booking_type TEXT,
  booking_title TEXT,
  raw_payload TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scans_provider_id ON scans(provider_id);
CREATE INDEX IF NOT EXISTS idx_scans_tourist_id ON scans(tourist_id);
CREATE INDEX IF NOT EXISTS idx_scans_scan_time ON scans(scan_time DESC);

-- Row-level security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Providers can view their own scan history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scans'
      AND policyname = 'Providers can view own scans'
  ) THEN
    CREATE POLICY "Providers can view own scans"
      ON scans FOR SELECT
      USING (auth.uid() = provider_id);
  END IF;
END $$;

-- Providers can insert their own scan records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scans'
      AND policyname = 'Providers can insert own scans'
  ) THEN
    CREATE POLICY "Providers can insert own scans"
      ON scans FOR INSERT
      WITH CHECK (auth.uid() = provider_id);
  END IF;
END $$;

-- Providers can delete their own scan history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scans'
      AND policyname = 'Providers can delete own scans'
  ) THEN
    CREATE POLICY "Providers can delete own scans"
      ON scans FOR DELETE
      USING (auth.uid() = provider_id);
  END IF;
END $$;

-- Optional: Admin can view all scans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scans'
      AND policyname = 'Admins can view all scans'
  ) THEN
    CREATE POLICY "Admins can view all scans"
      ON scans FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;
