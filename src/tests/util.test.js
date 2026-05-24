import { makeStringsUnique, normalizePastedTabular, summarizeCsv } from '../util';

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

describe('normalizePastedTabular', () => {
  it('returns CSV input unchanged (apart from trimming)', () => {
    const csv = 'name,age\nAda,36\nGrace,85';
    expect(normalizePastedTabular(csv)).toBe(csv);
  });

  it('converts tab-delimited input to CSV', () => {
    const tsv = 'name\tage\nAda\t36';
    expect(normalizePastedTabular(tsv)).toBe('"name","age"\n"Ada","36"');
  });

  it('trims surrounding whitespace before deciding format', () => {
    expect(normalizePastedTabular('  \n  name,age\nAda,36\n\n')).toBe(
      'name,age\nAda,36'
    );
  });

  it('returns null for non-strings', () => {
    expect(normalizePastedTabular(undefined)).toBeNull();
    expect(normalizePastedTabular(null)).toBeNull();
    expect(normalizePastedTabular(42)).toBeNull();
  });

  it('returns null for empty or whitespace-only input', () => {
    expect(normalizePastedTabular('')).toBeNull();
    expect(normalizePastedTabular('   \n\t  ')).toBeNull();
  });
});

describe('summarizeCsv', () => {
  it('counts data rows (excluding header) and columns', () => {
    expect(summarizeCsv('name,age\nAda,36\nGrace,85')).toEqual({
      rows: 2,
      cols: 2,
    });
  });

  it('handles header-only input as zero data rows', () => {
    expect(summarizeCsv('name,age')).toEqual({ rows: 0, cols: 2 });
  });

  it('handles CRLF line endings', () => {
    expect(summarizeCsv('a,b,c\r\n1,2,3\r\n4,5,6')).toEqual({
      rows: 2,
      cols: 3,
    });
  });

  it('returns zeros for empty input', () => {
    expect(summarizeCsv('')).toEqual({ rows: 0, cols: 0 });
    expect(summarizeCsv('   ')).toEqual({ rows: 0, cols: 0 });
  });
});
