
import { describe, it, expect } from 'vitest';
import { serializeProformaToQuery, parseProformaFromQuery } from '../urlSharing';
import { getExampleProformaInput } from '../../domain/proforma/validation';


describe('urlSharing', () => {
    it('serialize and parse round-trip preserves data', () => {
        const original = getExampleProformaInput();
        // Modify some values to ensure we aren't just getting defaults back
        original.howManyBuild = 10;
        original.propertyAddress = 'Testing Way 123';
        original.sitePrep = 5000;

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

        // We cast to any because we're testing partial serialization logic implicitly, 
        // effectively we just want to check the param names.
        // But serializeProformaToQuery expects full input. 
        // Let's use the full input and check specific keys.
        const fullInput = getExampleProformaInput();
        fullInput.howManyBuild = 5;
        fullInput.sitePrep = 1234;

        const params = serializeProformaToQuery(fullInput);

        expect(params.get('qty')).toBe('5');
        expect(params.get('prep')).toBe('1234');
    });
});
