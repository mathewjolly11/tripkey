# Google OAuth Setup Guide for TripKey

## 🔐 Overview

TripKey now supports Google OAuth authentication. Users can sign up and log in with their Google account, making onboarding faster and more convenient.

## 📋 Prerequisites

1. Supabase project already set up (see SUPABASE_SETUP.md)
2. Google Cloud Console account
3. A Google OAuth 2.0 credential

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Google OAuth 2.0 Credential

#### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

#### 1.2 Enable Google+ API
1. Click on "APIs & Services" in the left sidebar
2. Click "Library"
3. Search for "Google+ API"
4. Click on it and press "Enable"

#### 1.3 Create OAuth 2.0 Credentials
1. Go back to "APIs & Services"
2. Click "Credentials" in the left sidebar
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Choose "Web application"
5. Under "Authorized redirect URIs", add:
   - **Development**: `http://localhost:3000/auth/callback`
   - **Production**: `https://yourdomain.com/auth/callback`
6. Click "Create"
7. Copy your **Client ID** (you'll need this next)

---

### Step 2: Configure in Supabase

#### 2.1 Add Google Provider
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find and click on **Google**
5. Toggle it **ON**
6. Paste your Google OAuth 2.0 **Client ID** from Google Cloud Console
7. Click **Save**

#### 2.2 Set Callback URL in Supabase
1. In the same Google provider settings
2. Note the Callback URL (should be `https://your-project-id.supabase.co/auth/v1/callback`)
3. This will be used in your Google Cloud Console (already added above)

---

### Step 3: Update Environment Variables

Your `.env.local` already has the necessary Supabase configuration. The Google OAuth is automatically configured through Supabase.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

No additional environment variables needed for Google OAuth!

---

## 🧪 Testing Google OAuth

### Test Sign Up with Google

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Go to signup page**: `http://localhost:3000/signup`

3. **Click "Sign up with Google"**
   - You'll be redirected to Google login
   - Sign in with your Google account
   - You'll be redirected back to `/auth/callback`
   - Then automatically redirected to `/dashboard`

4. **Check Supabase**:
   - Go to **Authentication** → **Users**
   - You should see your Google account user
   - Go to **Database** → **profiles** table
   - You should see your profile created automatically

### Test Sign In with Google

1. **Go to login page**: `http://localhost:3000/login`

2. **Click "Sign in with Google"**
   - Same flow as signup
   - If account exists, you'll be logged into existing account
   - If account doesn't exist, a new one will be created

---

## 🔄 How Google OAuth Works

### Flow Diagram

```
User → TripKey Login/Signup
    ↓
User clicks "Sign in with Google"
    ↓
Redirects to Google Login (Google OAuth)
    ↓
User signs in with Google
    ↓
Google redirects to TripKey (/auth/callback)
    ↓
Supabase creates/verifies user session
    ↓
AuthProvider fetches user profile
    ↓
Redirects to /dashboard
    ↓
User is logged in ✓
```

---

## 👤 Auto-Profile Creation

When a user signs in with Google for the first time:

1. **Supabase Auth** creates an auth user with:
   - Google email
   - Google profile picture (optional)
   - Verified email (Gmail verified)

2. **Profiles Table** receives:
   - `id` - User UUID from auth
   - `email` - Google email
   - `name` - Google name (if available)
   - `role` - Defaults to "tourist" (can be updated later)
   - `provider_type` - null for tourists
   - `created_at` - Current timestamp

### Note on Role Selection
- For email/password signup: Users choose role during signup
- For Google OAuth: Users get default "tourist" role
- Users can update their role in dashboard settings later

---

## 🔒 Security Considerations

✅ **Already Secure**
- Google handles password security
- Supabase uses secure OAuth 2.0 flow
- Session tokens are secure
- Email is verified by Google

✅ **Best Practices Implemented**
- PKCE (Proof Key for Code Exchange) enabled by default
- State parameter validates callback requests
- Redirect URIs are whitelisted

⚠️ **Important**
- Never expose your Google OAuth Client Secret in frontend code
- Always use the Client ID (public, safe to expose)
- Keep your Supabase Anon Key public (it's meant for client-side use)
- Service Role Key should never be exposed

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch" Error

**Cause**: The redirect URL doesn't match between Google Cloud Console and actual app URL

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 credential
3. Add or update Authorized redirect URIs to match:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
4. Save and wait 5-10 minutes

### Issue: "Invalid Client" Error

**Cause**: Google OAuth Client ID is incorrect or disabled

**Solution**:
1. Verify your Client ID is correct in Supabase
2. Check that Google+ API is enabled in Google Cloud Console
3. Ensure OAuth 2.0 credential hasn't expired
4. Delete and recreate the credential if needed

### Issue: Google Login Button Not Working

**Cause**: JavaScript error or auth context not loaded

**Solution**:
1. Open browser console (F12)
2. Check for error messages
3. Verify `.env.local` has correct Supabase keys
4. Clear browser cache and reload
5. Check that AuthProvider wraps your app (see layout.tsx)

### Issue: User Not Appearing in Dashboard

**Cause**: Profile not created automatically

**Solution**:
1. Check Supabase profiles table for the user
2. Manually create profile if missing:
   ```sql
   INSERT INTO profiles (id, email, name, role, created_at)
   VALUES ('user-uuid-here', 'email@example.com', 'Name', 'tourist', NOW());
   ```
3. Report issue if it persists

---

## 🔧 Advanced Configuration

### Custom Claims (Optional)

You can add custom claims to Supabase JWT tokens:

1. Go to **Authentication** → **JWT** in Supabase
2. Add custom claims for roles or permissions
3. Access them in your app via the session JWT

### Using Google Profile Picture

```typescript
// Access from session user metadata
const user = session?.user;
const profilePicture = user?.user_metadata?.picture;
```

### Linking Multiple OAuth Providers

Users can link their Google account to existing email/password account:

```typescript
// Link Google OAuth to existing account
await supabase.auth.linkIdentities({
  provider: 'google',
});
```

---

## 📚 Additional Resources

- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/oauth-providers)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [PKCE Flow Documentation](https://datatracker.ietf.org/doc/html/rfc7636)

---

## ✅ Checklist

- [ ] Created Google OAuth 2.0 credential
- [ ] Added redirect URIs to Google Cloud Console
- [ ] Enabled Google+ API
- [ ] Added Client ID to Supabase
- [ ] Updated SUPABASE_SETUP.md credentials
- [ ] Tested sign up with Google
- [ ] Tested sign in with Google
- [ ] Verified profile is created in database
- [ ] Set production redirect URI
- [ ] Tested on production deployment

---

## 🎉 Done!

Your TripKey app now has Google OAuth authentication! Users can:

✅ Sign up with Google  
✅ Sign in with Google  
✅ Have profiles automatically created  
✅ Switch between email and Google signin  

**Next Steps:**
- Add email verification
- Add password reset
- Add OAuth provider linking
- Custom profile fields
- Social sharing features

---

**Need help? Check the Supabase docs or contact support.**
