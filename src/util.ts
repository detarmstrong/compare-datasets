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

// Quick row/column estimate for the paste preview UI. Approximate by design:
// counts newlines for rows and commas in the first line for columns. Fails for
// CSVs with embedded newlines or commas inside quoted cells, but those are rare
// in paste-from-spreadsheet flows and the authoritative parse happens downstream.
export function summarizeCsv(csvText: string): { rows: number; cols: number } {
  const trimmed = csvText.trim()
  if (trimmed.length === 0) return { rows: 0, cols: 0 }
  const lines = trimmed.split(/\r?\n/)
  const cols = (lines[0].match(/,/g) || []).length + 1
  const rows = Math.max(0, lines.length - 1)
  return { rows, cols }
}

// Normalize pasted tabular text into CSV. Users typically paste a range from
// Excel/Google Sheets (TSV) or already-comma-separated text. Any tab in the
// body is treated as TSV; otherwise the text is assumed already CSV.
// Returns null when input isn't a non-empty string.
export function normalizePastedTabular(rawText: unknown): string | null {
  if (typeof rawText !== 'string') return null
  const trimmed = rawText.trim()
  if (trimmed.length === 0) return null
  return trimmed.includes('\t') ? TSVToCSV(trimmed) : trimmed
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