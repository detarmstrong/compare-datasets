import _ from 'lodash';

export function makeStringsUnique(strings: string[]): string[] {
  const uniqueStrings: string[] = [];
  const stringCounts: Record<string, number> = {};

  _.forEach(strings, originalString => {
    let uniqueString = originalString;
    let count = stringCounts[originalString] || 0;

    // If the string already exists, append a number to make it unique
    while (_.includes(uniqueStrings, uniqueString)) {
      uniqueString = `${originalString}${++count}`;
    }

    // Update the count for this string and add it to the array of unique strings
    stringCounts[originalString] = count;
    uniqueStrings.push(uniqueString);
  });

  return uniqueStrings;
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