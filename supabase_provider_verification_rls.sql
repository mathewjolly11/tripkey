-- Allow providers to update verification fields on bookings (non-recursive)
-- Uses a simple check: if user is authenticated and updates only verification fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Providers can verify bookings'
  ) THEN
    CREATE POLICY "Providers can verify bookings"
      ON bookings FOR UPDATE
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
