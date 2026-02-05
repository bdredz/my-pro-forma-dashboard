
import type { ProformaInput, SitePrepCosts } from '../domain/proforma/types';
import { getExampleProformaInput, getBlankSitePrepCosts } from '../domain/proforma/validation';

/**
 * Mapping of ProformaInput keys to short URL query parameter keys.
 * Note: sitePrepCosts is handled separately via SITE_PREP_PARAM_MAP
 */
const PARAM_MAP: Record<Exclude<keyof ProformaInput, 'sitePrepCosts'>, string> = {
    propertyAddress: 'addr',
    lotSize: 'ls',
    lotZoning: 'z',
    pricingMode: 'pm',
    expectedSalePrice: 'esp',
    howManyBuild: 'qty',
    proposedSqFt: 'sf',
    buildCostPerSqFt: 'bc',
    salePricePerSqFt: 'sp',
    costOfLand: 'land',
    estimatedClosingCost: 'close',
    realEstateCommissionRate: 'comm',
    interestRate: 'ir',
    loanPointsRate: 'pts',
    autoCalculateClosingCost: 'acc',
    sidewalks: 'sw',
    rePlatt: 'rp',
    grinderPumps: 'gp',
    builderFee: 'bf',
    payment1: 'p1',
    payment2: 'p2',
    payment3: 'p3',
    payment4: 'p4',
    payment5: 'p5',
    payment6: 'p6',
};

/**
 * Mapping of SitePrepCosts keys to short URL query parameter keys
 */
const SITE_PREP_PARAM_MAP: Record<keyof SitePrepCosts, string> = {
    surveyAndPermits: 'sp_sv',
    houseDemolitionDebris: 'sp_dm',
    treeRemovalFillDirt: 'sp_tr',
    clearingGrading: 'sp_cg',
    culvertDrainagePipe: 'sp_cv',
    padPrep: 'sp_pp',
    gravelCement: 'sp_gc',
    gasElectricTap: 'sp_ge',
    sewerWaterTap: 'sp_sw',
    septic: 'sp_sp',
    retainingWall: 'sp_rw',
};


/**
 * Serialize ProformaInput to URLSearchParams
 */
export function serializeProformaToQuery(input: ProformaInput): URLSearchParams {
    const params = new URLSearchParams();

    // Handle regular fields
    for (const [key, value] of Object.entries(input)) {
        if (key === 'sitePrepCosts') continue; // Handle separately

        const paramKey = PARAM_MAP[key as keyof typeof PARAM_MAP];
        if (paramKey) {
            params.set(paramKey, String(value));
        }
    }

    // Handle site prep costs - only include non-zero values to keep URLs short
    for (const [key, value] of Object.entries(input.sitePrepCosts)) {
        const paramKey = SITE_PREP_PARAM_MAP[key as keyof SitePrepCosts];
        if (paramKey && value !== 0) {
            params.set(paramKey, String(value));
        }
    }

    return params;
}

/**
 * Parse ProformaInput from URLSearchParams
 * Falls back to default example values for missing or invalid fields.
 * Also handles legacy params for backward compatibility.
 */
export function parseProformaFromQuery(params: URLSearchParams): ProformaInput {
    const defaults = getExampleProformaInput();
    // Initialize with defaults so we have a valid base
    const result = { ...defaults };

    // Iterate over expected keys to find them in params
    for (const [key, paramKey] of Object.entries(PARAM_MAP)) {
        const value = params.get(paramKey);

        if (value !== null) {
            if (key === 'propertyAddress' || key === 'lotSize' || key === 'lotZoning') {
                // String fields - use explicit type guard
                if (key === 'propertyAddress') result.propertyAddress = value;
                else if (key === 'lotSize') result.lotSize = value;
                else if (key === 'lotZoning') result.lotZoning = value;
            } else if (key === 'autoCalculateClosingCost') {
                // Boolean field
                result.autoCalculateClosingCost = value === 'true' || value === 't' || value === '1';
            } else if (key === 'pricingMode') {
                // Enum field
                if (value === 'perSqFt' || value === 'totalPrice') {
                    result.pricingMode = value;
                }
                // If invalid value, leave as default
            } else {
                // Number fields
                const parsed = parseFloat(value);
                if (!isNaN(parsed) && isFinite(parsed)) {
                    // Use type-safe indexing for number fields
                    (result as unknown as Record<string, number>)[key] = parsed;
                }
                // If NaN, leave as default
            }
        }
    }

    // Parse site prep costs
    const sitePrepCosts = { ...getBlankSitePrepCosts() };
    for (const [key, paramKey] of Object.entries(SITE_PREP_PARAM_MAP)) {
        const value = params.get(paramKey);
        if (value !== null) {
            const parsed = parseFloat(value);
            if (!isNaN(parsed) && isFinite(parsed)) {
                sitePrepCosts[key as keyof SitePrepCosts] = parsed;
            }
        }
    }
    result.sitePrepCosts = sitePrepCosts;

    // Handle legacy params for backward compatibility
    // Legacy 'prep' (old sitePrep) -> distribute to clearingGrading
    const legacySitePrep = params.get('prep');
    if (legacySitePrep !== null) {
        const parsed = parseFloat(legacySitePrep);
        if (!isNaN(parsed) && isFinite(parsed) && parsed > 0) {
            result.sitePrepCosts.clearingGrading = parsed;
        }
    }

    // Legacy 'sew' and 'wat' (old sewer/water) -> combine into sewerWaterTap
    const legacySewer = params.get('sew');
    const legacyWater = params.get('wat');
    if (legacySewer !== null || legacyWater !== null) {
        const sewerVal = parseFloat(legacySewer || '0') || 0;
        const waterVal = parseFloat(legacyWater || '0') || 0;
        if (sewerVal + waterVal > 0) {
            result.sitePrepCosts.sewerWaterTap = sewerVal + waterVal;
        }
    }

    return result as ProformaInput;
}

/**
 * Generate a full shareable URL from the current input
 */
export function generateShareUrl(input: ProformaInput): string {
    const query = serializeProformaToQuery(input);
    return `${window.location.origin}${window.location.pathname}?${query.toString()}`;
}
