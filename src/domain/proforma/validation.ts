import { z } from 'zod';
import type { ProformaInput, SitePrepCosts } from './types';

/**
 * Sanitize currency input - accepts "$1,234.56", "1234.56", "1234", etc.
 */
export function sanitizeCurrency(value: string | number): number {
    if (typeof value === 'number') return value;
    const cleaned = value.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * Sanitize percentage input - accepts "15%", "15.5", "15", etc.
 */
export function sanitizePercent(value: string | number): number {
    if (typeof value === 'number') return value;
    const cleaned = value.replace(/[%\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * Zod schema for Site Prep Costs - 11 line items
 */
export const SitePrepCostsSchema = z.object({
    surveyAndPermits: z.number().min(0).default(0),
    houseDemolitionDebris: z.number().min(0).default(0),
    treeRemovalFillDirt: z.number().min(0).default(0),
    clearingGrading: z.number().min(0).default(0),
    culvertDrainagePipe: z.number().min(0).default(0),
    padPrep: z.number().min(0).default(0),
    gravelCement: z.number().min(0).default(0),
    gasElectricTap: z.number().min(0).default(0),
    sewerWaterTap: z.number().min(0).default(0),
    septic: z.number().min(0).default(0),
    retainingWall: z.number().min(0).default(0),
});

/**
 * Get blank site prep costs (all zeros)
 */
export function getBlankSitePrepCosts(): SitePrepCosts {
    return SitePrepCostsSchema.parse({});
}

/**
 * Zod schema for ProformaInput with coercion and validation
 */
export const ProformaInputSchema = z.object({
    // Property details
    propertyAddress: z.string().default(''),
    lotSize: z.string().default(''),
    lotZoning: z.string().default(''),

    // Pricing mode toggle
    pricingMode: z.enum(['perSqFt', 'totalPrice']).default('perSqFt'),
    expectedSalePrice: z.number().min(0).default(0),

    // Core variables with validation
    howManyBuild: z.number().min(1, 'Quantity must be at least 1').default(1),
    proposedSqFt: z.number().min(0, 'Square footage must be positive').default(0),
    buildCostPerSqFt: z.number().min(0).default(0),
    salePricePerSqFt: z.number().min(0).default(0),
    costOfLand: z.number().min(0).default(0),
    sitePrepCosts: SitePrepCostsSchema.default({
        surveyAndPermits: 0,
        houseDemolitionDebris: 0,
        treeRemovalFillDirt: 0,
        clearingGrading: 0,
        culvertDrainagePipe: 0,
        padPrep: 0,
        gravelCement: 0,
        gasElectricTap: 0,
        sewerWaterTap: 0,
        septic: 0,
        retainingWall: 0,
    }),
    estimatedClosingCost: z.number().min(0).default(0),
    realEstateCommissionRate: z.number().min(0).max(100).default(0),
    interestRate: z.number().min(0).max(100).default(0),
    loanPointsRate: z.number().min(0).max(100).default(0),

    // Closing cost auto-calculation toggle
    autoCalculateClosingCost: z.boolean().default(true),

    // Extra expenses (sewer/water moved to sitePrepCosts)
    sidewalks: z.number().min(0).default(0),
    rePlatt: z.number().min(0).default(0),
    grinderPumps: z.number().min(0).default(0),
    builderFee: z.number().min(0).default(0),

    // Interest payments
    payment1: z.number().min(0).default(0),
    payment2: z.number().min(0).default(0),
    payment3: z.number().min(0).default(0),
    payment4: z.number().min(0).default(0),
    payment5: z.number().min(0).default(0),
    payment6: z.number().min(0).default(0),
});

/**
 * Type-safe validation of ProformaInput
 */
export function validateProformaInput(input: unknown): ProformaInput {
    return ProformaInputSchema.parse(input);
}

/**
 * Safe validation that returns validation result with errors
 */
export function safeValidateProformaInput(input: unknown) {
    return ProformaInputSchema.safeParse(input);
}

/**
 * Get default/blank ProformaInput
 */
export function getBlankProformaInput(): ProformaInput {
    return ProformaInputSchema.parse({});
}

/**
 * Get example ProformaInput (from spreadsheet)
 */
export function getExampleProformaInput(): ProformaInput {
    return {
        // Property
        propertyAddress: '123 Main st',
        lotSize: '',
        lotZoning: '',

        // Pricing mode - example uses price per sq ft
        pricingMode: 'perSqFt',
        expectedSalePrice: 0,

        // Variables
        howManyBuild: 3,
        proposedSqFt: 1800,
        buildCostPerSqFt: 205.00,
        salePricePerSqFt: 361.00,
        costOfLand: 330000.00,
        sitePrepCosts: getBlankSitePrepCosts(),
        estimatedClosingCost: 7000.00,
        realEstateCommissionRate: 6.00,
        interestRate: 11.00,
        loanPointsRate: 1.50,

        // Closing cost - example uses manual value
        autoCalculateClosingCost: false,

        // Extra expenses (all 0 by default - sewer/water moved to sitePrepCosts)
        sidewalks: 0,
        rePlatt: 0,
        grinderPumps: 0,
        builderFee: 0,

        // Interest payments
        payment1: 6049.33,
        payment2: 8447.83,
        payment3: 13244.83,
        payment4: 15643.33,
        payment5: 15643.33,
        payment6: 15643.33,
    };
}
