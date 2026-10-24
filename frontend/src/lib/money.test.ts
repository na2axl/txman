import { describe, expect, it } from 'vitest';
import { formatMoney, toMinorUnits } from './money';

describe('toMinorUnits', () => {
  it('converts decimals using the currency exponent', () => {
    expect(toMinorUnits('125.50', 'USD')).toEqual({ ok: true, minor: 12550 });
    expect(toMinorUnits('10', 'USD')).toEqual({ ok: true, minor: 1000 });
    expect(toMinorUnits('250000', 'XAF')).toEqual({ ok: true, minor: 250000 });
  });

  it('accepts a decimal comma and surrounding spaces', () => {
    expect(toMinorUnits(' 3,5 ', 'EUR')).toEqual({ ok: true, minor: 350 });
  });

  it('avoids floating point errors', () => {
    expect(toMinorUnits('0.29', 'USD')).toEqual({ ok: true, minor: 29 });
    expect(toMinorUnits('1.15', 'USD')).toEqual({ ok: true, minor: 115 });
  });

  it.each([
    ['', 'USD', 'valid positive amount'],
    ['abc', 'USD', 'valid positive amount'],
    ['-5', 'USD', 'valid positive amount'],
    ['0', 'USD', 'greater than zero'],
    ['0.00', 'USD', 'greater than zero'],
    ['1.234', 'USD', 'at most 2 decimal places'],
    ['12.5', 'XAF', 'no decimal places'],
    ['10', 'ZZZ', 'Choose a currency'],
    ['99999999999999999999', 'USD', 'too large'],
  ])('rejects "%s" in %s', (input, code, message) => {
    const result = toMinorUnits(input, code);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toContain(message);
  });
});

describe('formatMoney', () => {
  it('formats minor units with the currency precision', () => {
    expect(formatMoney(12550, 'USD')).toContain('125.50');
    expect(formatMoney(250000, 'XAF')).toContain('250,000');
  });

  it('falls back for unknown currencies', () => {
    expect(formatMoney(100, 'ZZZ')).toBe('100 ZZZ');
  });
});
