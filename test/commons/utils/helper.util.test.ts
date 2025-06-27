import { describe, it, expect } from 'vitest';
import { generateUniqueId, getOrdinalSuffix } from '@/commons/utils/helper.util';

/**
 * Generates an ordinal suffix for a given number.
 * @param num - The number to convert to an ordinal string
 * @returns '1st', '2nd', '3rd', '4th', etc.
 */
describe('generateUniqueId', () => {
    it('should generate a unique identifier', () => {
        const id1 = generateUniqueId();
        const id2 = generateUniqueId();
        expect(id1).not.toBe(id2); // IDs should be unique
        expect(id1).toMatch(/^\d+-[a-z0-9]+$/); // Matches the expected format
    });
});

describe('getOrdinalSuffix', () => {
    it('should return the correct ordinal suffix for numbers', () => {
        expect(getOrdinalSuffix(1)).toBe('1st');
        expect(getOrdinalSuffix(2)).toBe('2nd');
        expect(getOrdinalSuffix(3)).toBe('3rd');
        expect(getOrdinalSuffix(4)).toBe('4th');
        expect(getOrdinalSuffix(11)).toBe('11th');
        expect(getOrdinalSuffix(21)).toBe('21st');
        expect(getOrdinalSuffix(22)).toBe('22nd');
        expect(getOrdinalSuffix(23)).toBe('23rd');
        expect(getOrdinalSuffix(101)).toBe('101st');
        expect(getOrdinalSuffix(111)).toBe('111th');
    });

    it('should handle edge cases', () => {
        expect(getOrdinalSuffix(0)).toBe('0th');
        expect(getOrdinalSuffix(-1)).toBe('-1th');
        expect(getOrdinalSuffix(100)).toBe('100th');
    });
});
