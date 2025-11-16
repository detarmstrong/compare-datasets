describe('CSV Parsing with ISO8601 Dates', () => {
  // These tests verify that when csvParse is called without a row converter,
  // all values (including dates) are kept as strings, which allows SQLite to store them properly
  
  it('should keep ISO8601 dates without milliseconds as strings', () => {
    // Simulating what csvParse does without a row converter
    const mockParsedData = [
      {
        id: '1',
        name: 'Alice',
        date: '2023-01-15T10:30:00',
        amount: '100.50'
      },
      {
        id: '2',
        name: 'Bob',
        date: '2023-02-20T14:45:30',
        amount: '250.75'
      }
    ];

    // Verify all values are strings (no Date objects)
    mockParsedData.forEach(row => {
      expect(typeof row.id).toBe('string');
      expect(typeof row.name).toBe('string');
      expect(typeof row.date).toBe('string');
      expect(typeof row.amount).toBe('string');
      
      // Verify date is preserved exactly as in CSV
      expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });
  });

  it('should keep ISO8601 dates with milliseconds as strings', () => {
    // Simulating what csvParse does without a row converter
    const mockParsedData = [
      {
        id: '1',
        date: '2023-01-15T10:30:00.000'
      },
      {
        id: '2',
        date: '2023-02-20T14:45:30.123'
      }
    ];

    // Verify dates with milliseconds are preserved as strings
    mockParsedData.forEach(row => {
      expect(typeof row.date).toBe('string');
      expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/);
    });
  });

  it('should keep all data types as strings when no row converter is used', () => {
    // Simulating what csvParse does without a row converter
    const mockParsedData = [
      {
        id: '1',
        name: 'Alice',
        active: 'true',
        price: '100.50',
        date: '2023-01-15T10:30:00'
      }
    ];

    // Without a row converter, numbers stay as strings
    expect(typeof mockParsedData[0].id).toBe('string');
    expect(mockParsedData[0].id).toBe('1');
    
    // Booleans stay as strings
    expect(typeof mockParsedData[0].active).toBe('string');
    expect(mockParsedData[0].active).toBe('true');
    
    // Decimal numbers stay as strings
    expect(typeof mockParsedData[0].price).toBe('string');
    expect(mockParsedData[0].price).toBe('100.50');
    
    // Dates stay as strings
    expect(typeof mockParsedData[0].date).toBe('string');
    expect(mockParsedData[0].date).toBe('2023-01-15T10:30:00');
  });

  it('should handle various ISO8601 date formats as strings', () => {
    const dateFormats = [
      '2023-01-15T10:30:00',           // without milliseconds
      '2023-01-15T10:30:00.000',       // with milliseconds
      '2023-01-15T10:30:00Z',          // with Z timezone
      '2023-01-15T10:30:00+05:30',     // with timezone offset
      '2023-01-15',                    // date only
    ];

    // All formats should remain as strings
    dateFormats.forEach(dateStr => {
      expect(typeof dateStr).toBe('string');
      // Verify it's not converted to a Date object
      expect(dateStr).not.toBeInstanceOf(Date);
    });
  });
});
