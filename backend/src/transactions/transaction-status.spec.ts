import { TransactionStatus } from '../db/index.js';
import { InvalidStatusTransitionError } from './errors/invalid-status-transition.error.js';
import {
  allowedTransitions,
  assertTransition,
  canTransition,
} from './transaction-status.js';

const { PENDING, APPROVED, REJECTED } = TransactionStatus;

describe('transaction status transitions', () => {
  it.each([
    [PENDING, APPROVED],
    [PENDING, REJECTED],
  ])('allows %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
    expect(() => assertTransition(from, to)).not.toThrow();
  });

  it.each([
    [APPROVED, REJECTED],
    [APPROVED, PENDING],
    [REJECTED, APPROVED],
    [REJECTED, PENDING],
    [PENDING, PENDING],
    [APPROVED, APPROVED],
    [REJECTED, REJECTED],
  ])('rejects %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
    expect(() => assertTransition(from, to)).toThrow(
      InvalidStatusTransitionError,
    );
  });

  it('exposes the allowed targets for each status', () => {
    expect(allowedTransitions(PENDING)).toEqual([APPROVED, REJECTED]);
    expect(allowedTransitions(APPROVED)).toEqual([]);
    expect(allowedTransitions(REJECTED)).toEqual([]);
  });

  it('reports the offending transition on the error', () => {
    expect.assertions(3);
    try {
      assertTransition(APPROVED, REJECTED);
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidStatusTransitionError);
      expect((error as InvalidStatusTransitionError).from).toBe(APPROVED);
      expect((error as InvalidStatusTransitionError).to).toBe(REJECTED);
    }
  });
});
