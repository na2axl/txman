import { type Dinero, dinero, isPositive, toSnapshot } from 'dinero.js';
import * as currencies from 'dinero.js/currencies';

type Currency = (typeof currencies)[keyof typeof currencies];

export type MoneyValidationResult =
  | { ok: true; money: Dinero<number> }
  | { ok: false; error: string };

function findCurrency(code: string): Currency | undefined {
  return (currencies as Record<string, Currency>)[code];
}

/**
 * Checks wether the currency is a valid and supported currency
 * @author Axel Nana <ax.lnana@outlook.cm>
 * @param code The currency code.
 */
export function isSupportedCurrency(code: string): boolean {
  return findCurrency(code) !== undefined;
}

/**
 * Validates an amount in minor units for a currency.
 * @author Axel Nana <ax.lnana@outlook.cm>
 */
export function validateMoney(
  amount: number,
  code: string,
): MoneyValidationResult {
  const currency = findCurrency(code);
  if (!currency) return { ok: false, error: `Unsupported currency "${code}"` };

  if (!Number.isSafeInteger(amount)) {
    return { ok: false, error: 'Amount must be an integer in minor units' };
  }

  const money = dinero({ amount, currency });
  if (!isPositive(money)) {
    return { ok: false, error: 'Amount must be greater than zero' };
  }

  return { ok: true, money };
}

/**
 * Converts an amount from a Dinero object to minor units.
 * @author Axel Nana <ax.lnana@outlook.cm>
 * @param money The Dinero object to convert.
 */
export function toMinorUnits(money: Dinero<number>): number {
  return toSnapshot(money).amount;
}
