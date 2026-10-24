import type { ISODateTime, Uuid } from './base';
import type { CustomerResource } from './customers';

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type TransactionSortField =
  | 'created_at'
  | 'updated_at'
  | 'amount'
  | 'reference'
  | 'status';

export interface TransactionResource {
  id: Uuid;
  reference: string;
  customer: CustomerResource;
  amount: number;
  currency: string;
  status: TransactionStatus;
  allowed_transitions: TransactionStatus[];
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface ListTransactionsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: TransactionStatus;
  customer_id?: Uuid;
  sort_by?: TransactionSortField;
  order?: 'asc' | 'desc';
}

export type CreateTransactionRequest = {
  reference: string;
  amount: number;
  currency: string;
} & ({ customer_id: Uuid } | { customer_name: string });

export interface UpdateTransactionStatusRequest {
  status: TransactionStatus;
}
