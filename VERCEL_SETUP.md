# Vercel Deployment Configuration Guide

## Current Issue

**Error:** Vercel is using Node v22.21.1 + pnpm 6.35.1 instead of Node 18.x + pnpm 9.12.3

**Symptoms:**
```
WARN  Ignoring not compatible lockfile
ERR_PNPM_META_FETCH_FAIL  Value of "this" must be of type URLSearchParams
```

**Root Cause:** Vercel project settings need to be configured to use the correct versions.

---

## ✅ Repository Configuration (Already Done)

These are already committed and pushed:

- ✅ `.nvmrc` created with `18`
- ✅ `package.json` has `"packageManager": "pnpm@9.12.3"`
- ✅ `package.json` has `"engines": { "node": "18.x" }`
- ✅ `pnpm-lock.yaml` generated with pnpm@9.12.3
- ✅ Build scripts use `pnpm --filter web`
- ✅ All investor flow pages implemented
- ✅ Root redirects to `/invite/demo`
- ✅ Minimal `netlify.toml` (no function overrides)

---

## ⚙️ Vercel Project Settings (Manual Steps Required)

You MUST configure these in the Vercel Dashboard - they cannot be set in code:

### Step 1: Access Project Settings

1. Go to https://vercel.com/dashboard
2. Find and click on your `pitch-deck` project
3. Click the **Settings** tab at the top

### Step 2: Configure Root Directory

1. In left sidebar, click **General**
2. Scroll to **Root Directory**
3. Click **Edit**
4. Enter: `apps/web`
5. Click **Save**

**Why:** Tells Vercel to build from the web app directory in your monorepo.

### Step 3: Override Install Command

1. Still in **General** settings
2. Scroll to **Build & Development Settings**
3. Find **Install Command**
4. Click **Override** toggle to enable it
5. Enter this exact command:
   ```
   corepack enable && corepack prepare pnpm@9.12.3 --activate && pnpm install
   ```
6. Click **Save**

**Why:** Forces Vercel to activate pnpm 9.12.3 before installing dependencies.

### Step 4: Set Build Command (Optional)

1. Find **Build Command** (same section)
2. Click **Override** if not already enabled
3. Enter: `pnpm build`
4. Click **Save**

**Why:** Ensures the correct build command is used.

### Step 5: Set Node.js Version

1. Still in **General** settings
2. Scroll to **Node.js Version**
3. Click the dropdown
4. Select: **18.x**
5. Auto-saves when you select

**Why:** Forces Vercel to use Node 18 instead of Node 22.

### Step 6: Add Environment Variable

1. In left sidebar, click **Environment Variables**
2. Click **Add New**
3. Fill in:
   - **Name:** `DECK_PASS`
   - **Value:** `your-secret-access-key` (choose a strong secret)
   - **Environments:** Check all three boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
4. Click **Save**

**Why:** Your app needs this to validate the access key at the gate.

### Step 7: Trigger Fresh Deployment

1. Click **Deployments** tab at the top
2. Find the most recent deployment
3. Click the three dots (**⋯**) on the right
4. Click **Redeploy**
5. In the modal:
   - **UNCHECK** "Use existing Build Cache"
   - Click **Redeploy**

**Why:** Clears the old build cache and uses your new settings.

---

## 📊 Verification

After redeployment starts, check the build logs:

### ✅ Success Indicators:

**At the start of logs:**
```
Running "install" command: corepack enable && corepack prepare pnpm@9.12.3 --activate && pnpm install
Node.js v18.x.x
pnpm 9.12.3
```

**During install:**
```
Lockfile is up to date, resolution step is skipped
```
(No warnings about ignoring incompatible lockfile)

**At the end:**
```
✓ Generating static pages
Build Completed
```

### ❌ If You Still See Errors:

**Node version is wrong:**
- Verify you selected **18.x** in Node.js Version dropdown
- Try redeploying again

**pnpm version is wrong:**
- Verify install command is exactly: `corepack enable && corepack prepare pnpm@9.12.3 --activate && pnpm install`
- Check for typos
- Make sure Override toggle is ON

**Lockfile warnings:**
- Verify `pnpm-lock.yaml` was generated with pnpm 9.12.3 locally
- Run `pnpm install` locally one more time
- Commit and push the updated lockfile
- Redeploy

---

## 🎯 Expected Final Result

After successful deployment:

1. Visit your Vercel URL (e.g., `https://pitch-deck-xxx.vercel.app`)
2. Should immediately redirect to `/invite/demo`
3. See glass morphism card with blur background
4. Enter your `DECK_PASS` value
5. Check "I accept the NDA"
6. Click Continue
7. Should redirect to `/deck/intro`
8. Protected pages work: `/summary`, `/hub`

---

## 🔍 Troubleshooting

### "Root Directory not found"
- Make sure you typed exactly `apps/web` (no trailing slash)
- Verify the folder exists in your repo

### "Command not found: corepack"
- This shouldn't happen on Vercel's Node 18+
- If it does, use alternative install command: `npm i -g pnpm@9.12.3 && pnpm install`

### Build succeeds but pages 404
- Check that Root Directory is set to `apps/web`
- Verify build command is `pnpm build` not `npm run build`

### Environment variable not working
- Go back to Environment Variables
- Check it's added to Production environment
- Redeploy after adding it

---

## 📝 Why Node 18 Instead of Node 22?

**Question:** "Is Node 22 better since it's newer?"

**Answer:** For this project, **Node 18 is the right choice** because:

1. **LTS Status:** Node 18 is the current Long Term Support version
2. **Stability:** Node 22 is still relatively new and may have compatibility issues
3. **Package Compatibility:** Your dependencies (Next.js 14.2.10, Prisma 5.22.0) are tested with Node 18
4. **pnpm Compatibility:** The specific pnpm 6.35.1 + Node 22 combination has the fetch bug you're seeing
5. **Consistency:** Your lockfile was generated with Node 18 + pnpm 9.12.3

**Using Node 22 causes:**
- Lockfile incompatibility warnings
- `ERR_INVALID_THIS` fetch errors
- Unpredictable build failures

**Stick with Node 18** until you're ready to upgrade the entire stack together.

---

## ✅ Final Checklist

Before considering Vercel setup complete:

- [ ] Root Directory set to `apps/web`
- [ ] Install Command overridden with corepack command
- [ ] Build Command set to `pnpm build`
- [ ] Node.js Version set to 18.x
- [ ] Environment variable `DECK_PASS` added
- [ ] Fresh deployment triggered with cache cleared
- [ ] Build logs show Node 18.x and pnpm 9.12.3
- [ ] No lockfile warnings in logs
- [ ] Build completes successfully
- [ ] Site redirects from root to `/invite/demo`
- [ ] Access gate works with correct key
- [ ] Protected routes require cookie

---

## 🚀 Summary

**What you have:**
- ✅ Code is ready and deployed to GitHub
- ✅ All pages implemented
- ✅ Security features in place
- ✅ Deterministic build configuration

**What you need to do:**
1. Configure Vercel project settings (5 minutes)
2. Add environment variable (1 minute)
3. Redeploy with fresh cache (automatic)
4. Test the flow (2 minutes)

**Total time:** ~10 minutes of clicking in Vercel UI

The code is perfect. Vercel just needs to be told how to build it! 🎯
