# 🎯 Google OAuth + Supabase Setup - Quick Reference Card

Print this page or keep it open next to your setup tabs for quick reference!

---

## 📋 Step 1: Google Cloud Console

### URLs You'll Need
```
Main Console:    https://console.cloud.google.com/
API Search:      Search for "Google+ API"
Credentials Tab: APIs & Services → Credentials
```

### What to Do
1. ✓ Create Project (name: `tripkey`)
2. ✓ Enable Google+ API
3. ✓ Create OAuth 2.0 Client ID (type: Web Application)

### URLs to Add to Google (Authorized Redirect URIs)
```
http://localhost:3000/auth/callback
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```
(Get `YOUR_PROJECT_ID` from Supabase URL in Step 2)

### Important Value to Copy
```
✓ CLIENT ID: [looks like: xxx.apps.googleusercontent.com]
  Save this! You'll need it in Step 2.
```

---

## 🌐 Step 2: Supabase Dashboard

### URLs You'll Need
```
Main Dashboard:    https://supabase.com/dashboard
Select Project:    Click your "tripkey" project
Auth Settings:     Authentication → Providers → Google
API Settings:      Settings → API → Copy Project URL
```

### What to Do
1. ✓ Copy Project URL (looks like: `https://xxxx.supabase.co`)
2. ✓ Go back to Google Cloud and add callback URL with this Project URL
3. ✓ Go to Authentication → Google Provider
4. ✓ Enable Google provider (toggle ON)
5. ✓ Paste your Google Client ID
6. ✓ Save

### Important Values to Copy
```
✓ PROJECT URL: https://your-project-id.supabase.co
✓ ANON KEY:   [from Settings → API]
  You'll need these for Step 3!
```

---

## 💻 Step 3: Your Next.js App

### File to Update
```
.env.local
```

### What to Add
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Terminal Commands
```bash
# Start dev server
npm run dev

# You should see:
# ▲ Next.js 15.5.x
# ✓ Ready in xxx ms
# - Local: http://localhost:3000
```

---

## 🧪 Step 4: Test It

### Open in Browser
```
http://localhost:3000
```

### Click Through
1. Click **"Sign Up"** button
2. Click **"Sign up with Google"** button
3. Select or create your Google account
4. Click **"Allow"**
5. ✓ Success! You're logged in

---

## 🚨 If Something Goes Wrong

### Error: "Redirect URI mismatch"
→ Check URLs in Google Cloud Console match your Supabase URL

### Error: "Invalid Client"
→ Make sure you copied the full Client ID from Google Cloud

### No Google Button Showing
→ Press F12, check Console for errors
→ Check `.env.local` has correct values
→ Restart: `npm run dev`

### Can Login but Profile Not Created
→ Check Supabase `profiles` table
→ Row Level Security policies might be blocking inserts

---

## ✅ Everything Configured Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URIs added to Google Cloud:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
- [ ] Client ID saved/noted
- [ ] Supabase project opened
- [ ] Project URL copied
- [ ] Google provider enabled in Supabase
- [ ] Client ID pasted into Supabase
- [ ] `.env.local` created and filled
- [ ] `npm run dev` works without errors
- [ ] Can see Google button on `/signup` and `/login`
- [ ] Can sign up with Google
- [ ] Can log in with Google
- [ ] Profile appears in Supabase after login

---

## 📚 Full Docs

- **Complete Step-by-Step**: `GOOGLE_LOGIN_STEPBYSTEP.md`
- **Supabase Setup**: `SUPABASE_SETUP.md`
- **Quick Start**: `QUICK_START.md`

---

## 🎯 Copy-Paste Values

**When you complete each section, paste values here:**

### From Google Cloud Console:
```
My Client ID: ______________________________________
```

### From Supabase:
```
My Project URL: ____________________________________
My Anon Key: _______________________________________
```

### In my .env.local:
```
NEXT_PUBLIC_SUPABASE_URL=_________________________
NEXT_PUBLIC_SUPABASE_ANON_KEY=____________________
```

---

**Ready to go? Start with [GOOGLE_LOGIN_STEPBYSTEP.md](GOOGLE_LOGIN_STEPBYSTEP.md) for the detailed walkthrough!**
