/**
 * Canonical Proforma Types
 * Single source of truth for all proforma data structures
 */

/**
 * Site Prep Cost breakdown - 11 line items
 * Replaces the single sitePrep field with itemized costs
 */
export interface SitePrepCosts {
    surveyAndPermits: number;
    houseDemolitionDebris: number;
    treeRemovalFillDirt: number;
    clearingGrading: number;
    culvertDrainagePipe: number;
    padPrep: number;
    gravelCement: number;
    gasElectricTap: number;
    sewerWaterTap: number; // Replaces sewer + water from Extra Expenses
    septic: number;
    retainingWall: number;
}

/**
 * ProformaInput - All user-provided inputs
 * These are the editable fields in the calculator
 */
export interface ProformaInput {
    // Property details
    propertyAddress: string;
    lotSize: string; // Freeform string, optional
    lotZoning: string; // Freeform string, optional

    // Pricing mode toggle
    pricingMode: 'perSqFt' | 'totalPrice'; // How user enters sale price
    expectedSalePrice: number; // Total expected sale price (used when pricingMode === 'totalPrice')

    // Core variables
    howManyBuild: number; // Quantity of units to build
    proposedSqFt: number; // Square footage per unit
    buildCostPerSqFt: number;
    salePricePerSqFt: number; // Used when pricingMode === 'perSqFt'
    costOfLand: number;
    sitePrepCosts: SitePrepCosts; // Detailed site prep breakdown (replaces single sitePrep)
    estimatedClosingCost: number;
    realEstateCommissionRate: number; // Stored as percentage 0-100
    interestRate: number; // Stored as percentage 0-100 (for display/auto-fill only)
    loanPointsRate: number; // Stored as percentage 0-100

    // Closing cost auto-calculation toggle
    autoCalculateClosingCost: boolean; // When true, closing cost = 2.5% of land cost

    // Extra expenses (fixed list - sewer/water moved to sitePrepCosts)
    sidewalks: number;
    rePlatt: number;
    grinderPumps: number;
    builderFee: number;

    // Interest payments (6 editable amounts)
    payment1: number;
    payment2: number;
    payment3: number;
    payment4: number;
    payment5: number;
    payment6: number;
}

/**
 * ProformaDerived - All computed/calculated values
 * These are read-only and derived from ProformaInput
 */
export interface ProformaDerived {
    effectiveSalePricePerSqFt: number; // The actual price/sqft used (calculated or entered)
    arv: number; // After Repair Value
    totalBuildCost: number;
    sitePrepTotal: number; // Sum of all site prep line items
    extraExpensesTotal: number;
    effectiveClosingCost: number; // The actual closing cost used (auto or manual)
    loanBase: number; // Base amount for calculating loan points
    totalPoints: number; // Loan points cost
    totalInterestPayments: number; // Sum of payment1-payment6
    realEstateCommissionAmount: number;
    totalProfit: number;
    profitPercentage: number; // Stored as decimal (0.15 = 15%)
    dealBadge: 'Great' | 'Good' | 'NO Deal';
}

/**
 * Complete proforma result combining inputs and derived values
 */
export interface ProformaResult {
    input: ProformaInput;
    derived: ProformaDerived;
}
