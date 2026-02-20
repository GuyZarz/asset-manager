# Asset Manager - Manual Testing Checklist

Use this checklist when manually testing the application.

## Pre-Testing Setup

- [ ] Frontend running on http://localhost:5173
- [ ] Backend running on http://localhost:5000
- [ ] Logged in with Google account
- [ ] Browser console open (F12) to monitor errors

---

## 1. Symbol Validation - Crypto

### Test BTC
- [ ] Navigate to "Add Asset" → Select "Crypto"
- [ ] Type "BTC" in Symbol field
- [ ] Wait 500ms for validation spinner
- [ ] **Expected**: Green checkmark ✓ "Bitcoin" appears
- [ ] **Expected**: Current price displays (e.g., "$65,432.50 USD")
- [ ] **Expected**: Name field auto-fills to "Bitcoin" (if empty)
- [ ] **Expected**: Submit button becomes enabled

### Test ETH
- [ ] Clear form and type "ETH" in Symbol field
- [ ] **Expected**: Green checkmark ✓ "Ethereum" appears
- [ ] **Expected**: Current price displays in USD
- [ ] **Expected**: Name field auto-fills to "Ethereum"

### Test Invalid Crypto
- [ ] Type "FAKECOIN999" in Symbol field
- [ ] **Expected**: Red X ✗ "Symbol not found" appears
- [ ] **Expected**: "Add manually" button appears
- [ ] **Expected**: Submit button disabled

---

## 2. Symbol Validation - Stocks

### Test AAPL
- [ ] Select "Stock" type
- [ ] Leave Exchange as "US (default)"
- [ ] Type "AAPL" in Symbol field
- [ ] **Expected**: Green checkmark ✓ "Apple Inc." appears
- [ ] **Expected**: Current price displays
- [ ] **Expected**: Submit button enabled

### Test MSFT
- [ ] Clear and type "MSFT"
- [ ] **Expected**: Green checkmark ✓ "Microsoft Corporation" appears
- [ ] **Expected**: Current price displays

### Test Invalid Stock
- [ ] Type "INVALIDSTOCK"
- [ ] **Expected**: Red X ✗ "Symbol not found"
- [ ] **Expected**: "Add manually" button appears

---

## 3. TASE Stocks (Critical Test)

### Test LUMI with Exchange Dropdown
- [ ] Select "Stock" type
- [ ] **First**: Type "LUMI" with Exchange = "US (default)"
- [ ] **Expected**: Red X ✗ "Symbol not found"
- [ ] **Then**: Change Exchange to "TASE (Israel)"
- [ ] **CHECK**: Does validation re-trigger automatically?
  - **If YES**: Bug is fixed ✅
  - **If NO**: Bug exists ❌ (validation should re-run when exchange changes)
- [ ] **Workaround**: Delete "I" from "LUMI" then re-type it
- [ ] **Expected**: Green checkmark ✓ with company name appears
- [ ] **Expected**: Price displays in ILS or USD (check currency label)

### Test Other TASE Stocks
- [ ] Try "TEVA" with TASE exchange
- [ ] **Expected**: Should validate successfully

---

## 4. Manual Entry Feature

### Test Manual Entry Flow
- [ ] Select "Crypto" type
- [ ] Type "MYCUSTOMCOIN" in Symbol field
- [ ] Wait for red X ✗ "Symbol not found"
- [ ] Click **"Add manually"** button
- [ ] **Expected**: Warning appears: "⚠ Manual entry - price must be entered manually"
- [ ] **Expected**: "Cancel" button appears
- [ ] **Expected**: "Current Price" field appears and is required
- [ ] Fill all required fields:
  - Name: "My Custom Coin"
  - Symbol: "MYCUSTOMCOIN"
  - Quantity: 100
  - Cost Basis: 10
  - Current Price: 15
