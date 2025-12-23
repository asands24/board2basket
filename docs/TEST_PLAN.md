# Board2Basket - Manual Test Plan

This document contains step-by-step manual test scenarios for verifying all MVP features.

## Prerequisites

- Two users (User A and User B) with different email addresses
- Sample whiteboard images with grocery lists
- Modern browser (Chrome, Safari, Firefox)
- Mobile device for mobile-specific tests

---

## Test Suite 1: Setup & Authentication

### TC-001: First-Time Setup
**Steps:**
1. Clone repository
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Fill in Supabase credentials
5. Run `npm run dev`
6. Navigate to `http://localhost:5173`

**Expected:**
- App loads without errors
- Redirected to login page

### TC-002: Magic Link Login
**Steps:**
1. Enter valid email address
2. Click "Sign in with Email"
3. Check email inbox
4. Click magic link

**Expected:**
- Success message shown
- Email received within 1 minute
- After clicking link, redirected to app
- Session persists on page refresh

---

## Test Suite 2: Feature A - Whiteboard Extraction

### TC-003: Upload Whiteboard Image (Desktop)
**Steps:**
1. Log in as User A
2. Create household "Test House"
3. Click "Scan" button
4. Select whiteboard image from file system

**Expected:**
- File picker opens
- Preview modal shows extracted items
- Each item shows: name, quantity (if detected), category, confidence
- Low-confidence items (< 0.8) have warning icon

### TC-004: Review Extracted Items
**Steps:**
1. Upload whiteboard image
2. In preview modal, review items
3. Edit an item name
4. Remove an incorrect item
5. Click "Confirm & Add to List"

**Expected:**
- Can edit item names inline
- Can remove items before confirming
- After confirmation, items appear in grocery list
- Removed items don't appear in list

### TC-005: Low-Confidence Warning
**Steps:**
1. Upload image with unclear/messy handwriting
2. Check confidence values in preview

**Expected:**
- Items with confidence < 0.8 show warning indicator
- Can still add them to list after review

### TC-006: Mobile Camera Capture
**Steps (on mobile device):**
1. Log in on mobile browser
2. Click "Scan" button
3. Should trigger camera directly

**Expected:**
- Native camera app opens
- Can take photo
- Photo is uploaded and processed

---

## Test Suite 3: Feature B - Editable Grocery List

### TC-007: Add Item Manually
**Steps:**
1. Navigate to household list
2. Type "Milk" in input field
3. Click + button

**Expected:**
- Item appears in list immediately
- No page refresh needed

### TC-008: Edit Item
**Steps:**
1. Hover over existing item
2. Click to edit (if inline edit exists)
3. Change name to "Almond Milk"

**Expected:**
- Item name updates
- Change saved to database

### TC-009: Delete Item
**Steps:**
1. Hover over item
2. Click trash icon

**Expected:**
- Item disappears from list
- Soft delete (status='removed')

### TC-010: Toggle Item Status
**Steps:**
1. Click checkbox on active item
2. Verify item moves to "Purchased" section
3. Click again to toggle back

**Expected:**
- Item status changes active ↔ purchased
- Visual state updates (checkmark, strikethrough)

---

## Test Suite 4: Feature C - Multi-User & Real-Time

### TC-011: Create & Share Household
**Steps (User A):**
1. Create new household
2. Click "Share" or "Invite" button
3. Copy invite code/link

**Expected:**
- Modal shows invite code
- Can copy to clipboard
- Code is valid household identifier

### TC-012: Join Household
**Steps (User B):**
1. Log in as User B
2. On onboarding page, choose "Join Household"
3. Paste invite code
4. Click "Join"

**Expected:**
- Successfully joins household
- Redirected to household list page
- Sees same list as User A

### TC-013: Real-Time Sync - Add Item
**Steps:**
1. User A and User B both view same household list
2. User A adds item "Apples"
3. User B watches (no refresh)

**Expected:**
- Item appears in User B's list within 1-2 seconds
- No page refresh needed

### TC-014: Real-Time Sync - Toggle Status
**Steps:**
1. User B marks "Apples" as purchased
2. User A watches

**Expected:**
- Item moves to purchased section in User A's view
- Real-time update

### TC-015: Claim Item
**Steps:**
1. User A clicks "Claim" on item "Bread"
2. User B views the list

**Expected:**
- Item shows "Claimed by [User A name]"
- User B sees the claim indicator
- User A can unclaim

### TC-016: Unclaim Item
**Steps:**
1. User A unclaims "Bread"

**Expected:**
- Claim indicator disappears
- Other users can now claim it

---

## Test Suite 5: Feature D - Shopping Mode

### TC-017: Enter Shopping Mode
**Steps:**
1. Navigate to household list with 10+ items
2. Click "Shop" tab in bottom navigation

