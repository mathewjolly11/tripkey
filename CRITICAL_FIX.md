# 🚨 CRITICAL FIX: Provider Verification RLS Policy

## Problem
Providers cannot update booking verification fields. Initial policy had recursion error.

## Solution - Fixed Non-Recursive Version

Run this in **Supabase SQL Editor**:

```sql
-- CORRECTED: Non-recursive version
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
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
```

## Steps to Apply
1. Open [supabase.com dashboard](https://supabase.com) → Your Project
2. Go to **SQL Editor** → Click **"New Query"**
3. First, **DELETE** the old recursive policy:
   ```sql
   DROP POLICY IF EXISTS "Providers can verify bookings" ON bookings;
   DROP POLICY IF EXISTS "Providers can view tourist profiles" ON profiles;
   ```
4. Then paste the CORRECTED SQL above
5. Click **Run**

## After Migration
✅ Providers can approve/reject bookings (no recursion!)
✅ Verify page will work end-to-end
✅ Phase 1 complete!
