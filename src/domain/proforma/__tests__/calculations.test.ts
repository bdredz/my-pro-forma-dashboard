import { describe, it, expect } from 'vitest';
import { calculateProforma } from '../calculations';
import { getExampleProformaInput } from '../validation';

describe('calculateProforma', () => {
    it('calculates example values with new defaults', () => {
        // Given: Example input with new defaults
        // howManyBuild: 1, proposedSqFt: 1800, buildCostPerSqFt: 111, salePricePerSqFt: 361
        // costOfLand: 88000, autoCalculateClosingCost: true (2.5% of 88000 = 2200)
        const input = getExampleProformaInput();

        // When: We calculate the proforma
        const result = calculateProforma(input);

        // Then: Results match expected values

        // ARV = 1 * 1800 * 361 = 649,800
        expect(result.arv).toBe(649800);

        // Total Build Cost = 1 * 1800 * 111 = 199,800
        expect(result.totalBuildCost).toBe(199800);

        // Site Prep and Extras Total = 0 (all zeros in example)
        expect(result.sitePrepAndExtrasTotal).toBe(0);

        // Effective Closing Cost = 2.5% of 88,000 = 2,200 (auto-calculated)
        expect(result.effectiveClosingCost).toBe(2200);

        // Loan Base = 199,800 + 88,000 + 0 (sitePrep) + 2,200 = 290,000
        expect(result.loanBase).toBe(290000);

        // Total Points = 290,000 * 0.015 = 4,350
        expect(result.totalPoints).toBe(4350);

        // Total Interest Payments = sum of all 6 payments
        const expectedInterest = 6049.33 + 8447.83 + 13244.83 + 15643.33 + 15643.33 + 15643.33;
        expect(result.totalInterestPayments).toBeCloseTo(expectedInterest, 2);

        // Real Estate Commission = 649,800 * 0.06 = 38,988
        expect(result.realEstateCommissionAmount).toBe(38988);
    });

    it('handles zero ARV gracefully', () => {
        const input = getExampleProformaInput();
        input.salePricePerSqFt = 0; // This makes ARV = 0

        const result = calculateProforma(input);

        expect(result.arv).toBe(0);
        expect(result.profitPercentage).toBe(0);
        expect(result.dealBadge).toBe('NO Deal');
    });

    it('classifies Great deal correctly', () => {
        const input = getExampleProformaInput();
        // Reduce costs dramatically to create a great deal
        input.costOfLand = 100000;
        input.buildCostPerSqFt = 100;
        input.payment1 = 1000;
        input.payment2 = 1000;
        input.payment3 = 1000;
        input.payment4 = 1000;
        input.payment5 = 1000;
        input.payment6 = 1000;

        const result = calculateProforma(input);

        // With reduced costs, profit percentage should be >= 21%
        expect(result.profitPercentage).toBeGreaterThanOrEqual(0.21);
        expect(result.dealBadge).toBe('Great');
    });

    it('classifies NO Deal correctly', () => {
        const input = getExampleProformaInput();
        // Increase costs to create a bad deal
        input.costOfLand = 800000;
        input.buildCostPerSqFt = 300;

        const result = calculateProforma(input);

        // With increased costs, profit percentage should be < 15%
        expect(result.profitPercentage).toBeLessThan(0.15);
        expect(result.dealBadge).toBe('NO Deal');
    });

    it('classifies Good deal correctly', () => {
        const input = getExampleProformaInput();
        // Adjust to create a good deal (15-20.99%)
        // With new defaults: qty=1, sqft=1800, salePricePerSqFt=361, costOfLand=88000
        input.costOfLand = 130000;
        input.buildCostPerSqFt = 185;
        input.payment1 = 1500;
        input.payment2 = 1500;
        input.payment3 = 1500;
        input.payment4 = 1500;
        input.payment5 = 1500;
        input.payment6 = 1500;

        const result = calculateProforma(input);

        // Profit percentage should be between 15% and 21%
        expect(result.profitPercentage).toBeGreaterThanOrEqual(0.15);
        expect(result.profitPercentage).toBeLessThan(0.21);
        expect(result.dealBadge).toBe('Good');
    });

    it('sums interest payments correctly', () => {
        const input = getExampleProformaInput();
        input.payment1 = 1000;
        input.payment2 = 2000;
        input.payment3 = 3000;
        input.payment4 = 4000;
        input.payment5 = 5000;
        input.payment6 = 6000;

        const result = calculateProforma(input);

        expect(result.totalInterestPayments).toBe(21000);
    });

    it('sums extra expenses correctly (combined with site prep)', () => {
        const input = getExampleProformaInput();
        input.sidewalks = 1000;
        // Note: sewer and water moved to sitePrepCosts.sewerWaterTap
        input.rePlatt = 4000;
        input.grinderPumps = 5000;
        input.builderFee = 6000;

        const result = calculateProforma(input);

        // Extra expenses (16000) combined with site prep (0) = 16000
        expect(result.sitePrepAndExtrasTotal).toBe(16000);
    });

    it('includes sitePrepCosts in calculations', () => {
        const input = getExampleProformaInput();
        const sitePrepCost = 10000;
        // Set one of the site prep cost fields
        input.sitePrepCosts.clearingGrading = sitePrepCost;

        // Get baseline without site prep
        const baselineResult = calculateProforma(getExampleProformaInput());
        const result = calculateProforma(input);

        // sitePrepAndExtrasTotal should be included in loan base
        expect(result.loanBase).toBe(baselineResult.loanBase + sitePrepCost);

        // Total points should increase
        const expectedPointsIncrease = sitePrepCost * (input.loanPointsRate / 100);
        expect(result.totalPoints).toBe(baselineResult.totalPoints + expectedPointsIncrease);

        // Total profit should decrease by sitePrepAndExtrasTotal + points on it
        const expectedProfitDecrease = sitePrepCost + expectedPointsIncrease;
        expect(result.totalProfit).toBeCloseTo(baselineResult.totalProfit - expectedProfitDecrease, 0);
    });

    it('sums all site prep and extra expenses correctly', () => {
        const input = getExampleProformaInput();
        // Site prep costs
        input.sitePrepCosts.surveyAndPermits = 1000;
        input.sitePrepCosts.houseDemolitionDebris = 2000;
        input.sitePrepCosts.clearingGrading = 3000;
        input.sitePrepCosts.sewerWaterTap = 4000;
        // Extra expenses
        input.sidewalks = 500;
        input.rePlatt = 500;

        const result = calculateProforma(input);

        // Site prep (10000) + extra expenses (1000) = 11000
        expect(result.sitePrepAndExtrasTotal).toBe(11000);
    });
});
