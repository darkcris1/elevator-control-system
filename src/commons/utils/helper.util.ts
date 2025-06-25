/**
 * generate random unique ID 
 * @returns A unique identifier string based on the current timestamp and a random component.
 */
export function generateUniqueId(): string  {
return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};


/**
 * Generates an ordinal suffix for a given number.
 * @param num - The number to convert to an ordinal string
 * @returns '1st', '2nd', '3rd', '4th', etc.
 */
export function getOrdinalSuffix(num: number): string {
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  }