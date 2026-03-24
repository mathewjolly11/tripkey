# ☑️ Google OAuth + Supabase Setup Checklist

Print this page and check off as you go!

---

## 📋 Part 1: Google Cloud Console Setup

### Google Cloud Project
- [ ] Create new project at https://console.cloud.google.com/
- [ ] Name it: `tripkey`
- [ ] Wait for project creation (1-2 min)
- [ ] Select the project from dropdown at top

### Google+ API
- [ ] Go to: **APIs & Services → Library**
- [ ] Search for: `Google+ API`
- [ ] Click on result and click **ENABLE**
- [ ] Wait for it to enable

### OAuth 2.0 Credentials
- [ ] Go to: **APIs & Services → Credentials**
- [ ] Click **+ CREATE CREDENTIALS**
- [ ] Choose **"OAuth client ID"**
- [ ] Choose **"Web application"**

### OAuth Consent Screen (First Time Only)
- [ ] If prompted: Select **"External"**
- [ ] Fill: **App name** = `TripKey`
- [ ] Fill: **Support email** = Your email
- [ ] Fill: **Developer contact** = Your email
- [ ] Click **SAVE AND CONTINUE** through pages
- [ ] Go back to create OAuth ID again

### OAuth Client ID Details
- [ ] **Name**: `WebApp` (or any name)
- [ ] **Authorized JavaScript origins**: `http://localhost:3000`
- [ ] Click **ADD** for this URI
- [ ] **Authorized redirect URIs**: Add both:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`

**⚠️ Note**: You'll get `YOUR_SUPABASE_PROJECT_ID` in Part 2. Add it there when you have it.

### Copy Client ID
- [ ] Click **CREATE**
- [ ] Copy the **Client ID** (long string ending in `.apps.googleusercontent.com`)
- [ ] Save it somewhere (Notepad, email to yourself, etc.)
- [ ] Click **OK**

✅ **Part 1 Complete!**

---

## 🌐 Part 2: Supabase Configuration

### Get Your Supabase URL
- [ ] Go to: https://supabase.com/dashboard
- [ ] Select your `tripkey` project
- [ ] Go to: **Settings → API**
- [ ] Copy **"Project URL"** (looks like: `https://xxx.supabase.co`)
- [ ] This is your `YOUR_SUPABASE_PROJECT_ID` from Part 1

### Update Google Cloud Redirect URI
- [ ] Go back to Google Cloud Console: https://console.cloud.google.com/
- [ ] Go to: **APIs & Services → Credentials**
- [ ] Find your OAuth Client ID and click edit (pencil icon)
- [ ] In **Authorized redirect URIs**, update/add:
  ```
  https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
  ```
- [ ] Replace `YOUR_SUPABASE_PROJECT_ID` with your actual ID
- [ ] Click **SAVE**
- [ ] Wait 5-10 minutes for changes to propagate

### Enable Google Provider in Supabase
- [ ] In Supabase Dashboard: **Authentication**
- [ ] Click **"Providers"**
- [ ] Find **"Google"** in the list
- [ ] Click to open Google provider settings
- [ ] Toggle the switch to **ON** (should be blue/green)

### Add Your Google Client ID to Supabase
- [ ] In Supabase Google provider page:
- [ ] Find **"Client ID"** field
- [ ] Paste your Google Client ID from Part 1
- [ ] Leave **"Client Secret"** empty
- [ ] Scroll down and click **SAVE**

### Verify Callback URL
- [ ] You should see **"Redirect URL"** displayed
- [ ] It should match: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
- [ ] This confirms it's correctly configured ✓

✅ **Part 2 Complete!**

---

## 💻 Part 3: Your Next.js App Configuration

### Environment Variables
- [ ] In your project folder, find or create: `.env.local`
- [ ] Add these lines:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- [ ] Replace `your-project-id` with actual project ID
- [ ] Get **ANON_KEY** from Supabase: **Settings → API → "anon" public key**

### Start Development Server
- [ ] Open terminal in your project folder
- [ ] Run: `npm run dev`
- [ ] You should see:
  ```
  ▲ Next.js 15.x.x
  ✓ Ready in xxx ms
  - Local: http://localhost:3000
  ```
- [ ] No errors? ✓ Great!

✅ **Part 3 Complete!**

---

## 🧪 Part 4: Test Your Setup

