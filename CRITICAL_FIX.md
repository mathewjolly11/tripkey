# 🚨 CRITICAL FIX: Provider Verification RLS Policy

## Problem
Providers cannot update booking verification fields because RLS policy only allows users to update **their own** bookings.

## Solution
Run this SQL migration in **Supabase SQL Editor**:

```sql
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

-- Allow profiles query to find tourist info when scanning
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
```

## Steps to Apply
1. Open [supabase.com dashboard](https://supabase.com) → Your Project
2. Go to **SQL Editor** → Click **"New Query"**
3. Paste the SQL above
4. Click **Run**

## After Migration
✅ Providers can approve/reject bookings
✅ Verify page will work end-to-end
✅ Phase 1 complete!