- [ ] Click **Submit**
- [ ] **Expected**: Asset created successfully
- [ ] **Expected**: Redirects to dashboard
- [ ] **Expected**: Asset appears in list with correct calculations

### Test Cancel Manual Entry
- [ ] Repeat steps to get to manual entry mode
- [ ] Click **"Cancel"** button
- [ ] **Expected**: Warning disappears
- [ ] **Expected**: Current Price field disappears
- [ ] **Expected**: Submit button disabled again

---

## 5. Form Validation

### Test Empty Fields
- [ ] Navigate to "Add Asset"
- [ ] Leave all fields empty
- [ ] Click **Submit**
- [ ] **Expected**: Browser shows "Please fill out this field" on Name input

### Test Invalid Quantity
- [ ] Fill Name: "Test Asset"
- [ ] Type: "Crypto", Symbol: "BTC" (wait for validation)
- [ ] Quantity: **0**
- [ ] Cost Basis: 10
- [ ] Click **Submit**
- [ ] **Expected**: Error message "Quantity must be greater than 0"

### Test Negative Cost Basis
- [ ] Quantity: 1
- [ ] Cost Basis: **-100**
- [ ] Click **Submit**
- [ ] **Expected**: Error message "Cost basis must be >= 0" (or browser validation blocks)

### Test Missing Required Fields (Real Estate)
- [ ] Select Type: "RealEstate"
- [ ] Fill Name: "My House"
- [ ] Leave Address, City, State empty
- [ ] Purchase Price: 300000
- [ ] Click **Submit**
- [ ] **Expected**: Error messages for Address, City, State

### Test Valid Submission
- [ ] Fill all required fields with valid data
- [ ] Click **Submit**
- [ ] **Expected**: Success! Redirects to dashboard
- [ ] **Expected**: Asset appears in list

---

## 6. Dashboard Charts

