import { set_to_dict } from '../src/tools/utils';

describe('set_to_dict function tests', () => {

    it('sets a value in a plain object at root level', () => {
        const obj = {};
        set_to_dict(obj, 'a', 1);
        expect(obj).toEqual({ a: 1 });
    });

    it('sets a value in a plain object with nested structure', () => {
        const obj = {};
        set_to_dict(obj, 'a.b.c', 2);
        expect(obj).toEqual({ a: { b: { c: 2 } } });
    });

    it('overwrites existing value in a nested object', () => {
        const obj = { a: { b: { c: 1 } } };
        set_to_dict(obj, 'a.b.c', 2);
        expect(obj).toEqual({ a: { b: { c: 2 } } });
    });

    it('handles setting a value with empty key', () => {
        const obj = {};
        set_to_dict(obj, '', 1);
        expect(obj).toEqual({ '': 1 });
    });

    it('creates intermediate objects/maps if they do not exist', () => {
        const obj = {};
        set_to_dict(obj, 'a.b.c', 3);
        expect(obj).toHaveProperty('a.b.c', 3);
    });

});
