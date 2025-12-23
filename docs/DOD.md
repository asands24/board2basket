# Board2Basket - Definition of Done

This checklist defines when the Board2Basket MVP is considered complete and ready for user testing.

## Core Features

### ✅ Feature A: Whiteboard Photo → Extracted List
- [ ] User can upload whiteboard image (mobile camera capture supported)
- [ ] Extraction returns structured JSON with name, quantity, unit, category, confidence
- [ ] Preview modal shows extracted items before saving
- [ ] Low-confidence items (< 0.8) are visually flagged
- [ ] User can edit/remove items in preview before confirming
- [ ] No hallucinated items (verified with sample images)
- [ ] Works on mobile devices

### ✅ Feature B: Editable Grocery List
- [ ] Can add items manually via input field
- [ ] Can edit item names inline or in detail view
- [ ] Can delete/remove items (soft delete)
- [ ] Items show categories (via AI categorization or manual)
- [ ] Items can be marked active/purchased/removed
- [ ] Status changes persist to database

### ✅ Feature C: Shared List for Roommates (Multi-User)
- [ ] User can create a household
- [ ] Household owner can generate invite link/code
- [ ] Other users can join via invite code
- [ ] Real-time sync: changes by one user appear for others without refresh
- [ ] "Claim item" feature: users can claim items they'll purchase
- [ ] Claimed items show who claimed them
- [ ] Users can unclaim items

### ✅ Feature D: Shopping Mode
- [ ] Fast checkbox UI for marking items purchased
- [ ] Works smoothly with 20+ items
- [ ] Mobile-friendly layout
- [ ] Shows count of remaining items
- [ ] Purchased items shown separately with completion state
- [ ] Can toggle purchased items back to active

### ✅ Feature E: Meal Plan from Purchased Ingredients
- [ ] Generates 3-7 day meal plan
- [ ] Uses purchased items first
- [ ] Optional staples are clearly marked
- [ ] Shopping additions (missing items) are flagged
- [ ] Displays recipes with:
  - Recipe title
  - Time in minutes
  - Ingredients used (from purchased list)
  - Step-by-step instructions
- [ ] Warning shown if < 3 purchased items

## Technical Requirements

### Database & Security
- [ ] Row Level Security (RLS) policies enforce household boundaries
- [ ] Users can only see data for households they belong to
- [ ] Real-time subscriptions don't leak data across households
- [ ] Soft deletes work (status='removed')

### AI Endpoints
- [ ] `extract-whiteboard` returns valid JSON, handles errors gracefully
- [ ] `categorize-items` assigns categories from fixed list
- [ ] `generate-mealplan` validates input and output schema
- [ ] All endpoints have input validation and size limits
- [ ] Error responses are user-friendly

### UX & Polish
- [ ] Real-time connection status indicator visible
- [ ] Low-confidence items warning banner shows count
- [ ] Mobile-responsive on iOS and Android
- [ ] Loading states during AI operations
- [ ] Error handling with helpful messages

## Documentation

- [ ] `.env.example` file exists with all required variables
- [ ] `README.md` has complete local setup steps
- [ ] Common troubleshooting issues documented
- [ ] Test plan exists in `docs/TEST_PLAN.md`
- [ ] All MVP features described in README

## Testing

- [ ] Manual test plan executed successfully
- [ ] Happy path works end-to-end:
  1. User A creates household
  2. User A uploads whiteboard → items extracted
  3. User A shares invite code
  4. User B joins household
  5. User B sees list in real-time
  6. User B claims items
  7. User A enters shopping mode, marks purchased
  8. User generates meal plan from purchased items
- [ ] Edge cases handled:
  - Empty lists
  - No purchased items
  - Invalid invite codes
  - AI extraction failures
  - Network errors

## Deployment Readiness

- [ ] Environment variables set in Netlify
- [ ] Supabase project configured with:
  - Database migrations applied
  - Auth configured (magic link)
  - Storage bucket created
  - RLS policies enabled
- [ ] App builds without errors (`npm run build`)
- [ ] App runs locally (`npm run dev`)

---

**Sign-off**: When all checkboxes are ✅, the MVP is ready for initial user testing.
