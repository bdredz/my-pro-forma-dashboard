import type { ProformaInput, ProformaDerived, ProformaResult, SitePrepCosts } from './types';

/**
 * Closing cost rate for auto-calculation (2.5% of land cost)
 */
export const CLOSING_COST_RATE = 0.025;

/**
 * Calculate the auto closing cost based on land cost
 */
export function calculateAutoClosingCost(costOfLand: number): number {
    return costOfLand * CLOSING_COST_RATE;
}

/**
 * Get effective closing cost based on auto-calculate toggle
 */
export function getEffectiveClosingCost(input: ProformaInput): number {
    if (input.autoCalculateClosingCost) {
        return calculateAutoClosingCost(input.costOfLand);
    }
    return input.estimatedClosingCost;
}

/**
 * Calculate total site prep costs from breakdown
 */
export function calculateSitePrepTotal(sitePrepCosts: SitePrepCosts): number {
    return (
        sitePrepCosts.surveyAndPermits +
        sitePrepCosts.houseDemolitionDebris +
        sitePrepCosts.treeRemovalFillDirt +
        sitePrepCosts.clearingGrading +
        sitePrepCosts.culvertDrainagePipe +
        sitePrepCosts.padPrep +
        sitePrepCosts.gravelCement +
        sitePrepCosts.gasElectricTap +
        sitePrepCosts.sewerWaterTap +
        sitePrepCosts.septic +
        sitePrepCosts.retainingWall
    );
}

/**
 * Get effective sale price per sq ft based on pricing mode
 * Mode 'perSqFt': use input.salePricePerSqFt directly
 * Mode 'totalPrice': calculate from expectedSalePrice / (qty * sqft)
 */
export function getEffectiveSalePricePerSqFt(input: ProformaInput): number {
    if (input.pricingMode === 'totalPrice') {
        const totalSqFt = input.howManyBuild * input.proposedSqFt;
        return totalSqFt === 0 ? 0 : input.expectedSalePrice / totalSqFt;
    }
    return input.salePricePerSqFt;
}

/**
 * Pure calculation engine for proforma analysis
 * Implements the exact formulas from the spreadsheet
 * 
 * @param input - Validated ProformaInput
 * @returns ProformaDerived with all calculated values
 */
export function calculateProforma(input: ProformaInput): ProformaDerived {
    // Normalize inputs
    const qty = input.howManyBuild;
    const commissionRateDecimal = input.realEstateCommissionRate / 100;
    const loanPointsRateDecimal = input.loanPointsRate / 100;

    // Calculate site prep total from breakdown
    const sitePrepTotal = calculateSitePrepTotal(input.sitePrepCosts);

    // Calculate extra expenses total (sewer/water moved to sitePrepCosts)
    const extraExpensesTotal =
        input.sidewalks +
        input.rePlatt +
        input.grinderPumps +
        input.builderFee;

    // Get effective sale price per sq ft based on pricing mode
    const effectiveSalePricePerSqFt = getEffectiveSalePricePerSqFt(input);

    // Calculate ARV (After Repair Value)
    const arv = qty * input.proposedSqFt * effectiveSalePricePerSqFt;

    // Calculate total build cost
    const totalBuildCost = qty * input.proposedSqFt * input.buildCostPerSqFt;

    // Get effective closing cost (auto-calculated or manual)
    const effectiveClosingCost = getEffectiveClosingCost(input);

    // Calculate loan base (for points calculation) - includes sitePrepTotal
    const loanBase =
        totalBuildCost +
        input.costOfLand +
        sitePrepTotal +
        effectiveClosingCost +
        extraExpensesTotal;

    // Calculate total points
    const totalPoints = loanBase * loanPointsRateDecimal;

    // Calculate total interest payments (sum of all 6 payments)
    const totalInterestPayments =
        input.payment1 +
        input.payment2 +
        input.payment3 +
        input.payment4 +
        input.payment5 +
        input.payment6;

    // Calculate real estate commission
    const realEstateCommissionAmount = arv * commissionRateDecimal;

    // Calculate total profit - includes sitePrepTotal as a cost
    const totalProfit =
        arv -
        totalBuildCost -
        input.costOfLand -
        sitePrepTotal -
        effectiveClosingCost -
        extraExpensesTotal -
        totalPoints -
        totalInterestPayments -
        realEstateCommissionAmount;

    // Calculate profit percentage
    // If ARV is 0, profit percentage is 0 (avoid division by zero)
    const profitPercentage = arv > 0 ? totalProfit / arv : 0;

    // Determine deal badge based on profit percentage thresholds
    // Great: >= 21%, Good: 15-20.99%, NO Deal: < 15%
    let dealBadge: 'Great' | 'Good' | 'NO Deal';
    if (profitPercentage >= 0.21) {
        dealBadge = 'Great';
    } else if (profitPercentage >= 0.15) {
        dealBadge = 'Good';
    } else {
        dealBadge = 'NO Deal';
    }

    return {
        effectiveSalePricePerSqFt,
        arv,
        totalBuildCost,
        sitePrepTotal,
        extraExpensesTotal,
        effectiveClosingCost,
        loanBase,
        totalPoints,
        totalInterestPayments,
        realEstateCommissionAmount,
        totalProfit,
        profitPercentage,
        dealBadge,
    };
}

/**
 * Calculate complete proforma result
 */
export function calculateProformaResult(input: ProformaInput): ProformaResult {
    return {
        input,
        derived: calculateProforma(input),
    };
}

/**
 * Auto-fill interest payments based on interest rate
 * This is a helper for the optional "Auto-fill" button
 * Simple algorithm: distribute total estimated interest across 6 payments
 * with escalating amounts (simulating construction loan draws)
 */
export function autoFillInterestPayments(
    input: ProformaInput
): Pick<ProformaInput, 'payment1' | 'payment2' | 'payment3' | 'payment4' | 'payment5' | 'payment6'> {
    const interestRateDecimal = input.interestRate / 100;

    // Rough estimate of loan base - includes sitePrep and Extra Expenses (aligning with main loanBase)
    const qty = input.howManyBuild;
    const estimatedBuildCost = qty * input.proposedSqFt * input.buildCostPerSqFt;

    // Calculate site prep total for the estimate
    const sitePrepTotal = calculateSitePrepTotal(input.sitePrepCosts);

    // Calculate extra expenses total for the estimate (sewer/water moved to sitePrepCosts)
    const extraExpensesTotal =
        input.sidewalks +
        input.rePlatt +
        input.grinderPumps +
        input.builderFee;

    const estimatedLoanBase =
        estimatedBuildCost +
        input.costOfLand +
        sitePrepTotal +
        input.estimatedClosingCost +
        extraExpensesTotal;

    // Simple interest approximation over 6 months
    // Assume average balance is ~75% of loan base (draws increase over time)
    const totalEstimatedInterest = estimatedLoanBase * 0.75 * interestRateDecimal * (6 / 12);

    // Distribute with escalating pattern (10%, 15%, 20%, 22%, 22%, 11%)
    const weights = [0.10, 0.15, 0.20, 0.22, 0.22, 0.11];

    return {
        payment1: Math.round(totalEstimatedInterest * weights[0] * 100) / 100,
        payment2: Math.round(totalEstimatedInterest * weights[1] * 100) / 100,
        payment3: Math.round(totalEstimatedInterest * weights[2] * 100) / 100,
        payment4: Math.round(totalEstimatedInterest * weights[3] * 100) / 100,
        payment5: Math.round(totalEstimatedInterest * weights[4] * 100) / 100,
        payment6: Math.round(totalEstimatedInterest * weights[5] * 100) / 100,
    };
}
