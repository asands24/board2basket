# Board2Basket 🛒📋

**Transform your whiteboard grocery scribbles into organized, shared shopping lists with AI-powered meal planning.**

Board2Basket is an MVP web app that lets roommates collaboratively manage grocery shopping. Snap a photo of your whiteboard list, let AI extract and categorize items, shop together in real-time, and generate meal plans from what you've bought.

---

## ✨ Features

### 📸 **A. Whiteboard Photo → Extracted List**
- Upload whiteboard images (mobile camera supported)
- AI extraction with GPT-4o Vision
- Confidence scoring for each item
- Preview & edit before adding to list
- Automatic categorization (Produce, Dairy, Meat, etc.)

### ✏️ **B. Editable Grocery List**
- Add/edit/remove items inline
- Smart categorization
- Mark items as active/purchased/removed
- Real-time sync across all devices

### 👥 **C. Shared Lists for Roommates**
- Create households and invite roommates
- Share via invite code
- Real-time updates (no refresh needed)
- **Claim items** so roommates know who's buying what

### 🛍️ **D. Shopping Mode**
- Fast checkbox UI optimized for in-store shopping
- Works smoothly with large lists
- Mobile-friendly interface
- Progress counter

### 🍳 **E. Meal Plan from Purchased Ingredients**
- Generate 3-7 day meal plans
- Prioritizes purchased items
- Shows recipe steps, cook time, ingredients
- Flags missing ingredients

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** (free tier works)
- **OpenAI API key** (for AI features)
- **Netlify account** (optional, for deploying functions)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd board2basket
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For Netlify Functions, also set (in Netlify dashboard or `netlify.toml`):

```bash
OPENAI_API_KEY=sk-your-key-here
```

### 3. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase/migrations/20240523000000_initial_schema.sql`
4. Paste and run the migration
5. Verify tables were created: `profiles`, `households`, `household_members`, `lists`, `list_items`, `whiteboard_uploads`, `mealplans`

### 4. Configure Authentication

In your Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure **Email Templates** (optional: customize magic link emails)
4. Set **Site URL** to `http://localhost:5173` for local development

### 5. Configure Storage

1. Go to **Storage** in Supabase dashboard
2. Verify the `uploads` bucket was created (migration does this)
3. Ensure bucket is set to **public** for image access

### 6. Run Development Server

```bash
npm run dev
```

App will be available at **http://localhost:5173**

### 7. Test Netlify Functions Locally (Optional)

If you want to test AI features locally:

```bash
npm install -g netlify-cli
netlify dev
```

This runs both frontend and serverless functions.

---

## 🏗️ Project Structure

```
board2basket/
├── src/
│   ├── components/       # React components
│   │   ├── GroceryList.tsx
│   │   └── ProtectedRoute.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useListItems.tsx    # List management + realtime
│   │   └── useHouseholds.tsx   # Household management
│   ├── pages/            # Route pages
│   │   ├── Login.tsx
│   │   ├── Onboarding.tsx
│   │   ├── HouseholdDetail.tsx
│   │   ├── ShoppingMode.tsx
│   │   └── MealPlan.tsx
│   ├── lib/
│   │   └── supabase.ts   # Supabase client
│   └── App.tsx           # Main app + routing
├── netlify/
│   └── functions/        # Serverless AI endpoints
│       ├── extract-whiteboard.ts
│       ├── categorize-items.ts
│       └── generate-mealplan.ts
├── supabase/
│   └── migrations/       # Database schema
├── docs/
│   ├── DOD.md           # Definition of Done
│   └── TEST_PLAN.md     # Manual test scenarios
└── .env.example         # Environment template
```

---

## 🧪 Testing

See [docs/TEST_PLAN.md](docs/TEST_PLAN.md) for comprehensive manual test scenarios.

**Quick smoke test:**

1. Sign in with magic link
2. Create a household
3. Add items manually
4. Upload a whiteboard image (scan feature)
5. Invite a second user (use different browser/incognito)
6. Verify real-time sync
7. Enter shopping mode and toggle items
8. Generate a meal plan

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

**Solution:** Ensure `.env` file exists in project root with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart dev server after creating `.env`.

### Magic link not arriving

**Solution:** 
- Check spam folder
- Verify email provider is enabled in Supabase → Authentication → Providers
- Check Supabase logs for email delivery errors
- For development, disable email confirmation requirement

### "AI extraction failed" or 500 error on scan

**Solution:**
- Verify `OPENAI_API_KEY` is set in Netlify environment
- Run `netlify dev` instead of `npm run dev` to test functions locally
- Check Netlify function logs for detailed errors
- Ensure OpenAI API key has sufficient credits

### Real-time updates not working

**Solution:**
- Check browser console for websocket errors
- Verify Supabase project has Realtime enabled (it's on by default)
- Check RLS policies are correctly set up
- Refresh page and check subscription status

### "Permission denied" errors

**Solution:**
- Check Row Level Security policies in Supabase
- Ensure user is a member of the household they're accessing
- Verify `is_household_member()` function exists in database

### Build fails with TypeScript errors

**Solution:**
```bash
npm run lint
npx tsc --noEmit
```
Fix any type errors, then rebuild.

### Images not uploading

**Solution:**
- Verify `uploads` bucket exists in Supabase Storage
- Check bucket is set to **public**
- Verify storage policies allow authenticated users to upload
- Check image file size (< 10MB recommended)

---

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Magic Links) |
| **Storage** | Supabase Storage |
| **Real-time** | Supabase Realtime |
| **AI** | OpenAI GPT-4o (Vision + Chat) |
| **Functions** | Netlify Functions |
| **Icons** | Lucide React |

---

## 🚢 Deployment

### Deploy to Netlify

**Quick Start:**

1. Push your code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard:
   - `OPENAI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Netlify will auto-detect Vite and deploy
5. Update Supabase **Site URL** to your Netlify domain

**For detailed instructions, see [docs/NETLIFY_DEPLOYMENT.md](docs/NETLIFY_DEPLOYMENT.md)**

### Update Supabase Settings

After deploying:
1. Go to Supabase → Authentication → URL Configuration
2. Set **Site URL** to `https://your-app.netlify.app`
3. Add redirect URL to allowed list

---

## 📋 Roadmap

**Current MVP includes:**
- ✅ Whiteboard scanning
- ✅ Real-time shared lists
- ✅ Shopping mode
- ✅ Basic meal planning

**Future enhancements:**
- Recipe favorites & ratings
- Pantry inventory tracking
- Store integrations (prices, availability)
- Push notifications for list changes
- Dark mode
- Advanced meal plan customization (dietary restrictions, cuisine preferences)

---

## 📄 License

MIT License - feel free to use this project as a template for your own apps.

---

## 🤝 Contributing

This is an MVP/reference implementation. Feel free to fork and customize for your needs.

For bug reports or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for roommates who hate coordinating grocery shopping**
