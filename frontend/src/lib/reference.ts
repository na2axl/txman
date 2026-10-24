const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const RANDOM_LENGTH = 6;

export const REFERENCE_PATTERN = /^TX[0-9]{14}[A-Z0-9]{6}$/;

const pad = (value: number) => String(value).padStart(2, '0');

export function generateReference(date: Date = new Date()): string {
  const timestamp =
    String(date.getUTCFullYear()) +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds());

  const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_LENGTH));
  const suffix = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join(
    '',
  );

  return `TX${timestamp}${suffix}`;
}
