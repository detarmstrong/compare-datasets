import _ from 'lodash';

export function makeStringsUnique(strings: string[]): string[] {
  const uniqueStrings: string[] = [];
  const seen = new Set<string>();
  const stringCounts: Record<string, number> = {};

  for (const originalString of strings) {
    let uniqueString = originalString;
    let count = stringCounts[originalString] || 0;

    // If the string already exists, append a number to make it unique
    while (seen.has(uniqueString)) {
      uniqueString = `${originalString}${++count}`;
    }

    // Update the count for this string and add it to the array of unique strings
    stringCounts[originalString] = count;
    seen.add(uniqueString);
    uniqueStrings.push(uniqueString);
  }

  return uniqueStrings;
}

/**
 * Custom auto-type function for CSV parsing that converts values to appropriate types
 * but keeps ISO8601 date strings as strings instead of converting to Date objects.
 * This is necessary because wa-sqlite doesn't handle JavaScript Date objects well.
 * 
 * Based on d3-dsv's autoType but preserves date strings.
 */
export function autoTypeWithoutDates(object: any): any {
  for (const key in object) {
    let value = object[key].trim()
    let number
    
    if (!value) {
      value = null
    } else if (value === 'true') {
      value = true
    } else if (value === 'false') {
      value = false
    } else if (value === 'NaN') {
      value = NaN
    } else if (!isNaN((number = +value))) {
      value = number
    }
    // Note: We intentionally skip date conversion here to keep date strings as strings
    // The original d3-dsv autoType would convert ISO8601 dates to Date objects,
    // but this causes issues when inserting into SQLite
    
    object[key] = value
  }
  return object
}

export function TSVToCSV(TSVText: string): string {
  // Split the input text into rows based on newline characters
  const rows = TSVText.trim().split('\n');

  // Convert each row from tab-delimited to comma-delimited
  const csvRows = rows.map(row => {
      // Split the row into columns based on tab characters
      const columns = row.split('\t');

      // Enclose each cell in double quotes and replace any internal double quotes with two double quotes (CSV escaping)
      const escapedColumns = columns.map(cell => `"${cell.replace(/"/g, '""')}"`);

      // Join the cells back together with commas
      return escapedColumns.join(',');
  });

  // Join the rows back together with newline characters
  const csvText = csvRows.join('\n');

  return csvText;
}