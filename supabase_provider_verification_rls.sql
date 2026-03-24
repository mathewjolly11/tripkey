-- Allow providers to update verification fields on bookings
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
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'provider'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'provider'
        )
      );
  END IF;
END $$;

-- Also allow profiles query to find tourist info when scanning
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Providers can view tourist profiles'
  ) THEN
    CREATE POLICY "Providers can view tourist profiles"
      ON profiles FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles p2
          WHERE p2.id = auth.uid()
          AND p2.role = 'provider'
        )
      );
  END IF;
END $$;
