import { uid } from 'radash';

/**
 * Builds a transaction reference: `TX{YYYY}{MM}{DD}{HH}{mm}{SS}{6 random chars}`.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function generateReference(date: Date = new Date()): string {
  const pad = (value: number, length = 2) =>
    String(value).padStart(length, '0');

  const timestamp =
    pad(date.getUTCFullYear(), 4) +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds());

  const suffix = uid(6);

  return `TX${timestamp}${suffix}`.toUpperCase();
}
