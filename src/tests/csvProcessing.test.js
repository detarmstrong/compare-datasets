import _ from 'lodash';
import { makeStringsUnique } from '../util';

describe('CSV Column Processing', () => {
  // This mimics the logic in App.tsx loadCsv function
  const processColumns = (rawColumns) => {
    let columns = _.map(rawColumns, (col) => {
      // Replace empty column names with a default name
      const columnName = col || 'Column';
      return columnName.replace(/[^0-9A-Za-z _-]/g, '_');
    });

    return makeStringsUnique(columns);
  };

  it('should handle columns with empty names', () => {
    // Simulating columns parsed from CSV: name,age,,city,
    const rawColumns = ['name', 'age', '', 'city', ''];
    
    const columns = processColumns(rawColumns);
    
    // Verify no empty column names exist
    expect(columns.every(col => col.length > 0)).toBe(true);
    
    // Verify the expected column names
    expect(columns).toEqual(['name', 'age', 'Column', 'city', 'Column1']);
  });

  it('should handle columns with only valid names', () => {
    const rawColumns = ['name', 'age', 'email', 'city'];
    
    const columns = processColumns(rawColumns);
    
    expect(columns).toEqual(['name', 'age', 'email', 'city']);
  });

  it('should handle columns with special characters', () => {
    const rawColumns = ['name', 'age@', 'email!', 'city#'];
    
    const columns = processColumns(rawColumns);
    
    // Special characters should be replaced with underscores
    expect(columns).toEqual(['name', 'age_', 'email_', 'city_']);
  });

  it('should handle multiple empty columns', () => {
    const rawColumns = ['name', '', '', 'city'];
    
    const columns = processColumns(rawColumns);
    
    expect(columns).toEqual(['name', 'Column', 'Column1', 'city']);
    // Verify no empty strings
    expect(columns.every(col => col.length > 0)).toBe(true);
  });

  it('should generate valid SQL DDL with processed columns', () => {
    const rawColumns = ['name', 'age', '', 'city', ''];
    
    const columns = processColumns(rawColumns);
    const columnsDDL = _.map(columns, (col) => `"${col}" varchar`);
    const ddl = `create table test (${columnsDDL.join(',')})`;
    
    // DDL should not contain empty column names like ""
    expect(ddl).not.toContain('""');
    expect(ddl).toContain('"Column"');
    expect(ddl).toContain('"Column1"');
  });

  it('should handle all empty columns', () => {
    const rawColumns = ['', '', ''];
    
    const columns = processColumns(rawColumns);
    
    expect(columns).toEqual(['Column', 'Column1', 'Column2']);
    expect(columns.every(col => col.length > 0)).toBe(true);
  });

  it('should handle columns that become duplicates after sanitization', () => {
    const rawColumns = ['age@', 'age!', 'age#'];
    
    const columns = processColumns(rawColumns);
    
    // All should become age_ but be made unique
    expect(columns).toEqual(['age_', 'age_1', 'age_2']);
  });
});
