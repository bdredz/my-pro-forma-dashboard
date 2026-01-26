import type { ProformaInput, ProformaDerived, ProformaResult } from './types';

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

    // Calculate extra expenses total
    const extraExpensesTotal =
        input.sidewalks +
        input.sewer +
        input.water +
        input.rePlatt +
        input.grinderPumps +
        input.builderFee;

    // Calculate ARV (After Repair Value)
    const arv = qty * input.proposedSqFt * input.salePricePerSqFt;

    // Calculate total build cost
    const totalBuildCost = qty * input.proposedSqFt * input.buildCostPerSqFt;

    // Calculate loan base (for points calculation)
    const loanBase =
        totalBuildCost +
        input.costOfLand +
        input.estimatedClosingCost +
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

    // Calculate total profit
    const totalProfit =
        arv -
        totalBuildCost -
        input.costOfLand -
        input.estimatedClosingCost -
        extraExpensesTotal -
        totalPoints -
        totalInterestPayments -
        realEstateCommissionAmount;

    // Calculate profit percentage
    // If ARV is 0, profit percentage is 0 (avoid division by zero)
    const profitPercentage = arv > 0 ? totalProfit / arv : 0;

    // Determine deal badge based on profit percentage thresholds
    let dealBadge: 'Great' | 'Borderline' | 'Pass';
    if (profitPercentage >= 0.25) {
        dealBadge = 'Great';
    } else if (profitPercentage >= 0.15) {
        dealBadge = 'Borderline';
    } else {
        dealBadge = 'Pass';
    }

    return {
        arv,
        totalBuildCost,
        extraExpensesTotal,
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

    // Rough estimate of loan base
    const qty = input.howManyBuild;
    const estimatedBuildCost = qty * input.proposedSqFt * input.buildCostPerSqFt;
    const estimatedLoanBase = estimatedBuildCost + input.costOfLand + input.estimatedClosingCost;

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
