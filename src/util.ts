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

