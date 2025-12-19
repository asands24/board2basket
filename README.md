# Board2Basket

A whiteboard-to-grocery-list MVP app.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create `.env` in the root (for Vite) and configure Netlify env vars if deploying.
   
   **.env**
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   **Netlify / Server**
   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. **Database**
   Run the SQL migration in `supabase/migrations/20240523000000_initial_schema.sql` in your Supabase SQL Editor.

4. **Run Locally**
   
   frontend:
   ```bash
   npm run dev
   ```
   
   backend (functions):
   Use `netlify dev` or just mock the response if lacking Netlify CLI, but the code is set up for Netlify Functions.

## Features
- **Auth**: Email Magic Link (Supabase).
- **Households**: Create/Join households.
- **Lists**: Realtime grocery list sync.
- **AI Scanning**: Upload whiteboard photo -> Extract items.
- **Shopping Mode**: Check off items.
- **Meal Plan**: Generate recipes from purchased items.
