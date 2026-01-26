# **1\) Product Scope (What we’re building)**

## **Core**

* **One page**: “Performa Dashboard” (calculator)

* Users **manually enter** all inputs (no import yet)

* App computes outputs instantly:

  * ARV, Build Cost, Points, Interest Total, Commission, Profit, Profit %

* **Interest Payments section**:

  * **6 payments** shown exactly like the sheet

  * **Editable amounts** (like the sheet)

  * App sums them into **Total Interest Payments**

  * (Optional “Auto-fill suggestion” button can populate the 6 payments, but values remain editable)

## **Deal assessment**

* Badge: **Great / Borderline / Pass**

  * **Great**: Profit % ≥ **25%**

  * **Borderline**: Profit % ≥ **15%** and \< 25%

  * **Pass**: Profit % \< 15%

* Also surface **Total Profit** prominently (since you want both to drive decisioning)

---

# **2\) Data Model (Canonical types)**

Even though there’s no backend, we still enforce **single source-of-truth types** (Master Spec “Canonical Types Rule”).

### **ProformaInput**

###  **(canonical)**

* propertyAddress: string

* lotSize: string (keep string; optional / freeform like sheet)

* lotZoning: string (optional / freeform)

* howManyBuild: number (Qty)

* proposedSqFt: number

* buildCostPerSqFt: number

* salePricePerSqFt: number

* costOfLand: number

* estimatedClosingCost: number

* realEstateCommissionRate: number (percent as 0–100 in UI, converted to decimal internally)

* interestRate: number (percent as 0–100)

* loanPointsRate: number (percent as 0–100)

* Extra expenses (fixed list exactly as image):

  * sidewalks: number

  * sewer: number

  * water: number

  * rePlatt: number

  * grinderPumps: number

  * builderFee: number

* Interest payments (editable amounts):

  * payment1..payment6: number

### **ProformaDerived**

###  **(computed, read-only)**

* arv: number

* totalBuildCost: number

* extraExpensesTotal: number

* loanBase: number

* totalPoints: number

* totalInterestPayments: number

* realEstateCommissionAmount: number

* totalProfit: number

* profitPercentage: number

* dealBadge: "Great" | "Borderline" | "Pass"

---

# **3\) Calculations (match the spreadsheet)**

Using the numbers in your image, these formulas reproduce the shown outputs exactly:

### **Inputs normalization**

* qty \= howManyBuild

* commissionRateDecimal \= realEstateCommissionRate / 100

* loanPointsRateDecimal \= loanPointsRate / 100

### **Extra expenses total**

* extraExpensesTotal \= sidewalks \+ sewer \+ water \+ rePlatt \+ grinderPumps \+ builderFee

### **ARV**

* arv \= qty \* proposedSqFt \* salePricePerSqFt

### **Total build cost**

* totalBuildCost \= qty \* proposedSqFt \* buildCostPerSqFt

### **Loan base (this is the key to matching “Total Points” in the image)**

* loanBase \= totalBuildCost \+ costOfLand \+ estimatedClosingCost \+ extraExpensesTotal

### **Total points**

* totalPoints \= loanBase \* loanPointsRateDecimal

### **Interest payments**

* totalInterestPayments \= payment1 \+ payment2 \+ payment3 \+ payment4 \+ payment5 \+ payment6

* (Interest Rate is still captured as an input, and used for “Auto-fill suggestion” if you enable it, but the authoritative value is the sum of payments — exactly like the sheet.)

### **Real estate commission amount**

* realEstateCommissionAmount \= arv \* commissionRateDecimal

### **Total profit**

* \`totalProfit \=

   arv

  * totalBuildCost

  * costOfLand

  * estimatedClosingCost

  * extraExpensesTotal

  * totalPoints

  * totalInterestPayments

  * realEstateCommissionAmount\`

### **Profit percentage**

* profitPercentage \= totalProfit / arv (display as %)

### **Deal badge**

* if profitPercentage \>= 0.25 → **Great**

* else if profitPercentage \>= 0.15 → **Borderline**

* else → **Pass**

---

# **4\) UX / UI Requirements (white \+ Zoom-blue, builder-simple)**

## **Layout (simple & fast)**

* **Header**: “Proforma Dashboard”

* Two-column on desktop, single-column on mobile:

  * **Left: Inputs**

  * **Right: Results \+ Deal Badge**

* Bottom section:

  * **Interest Payments (1–6)** \+ Total

  * **Extra Expenses** fixed list \+ Total

## **Input ergonomics (mobile-first)**

* All numeric fields:

  * inputMode="decimal"

  * Numeric formatting on blur (currency/percent)

  * Clear inline validation states

* Provide **Reset** button (returns to sensible defaults: qty=1, all else blank/0)

* Provide **Share** button:

  * Generates a shareable URL with query params (optional but very useful for builders)

  * This keeps it “public tool” friendly without a database

## **Results presentation (high value)**

* Top-right “Deal Badge” pill:

  * Great (Zoom-blue accent)

  * Borderline (neutral dark)

  * Pass (muted)

* KPI cards:

  * **Profit $**

  * **Profit %**

  * ARV

  * Total Cost (sum of all costs)

* Keep secondary numbers collapsible (“Show breakdown”)

---

# **5\) PWA / Capacitor Readiness (production)**

## **PWA**

* Manifest \+ icons \+ installable

* Offline-capable shell (calculator works offline)

* No auth, no server dependency required

## **Capacitor**

* Ensure:

  * Responsive safe-area padding

  * No reliance on server-only features

  * Local state only (or URL share state)

---

# **6\) Guardrails & Validation (no broken math)**

* Prevent invalid states:

  * qty must be ≥ 1

  * sq ft must be \> 0

  * sale price per sf must be \> 0 (otherwise ARV 0 breaks profit%)

* If ARV \= 0 → profit% shows “—” and badge becomes Pass with message “Enter Sale Price / Sq Ft and Sq Ft”

* All currency inputs accept:

  * “205”, “205.00”, “$205” (we sanitize)

* Display formatting:

  * Currency: $1,234,567.89

  * Percent: 15% (rounded; store full precision internally)

---

# **7\) Build Structure (clean separation per Master Spec)**

Even without backend:

* domain/

  * proformaTypes.ts (canonical types)

  * proformaCalc.ts (pure calculation engine)

  * proformaValidation.ts (zod schema \+ sanitizers)

* components/

  * NumberField.tsx (reusable numeric input with formatting)

  * KpiCard.tsx

  * DealBadge.tsx

* pages/

  * Home.tsx (wires UI ↔ domain)

* pwa/

  * manifest, service worker config

This enforces the “DB/API/UI alignment” spirit by keeping **one canonical data contract** and **pure deterministic calculation logic**.

---

# **8\) QA Gate (must pass)**

Manual checklist:

* Every input updates results instantly

* Profit matches spreadsheet math for the sample case

* Interest payments editable; total updates correctly

* Extra expenses total correct

* Badge thresholds correct (15% / 25%)

* Mobile numeric keypad appears

* PWA installs \+ works offline

* No NaN / Infinity anywhere (especially profit%)

