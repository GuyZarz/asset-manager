# 🐛 Bug Report: TASE Exchange Validation

**Bug ID**: ASSET-001
**Date Reported**: 2026-02-20
**Reporter**: Claude Code (Static Analysis)
**Severity**: 🔴 HIGH
**Status**: ⚠️ Awaiting Manual Verification
**Priority**: P1 (Must fix before international stock support)

---

## 📋 Summary

Changing the stock exchange dropdown from "US (default)" to "TASE (Israel)" may not automatically re-trigger symbol validation, causing valid TASE stocks to appear invalid.

---

## 🔍 Description

When a user enters a stock symbol that is valid on one exchange but not another (e.g., "LUMI" is valid on TASE but not NYSE), changing the exchange dropdown should re-validate the symbol. However, the current implementation may not trigger re-validation automatically.

---

## 📂 Affected Files

**Primary**:
- `frontend/src/pages/AssetFormPage.tsx` (lines 102-114)

**Related**:
- `backend/src/AssetManager.Infrastructure/Services/PriceService.cs` (lines 104-118)
- `frontend/src/api/assets.ts` (lines 64-73)

---

## 🔄 Steps to Reproduce

1. Navigate to http://localhost:5173
2. Log in with Google account
3. Click **"+ Add Asset"** button
4. Select **"Stock"** from Type dropdown
5. Leave Exchange as **"US (default)"**
6. Type **"LUMI"** in Symbol field
7. Wait 500ms for validation to complete
8. **Observe**: Red X ✗ "Symbol not found" appears (expected - LUMI is not on US exchanges)
9. Change Exchange dropdown to **"TASE (Israel)"**
10. **Observe**: Does validation automatically re-run?

---

## ❌ Expected Behavior

After step 9 (changing exchange to TASE):
- Validation should automatically re-trigger
- Loading spinner should appear briefly
- Green checkmark ✓ should appear with company name
- Current price should display
- Submit button should become enabled

**Reasoning**: The same symbol can be valid or invalid depending on the exchange. Changing the exchange changes the context, so re-validation is necessary.

---

## ⚠️ Actual Behavior (Hypothesis - Requires Manual Testing)

**Scenario A (Bug exists)**:
- After changing exchange to TASE, validation does NOT re-run
- Red X ✗ remains showing "Symbol not found"
- Submit button remains disabled
- User must delete the last character and re-type to trigger validation
- **Workaround**: Delete "I" from "LUMI", then type "I" again