### Test Sign Up with Google
- [ ] Open browser: http://localhost:3000
- [ ] Click **"Sign Up"** button in navbar
- [ ] Click **"Sign up with Google"** button
- [ ] You'll be taken to Google login page
- [ ] Sign in with your Google account
- [ ] Click **"Allow"** to grant permissions
- [ ] You should be redirected to dashboard
- [ ] ✅ Success! You're logged in

### Verify in Supabase
- [ ] Go to Supabase Dashboard
- [ ] Click **"Authentication"**
- [ ] Click **"Users"** tab
- [ ] You should see your email in the list
- [ ] Provider should show: `google`

### Verify Profile Created
- [ ] In Supabase: **"Database"**
- [ ] Click **"profiles"** table
- [ ] You should see a new row with your data
- [ ] Columns should have: id, email, name, role, created_at

### Test Log Out and Log In
- [ ] On dashboard: Click avatar/menu in navbar
- [ ] Click **"Sign Out"**
- [ ] You should be back on landing page
- [ ] Click **"Login"** button
- [ ] Click **"Sign in with Google"** 
- [ ] Should automatically log you in (Google remembers you)
- [ ] ✅ You're logged in again!

✅ **Part 4 Complete! Everything Works!**

---

## ✅ Final Verification Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URIs added to Google Cloud
- [ ] Client ID copied and saved
- [ ] Supabase project ready
- [ ] Supabase Project URL found
- [ ] Google provider enabled in Supabase
- [ ] Google Client ID added to Supabase
- [ ] `.env.local` created with credentials
- [ ] `npm run dev` works without errors
- [ ] All Google buttons visible on sign up/login pages
- [ ] Can sign up with Google
- [ ] User appears in Supabase Auth
- [ ] Profile appears in Supabase Database
- [ ] Can log out
- [ ] Can log in with Google again
- [ ] Dashboard shows user information
- [ ] Everything working! 🎉

---

## 🚨 Troubleshooting Checklist

If something doesn't work, go through these:

### Google Button Not Showing
- [ ] Open browser console: F12 or Ctrl+Shift+I
- [ ] Check for red error messages
- [ ] Check `.env.local` has correct values
- [ ] Restart dev server: `npm run dev` (stop with Ctrl+C first)
- [ ] Clear browser cache: Ctrl+Shift+Delete
- [ ] Refresh page: F5

### "Redirect URI Mismatch" Error
- [ ] Go to Google Cloud Credentials
- [ ] Edit your OAuth Client ID
- [ ] Verify these URLs are there:
  - `http://localhost:3000/auth/callback`
  - `https://your-project-id.supabase.co/auth/v1/callback`
- [ ] Click SAVE
- [ ] Wait 5-10 minutes
- [ ] Try again

### "Invalid Client" Error
- [ ] Go to Google Cloud Console
- [ ] Copy full Client ID again
- [ ] Go to Supabase → Authentication → Providers → Google
- [ ] Clear the Client ID field
- [ ] Paste the new one exactly
- [ ] Click SAVE
- [ ] Try again

### Can Login but Profile Not Created
- [ ] Check Supabase Database → `profiles` table
- [ ] If empty, create manually or adjust RLS policies
- [ ] See SUPABASE_SETUP.md for profile table info

### Dev Server Won't Start
- [ ] Run: `npm install` (make sure all packages installed)
- [ ] Check Node version: `node --version` (should be 18+)
- [ ] Check for syntax errors in `.env.local` (no quotes needed!)
- [ ] Try: `npm run dev` again

---

## 📞 Need Help?

Check these in order:
1. [GOOGLE_LOGIN_STEPBYSTEP.md](GOOGLE_LOGIN_STEPBYSTEP.md) - Full walkthrough
2. [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - Technical details
3. [Browser Console] - F12, look for error messages
4. [SETUP_QUICK_REFERENCE.md](SETUP_QUICK_REFERENCE.md) - Copy-paste values

---

## 🎉 You're Done!

```
✓ Google OAuth Configured
✓ Supabase Authenticated  
✓ App Running Locally
✓ Users Can Sign Up/Login with Google
✓ Profiles Stored in Database
✓ Ready for Production!
```

**Next Steps:**
- Environment-specific `.env` for production
- Custom domain setup
- Database backups
- Monitoring and logging
- Deploy to production

---

**Print this page and check off as you complete each step!**
