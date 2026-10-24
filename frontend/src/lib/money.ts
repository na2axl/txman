import { dinero, toDecimal } from 'dinero.js';
import * as currencies from 'dinero.js/currencies';

type Currency = (typeof currencies)[keyof typeof currencies];

/** Currencies offered by the transaction form. */
export const CURRENCY_CODES = ['XAF', 'USD', 'EUR', 'NGN', 'GHS'] as const;

const DECIMAL_PATTERN = /^\d+([.,]\d+)?$/;

function findCurrency(code: string): Currency | undefined {
  return (currencies as Record<string, Currency>)[code];
}

export type MinorUnitsResult =
  | { ok: true; minor: number }
  | { ok: false; error: string };

/**
 * Converts a typed decimal amount (i.e. "125.50") into integer minor units.
 * Works directly on the string to avoid floating point math errors.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function toMinorUnits(input: string, code: string): MinorUnitsResult {
  const currency = findCurrency(code);
  if (!currency) return { ok: false, error: 'Choose a currency' };

  const value = input.trim();
  if (!DECIMAL_PATTERN.test(value)) {
    return { ok: false, error: 'Enter a valid positive amount' };
  }

  const [whole, fraction = ''] = value.replace(',', '.').split('.');
  if (fraction.length > currency.exponent) {
    return {
      ok: false,
      error:
        currency.exponent === 0
          ? `${code} has no decimal places`
          : `${code} allows at most ${currency.exponent} decimal places`,
    };
  }

  const minor = Number(whole + fraction.padEnd(currency.exponent, '0'));
  if (!Number.isSafeInteger(minor)) {
    return { ok: false, error: 'Amount is too large' };
  }
  if (minor <= 0)
    return { ok: false, error: 'Amount must be greater than zero' };
  return { ok: true, minor };
}

/**
 * Formats minor units for display, i.e. 12550 USD -> "$125.50".
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function formatMoney(amount: number, code: string): string {
  const currency = findCurrency(code);
  if (!currency) return `${amount} ${code}`;
  const decimal = toDecimal(dinero({ amount, currency }));
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: currency.exponent,
    maximumFractionDigits: currency.exponent,
  }).format(Number(decimal));
}