**Scenario B (Bug doesn't exist)**:
- After changing exchange to TASE, validation automatically re-runs
- Green checkmark appears
- Submit button enables
- Everything works as expected

---

## 🧪 Test Results

**Status**: ⚠️ **NOT YET TESTED MANUALLY**

**Code Analysis**:
```typescript
// frontend/src/pages/AssetFormPage.tsx:102-114
useEffect(() => {
  if (isEdit) return;
  setManualEntry(false);
  if (type === "Crypto" && cryptoSymbol) {
    doValidateSymbol("Crypto", cryptoSymbol);
  } else if (type === "Stock" && stockSymbol) {
    doValidateSymbol("Stock", stockSymbol, stockExchange); // ← Exchange is passed
  } else {
    setSymbolValidation("idle");
    setValidationResult(null);
  }
}, [cryptoSymbol, stockSymbol, stockExchange, type, isEdit, doValidateSymbol]);
   ↑ stockExchange IS in dependencies
```

**Analysis**:
- ✅ `stockExchange` is included in the `useEffect` dependencies
- ✅ `doValidateSymbol` is called with `stockExchange` parameter
- ✅ Backend correctly handles exchange parameter

**Conclusion**: Code LOOKS correct, but **manual testing is required** to confirm runtime behavior.

---

## 💻 Technical Details

### Backend Implementation

**File**: `backend/src/AssetManager.Infrastructure/Services/PriceService.cs`

```csharp
private static string BuildYahooSymbol(string symbol, string? exchange)
{
    if (string.IsNullOrEmpty(exchange))
        return symbol;

    return exchange.ToUpperInvariant() switch
    {
        "TASE" => $"{symbol}.TA",      // ← LUMI becomes LUMI.TA
        "LSE" or "LONDON" => $"{symbol}.L",
        "TSX" or "TORONTO" => $"{symbol}.TO",
        "ASX" or "SYDNEY" => $"{symbol}.AX",
        "XETRA" or "FRANKFURT" => $"{symbol}.DE",
        _ => symbol
    };
}
```

**Validation Flow**:
1. Frontend sends: `{ type: "Stock", symbol: "LUMI", exchange: "TASE" }`
2. Backend calls: `BuildYahooSymbol("LUMI", "TASE")` → returns `"LUMI.TA"`
3. Backend queries Yahoo Finance: `Yahoo.Symbols("LUMI.TA").QueryAsync()`
4. Yahoo returns stock data for Tel Aviv Stock Exchange
5. Backend returns: `{ valid: true, name: "...", price: 123.45, currency: "ILS" }`

---

## 🎯 Impact Assessment

**User Impact**: High
- Affects anyone trading international stocks
- Particularly impacts Israeli users (TASE is Israeli exchange)
- May affect users of LSE, TSX, ASX, XETRA as well

**Business Impact**: Medium
- Reduces international stock support usability
- May require customer support to explain workaround
- Negative user experience

**Frequency**: Medium
- Only affects users who:
  1. Type symbol before selecting exchange, AND
  2. Need to change exchange after typing

---

## 🔧 Potential Root Causes

### Hypothesis 1: useEffect Not Triggering
**Likelihood**: Low
- Dependencies include `stockExchange`
- Should trigger when it changes

**Possible Cause**:
- React may be batching state updates
- `setStockExchange` might not trigger immediate re-render

### Hypothesis 2: Debounce Interference
**Likelihood**: Medium
- The `doValidateSymbol` function has 500ms debounce
- If exchange changes during debounce window, might cancel previous validation

**Code**:
```typescript
debounceRef.current = setTimeout(async () => {
  // Validation logic
}, 500);
```

### Hypothesis 3: Race Condition
**Likelihood**: Low
- Multiple useEffect dependencies changing simultaneously
- Cleanup function clearing timeout prematurely

---

## 🛠️ Proposed Solutions

### Solution 1: Force Re-validation on Exchange Change (Recommended)
```typescript
// Add separate useEffect for exchange changes
useEffect(() => {
  if (type === "Stock" && stockSymbol && stockExchange) {
    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Immediately trigger validation
    doValidateSymbol("Stock", stockSymbol, stockExchange);
  }
}, [stockExchange]); // Only watch exchange
```

**Pros**:
- Guaranteed to work
- Clear separation of concerns
- No side effects

**Cons**:
- Additional useEffect hook
- Slight code duplication

---

### Solution 2: Add Exchange to Debounce Logic
```typescript
const doValidateSymbol = useCallback(
  (assetType: AssetType, symbol: string, exchange?: string) => {
    // Clear existing timeout
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Store exchange in validation state to detect changes
    const validationKey = `${assetType}:${symbol}:${exchange || ''}`;

    // Rest of validation logic...
  },
  [name]
);
```

**Pros**:
- Centralized logic
- Handles all edge cases

**Cons**:
- More complex
- Harder to debug

---

### Solution 3: Remove Debounce for Exchange Changes
```typescript
useEffect(() => {
  if (type === "Stock" && stockSymbol) {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // No debounce for exchange changes - validate immediately
    doValidateSymbol("Stock", stockSymbol, stockExchange);
  }
}, [stockExchange]);

// Keep debounced validation for symbol changes
useEffect(() => {
  if (type === "Stock" && stockSymbol) {
    // Debounced validation (500ms)
    const timer = setTimeout(() => {
      doValidateSymbol("Stock", stockSymbol, stockExchange);
    }, 500);
    return () => clearTimeout(timer);
  }
}, [stockSymbol]);
```

**Pros**:
- Best user experience (immediate feedback)
- Clear intent

**Cons**:
- Two separate useEffects
- Slightly more complex

---

## 🧪 Verification Steps

After implementing fix:

1. **Test Original Scenario**:
   - [ ] Type "LUMI" with US exchange → validation fails
   - [ ] Change to TASE → validation re-runs automatically
   - [ ] Green checkmark appears
   - [ ] Submit button enables

2. **Test Reverse**:
   - [ ] Type "AAPL" with TASE exchange → validation fails
   - [ ] Change to US → validation re-runs
   - [ ] Green checkmark appears

3. **Test Multiple Changes**:
   - [ ] Type "LUMI" with US → fails
   - [ ] Change to TASE → passes
   - [ ] Change back to US → fails again
   - [ ] Change to LSE → fails
   - [ ] Change to TASE → passes again

4. **Test Edge Cases**:
   - [ ] Change exchange before typing symbol
   - [ ] Change exchange during typing (mid-debounce)
   - [ ] Change exchange rapidly multiple times

---

## 📊 Related Test Cases

This bug may affect these test scenarios:

| Exchange | Test Symbol | Expected Result |
|----------|-------------|-----------------|
| TASE | LUMI | Valid (Tel Aviv) |
| TASE | TEVA | Valid (Tel Aviv) |
| LSE | HSBA | Valid (London) |
| TSX | RY | Valid (Toronto) |
| XETRA | SAP | Valid (Frankfurt) |
| ASX | BHP | Valid (Sydney) |

---

## 🔗 Related Issues

- **Issue #2**: No error feedback on API failures
- **Issue #4**: Currency display for non-USD stocks

---

## 📝 Notes

**Why This Wasn't Caught Earlier**:
- Code analysis suggests it should work
- Dependencies are correctly configured
- Runtime behavior may differ from static analysis
- Requires user interaction testing

**Why This Is High Severity**:
- Blocks international stock support
- Poor user experience (requires workaround)
- May cause user to abandon feature

**Why Manual Testing Is Critical**:
- Static analysis shows correct dependencies
- Only runtime testing can confirm behavior
- Browser React behavior may differ from expectations

---

## ✅ Acceptance Criteria

Bug is considered FIXED when:
- [ ] User types invalid symbol with default exchange
- [ ] User changes exchange dropdown to correct exchange
- [ ] Validation automatically re-runs (no manual re-typing needed)
- [ ] Green checkmark appears immediately
- [ ] Submit button enables
- [ ] Process is smooth and intuitive
- [ ] All related test cases pass

---

## 🎬 Next Steps

1. **Manual Testing** (P0 - Highest Priority)
   - Test current behavior
   - Confirm if bug exists
   - Document actual behavior

2. **If Bug Confirmed**:
   - Implement Solution 1 or 3
   - Add unit test for useEffect
   - Add E2E test for exchange change
   - Update documentation

3. **If Bug Does NOT Exist**:
   - Update this report
   - Close as "Not a Bug"
   - Document actual behavior for reference

---

## 📸 Screenshots

_Screenshots will be added after manual testing_

**Expected**:
- Before exchange change: ✗ Symbol not found
- After exchange change: ✓ Valid symbol with price

**Actual** (to be captured):
- [Screenshot 1: Initial validation failure]
- [Screenshot 2: After changing exchange]
- [Screenshot 3: Final state]

---

**Reported by**: Claude Code (Static Analysis Tool)
**Assigned to**: Manual QA Tester
**Due Date**: Before international stock support launch
**Last Updated**: 2026-02-20

---

_This bug report was automatically generated by static code analysis. Manual verification is required to confirm actual behavior._
