import { makeStringsUnique } from '../util';

describe('makeStringsUnique', () => {
  it('should make duplicate strings unique by appending numbers', () => {
    const input = ['name', 'age', 'name', 'city'];
    const expected = ['name', 'age', 'name1', 'city'];
    expect(makeStringsUnique(input)).toEqual(expected);
  });

  it('should handle all unique strings without modification', () => {
    const input = ['name', 'age', 'city'];
    const expected = ['name', 'age', 'city'];
    expect(makeStringsUnique(input)).toEqual(expected);
  });

  it('should handle empty strings by making them unique', () => {
    const input = ['name', '', '', 'city'];
    const expected = ['name', '', '1', 'city'];
    expect(makeStringsUnique(input)).toEqual(expected);
  });

  it('should handle multiple consecutive duplicates', () => {
    const input = ['col', 'col', 'col', 'other'];
    const expected = ['col', 'col1', 'col2', 'other'];
    expect(makeStringsUnique(input)).toEqual(expected);
  });

  it('should handle empty array', () => {
    const input = [];
    const expected = [];
    expect(makeStringsUnique(input)).toEqual(expected);
  });
});
