/**
 * Canonical Proforma Types
 * Single source of truth for all proforma data structures
 */

/**
 * ProformaInput - All user-provided inputs
 * These are the editable fields in the calculator
 */
export interface ProformaInput {
    // Property details
    propertyAddress: string;
    lotSize: string; // Freeform string, optional
    lotZoning: string; // Freeform string, optional

    // Core variables
    howManyBuild: number; // Quantity of units to build
    proposedSqFt: number; // Square footage per unit
    buildCostPerSqFt: number;
    salePricePerSqFt: number;
    costOfLand: number;
    sitePrep: number; // Site preparation costs
    estimatedClosingCost: number;
    realEstateCommissionRate: number; // Stored as percentage 0-100
    interestRate: number; // Stored as percentage 0-100 (for display/auto-fill only)
    loanPointsRate: number; // Stored as percentage 0-100

    // Extra expenses (fixed list)
    sidewalks: number;
    sewer: number;
    water: number;
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
    arv: number; // After Repair Value
    totalBuildCost: number;
    extraExpensesTotal: number;
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
