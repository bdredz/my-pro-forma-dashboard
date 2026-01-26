# Proforma Calculator Logic

This document details every calculation performed in the backend of the Perfect Picture Homes Proforma calculator.

**Source File:** `src/domain/proforma/calculations.ts`

## 1. Input Normalization
Percentage inputs are converted to decimals for calculation:
- **`commissionRateDecimal`** = `realEstateCommissionRate` / 100
- **`loanPointsRateDecimal`** = `loanPointsRate` / 100
- **`interestRateDecimal`** (for auto-fill only) = `interestRate` / 100

## 2. Core Calculations

### Extra Expenses Total
Sum of all individual extra expense line items:
```javascript
extraExpensesTotal = 
  sidewalks + 
  sewer + 
  water + 
  rePlatt + 
  grinderPumps + 
  builderFee
```

### ARV (After Repair Value)
Total projected revenue:
```javascript
arv = howManyBuild * proposedSqFt * salePricePerSqFt
```

### Total Build Cost
Direct construction costs:
```javascript
totalBuildCost = howManyBuild * proposedSqFt * buildCostPerSqFt
```

### Loan Base
The principal amount used to calculate loan points. Note that **Site Prep** is included here.
```javascript
loanBase = 
  totalBuildCost + 
  costOfLand + 
  sitePrep + 
  estimatedClosingCost + 
  extraExpensesTotal
```

## 3. Financial Costs

### Total Points
Upfront loan fees based on the loan base:
```javascript
totalPoints = loanBase * loanPointsRateDecimal
```
*(Note: Uses `loanPointsRate` input)*

### Total Interest Payments
Sum of the six manual payment fields (assumed 6-month term):
```javascript
totalInterestPayments = 
  payment1 + 
  payment2 + 
  payment3 + 
  payment4 + 
  payment5 + 
  payment6
```
*(Note: These are manual inputs unless the Auto-fill tool is used)*

### Real Estate Commission
Commission fees based on the total ARV:
```javascript
realEstateCommissionAmount = arv * commissionRateDecimal
```

## 4. Profitability Metrics

### Total Profit
Net profit after deducting all costs from ARV:
```javascript
totalProfit = 
  arv - 
  totalBuildCost - 
  costOfLand - 
  sitePrep - 
  estimatedClosingCost - 
  extraExpensesTotal - 
  totalPoints - 
  totalInterestPayments - 
  realEstateCommissionAmount
```

### Profit Percentage
Return on Revenue (Profit Margin):
```javascript
profitPercentage = (arv > 0) ? (totalProfit / arv) : 0
```
*(Safe division: if ARV is 0, returns 0)*

## 5. Deal Logic (Badges)
Classifies the deal based on **Profit Percentage**:

| Badge | Condition | Logic |
| :--- | :--- | :--- |
| **🚀 Great** | Profit ≥ **21%** | `profitPercentage >= 0.21` |
| **✅ Good** | Profit ≥ **15%** (and < 21%) | `profitPercentage >= 0.15` |
| **👎 NO Deal** | Profit < **15%** | `else` |

---

## 6. Auto-Fill Interest Tool
**Helper Function:** `autoFillInterestPayments`
Used only when the user clicks "Auto-fill from Rate".

1.  **Estimate Loan Base**:
    `estimatedLoanBase = totalBuildCost + costOfLand + sitePrep + estimatedClosingCost`
    *(Note: Does not include extra expenses in this specific estimation formula, slightly confusing but per implementation)*
2.  **Estimate Total Interest**:
    Assumes average outstanding balance is **75%** of loan base over **6 months** (0.5 years).
    `totalEstimatedInterest = estimatedLoanBase * 0.75 * interestRateDecimal * 0.5`
3.  **Distribute Payments**:
    Distributes the total interest across 6 months using an escalating weighted curve (simulating draw schedule):
    - Month 1: **10%**
    - Month 2: **15%**
    - Month 3: **20%**
    - Month 4: **22%**
    - Month 5: **22%**
    - Month 6: **11%** (Loan finishes/sells)
