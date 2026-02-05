import { describe, it, expect } from 'vitest';
import { calculateProforma } from '../calculations';
import { getExampleProformaInput } from '../validation';

describe('calculateProforma', () => {
    it('calculates exact spreadsheet example values', () => {
        // Given: Example input from the spreadsheet
        const input = getExampleProformaInput();

        // When: We calculate the proforma
        const result = calculateProforma(input);

        // Then: Results match expected values from spreadsheet

        // ARV = 3 * 1800 * 361 = 1,949,400
        expect(result.arv).toBe(1949400);

        // Total Build Cost = 3 * 1800 * 205 = 1,107,000
        expect(result.totalBuildCost).toBe(1107000);

        // Site Prep and Extras Total = 0 (all zeros in example)
        expect(result.sitePrepAndExtrasTotal).toBe(0);

        // Loan Base = 1,107,000 + 330,000 + 0 (sitePrep) + 7,000 + 0 = 1,444,000
        expect(result.loanBase).toBe(1444000);

        // Total Points = 1,444,000 * 0.015 = 21,660
        expect(result.totalPoints).toBe(21660);

        // Total Interest Payments = sum of all 6 payments = 74,671.98 ≈ 74,672
        const expectedInterest = 6049.33 + 8447.83 + 13244.83 + 15643.33 + 15643.33 + 15643.33;
        expect(result.totalInterestPayments).toBeCloseTo(expectedInterest, 2);

        // Real Estate Commission = 1,949,400 * 0.06 = 116,964
        expect(result.realEstateCommissionAmount).toBe(116964);

        // Total Profit = 1,949,400 - 1,107,000 - 330,000 - 7,000 - 0 - 21,660 - 74,671.98 - 116,964
        //              = 1,949,400 - 1,656,295.98 = 292,104.02 ≈ 292,104
        expect(result.totalProfit).toBeCloseTo(292104, 0);

        // Profit Percentage = 292,104 / 1,949,400 ≈ 0.1498 ≈ 14.98%
        expect(result.profitPercentage).toBeCloseTo(0.1498, 3);

        // Deal Badge = NO Deal (profit% < 15%)
        expect(result.dealBadge).toBe('NO Deal');
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
        input.costOfLand = 480000;
        input.buildCostPerSqFt = 180;
        input.payment1 = 3000;
        input.payment2 = 3000;
        input.payment3 = 3000;
        input.payment4 = 3000;
        input.payment5 = 3000;
        input.payment6 = 3000;

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

        const result = calculateProforma(input);

        // sitePrepAndExtrasTotal should be included in loan base
        // Original loan base: 1,444,000, with sitePrepAndExtrasTotal: 1,454,000
        expect(result.loanBase).toBe(1444000 + sitePrepCost);

        // Total points should increase
        const expectedPointsIncrease = sitePrepCost * (input.loanPointsRate / 100);
        expect(result.totalPoints).toBe(21660 + expectedPointsIncrease);

        // Total profit should decrease by sitePrepAndExtrasTotal + points on it
        const expectedProfitDecrease = sitePrepCost + expectedPointsIncrease;
        expect(result.totalProfit).toBeCloseTo(292104 - expectedProfitDecrease, 0);
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
