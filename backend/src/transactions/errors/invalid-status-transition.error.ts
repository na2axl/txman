import { TransactionStatus } from '../../db/index.js';

/**
 * Domain error thrown when a transaction status transition is invalid.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export class InvalidStatusTransitionError extends Error {
  constructor(
    readonly from: TransactionStatus,
    readonly to: TransactionStatus,
  ) {
    super(`Cannot change a ${from} transaction to ${to}`);
    this.name = 'InvalidStatusTransitionError';
  }
}
