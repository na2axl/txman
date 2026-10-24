import type { TransactionResource, TransactionStatus } from '@/api/resources';
import { formatMoney } from '@/lib/money';
import { CustomerModel } from './customer';
import { Model } from './model';

export class TransactionModel extends Model<TransactionResource> {
  get id() {
    return this._data.id;
  }

  get reference() {
    return this._data.reference;
  }

  get customer(): CustomerModel {
    return new CustomerModel(this._data.customer);
  }

  get currency() {
    return this._data.currency;
  }

  get status(): TransactionStatus {
    return this._data.status;
  }

  get createdAt(): Date {
    return this.parseDate(this._data.created_at);
  }

  get updatedAt(): Date {
    return this.parseDate(this._data.updated_at);
  }

  get amountMinor() {
    return this._data.amount;
  }

  get formattedAmount(): string {
    return formatMoney(this._data.amount, this._data.currency);
  }

  get allowedTransitions(): TransactionStatus[] {
    return this._data.allowed_transitions;
  }

  get isPending(): boolean {
    return this._data.status === 'PENDING';
  }

  get isFinal(): boolean {
    return this._data.allowed_transitions.length === 0;
  }

  canTransitionTo(status: TransactionStatus): boolean {
    return this._data.allowed_transitions.includes(status);
  }
}
