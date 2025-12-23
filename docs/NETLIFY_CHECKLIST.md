# Netlify Deployment Verification Checklist

Use this checklist after deploying to Netlify to ensure everything works correctly.

## ✅ Pre-Deployment Verification

- [ ] Code builds successfully locally: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] All environment variables documented in `.env.example`
- [ ] Code pushed to GitHub repository
- [ ] Supabase project is ready and configured

---

## ✅ Netlify Configuration

- [ ] Repository connected to Netlify
- [ ] Build command set: `npm run build`
- [ ] Publish directory set: `dist`
- [ ] Functions directory set: `netlify/functions`

### Environment Variables Set

**Server-side (Functions):**
- [ ] `OPENAI_API_KEY` = sk-...

**Client-side (Build-time):**
- [ ] `VITE_SUPABASE_URL` = https://xxxxx.supabase.co
- [ ] `VITE_SUPABASE_ANON_KEY` = eyJh...

---

## ✅ Post-Deployment Tests

### 1. Site Accessibility
- [ ] Site loads at `https://your-app.netlify.app`
- [ ] No 404 errors on homepage
- [ ] No console errors in browser DevTools

### 2. Authentication
- [ ] Login page loads
- [ ] Can enter email address
- [ ] Magic link email arrives
- [ ] Clicking link redirects to app
- [ ] User is authenticated (not redirected back to login)

### 3. Household Management
- [ ] Can create a new household
- [ ] "Share" button appears in header
- [ ] Clicking Share shows invite code modal
- [ ] Can copy invite code to clipboard
- [ ] Opening app in incognito/different browser
- [ ] Can join household using invite code

### 4. Grocery List
- [ ] Can add items manually
- [ ] Items appear in list
- [ ] Can delete items
- [ ] Can mark items as purchased
- [ ] Purchased items move to "Purchased" section

### 5. Whiteboard Scanning (AI Function Test)
- [ ] "Scan" button visible
- [ ] Can select/upload image
- [ ] Loading indicator shows
- [ ] Items are extracted and added to list
- [ ] Low-confidence items show warning badge
- [ ] Check Netlify function logs for successful execution

### 6. Claim Items Feature
- [ ] Hovering over item shows "Claim" button
- [ ] Clicking claim adds "Claimed by you" badge
- [ ] Other user sees "Claimed by [Name]"
- [ ] Can unclaim items

### 7. Real-time Sync
- [ ] Open app in two different browsers/devices
- [ ] Add item in Browser A
- [ ] Item appears in Browser B (within 2 seconds, no refresh)
- [ ] Toggle item status in Browser B
- [ ] Status updates in Browser A

### 8. Shopping Mode
- [ ] Navigate to "Shop" tab
- [ ] Active items listed
- [ ] Counter shows "X left"
- [ ] Can toggle items purchased
- [ ] Purchased items move to bottom section
- [ ] "All Done!" message when all items checked

### 9. Meal Plan Generation (AI Function Test)
- [ ] Mark 3+ items as purchased
- [ ] Navigate to "Meals" tab
- [ ] "Generate Meal Plan" button works
- [ ] Loading indicator shows
- [ ] Meal plan generates within 20 seconds
- [ ] Shows 3 days of meals
- [ ] Each meal has title, time, ingredients, steps
- [ ] "Missing Ingredients" section shows if needed
- [ ] Check Netlify function logs for successful execution

### 10. Mobile Experience
- [ ] Test on actual mobile device or mobile simulator
- [ ] Layout is responsive
- [ ] Scan button triggers camera on mobile
- [ ] Shopping mode checkboxes are large enough to tap
- [ ] Bottom navigation is accessible

---

## ✅ Netlify Function Logs Check

1. Go to Netlify Dashboard → **Functions**
2. Check each function has been invoked:
   - `extract-whiteboard`
   - `generate-mealplan`
3. Click function → View logs
4. Verify no errors in recent invocations
5. Check response times are reasonable (< 15s)

**Expected log output:**
- No "undefined" or "null" errors
- Successful OpenAI API calls
- Proper JSON responses
- HTTP 200 status codes

---

## ✅ Supabase Integration

- [ ] Supabase Site URL updated to Netlify domain
- [ ] Redirect URLs include Netlify domain
- [ ] RLS policies are enabled (in Supabase dashboard)
- [ ] Realtime is enabled for tables
- [ ] Storage bucket `uploads` is public
- [ ] Can view uploaded images via public URL

---

## ❌ Common Issues & Fixes

### Issue: "Missing Supabase environment variables"
**Fix:** Ensure client-side env vars are set in Netlify dashboard and deployed

### Issue: Functions return 404
**Fix:** 
1. Check `netlify.toml` functions directory
2. Verify `@netlify/functions` in dependencies (not devDependencies)
3. Redeploy

### Issue: "AI extraction failed" or 500 error
**Fix:**
1. Check `OPENAI_API_KEY` is set in Netlify
2. View function logs for detailed error
3. Verify OpenAI API key has credits

### Issue: Real-time not working
**Fix:**
1. Check Supabase Realtime is enabled
2. Verify RLS policies allow SELECT for household members
3. Check browser console for websocket errors

### Issue: Images not showing after upload
**Fix:**
1. Verify `uploads` bucket exists in Supabase Storage
2. Check bucket is set to public
3. Verify storage RLS policies

---

## 🎉 Deployment Success Criteria

Your deployment is successful when:

✅ All items in "Post-Deployment Tests" are checked  
✅ No errors in Netlify function logs  
✅ No errors in browser console  
✅ Real-time sync works between two browsers  
✅ All 5 MVP features work end-to-end  
✅ Mobile experience is functional  

**Once complete, your Board2Basket app is production-ready!**

---

## 📊 Monitoring Recommendations

**Daily:**
- Check Netlify function invocation count
- Monitor OpenAI API usage/costs
- Check Supabase database size

**Weekly:**
- Review Netlify bandwidth usage
- Check for any failed function invocations
- Review user feedback for issues

**Monthly:**
- Verify all services within free tier limits
- Update dependencies if needed
- Review and optimize bundle size
