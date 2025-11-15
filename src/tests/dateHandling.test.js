import { autoTypeWithoutDates } from '../util';

describe('autoTypeWithoutDates', () => {
  it('should convert numbers correctly', () => {
    const obj = { id: '42', price: '29.99', count: '100' };
    const result = autoTypeWithoutDates(obj);
    expect(result.id).toBe(42);
    expect(result.price).toBe(29.99);
    expect(result.count).toBe(100);
  });

  it('should convert booleans correctly', () => {
    const obj = { isActive: 'true', isDeleted: 'false' };
    const result = autoTypeWithoutDates(obj);
    expect(result.isActive).toBe(true);
    expect(result.isDeleted).toBe(false);
  });

  it('should convert empty strings to null', () => {
    const obj = { name: 'John', email: '' };
    const result = autoTypeWithoutDates(obj);
    expect(result.name).toBe('John');
    expect(result.email).toBe(null);
  });

  it('should handle NaN correctly', () => {
    const obj = { value: 'NaN' };
    const result = autoTypeWithoutDates(obj);
    expect(result.value).toBeNaN();
  });

  it('should preserve ISO8601 dates as strings (without milliseconds)', () => {
    const obj = {
      date1: '2023-01-15T10:30:00',
      date2: '2023-12-31T23:59:59',
      date3: '2024-06-15T08:00:00',
    };
    const result = autoTypeWithoutDates(obj);
    // These should remain as strings, not be converted to Date objects
    expect(typeof result.date1).toBe('string');
    expect(typeof result.date2).toBe('string');
    expect(typeof result.date3).toBe('string');
    expect(result.date1).toBe('2023-01-15T10:30:00');
    expect(result.date2).toBe('2023-12-31T23:59:59');
    expect(result.date3).toBe('2024-06-15T08:00:00');
  });

  it('should preserve ISO8601 dates as strings (with milliseconds)', () => {
    const obj = {
      date1: '2023-01-15T10:30:00.000',
      date2: '2023-12-31T23:59:59.999',
      date3: '2024-06-15T08:00:00.123',
    };
    const result = autoTypeWithoutDates(obj);
    // These should remain as strings, not be converted to Date objects
    expect(typeof result.date1).toBe('string');
    expect(typeof result.date2).toBe('string');
    expect(typeof result.date3).toBe('string');
    expect(result.date1).toBe('2023-01-15T10:30:00.000');
    expect(result.date2).toBe('2023-12-31T23:59:59.999');
    expect(result.date3).toBe('2024-06-15T08:00:00.123');
  });

  it('should preserve ISO8601 dates with timezone as strings', () => {
    const obj = {
      date1: '2023-01-15T10:30:00Z',
      date2: '2023-12-31T23:59:59+05:30',
      date3: '2024-06-15T08:00:00-08:00',
    };
    const result = autoTypeWithoutDates(obj);
    // These should remain as strings, not be converted to Date objects
    expect(typeof result.date1).toBe('string');
    expect(typeof result.date2).toBe('string');
    expect(typeof result.date3).toBe('string');
    expect(result.date1).toBe('2023-01-15T10:30:00Z');
    expect(result.date2).toBe('2023-12-31T23:59:59+05:30');
    expect(result.date3).toBe('2024-06-15T08:00:00-08:00');
  });

  it('should preserve simple date formats as strings', () => {
    const obj = {
      date1: '2023-01-15',
      date2: '2024-12-31',
    };
    const result = autoTypeWithoutDates(obj);
    // These should remain as strings
    expect(typeof result.date1).toBe('string');
    expect(typeof result.date2).toBe('string');
    expect(result.date1).toBe('2023-01-15');
    expect(result.date2).toBe('2024-12-31');
  });

  it('should handle mixed data types in one object', () => {
    const obj = {
      id: '42',
      name: 'John Doe',
      isActive: 'true',
      date: '2023-01-15T10:30:00',
      price: '29.99',
      empty: '',
    };
    const result = autoTypeWithoutDates(obj);
    expect(result.id).toBe(42);
    expect(result.name).toBe('John Doe');
    expect(result.isActive).toBe(true);
    expect(typeof result.date).toBe('string');
    expect(result.date).toBe('2023-01-15T10:30:00');
    expect(result.price).toBe(29.99);
    expect(result.empty).toBe(null);
  });

  it('should trim whitespace from values', () => {
    const obj = { name: '  John  ', id: ' 42 ' };
    const result = autoTypeWithoutDates(obj);
    expect(result.name).toBe('John');
    expect(result.id).toBe(42);
  });
});