**Expected:**
- Redirects to `/shopping/:listId`
- Shows all active items
- Header shows count "X left"

### TC-018: Fast Toggle Items
**Steps:**
1. Rapidly tap 5 items to mark purchased

**Expected:**
- UI responds instantly (< 100ms)
- Items move to "Purchased" section
- Counter updates

### TC-019: Shopping Mode on Mobile
**Steps (on mobile):**
1. Enter shopping mode
2. Scroll through list
3. Toggle items

**Expected:**
- Smooth scrolling
- Large tap targets (48x48px minimum)
- No lag with 20+ items

### TC-020: Complete Shopping
**Steps:**
1. Mark all items as purchased

**Expected:**
- Shows "All Done! 🎉" message
- "Back to List" button available

---

## Test Suite 6: Feature E - Meal Plan

### TC-021: Generate Meal Plan
**Steps:**
1. Mark 5 items as purchased (e.g., chicken, rice, broccoli, tomatoes, cheese)
2. Navigate to "Meals" tab
3. Click "Generate Meal Plan"

**Expected:**
- Loading indicator shows
- Returns 3-day meal plan within 10 seconds
- Each day shows meals with:
  - Recipe title
  - Time in minutes
  - Ingredients used (from purchased items)
  - Optional staples
  - Step-by-step instructions

### TC-022: Verify Purchased Items Used First
**Steps:**
1. Review generated meal plan
2. Check ingredients used in recipes

**Expected:**
- Recipes prioritize purchased items
- Purchased items appear in "ingredients_used"
- Minimal "shopping_additions"

### TC-023: Shopping Additions Flagged
**Steps:**
1. Generate plan with only 3 purchased items
2. Review "Missing Ingredients" section

**Expected:**
- Shows list of additional items needed
- Clearly labeled as optional or required

### TC-024: Low Ingredient Warning
**Steps:**
1. Have < 3 purchased items
2. Click "Generate Meal Plan"

**Expected:**
- Warning banner shows before generation
- Offers to use active items instead
- Can proceed or cancel

---

## Test Suite 7: Security & RLS

### TC-025: Household Data Isolation
**Steps:**
1. User A creates Household 1
2. User B creates Household 2 (separate)
3. User A tries to access Household 2 by guessing URL

**Expected:**
- User A cannot see Household 2 data
- Supabase RLS blocks access
- Error or redirect

### TC-026: Real-Time Subscription Isolation
**Steps:**
1. User A in Household 1
2. User B in Household 2
3. User B adds item to their list
4. User A watches their own list

**Expected:**
- User A does NOT see User B's changes
- Real-time subscriptions filtered by household

---

## Test Suite 8: Error Handling

### TC-027: AI Extraction Failure
**Steps:**
1. Upload non-image file or corrupted image
2. Observe behavior

**Expected:**
- Helpful error message
- No app crash
- Can retry

### TC-028: Network Offline
**Steps:**
1. Disconnect internet
2. Try adding item

**Expected:**
- Shows error message
- Graceful degradation
- Can retry when online

### TC-029: Invalid Invite Code
**Steps:**
1. Try joining household with code "INVALID123"

**Expected:**
- Error message: "Invalid invite code"
- Does not crash

---

## Test Suite 9: UI/UX Polish

### TC-030: Real-Time Connection Indicator
**Steps:**
1. Navigate to household list
2. Check header area

**Expected:**
- Shows connection status (🟢 Connected / 🔴 Disconnected)
- Updates when connection state changes

### TC-031: Low-Confidence Items Banner
**Steps:**
1. Have list with 3+ low-confidence items
2. View list page

**Expected:**
- Banner shows "3 items need review"
- Clicking banner highlights those items

---

## Regression Tests

### TC-032: Page Refresh Persistence
**Steps:**
1. Add items to list
2. Refresh page

**Expected:**
- Items still present
- Session maintained

### TC-033: Multiple Tabs
**Steps:**
1. Open app in Tab 1
2. Open same household in Tab 2
3. Add item in Tab 1

**Expected:**
- Tab 2 updates via real-time subscription

---

## Performance Benchmarks

| Test | Target | Actual |
|------|--------|--------|
| Page load (cold) | < 2s | |
| Add item (manual) | < 500ms | |
| Toggle item status | < 300ms | |
| Real-time update latency | < 2s | |
| AI extraction time | < 15s | |
| Meal plan generation | < 20s | |
| Shopping mode (50 items) | No lag | |

---

## Sign-Off

- [ ] All test cases executed
- [ ] No critical bugs found
- [ ] Performance meets targets
- [ ] Mobile experience verified
- [ ] Multi-user scenarios tested

**Tested by:** _______________  
**Date:** _______________  
**Build Version:** _______________
