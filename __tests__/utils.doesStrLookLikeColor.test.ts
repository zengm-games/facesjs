import { doesStrLookLikeColor } from '../src/utils';

describe('doesStrLookLikeColor function tests', () => {

    it('returns true for valid 6-digit hexadecimal color', () => {
        expect(doesStrLookLikeColor('#FFFFFF')).toBe(true);
    });

    it('returns true for valid 3-digit shorthand hexadecimal color', () => {
        expect(doesStrLookLikeColor('#FFF')).toBe(true);
    });

    it('returns false for invalid color without #', () => {
        expect(doesStrLookLikeColor('FFFFFF')).toBe(false);
    });

    it('returns false for invalid color with more than 6 digits', () => {
        expect(doesStrLookLikeColor('#FFFFFFF')).toBe(false);
    });

    it('returns false for invalid color with less than 3 digits', () => {
        expect(doesStrLookLikeColor('#FF')).toBe(false);
    });

    it('returns false for invalid characters in color', () => {
        expect(doesStrLookLikeColor('#ZZZ999')).toBe(false);
    });

});
