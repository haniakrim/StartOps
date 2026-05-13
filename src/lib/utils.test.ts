import { describe, it, expect } from 'vitest';
import { isDefined } from './utils';

describe('isDefined', () => {
  it('should return false for null and undefined', () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });

  it('should return true for falsy but defined values', () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined(NaN)).toBe(true);
  });

  it('should return true for truthy values', () => {
    expect(isDefined(1)).toBe(true);
    expect(isDefined('hello')).toBe(true);
    expect(isDefined(true)).toBe(true);
    expect(isDefined({})).toBe(true);
    expect(isDefined([])).toBe(true);
  });
});
