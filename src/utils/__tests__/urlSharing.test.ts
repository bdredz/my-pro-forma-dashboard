
import { describe, it, expect } from 'vitest';
import { serializeProformaToQuery, parseProformaFromQuery } from '../urlSharing';
import { getExampleProformaInput } from '../../domain/proforma/validation';


describe('urlSharing', () => {
    it('serialize and parse round-trip preserves data', () => {
        const original = getExampleProformaInput();
        // Modify some values to ensure we aren't just getting defaults back
        original.howManyBuild = 10;
        original.propertyAddress = 'Testing Way 123';
        original.sitePrepCosts.clearingGrading = 5000;
        original.sitePrepCosts.sewerWaterTap = 3000;

        const params = serializeProformaToQuery(original);
        const parsed = parseProformaFromQuery(params);

        expect(parsed).toEqual(original);
    });

    it('handles invalid numbers by falling back to defaults', () => {
        const defaults = getExampleProformaInput();
        const params = new URLSearchParams();

        // 'qty' expects a number, give it garbage
        params.set('qty', 'abc');
        // 'addr' is valid
        params.set('addr', 'New Address');

        const parsed = parseProformaFromQuery(params);

        expect(parsed.howManyBuild).toBe(defaults.howManyBuild); // Should fallback
        expect(parsed.propertyAddress).toBe('New Address'); // Should update
    });

    it('handles missing params by using defaults', () => {
        const defaults = getExampleProformaInput();
        const params = new URLSearchParams();
        // Only provide one param
        params.set('bc', '500');

        const parsed = parseProformaFromQuery(params);

        expect(parsed.buildCostPerSqFt).toBe(500);
        expect(parsed.howManyBuild).toBe(defaults.howManyBuild);
        expect(parsed.costOfLand).toBe(defaults.costOfLand);
    });

    it('safely handles empty strings for numbers', () => {
        const defaults = getExampleProformaInput();
        const params = new URLSearchParams();
        // Empty string should parse as NaN -> fallback to default
        params.set('land', '');

        const parsed = parseProformaFromQuery(params);
        expect(parsed.costOfLand).toBe(defaults.costOfLand);
    });

    it('correctly maps URL keys to Proforma keys', () => {
        const fullInput = getExampleProformaInput();
        fullInput.howManyBuild = 5;
        fullInput.sitePrepCosts.clearingGrading = 1234;

        const params = serializeProformaToQuery(fullInput);

        expect(params.get('qty')).toBe('5');
        expect(params.get('sp_cg')).toBe('1234'); // sitePrepCosts.clearingGrading
    });

    it('handles legacy sitePrep param for backward compatibility', () => {
        const params = new URLSearchParams();
        params.set('prep', '5000'); // Legacy sitePrep param

        const parsed = parseProformaFromQuery(params);

        // Should map to clearingGrading
        expect(parsed.sitePrepCosts.clearingGrading).toBe(5000);
    });

    it('handles legacy sewer and water params for backward compatibility', () => {
        const params = new URLSearchParams();
        params.set('sew', '2000'); // Legacy sewer param
        params.set('wat', '3000'); // Legacy water param

        const parsed = parseProformaFromQuery(params);

        // Should combine into sewerWaterTap
        expect(parsed.sitePrepCosts.sewerWaterTap).toBe(5000);
    });

    it('only includes non-zero site prep values in URL', () => {
        const input = getExampleProformaInput();
        input.sitePrepCosts.surveyAndPermits = 5000;
        // All others are 0 by default

        const params = serializeProformaToQuery(input);

        expect(params.get('sp_sv')).toBe('5000');
        expect(params.has('sp_dm')).toBe(false); // Not included when 0
        expect(params.has('sp_cg')).toBe(false); // Not included when 0
    });
});
