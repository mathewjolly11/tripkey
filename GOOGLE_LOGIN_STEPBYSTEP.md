# 🔐 Complete Step-by-Step Google OAuth + Supabase Setup Guide

This guide walks you through setting up Google login for TripKey with detailed screenshots descriptions and exact navigation steps.

---

## 📋 What You'll Need

1. **Google Account** (any Gmail account works)
2. **Supabase Project** (already set up - see SUPABASE_SETUP.md)
3. **About 15-20 minutes**

---

## 🎯 Part 1: Google Cloud Console Setup

### Step 1.1: Create a Google Cloud Project

**Goal**: Create a dedicated project for your app in Google Cloud.

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Sign in with your Google account
   - (You may need to accept terms of service)

2. **Create New Project**
   - Look for the **Project Dropdown** at the top (next to Google Cloud logo)
   - Click it
   - Click **"NEW PROJECT"** button
   - Fill in:
     - **Project name**: `tripkey` (or any name you want)
     - **Organization**: Leave blank (optional)
   - Click **"CREATE"**
   - Wait for project to be created (1-2 minutes)

3. **Select Your Project**
   - Once created, click the project dropdown again
   - Select your new `tripkey` project
   - You should now see your project name in the top bar

---

### Step 1.2: Enable Google+ API

**Goal**: Give your project permission to use Google authentication.

1. **Go to APIs & Services**
   - In the left sidebar, scroll down and click **"APIs & Services"**
   - Then click **"Library"**

2. **Search for Google+ API**
   - In the search box at top, search for: `Google+ API`
   - Click the **"Google+ API"** result
   - Click the blue **"ENABLE"** button
   - Wait for it to load

3. **Return to Credentials**
   - Click **"Credentials"** in the left sidebar (under APIs & Services)

---

### Step 1.3: Create OAuth 2.0 Credentials

**Goal**: Generate credentials for your app to authenticate users.

1. **Create New Credentials**
   - Look for the blue **"+ CREATE CREDENTIALS"** button near the top
   - Click it
   - Choose **"OAuth client ID"** from the dropdown

2. **Configure OAuth Consent Screen** (first time only)
   - If you see a warning, click **"Configure Consent Screen"**
   - Choose **"External"** (for testing)
   - Click **"CREATE"**
   - Fill in:
     - **App name**: `TripKey`
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click **"SAVE AND CONTINUE"**
   - On Scopes page: Click **"SAVE AND CONTINUE"** (no changes needed)
   - On Test users page: Click **"SAVE AND CONTINUE"**
   - Click **"BACK TO DASHBOARD"**

