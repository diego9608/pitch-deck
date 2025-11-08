# Deployment Guide - Pitch Deck Platform

## Overview

This guide covers deploying the pitch-deck platform to Netlify for production use.

## Prerequisites

- GitHub account with repo access
- Netlify account
- PostgreSQL database (Supabase recommended)
- Environment variables configured

## Step 1: Database Setup (Supabase)

1. Create a Supabase project at https://supabase.com

2. Get your connection string:
   - Go to Project Settings > Database
   - Copy the Connection String (with password)

3. Note your project URL and anon key:
   - Project Settings > API
   - Copy Project URL and anon/public key

## Step 2: Generate Secrets

### Gate Hash

Generate SHA-256 hash of your secret key:

```bash
# macOS/Linux
echo -n "YOUR_SECRET_KEY" | shasum -a 256

# Windows PowerShell
$text = 'YOUR_SECRET_KEY'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hash = $sha256.ComputeHash($bytes)
$hashString = [System.BitConverter]::ToString($hash) -replace '-'
$hashString.ToLower()
```

### Cookie Secret

Generate random 32+ character string:

```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

## Step 3: Initialize Database

From your local environment:

```bash
cd apps/web

# Set your DATABASE_URL in .env.local
echo "DATABASE_URL=your_postgres_url_here" > .env.local

# Push schema
pnpm db:push

# Generate Prisma client
pnpm db:generate

# Seed initial data
pnpm seed
```

## Step 4: Push to GitHub

```bash
cd pitch-deck
git init
git add .
git commit -m "feat: initial pitch-deck platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pitch-deck.git
git push -u origin main
```

## Step 5: Connect to Netlify

### Via Netlify UI

1. Log in to https://netlify.com
2. Click "Add new site" > "Import an existing project"
3. Choose GitHub and select your repo
4. Configure build settings:

**Build command**: `cd apps/web && pnpm build`
**Publish directory**: `apps/web/.next`
**Base directory**: (leave empty)

### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
cd pitch-deck
netlify init

# Follow prompts to link site
```

## Step 6: Set Environment Variables

In Netlify dashboard (Site settings > Environment variables), add:

```
DECK_GATE_HASH=your_sha256_hash_from_step2
COOKIE_SECRET=your_random_string_from_step2
DATABASE_URL=your_supabase_connection_string
ENABLE_SIGNUP=false
DEFAULT_WORKSPACE_SLUG=agua
DEFAULT_PROJECT_SLUG=maquila-agua
NODE_ENV=production
```

**Important**: Never commit these values to git!

## Step 7: Configure Build Settings

In `netlify.toml` (already included):

```toml
[build]
  command = "cd apps/web && pnpm build"
  publish = "apps/web/.next"

[build.environment]
  NODE_VERSION = "18"
```

## Step 8: Deploy

### Automatic Deployment

Push to main branch:

```bash
git push origin main
```

Netlify will automatically build and deploy.

### Manual Deploy

```bash
cd pitch-deck
netlify deploy --prod
```

## Step 9: Verify Deployment

1. Visit your Netlify URL (e.g., `https://your-site.netlify.app`)

2. Test the invite flow:
   - Go to `/invite/demo`
   - Enter your secret key
   - Accept NDA
   - Verify deck loads

3. Check protected routes:
   - `/deck/default-deck-id` - Should redirect if no session
   - `/summary` - Should redirect if no session
   - `/hub` - Should redirect if no session

4. Test full flow:
   - Unlock with key → should set cookie
   - View deck → should show slides
   - End of deck → should show modal
   - Click CTAs → should navigate to summary/hub

## Step 10: Custom Domain (Optional)

### Add Domain in Netlify

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `pitch.yourdomain.com`)
4. Follow DNS configuration instructions

### DNS Configuration

Add CNAME record in your DNS provider:

```
Type: CNAME
Name: pitch (or @ for root domain)
Value: your-site.netlify.app
TTL: 3600
```

### SSL Certificate

Netlify automatically provisions Let's Encrypt SSL certificate.
Wait 10-60 minutes for DNS propagation.

## Monitoring and Maintenance

### Check Deployment Status

```bash
netlify status
```

### View Logs

```bash
netlify logs
```

### Environment Variables

Update via Netlify UI or CLI:

```bash
netlify env:set VARIABLE_NAME "value"
```

### Database Migrations

When schema changes:

```bash
# Local
cd apps/web
pnpm db:push

# Production (via Supabase)
# Run migrations through Supabase dashboard or CLI
```

## Rollback

### Via Netlify UI

1. Go to Deploys
2. Find previous successful deploy
3. Click "Publish deploy"

### Via CLI

```bash
netlify rollback
```

## Troubleshooting

### Build Fails

**Check Node version**:
```bash
# In netlify.toml
[build.environment]
  NODE_VERSION = "18"
```

**Check build logs**:
- Netlify UI > Deploys > [failed build] > Logs

**Common issues**:
- Missing environment variables
- TypeScript errors
- Missing dependencies

### Runtime Errors

**Check function logs**:
```bash
netlify functions:log
```

**Database connection issues**:
- Verify DATABASE_URL is correct
- Check Supabase connection pooler settings
- Ensure IP allowlisting if required

### Session/Cookie Issues

**Verify COOKIE_SECRET is set**:
```bash
netlify env:list
```

**Check cookie settings**:
- In production: `secure: true`, `sameSite: 'lax'`
- Domain must match deployment URL

## Security Checklist

Before going live:

- [ ] All environment variables set in Netlify
- [ ] Strong COOKIE_SECRET (32+ chars)
- [ ] DECK_GATE_HASH uses unique secret key
- [ ] DATABASE_URL uses connection pooling
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] No secrets in git history
- [ ] Supabase RLS enabled (future)
- [ ] CSP headers configured (in next.config.js)

## Performance Optimization

### Enable Next.js Features

In `apps/web/next.config.js`:

```js
module.exports = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### CDN Configuration

Netlify automatically CDN-distributes:
- Static assets
- Images
- API responses (with caching headers)

## Monitoring

### Recommended Services

- **Uptime**: UptimeRobot or Pingdom
- **Errors**: Sentry
- **Analytics**: Plausible or Fathom (privacy-focused)
- **Performance**: Lighthouse CI in GitHub Actions

### Health Check Endpoint

Create `apps/web/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

Test: `https://your-site.netlify.app/api/health`

## Support

For deployment issues:
- Netlify Support: https://www.netlify.com/support/
- Supabase Support: https://supabase.com/support
- GitHub Issues: [Your repo issues]

---

**Last Updated**: January 2025
