import { isSupportedCurrency, toMinorUnits, validateMoney } from './money.js';

describe('money', () => {
  it('accepts a positive integer in minor units', () => {
    const result = validateMoney(12550, 'USD');
    expect(result.ok && toMinorUnits(result.money)).toBe(12550);
  });

  it('accepts zero-exponent currencies', () => {
    const result = validateMoney(250000, 'XAF');
    expect(result.ok && toMinorUnits(result.money)).toBe(250000);
  });

  it.each([
    [0, 'USD', 'greater than zero'],
    [-5, 'USD', 'greater than zero'],
    [1.5, 'USD', 'integer in minor units'],
    [Number.NaN, 'USD', 'integer in minor units'],
    [2 ** 53, 'USD', 'integer in minor units'],
    [100, 'ZZZ', 'Unsupported currency'],
    [100, 'usd', 'Unsupported currency'],
  ])('rejects %s %s', (amount, code, message) => {
    const result = validateMoney(amount, code);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toContain(message);
  });

  it('knows supported currencies', () => {
    expect(isSupportedCurrency('XAF')).toBe(true);
    expect(isSupportedCurrency('usd')).toBe(false);
  });
});