3. **Create the OAuth Client ID**
   - Go back to **"Credentials"** in left sidebar
   - Click **"+ CREATE CREDENTIALS"** again
   - Choose **"OAuth client ID"**
   - Choose **"Web application"**
   - Fill in or keep defaults:
     - **Name**: `WebApp` (or any name)
     - **Authorized JavaScript origins** (Optional): `http://localhost:3000`
     - **Authorized redirect URIs** (IMPORTANT!):
       ```
       http://localhost:3000/auth/callback
       https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
       ```
       (You'll get your Supabase URL in Part 2)

4. **Copy Your Client ID**
   - After clicking "Create", you'll see a popup with:
     - **Client ID** (long string like `xxx.apps.googleusercontent.com`)
     - **Client Secret** (you won't need this for frontend)
   - Click the copy icon next to **Client ID**
   - Paste it somewhere safe (Notepad)
   - Click **"OK"**

✅ **Step 1 Complete!** You now have your Google OAuth credentials.

---

## 🌐 Part 2: Supabase Configuration

### Step 2.1: Get Your Supabase Project URL

**Goal**: Find your Supabase callback URL.

1. **Go to Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Sign in with your account
   - Select your `tripkey` project

2. **Find Project URL**
   - Go to **Settings** (gear icon, bottom left)
   - Click **"API"**
   - Look for **"Project URL"** - copy it
   - It looks like: `https://your-project-id.supabase.co`
   - Note this for later

3. **Update Google Cloud Console**
   - Go back to Google Cloud Console: https://console.cloud.google.com/
   - Go to **APIs & Services → Credentials**
   - Find your OAuth 2.0 Client ID (named "WebApp" or similar)
   - Click the **edit icon** (pencil)
   - Under "Authorized redirect URIs", add:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
   - Replace `YOUR_PROJECT_ID` with your actual project ID
   - Click **"SAVE"**

---

### Step 2.2: Add Google Provider to Supabase

**Goal**: Tell Supabase to use your Google OAuth credentials.

1. **Go to Authentication**
   - In Supabase Dashboard, left sidebar
   - Click **"Authentication"**

2. **Go to Providers**
   - Click **"Providers"** (or "Auth Providers")

3. **Enable Google**
   - Find **"Google"** in the list of providers
   - Click on it to open settings
   - Toggle the switch to **"ON"** (it should turn blue/green)

4. **Add Your Client ID**
   - Find the field **"Client ID"** (or "Google OAuth 2.0 Client ID")
   - Paste your Google Client ID from Step 1.3
   - Leave "Client Secret" empty (not needed for this setup)
   - Scroll down and click **"SAVE"**

5. **Note Your Callback URL**
   - You should see a **"Redirect URL"** displayed
   - It should look like: `https://your-project-id.supabase.co/auth/v1/callback`
   - This is what you added to Google Cloud Console earlier ✓

✅ **Step 2 Complete!** Supabase is now configured for Google OAuth.

---

## 💻 Part 3: Your Next.js App Setup

### Step 3.1: Verify Environment Variables

**Goal**: Make sure your app has the Supabase credentials.

1. **Open `.env.local` file**
   - In your project folder, find `.env.local`
   - Check it has:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_long_anon_key
     ```
   - If not, add them from Supabase → Settings → API

2. **You don't need to add anything else!**
   - Google OAuth is configured through Supabase
   - No additional environment variables needed

---

### Step 3.2: Start Your Dev Server

**Goal**: Run your app locally.

1. **Open Terminal** in your project folder

2. **Run the dev server**
   ```bash
   npm run dev
   ```

3. **What you should see**
   ```
   ▲ Next.js 15.5.14
   - Local:        http://localhost:3000
   - Network:      http://10.201.211.120:3000
   ✓ Starting...
   ```

---

## 🧪 Part 4: Test Google Login

### Test 4.1: Sign Up with Google

**Goal**: Create a new account using Google.

1. **Open your app**
   - Go to: http://localhost:3000

2. **Click "Sign Up"**
   - Click the **"Sign Up"** button in navbar or hero section

3. **Click Google Button**
   - You should see: **"Sign up with Google"** button (with Google logo)
   - Click it

4. **What happens next**
   - You'll be redirected to **Google login page**
   - Sign in with your Google account (or create one)
   - Google will ask permission - click **"Allow"**
   - You'll be redirected back to your app
   - You should see your **dashboard** automatically
   - ✅ Success! You're logged in

5. **Verify in Supabase**
   - Go to Supabase Dashboard
   - Click **"Authentication"** → **"Users"**
   - You should see your email with "google" as provider
   - Click **"Database"** → **"profiles"** table
   - You should see your profile created automatically

---

### Test 4.2: Login with Google

**Goal**: Log in with an existing Google account.

1. **Log out first**
   - Click navbar dropdown
   - Click **"Sign Out"**

2. **Go to Login**
   - Click **"Login"** button in navbar

3. **Click Google Button**
   - Click **"Sign in with Google"**

4. **What happens**
   - Google recognizes you (quick login)
   - Or asks for permission again
   - You're redirected to dashboard
   - ✅ Success! You're logged in

---

## 🚨 Common Setup Issues & Fixes

### Issue 1: "Redirect URI mismatch" Error

**What it looks like**: Error message in browser when clicking Google button

**Cause**: The redirect URL doesn't match between Google Cloud and Supabase

**Fix**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Find your OAuth Client ID
3. Click edit (pencil icon)
4. Make sure these URLs are there:
   ```
   http://localhost:3000/auth/callback
   https://YOUR-SUPABASE-PROJECT.supabase.co/auth/v1/callback
   ```
5. Click SAVE
6. Try again in 5-10 minutes (changes can take time to apply)

---

### Issue 2: "Invalid Client" Error

**What it looks like**: Error saying "invalid client" or "client not found"

**Cause**: Client ID is wrong or not entered correctly

**Fix**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Copy the full Client ID (including `.apps.googleusercontent.com` part)
3. Go to Supabase Dashboard → Authentication → Providers → Google
4. Paste it exactly in the "Client ID" field
5. Click SAVE
6. Try again

---

### Issue 3: Google Button Not Showing

**What it looks like**: No Google button on login/signup pages

**Cause**: Usually a JavaScript error

**Fix**:
1. Open browser **Developer Console** (F12 or right-click → Inspect)
2. Go to **Console** tab
3. Look for red error messages
4. Check that `.env.local` has correct Supabase URL and key
5. Restart dev server: `npm run dev`
6. Refresh browser page

---

### Issue 4: User Not Created in Database

**What it looks like**: Can login to Supabase AUTH but no profile in database

**Cause**: Profile table doesn't have permissions or trigger isn't working

**Fix**:
1. Check Row Level Security policies
2. In Supabase → Database → SQL Editor
3. Run this to check:
   ```sql
   SELECT * FROM profiles;
   ```
4. If empty, manually create profile:
   ```sql
   INSERT INTO profiles (id, email, name, role, created_at)
   VALUES (
     'user_uuid_from_auth',
     'your@email.com',
     'Your Name',
     'tourist',
     NOW()
   );
   ```

---

## 📊 Verification Checklist

Go through each item to verify everything is set up correctly:

- [ ] Google Cloud Console project created
- [ ] Google+ API enabled in Google Cloud
- [ ] OAuth 2.0 Client ID created in Google Cloud
- [ ] Client ID copied from Google Cloud
- [ ] Authorized redirect URIs added to Google Cloud:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `https://YOUR-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
- [ ] Supabase project exists and accessible
- [ ] Google provider enabled in Supabase
- [ ] Google Client ID pasted into Supabase
- [ ] `.env.local` has correct Supabase URL and key
- [ ] `npm run dev` starts without errors
- [ ] Can see "Sign up with Google" button on `/signup`
- [ ] Can see "Sign in with Google" button on `/login`
- [ ] Google button redirects to Google login page
- [ ] Can authenticate with Google account
- [ ] Redirected back to dashboard after auth
- [ ] Profile visible in Supabase Dashboard
- [ ] Can log out and log back in with Google

---

## 🎉 Success! What's Next?

Your Google Login is now working! 

### Optional Enhancements:

1. **Add Email Verification**
   - Verify users email before allowing access

2. **Add Password Reset**
   - Let users reset forgotten passwords

3. **Add More Providers**
   - GitHub, Microsoft, Discord, etc.

4. **Custom Profile Fields**
   - Upload profile picture
   - Set user preferences

5. **Social Sharing**
   - Share trips on social media
   - Invite friends

---

## 📞 Still Having Issues?

1. **Check Google OAuth Setup doc**: `GOOGLE_OAUTH_SETUP.md`
2. **Check Supabase Setup doc**: `SUPABASE_SETUP.md`
3. **Check browser console** for error messages (F12)
4. **Restart dev server**: `npm run dev`
5. **Clear browser cache**: Ctrl+Shift+Delete

---

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/oauth-providers)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**🚀 You're all set! Google login is now ready for your TripKey app!**

Questions? Check the documentation files in your project folder.
