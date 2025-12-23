# Netlify Deployment Guide for Board2Basket

This guide will help you deploy Board2Basket to Netlify with full functionality including serverless functions.

## Prerequisites

- GitHub account with Board2Basket repository
- Netlify account (free tier works)
- OpenAI API key
- Supabase project configured

---

## Step 1: Prepare Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

---

## Step 2: Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your `board2basket` repository

---

## Step 3: Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

Click **"Deploy site"**

---

## Step 4: Set Environment Variables

In your Netlify site dashboard:

1. Go to **Site configuration** → **Environment variables**
2. Add the following variables:

### Server-Side (Functions)
```
OPENAI_API_KEY = sk-your-openai-api-key-here
```

### Client-Side (Build-time)
These get bundled into your frontend code:

```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
```

3. Click **"Save"**
4. Trigger a new deploy: **Deploys** → **Trigger deploy** → **Deploy site**

---

## Step 5: Update Supabase Configuration

After deployment, you'll get a Netlify URL like `https://your-app.netlify.app`

In your Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to `https://your-app.netlify.app`
3. Add to **Redirect URLs**:
   - `https://your-app.netlify.app/**`
   - `https://your-app.netlify.app/login`

---

## Step 6: Test Your Deployment

1. Visit your Netlify URL
2. Test login with magic link
3. Create a household
4. Upload a whiteboard image (tests AI function)
5. Generate a meal plan (tests another AI function)

### Function Endpoints

Your serverless functions will be available at:
- `https://your-app.netlify.app/.netlify/functions/extract-whiteboard`
- `https://your-app.netlify.app/.netlify/functions/categorize-items`
- `https://your-app.netlify.app/.netlify/functions/generate-mealplan`

---

## Local Development with Netlify

To test functions locally:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Run local dev server with functions
netlify dev
```

This will:
- Start Vite dev server on port 5173
- Start Netlify Functions on port 8888
- Proxy functions to `/.netlify/functions/*`

---

## Troubleshooting

### Functions returning 404

**Problem:** Functions not found after deployment

**Solution:**
1. Check **Site configuration** → **Functions** shows `netlify/functions`
2. Verify TypeScript files are being compiled (check deploy logs)
3. Ensure `@netlify/functions` is in `dependencies` (not devDependencies)

### Environment variables not working

**Problem:** `process.env.OPENAI_API_KEY` is undefined

**Solution:**
1. Verify variables are set in Netlify dashboard
2. Trigger a new deploy after adding variables
3. Check deploy logs for "Environment variables" section

### CORS errors on AI functions

**Problem:** Fetch fails with CORS error

**Solution:**
Functions should return proper headers. Verify response includes:
```javascript
headers: { "Content-Type": "application/json" }
```

### Build fails with TypeScript errors

**Problem:** `tsc -b && vite build` fails

**Solution:**
```bash
# Locally check for errors
npm run build

# Fix TypeScript errors
npx tsc --noEmit
```

### Supabase auth redirect fails

**Problem:** After clicking magic link, stuck on login page

**Solution:**
1. Verify Netlify URL is set as Site URL in Supabase
2. Add redirect URL with wildcard: `https://your-app.netlify.app/**`
3. Clear browser cache and try again

---

## Production Checklist

Before going live:

- [ ] All environment variables set in Netlify
- [ ] Supabase Site URL updated to production domain
- [ ] Test all 5 MVP features work
- [ ] Verify no console errors in browser
- [ ] Test on mobile device
- [ ] Check Netlify function logs for errors
- [ ] Verify build time is reasonable (< 2 minutes)
- [ ] Confirm bundle size is acceptable

---

## Continuous Deployment

Netlify automatically deploys when you push to `main`:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Deploy will trigger automatically. Check status at:
`https://app.netlify.com/sites/your-site-name/deploys`

---

## Custom Domain (Optional)

1. Buy domain (Namecheap, Google Domains, etc.)
2. In Netlify: **Domain management** → **Add custom domain**
3. Follow DNS configuration instructions
4. Netlify provides free HTTPS via Let's Encrypt

After adding custom domain, update Supabase Site URL to your custom domain.

---

## Monitoring & Logs

### Function Logs
**Netlify Dashboard** → **Functions** → Click function name → **View logs**

### Deploy Logs
**Netlify Dashboard** → **Deploys** → Click deploy → **View details**

### Analytics (Pro plan)
Enable in **Analytics** tab for traffic insights

---

## Cost Estimates

**Netlify Free Tier includes:**
- 300 build minutes/month
- 100GB bandwidth/month
- 125k serverless function requests/month

**OpenAI API costs:**
- GPT-4o Vision: ~$0.01-0.05 per whiteboard scan
- GPT-4o: ~$0.01-0.02 per meal plan
- Budget ~$10-20/month for moderate usage

**Supabase Free Tier includes:**
- 500MB database
- 1GB file storage
- 2GB bandwidth/month

---

## Next Steps

- Set up [branch deploys](https://docs.netlify.com/site-deploys/overview/#branch-deploy-controls) for staging
- Add [deploy previews](https://docs.netlify.com/site-deploys/deploy-previews/) for pull requests
- Configure [notifications](https://docs.netlify.com/site-deploys/notifications/) for deploy status

**Your Board2Basket app is now live! 🚀**
