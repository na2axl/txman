import { describe, expect, it } from 'vitest';
import { generateReference, REFERENCE_PATTERN } from './reference';

describe('generateReference', () => {
  it('matches the 22-character backend format', () => {
    const reference = generateReference();
    expect(reference).toHaveLength(22);
    expect(reference).toMatch(REFERENCE_PATTERN);
  });

  it('embeds the UTC timestamp', () => {
    const reference = generateReference(new Date('2026-10-23T14:05:09Z'));
    expect(reference.slice(0, 16)).toBe('TX20261023140509');
  });

  it('is random between calls', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    expect(generateReference(date)).not.toBe(generateReference(date));
  });
});
