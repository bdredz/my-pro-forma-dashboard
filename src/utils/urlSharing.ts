
import type { ProformaInput } from '../domain/proforma/types';
import { getExampleProformaInput } from '../domain/proforma/validation';

/**
 * Mapping of ProformaInput keys to short URL query parameter keys.
 */
const PARAM_MAP: Record<keyof ProformaInput, string> = {
    propertyAddress: 'addr',
    lotSize: 'ls',
    lotZoning: 'z',
    howManyBuild: 'qty',
    proposedSqFt: 'sf',
    buildCostPerSqFt: 'bc',
    salePricePerSqFt: 'sp',
    costOfLand: 'land',
    sitePrep: 'prep',
    estimatedClosingCost: 'close',
    realEstateCommissionRate: 'comm',
    interestRate: 'ir',
    loanPointsRate: 'pts',
    sidewalks: 'sw',
    sewer: 'sew',
    water: 'wat',
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
 * Serialize ProformaInput to URLSearchParams
 */
export function serializeProformaToQuery(input: ProformaInput): URLSearchParams {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(input)) {
        const paramKey = PARAM_MAP[key as keyof ProformaInput];
        if (paramKey) {
            params.set(paramKey, String(value));
        }
    }

    return params;
}

/**
 * Parse ProformaInput from URLSearchParams
 * Falls back to default example values for missing or invalid fields.
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
                // String fields
                result[key] = value;
            } else {
                // Number fields
                const parsed = parseFloat(value);
                if (!isNaN(parsed) && isFinite(parsed)) {
                    // Type assertion to allow dynamic assignment without 'any'
                    (result as Record<string, string | number>)[key] = parsed;
                }
                // If NaN, leave as default
            }
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
