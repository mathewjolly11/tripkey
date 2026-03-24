-- Ensure profiles table exists for role-based auth flow
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('tourist', 'provider', 'admin')),
  provider_type TEXT CHECK (provider_type IN ('hotel', 'transport', 'attraction')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-level security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Keep updated_at fresh on updates
CREATE OR REPLACE FUNCTION set_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_profiles_updated_at();

-- Backfill missing profile rows for existing auth users
INSERT INTO profiles (id, email, name, role)
SELECT
  au.id,
  COALESCE(au.email, ''),
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name', split_part(COALESCE(au.email, ''), '@', 1), 'TripKey User'),
  COALESCE(NULLIF(au.raw_user_meta_data ->> 'role', ''), 'tourist')
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hotel', 'transport', 'attraction')),
  title TEXT NOT NULL,
  booking_date DATE NOT NULL,
  ticket_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-level security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Users can view own bookings'
  ) THEN
    CREATE POLICY "Users can view own bookings"
      ON bookings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can insert their own bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Users can insert own bookings'
  ) THEN
    CREATE POLICY "Users can insert own bookings"
      ON bookings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update their own bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Users can update own bookings'
  ) THEN
    CREATE POLICY "Users can update own bookings"
      ON bookings FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can delete their own bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Users can delete own bookings'
  ) THEN
    CREATE POLICY "Users can delete own bookings"
      ON bookings FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Optional storage bucket for ticket files
INSERT INTO storage.buckets (id, name, public)
VALUES ('tickets', 'tickets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Ticket files are publicly readable'
  ) THEN
    CREATE POLICY "Ticket files are publicly readable"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'tickets');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload own ticket files'
  ) THEN
    CREATE POLICY "Users can upload own ticket files"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'tickets' AND auth.uid()::text = split_part(name, '/', 1));
  END IF;
END $$;
