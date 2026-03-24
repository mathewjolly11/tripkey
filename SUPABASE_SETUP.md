# Supabase Authentication Integration Guide

## 📋 Overview

TripKey now includes complete Supabase authentication with email/password signup, login, session management, and role-based access. Users can register as Tourists, Service Providers, or Admins.

## 🚀 Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Choose a project name (e.g., "TripKey")
4. Select a region close to your users
5. Create a strong password for your database
6. Click **"Create new project"** and wait for initialization

### Step 2: Get API Keys

1. Go to **Project Settings** → **API** (in the left sidebar)
2. Copy the following:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Paste your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Step 4: Create the `profiles` Table

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and run this SQL:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('tourist', 'provider', 'admin')),
  provider_type TEXT CHECK (provider_type IN ('hotel', 'transport', 'attraction')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click **"Run"** to execute the SQL

### Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email settings if needed

### Step 6: (Optional) Enable Google OAuth

For Google Sign In integration, follow the setup in **GOOGLE_OAUTH_SETUP.md**:

1. Create Google OAuth 2.0 credentials in Google Cloud Console
2. Add them to Supabase → Authentication → Providers → Google
3. Test Google login on the `/login` and `/signup` pages

## 📁 Project Structure

```
tripkey/
├── lib/
│   ├── supabase.ts           # Supabase client configuration
│   └── auth-context.tsx      # Authentication context provider
├── app/
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── signup/
│   │   └── page.tsx          # Signup page (2-step form)
│   ├── dashboard/
│   │   └── page.tsx          # Protected dashboard
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Home page
├── components/
│   └── Navbar.tsx            # Updated with auth UI
└── .env.local                # Environment variables (create this)
```

## 🔐 Authentication Flow

### Sign Up Flow

1. User fills in name, email, password on `/signup`
2. Enters role (Tourist/Provider) and provider type if applicable
3. System creates auth user in Supabase Auth
4. System creates profile in `profiles` table
5. User is automatically logged in and redirected to `/dashboard`

### Sign In Flow

1. User enters email and password on `/login`
2. System authenticates with Supabase Auth
3. Session is established
4. User is redirected to `/dashboard`

### Session Management

- Sessions are automatically managed by Supabase
- Auth state is maintained in `AuthProvider` context
- User data is fetched from `profiles` table on login
- Session persists across page refreshes

## 🔗 Authentication API

### useAuth Hook

```typescript
const { 
  session,      // Current Supabase session
  user,        // User profile from profiles table
  loading,     // Auth state loading
  signUp,      // Sign up function
  signIn,      // Sign in function
  signOut,     // Sign out function
  isAuthenticated  // Boolean for auth status
} = useAuth();
```

### Sign Up

```typescript
const { error } = await signUp(email, password, name, role);
```

### Sign In

```typescript
const { error } = await signIn(email, password);
```

### Sign Out

```typescript
await signOut();
```

## 📄 User Profile Schema

```typescript
interface User {
  id: string;                    // UUID from auth.users
  email: string;
  name: string;
  role: 'tourist' | 'provider' | 'admin';
  provider_type?: 'hotel' | 'transport' | 'attraction';
  created_at: string;           // ISO timestamp
}
```

## 🛡️ Security Features

- ✅ Row Level Security (RLS) enabled on profiles table
- ✅ Users can only read/update their own profiles
- ✅ Passwords handled securely by Supabase Auth
- ✅ Email verification can be configured in Supabase
- ✅ Environment variables keep secrets safe

## 🚫 Protected Routes

The `/dashboard` page automatically redirects unauthenticated users to `/login`:

```typescript
useEffect(() => {
  if (!loading && !isAuthenticated) {
    router.push('/login');
  }
}, [loading, isAuthenticated, router]);
```

## 🧪 Testing

### Create Test Account

1. Go to `/signup`
2. Fill in test data:
   - Name: John Doe
   - Email: test@example.com
   - Password: Test@123456
   - Role: Tourist
3. Click "Create Account"
4. You'll be redirected to `/dashboard`

### View Test Account in Supabase

In Supabase Dashboard:
1. Go to **Authentication** → **Users** to see auth user
2. Go to **Database** → **profiles** table to see profile data

## 🔄 Common Tasks

### Add a New Role

1. Update `profiles` table constraint in SQL
2. Update `User` interface in `lib/supabase.ts`
3. Add role option in signup form

### Fetch User Data

```typescript
const { user } = useAuth();
console.log(user.email, user.role);
```

### Update User Profile

```typescript
const { error } = await supabase
  .from('profiles')
  .update({ name: 'New Name' })
  .eq('id', user.id);
```

### Delete Account

```typescript
const { error } = await supabase.auth.admin.deleteUser(userId);
```

## 🐛 Troubleshooting

### "Unexpected token 'export'" Error

**Solution**: Ensure `.env.local` has correct URLs without any quotes or extra spaces.

### 401 Unauthorized Errors

**Solution**: 
- Check that both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify keys are from correct Supabase project
- Clear browser cache and restart dev server

### Sessions Not Persisting

**Solution**:
- Check browser cookies are enabled
- Verify `AuthProvider` wraps your entire app in layout.tsx
- Check browser console for errors

### Cannot Create profiles Table

**Solution**:
- Verify you're logged in to Supabase
- Check SQL syntax carefully
- Ensure `auth.users` table exists (created automatically by Supabase)

## 📚 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/reference/javascript/auth-signup)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Next Steps

1. ✅ Set up Supabase credentials
2. ✅ Create profiles table
3. Test sign up at `/signup`
4. Test login at `/login`
5. Add more features (email verification, password reset, OAuth, etc.)

---

**Need help? Check the Supabase docs or contact support.**
