# Deployment Guide - Pitch Deck Platform

## Current Status

✅ **Netlify:** Successfully deployed and running
🔧 **Vercel:** Requires configuration (optional alternative)

---

## What You're Seeing Right Now

The root URL (`/`) now automatically redirects to `/invite/demo` (the investor gate).

If you previously saw the default Next.js template with "Deploy now" buttons - those were just marketing links from the starter template. Your app **is deployed on Netlify** and the redirect is now active.

---

## Quick Access

Visit your Netlify site and you'll be immediately redirected to the invite gate:
```
https://your-site.netlify.app/  →  /invite/demo
```

---

## Complete User Flow

1. **Root** (`/`) → Auto-redirects to `/invite/demo`
2. **Invite Gate** → Enter access key + accept NDA
3. **Unlock** → POST to `/api/unlock`
4. **Deck Viewer** → Fullscreen presentation `/deck/[id]`
5. **End Modal** → Choose CTA after last slide
6. **Summary** or **Hub** → Final destination

---

## Environment Variables (REQUIRED)

Set these in **Netlify → Site Settings → Environment variables**:

```bash
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
COOKIE_SECRET="your-super-secret-key-minimum-32-characters"
DECK_GATE_HASH="sha256-hash-of-your-access-key"
```

### Generate DECK_GATE_HASH

```bash
# Linux/Mac:
echo -n "yourkey" | sha256sum | cut -d' ' -f1

# Windows PowerShell:
$key = "yourkey"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
$hash = [System.Security.Cryptography.SHA256]::HashData($bytes)
[System.BitConverter]::ToString($hash).Replace("-","").ToLower()
```

---

## Database Setup

1. Create database on [Neon](https://console.neon.tech)
2. Copy connection string to `DATABASE_URL`
3. Push schema and seed data:

```bash
export DATABASE_URL="postgresql://..."
pnpm db:push
pnpm seed
```

The seed creates:
- Workspace: "agua"
- Project: "maquila-agua"  
- Deck with 6 slides
- Invite code: "demo"

---

## Architecture Reference

See `ARCHITECTURE.md` for complete technical documentation.

**Key Points:**
- **Monorepo** with pnpm workspaces + Turborepo
- **Edge runtime** for middleware (session validation)
- **Node.js runtime** for API routes (Prisma + crypto)
- **HMAC sessions** (no JWT, simpler security)
- **Glass morphism UI** (Agua theme)

---

## Support

- **Repo:** https://github.com/diego9608/pitch-deck
- **Docs:** `ARCHITECTURE.md` (technical details)
- **Owner:** @diego9608
