# Signup Fix - Complete Solution

## 🐛 Problem
Users couldn't create accounts without Google sign-in. Error: "Profile creation failed: new row violates row-level security policy for table 'profiles'"

## ✅ Solution Overview

The fix uses **two approaches** for maximum reliability:

1. **Database Trigger** - Automatically creates profiles when users sign up (bypasses RLS)
2. **Code Update** - Uses `upsert` instead of `insert` with better error handling

## 🔧 Step-by-Step Fix

### 1. Run SQL Script in Supabase

**Go to Supabase Dashboard → SQL Editor → New Query**

Copy and paste the contents of **`supabase_auth_trigger_fix.sql`** and click **Run**.

This will:
- ✅ Fix RLS policies to allow authenticated users
- ✅ Create a database trigger that auto-creates profiles
- ✅ Handle both email/password and OAuth signups
- ✅ Grant proper permissions

### 2. Code Changes (Already Applied)

**File: `lib/auth-context.tsx`**

Changes made:
- ✅ Pass user metadata (name, role, provider_type) to `signUp()`
- ✅ Changed from `insert` to `upsert` for profile creation
- ✅ Better error handling (ignores duplicate key errors)
- ✅ Added small delay for trigger completion

### 3. Deploy Changes

```bash
git add .
git commit -m "fix: resolve profile creation RLS error for email signup"
git push origin main
```

## 🧪 Testing Checklist

After deploying, test these scenarios:

### Email/Password Signup
- [ ] Go to signup page
- [ ] Enter email, password, name
- [ ] Select role (Tourist/Provider)
- [ ] Click "Sign Up"
- [ ] Should succeed without errors
- [ ] User should be logged in automatically

### Google OAuth Signup
- [ ] Go to signup page
- [ ] Click "Continue with Google"
- [ ] Complete Google authentication
- [ ] Should redirect to dashboard
- [ ] Profile should be created automatically

### Edge Cases
- [ ] Try signing up with same email twice (should show appropriate error)
- [ ] Try logging in after signup (should work)
- [ ] Check profile in Supabase Table Editor (should have correct role and data)

## 🔍 How It Works

### Database Trigger Approach

```sql
-- When a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

The trigger function:
1. Runs with `SECURITY DEFINER` (bypasses RLS)
2. Extracts user data from `raw_user_meta_data`
3. Creates profile with defaults if metadata is missing
4. Uses `ON CONFLICT DO NOTHING` to prevent duplicates

### Code Upsert Approach

```typescript
const { error: profileError } = await supabase.from('profiles').upsert({
  id: data.user.id,
  email,
  name,
  role,
  provider_type: role === 'provider' ? (providerType || 'hotel') : null,
}, { onConflict: 'id' });
```

Benefits:
- Works even if trigger fails
- Updates existing profile if needed
- Graceful error handling

## 📊 What Changed

### Files Modified:
1. **`supabase_auth_trigger_fix.sql`** (NEW) - Database trigger and policies
2. **`lib/auth-context.tsx`** - Updated signup function

### Database Changes:
1. **RLS Policies** - Updated to explicitly use `TO authenticated`
2. **Trigger Function** - `handle_new_user()` auto-creates profiles
3. **Trigger** - `on_auth_user_created` fires on new user
4. **Permissions** - Granted proper access to authenticated users

## ⚠️ Important Notes

### About Email Confirmation

If you have email confirmation enabled in Supabase:
- Users will receive a confirmation email
- Profile is created immediately (before confirmation)
- Users can only sign in after confirming email

To check/disable email confirmation:
1. Go to Supabase Dashboard
2. Authentication → Providers → Email
3. Look for "Confirm email" setting

### About the Delay

The code includes a 500ms delay after signup:
```typescript
await new Promise(resolve => setTimeout(resolve, 500));
```

This ensures the trigger completes before the upsert runs. It's a safety measure and doesn't affect user experience significantly.

## 🐛 Troubleshooting

### Still Getting RLS Error?

1. **Verify trigger was created:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Check if function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. **Verify RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

### Profile Not Created?

1. Check auth.users table:
   ```sql
   SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```

2. Check profiles table:
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
   ```

3. Check if user ID matches between tables

### Error Logs

Check browser console for detailed error messages:
- Press F12 (Developer Tools)
- Go to Console tab
- Look for red error messages during signup

## ✅ Success Criteria

You'll know it's working when:
- ✅ No RLS errors during signup
- ✅ User automatically logged in after signup
- ✅ Profile appears in Supabase Table Editor
- ✅ Both email/password and Google OAuth work
- ✅ User can access dashboard immediately

## 🚀 Next Steps

After confirming signup works:
1. Test the booking creation flow
2. Test QR code generation
3. Test provider dashboard scan feature
4. Verify all user roles work correctly

---

**Need Help?** Check Supabase logs in Dashboard → Settings → Logs