### Allocation Chart (Donut)
- [ ] Navigate to Dashboard
- [ ] **Expected**: Donut chart displays with asset types
- [ ] **Expected**: Colors match legend:
  - Crypto = Amber/Orange (#F59E0B)
  - Stock = Blue (#3B82F6)
  - Real Estate = Purple (#8B5CF6)
- [ ] Hover over chart segments
- [ ] **Expected**: Tooltip shows currency value
- [ ] Check percentages in legend
- [ ] **Verify**: Percentages add up to ~100% (allow ±1% for rounding)

### Performance Chart (Area)
- [ ] Check if chart displays data
- [ ] **If no data**: Expected message "No history yet. Check back tomorrow"
- [ ] **If data exists**:
  - [ ] Chart displays with gradient fill
  - [ ] Click **7D** button → chart updates
  - [ ] Click **30D** button → chart updates
  - [ ] Click **90D** button → chart updates
  - [ ] Click **1Y** button → chart updates
  - [ ] Hover over chart → tooltip shows date and value
  - [ ] **Verify**: Date format is readable (e.g., "Feb 20")

### Gain/Loss Chart (Horizontal Bars)
- [ ] Check if chart displays
- [ ] **Expected**: Top 8 assets by gain/loss magnitude
- [ ] **Verify**: Green bars = gains, Red bars = losses
- [ ] **Verify**: Each bar shows +/- sign with amount and percentage
- [ ] **Verify**: Bars animate smoothly on page load
- [ ] If more than 8 assets exist:
  - [ ] **Expected**: Note at bottom: "Showing top 8 assets by gain/loss magnitude"

---

## 7. Portfolio Calculations

### Create Test Assets
Create these 3 test assets to verify calculations:

**Asset 1: Bitcoin**
- Type: Crypto
- Symbol: BTC
- Quantity: 2.5
- Cost Basis: $20,000
- Expected Total Cost: $50,000
- Expected Total Value: ~$162,500 (depends on current BTC price)
- Expected Gain/Loss: ~$112,500
- Expected %: ~+225%

**Asset 2: Apple Stock**
- Type: Stock
- Symbol: AAPL
- Quantity: 100
- Cost Basis: $150
- Expected Total Cost: $15,000
- Expected Total Value: ~$18,000 (depends on current AAPL price)
- Expected Gain/Loss: ~$3,000
- Expected %: ~+20%

**Asset 3: Real Estate**
- Type: RealEstate
- Property Type: House
- Address: "123 Test St"
- City: "Test City"
- State: "CA"
- Purchase Price (Cost Basis): $300,000
- Current Value: $350,000
- Expected Total Cost: $300,000
- Expected Total Value: $350,000
- Expected Gain/Loss: +$50,000
- Expected %: +16.67%

### Verify Individual Calculations
For each asset in the table:
- [ ] **Total Cost** = Quantity × Cost Basis
- [ ] **Total Value** = Quantity × Current Price
- [ ] **Gain/Loss** = Total Value - Total Cost
- [ ] **%** = (Gain/Loss ÷ Total Cost) × 100

### Verify Portfolio Totals
- [ ] **Total Value** = Sum of all assets' Total Value
- [ ] **Total Cost** = Sum of all assets' Total Cost
- [ ] **Total Gain/Loss** = Total Value - Total Cost
- [ ] **Total %** = (Total Gain/Loss ÷ Total Cost) × 100
- [ ] **Compare**: Calculator results vs. dashboard display
- [ ] **Tolerance**: Allow ±$0.01 for rounding

### Edge Case: Zero Cost Basis
- [ ] Create asset with Cost Basis = 0, Current Price = 100
- [ ] **Expected**: Gain/Loss shows correctly
- [ ] **Expected**: % shows infinity symbol (∞) or "N/A" (not crash)

---

## 8. CRUD Operations

### Create
- [ ] Click **"+ Add Asset"** button
- [ ] Fill form with valid crypto data (BTC)
- [ ] Click **Submit**
- [ ] **Expected**: Redirects to dashboard
- [ ] **Expected**: New asset appears in list
- [ ] **Expected**: Portfolio totals update
- [ ] **Expected**: Charts update with new data

### Read (List)
- [ ] Dashboard displays all assets in table
- [ ] **Verify**: Asset name, type badge, quantity, prices display correctly
- [ ] **Verify**: Colored left border matches asset type
- [ ] **Verify**: Gain/loss shows + or - with color (green/red)

### Read (Single)
- [ ] Click **Edit** button on an asset (or click asset row)
- [ ] **Expected**: Navigates to edit page
- [ ] **Expected**: All fields populated with current values
- [ ] **Expected**: Asset type is disabled (can't change type)
- [ ] **Verify**: Symbol, quantity, cost basis, notes all match

### Update
- [ ] On edit page, change:
  - Name: "Bitcoin" → "My Bitcoin Investment"
  - Quantity: 1.0 → 1.5
  - Notes: "" → "HODLing for long term"
- [ ] Click **Update Asset**
- [ ] **Expected**: Redirects to dashboard
- [ ] **Expected**: Asset shows updated name
- [ ] **Expected**: Calculations reflect new quantity (1.5)
- [ ] Click Edit again to verify notes were saved

### Delete
- [ ] Click **Delete** button (trash icon) on an asset
- [ ] **Expected**: Confirmation dialog: "Are you sure you want to delete this asset?"
- [ ] Click **Cancel**
- [ ] **Expected**: Asset still exists in list
- [ ] Click **Delete** again
- [ ] Click **OK/Confirm**
- [ ] **Expected**: Asset disappears from list immediately
- [ ] **Expected**: Portfolio totals recalculate without that asset
- [ ] **Expected**: Charts update (allocation changes)
- [ ] **Note**: Asset is soft-deleted (IsDeleted=true in DB, not actually removed)

---

## 9. Responsive Design (Mobile)

### Test on Mobile Size
- [ ] Resize browser to 375px width (iPhone size)
- [ ] Dashboard layout stacks vertically
- [ ] Charts are readable on small screen
- [ ] Table scrolls horizontally if needed
- [ ] Form inputs are at least 44px tall (touch-friendly)
- [ ] Navigation menu accessible (hamburger icon if sidebar hidden)

---

## 10. Error Scenarios

### Network Error
- [ ] Disconnect internet (or block API calls in DevTools)
- [ ] Try to add asset
- [ ] **Expected**: Error message displays
- [ ] **Expected**: Doesn't crash
- [ ] Reconnect and retry → should work

### API Rate Limit (CoinGecko)
- [ ] Type 10+ different crypto symbols rapidly
- [ ] **If rate limited**: Validation fails silently (returns to idle)
- [ ] **Expected**: App doesn't crash
- [ ] **Improvement needed**: Show error message

### Concurrent Edits (Multi-tab)
- [ ] Open app in two browser tabs
- [ ] Edit same asset in both tabs
- [ ] Save in Tab 1, then Tab 2
- [ ] **Expected**: Last save wins (no conflict resolution)
- [ ] Refresh to see final state

---

## 11. Security Testing

### Authorization
- [ ] Try accessing another user's asset (if multi-user setup)
- [ ] Manual URL: `/api/assets/999999` (non-existent ID)
- [ ] **Expected**: 404 Not Found (not 403, to prevent enumeration)

### SQL Injection Attempt
- [ ] In Name field, enter: `'; DROP TABLE assets; --`
- [ ] Submit asset
- [ ] **Expected**: Saved as literal string, no SQL executed
- [ ] **Expected**: App still works after (tables not dropped)

### XSS Attempt
- [ ] In Notes field, enter: `<script>alert('XSS')</script>`
- [ ] Save and view asset
- [ ] **Expected**: Script displays as text, doesn't execute
- [ ] **Expected**: React auto-escapes HTML

---

## 12. Accessibility Testing

### Keyboard Navigation
- [ ] Use **Tab** key to navigate form
- [ ] **Expected**: All inputs, buttons, dropdowns reachable
- [ ] Use **Enter** to submit form
- [ ] Use **Esc** to close modals (if any)

### Screen Reader (Optional)
- [ ] Enable screen reader (NVDA, JAWS, VoiceOver)
- [ ] Navigate form with Tab
- [ ] **Expected**: Field labels announced
- [ ] **Expected**: Error messages announced
- [ ] **Expected**: Buttons have clear names

### Color Blindness
- [ ] Verify gains/losses have +/- symbols (not just color)
- [ ] Verify charts have labels/legends (not just color-coded)

---

## 13. Performance Testing

### Large Portfolio (100+ Assets)
- [ ] Create 100+ assets (use API or bulk import if available)
- [ ] Navigate to dashboard
- [ ] **Measure**: Page load time (should be < 2 seconds)
- [ ] **Check**: Charts render smoothly
- [ ] **Check**: Table scrolling is smooth
- [ ] **Check**: No browser lag or freezing

### Chart Animation Performance
- [ ] Dashboard with many assets
- [ ] Reload page and watch Gain/Loss chart animate
- [ ] **Expected**: Smooth animation (60 FPS)
- [ ] **If laggy**: Consider reducing animation on mobile

---

## Bug Report Template

When you find a bug, document it like this:

**Title**: [Short description]
**Severity**: Critical / High / Medium / Low
**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**: What should happen
**Actual Result**: What actually happened
**Screenshots**: (attach if applicable)
**Browser**: Chrome 120 / Firefox 115 / Safari 17
**Console Errors**: (paste any errors from browser console)

---

## Sign-Off

**Tester Name**: _________________
**Date**: _________________
**Overall Assessment**: ❌ Failed / ⚠️ Passed with Issues / ✅ Passed

**Critical Issues Found**: _____
**Non-Critical Issues Found**: _____

**Notes**:
