# Vercel Production Setup Guide

## Critical: Environment Variable Configuration

Your Vercel deployment requires the `NEXT_PUBLIC_API_URL` environment variable to be set.

### Steps to Fix Production Issues:

1. **Go to Vercel Dashboard:**

   - Visit https://vercel.com
   - Navigate to your project: `Sys_Logger` or `lab-monitoring`
   - Click on **Settings** → **Environment Variables**

2. **Add Environment Variable:**

   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://lab-monitoring-backend.onrender.com`
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

3. **Redeploy:**
   - After adding the environment variable, go to **Deployments**
   - Click the three dots (⋯) on the latest deployment
   - Select **Redeploy**
   - Or push a new commit to trigger automatic redeployment

### Verify Configuration:

After redeploying, check:

1. Open your live site (e.g., `https://lab-monitoring.nielitbhubaneswar.in`)
2. Open browser DevTools (F12) → Console tab
3. Look for any errors mentioning `NEXT_PUBLIC_API_URL`
4. Check Network tab to see if API calls are being made

### Backend CORS Configuration:

Make sure your Render backend has the frontend domain in CORS_ORIGINS:

**In Render Dashboard → Environment Variables:**

```
CORS_ORIGINS=https://sys-logger.vercel.app,https://sys-logger-git-main.vercel.app,https://lab-monitoring.nielitbhubaneswar.in
```

### Troubleshooting:

**If data still doesn't show:**

1. Check Vercel deployment logs for errors
2. Verify the environment variable is set correctly (no trailing slashes)
3. Check Render backend logs to see if requests are arriving
4. Verify CORS is configured correctly in Render

**Common Issues:**

- ❌ Missing `NEXT_PUBLIC_API_URL` → API routes return 500 errors
- ❌ Wrong backend URL → Connection refused errors
- ❌ CORS not configured → 403 Forbidden errors
- ❌ Backend not running → Timeout errors
