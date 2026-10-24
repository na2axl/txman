import { TransactionStatus } from '../db/index.js';
import { InvalidStatusTransitionError } from './errors/invalid-status-transition.error.js';

/**
 * This is a very simple representation of a state machine for transaction
 * statuses. Each status lists the statuses it may move to.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
const TRANSITIONS: Record<TransactionStatus, readonly TransactionStatus[]> = {
  [TransactionStatus.PENDING]: [
    TransactionStatus.APPROVED,
    TransactionStatus.REJECTED,
  ],
  [TransactionStatus.APPROVED]: [],
  [TransactionStatus.REJECTED]: [],
};

/**
 * Returns the list of statuses a transaction may move to from the given status.
 * @author Axel Nana <ax.lnana@outlook.com>
 * @param from The current status of the transaction.
 * @returns The list of statuses a transaction may move to from the given status.
 */
export function allowedTransitions(
  from: TransactionStatus,
): readonly TransactionStatus[] {
  return TRANSITIONS[from];
}

/**
 * Returns true if the transaction can move from the {@link from} status to the {@link to} status.
 * @author Axel Nana <ax.lnana@outlook.com>
 * @param from The current status of the transaction.
 * @param to The status the transaction is trying to move to.
 * @returns True if the transaction can execute this transition.
 */
export function canTransition(
  from: TransactionStatus,
  to: TransactionStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

/**
 * Throws an error if the transaction cannot move from the {@link from} status to the {@link to} status.
 * @author Axel Nana <ax.lnana@outlook.com>
 * @param from The current status of the transaction.
 * @param to The status the transaction is trying to move to.
 * @throws InvalidStatusTransitionError if the transaction cannot move from the {@link from} status to the {@link to} status.
 */
export function assertTransition(
  from: TransactionStatus,
  to: TransactionStatus,
): void {
  if (!canTransition(from, to)) {
    throw new InvalidStatusTransitionError(from, to);
  }
}
