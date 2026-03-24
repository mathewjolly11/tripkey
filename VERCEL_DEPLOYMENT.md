# Vercel Deployment Guide

This guide will help you deploy TripKey to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- A GitHub account (recommended for automatic deployments)
- Supabase project set up and configured

## Quick Deployment Steps

### 1. Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
     ```
   - You can copy these from your `.env.local` file

6. Click "Deploy"
7. Wait for the build to complete (usually 2-3 minutes)

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### 3. Configure Supabase for Production

After deployment, you need to update your Supabase configuration:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > URL Configuration**
3. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
4. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - Keep `http://localhost:3000/auth/callback` for local development

### 4. Configure Google OAuth (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://pybfrjwlatvkyragaark.supabase.co/auth/v1/callback` (your Supabase callback)

### 5. Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test the following:
   - Homepage loads correctly
   - Login/Signup flow works
   - Google OAuth authentication works
   - Dashboard accessible after login
   - Role-based routing works (tourist, provider, admin)

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server operations | Optional |

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy every push to the `main` branch (production)
- Create preview deployments for pull requests
- Run builds and show deployment status in GitHub

## Custom Domain (Optional)

To use a custom domain:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings > Domains**
3. Add your domain
4. Update DNS records as instructed
5. Update Supabase redirect URLs with your custom domain

## Troubleshooting

### Build Fails

- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Authentication Not Working

- Verify Supabase redirect URLs include your Vercel domain
- Check Google OAuth authorized redirect URIs
- Ensure environment variables are set in Vercel dashboard

### 404 Errors

- Clear cache and redeploy
- Check that all pages are in the `app` directory
- Verify `next.config.js` doesn't have incompatible settings

## Performance Optimization

Consider these optimizations for production:

1. **Enable Edge Functions** (if needed)
2. **Configure ISR** (Incremental Static Regeneration) for dynamic pages
3. **Add `robots.txt` and `sitemap.xml`**
4. **Enable Analytics** in Vercel dashboard

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Auth Guides](https://supabase.com/docs/guides/auth)

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked
- [ ] Environment variables added to Vercel
- [ ] Supabase redirect URLs updated
- [ ] Google OAuth redirect URIs updated (if using)
- [ ] Test deployment successful
- [ ] Authentication flow tested
- [ ] Role-based routing verified
- [ ] Custom domain configured (optional)
