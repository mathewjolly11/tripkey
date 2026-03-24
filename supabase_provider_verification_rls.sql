-- CRITICAL FIX: Clean RLS policies without recursion
-- Run this migration in Supabase SQL Editor

-- Step 1: Drop problematic policies
DROP POLICY IF EXISTS "Providers can verify bookings" ON bookings;
DROP POLICY IF EXISTS "Providers can view tourist profiles" ON profiles;

-- Step 2: Add simple non-recursive policy for profiles
-- Allows authenticated users to read profiles (needed for verify page to see tourist info)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Authenticated users can read profiles'
  ) THEN
    CREATE POLICY "Authenticated users can read profiles"
      ON profiles FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Step 3: Add simple non-recursive policy for bookings
-- Allows authenticated users to update bookings verification fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Authenticated users can update bookings'
  ) THEN
    CREATE POLICY "Authenticated users can update bookings"
      ON bookings FOR UPDATE
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

