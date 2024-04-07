import { generateRangeFromSlots } from '../src/tools/utils';

describe('generateRangeFromSlots function tests', () => {

    it('generates a range with specified number of slots', () => {
        const start = 0;
        const end = 10;
        const slots = 5;
        const expected = [0, 2, 4, 6, 8, 10];
        expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
    });

    it('handles floating point steps correctly', () => {
        const start = 1;
        const end = 2;
        const slots = 3;
        const expected = [1, 1.33, 1.67, 2].map(n => parseFloat(n.toFixed(2)));
        expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
    });

    it('returns just the start and end for 1 slot', () => {
        const start = 0;
        const end = 5;
        const slots = 1;
        const expected = [0, 5];
        expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
    });

    it('returns a single value when start and end are the same', () => {
        const start = 5;
        const end = 5;
        const slots = 3;
        const expected = [5];
        expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
    });

    it('correctly handles negative start and end values', () => {
        const start = -5;
        const end = -1;
        const slots = 4;
        const expected = [-5, -4, -3, -2, -1];
        expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
    });

    it('handles zero slots (should return an empty array)', () => {
        const start = 0;
        const end = 10;
        const slots = 0;
        const expected: any[] = [];
        expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
    });

});
