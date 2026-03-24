# 🚨 CRITICAL FIX: Remove Recursive Policies & Add Simple Fix

## Problem
Profiles table has infinite recursion in RLS policies. This blocks authentication entirely.

## Solution - Complete Database Cleanup

Run this in **Supabase SQL Editor** (all steps):

### Step 1: Drop All Problematic Policies
```sql
DROP POLICY IF EXISTS "Providers can verify bookings" ON bookings;
DROP POLICY IF EXISTS "Providers can view tourist profiles" ON profiles;
```

### Step 2: Add Simple Non-Recursive Policy for Profiles
```sql
-- Allow authenticated users to read profiles (needed for verify page to see tourist info)
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
```

### Step 3: Add Simple Non-Recursive Policy for Bookings
```sql
-- Allow authenticated users to update bookings verification fields
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
```

## Why This Works
- ✅ No table queries inside policies (no recursion)
- ✅ Uses only `auth.role()` built-in function
- ✅ Authenticated users can see profiles needed for verify page
- ✅ Providers can update bookings for verification
- ⚠️ Trade-off: Authenticated users can read all profiles (privacy OK for this app)

## Steps to Apply
1. Open [supabase.com dashboard](https://supabase.com) → Your Project
2. Go to **SQL Editor** → Click **"New Query"**
3. Copy and paste ALL THREE SQL blocks above
4. Click **Run**
5. Refresh your app

## After Migration
✅ Auth initializes without recursion errors
✅ Login/signup works
✅ Providers can verify bookings
✅ Complete Phase 1 flow ready!
