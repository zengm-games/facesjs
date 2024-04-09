import { objStringifyInOrder } from '../src/utils';

describe('objStringifyInOrder function tests', () => {

    it('returns an empty string for an empty object', () => {
        const obj = {};
        const expected = '';
        expect(objStringifyInOrder(obj)).toEqual(expected);
    });

    it('stringifies a simple flat object with keys in order', () => {
        const obj = { b: 2, a: 1 };
        const expected = 'a: 1\nb: 2\n';
        expect(objStringifyInOrder(obj)).toEqual(expected);
    });

    it('stringifies a nested object with keys in order', () => {
        const obj = { b: { x: 2, w: 1 }, a: 1 };
        const expected = 'a: 1\nb.w: 1\nb.x: 2\n';
        expect(objStringifyInOrder(obj)).toEqual(expected);
    });

    it('handles an object with mixed arrays and objects correctly', () => {
        const obj = { c: [3, 4], a: { b: 2 } };
        const expected = 'a.b: 2\nc.[0]: 3\nc.[1]: 4\n';
        expect(objStringifyInOrder(obj)).toEqual(expected);
    });

    it('correctly stringifies an object containing null values', () => {
        const obj = { a: null, b: { c: null } };
        const expected = 'a: null\nb.c: null\n';
        expect(objStringifyInOrder(obj)).toEqual(expected);
    });

    it('correctly stringifies an object containing undefined values', () => {
        const obj = { b: undefined, a: { b: undefined } };
        const expected = 'a.b: undefined\nb: undefined\n';
        expect(objStringifyInOrder(obj)).toEqual(expected);
    });

    it('orders keys correctly when special characters are included', () => {
        const obj = { 'a-a': 1, 'a.a': 2, 'a a': 3 };
        const expected = 'a a: 3\na-a: 1\na.a: 2\n';
        expect(objStringifyInOrder(obj)).toEqual(expected);
    });

    it('handles complex deeply nested structures', () => {
        const obj = { d: { e: { f: 1 } }, a: { b: { c: 2 } } };
        const expected = 'a.b.c: 2\nd.e.f: 1\n';
        expect(objStringifyInOrder(obj)).toEqual(expected);
    });

});