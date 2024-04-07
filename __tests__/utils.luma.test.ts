import { luma } from '../src/tools/utils';

describe('luma function tests', () => {

    it('calculates the luma of a dark color correctly', () => {
        expect(luma('#000000')).toBeCloseTo(0);
    });

    it('calculates the luma of a light color correctly', () => {
        expect(luma('#FFFFFF')).toBeCloseTo(1);
    });

    it('handles shorthand hexadecimal colors', () => {
        expect(luma('#FFF')).toBeCloseTo(1);
        expect(luma('#000')).toBeCloseTo(0);
    });

    it('throws an error for invalid hexadecimal colors', () => {
        expect(() => luma('123456')).toThrow('Invalid hexadecimal color');
        expect(() => luma('#GGGGGG')).toThrow('Invalid hexadecimal color');
    });

    it('calculates the luma of a mid-range color correctly', () => {
        expect(luma('#7F7F7F')).toBeCloseTo(0.5);
    });

});
