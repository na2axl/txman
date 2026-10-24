import {
  keepPreviousData,
  mutationOptions,
  queryOptions,
} from '@tanstack/react-query';
import { TransactionModel } from '@/api/models';
import type {
  CreateTransactionRequest,
  ListTransactionsParams,
  OffsetPaginatedEnvelope,
  TransactionResource,
  UpdateTransactionStatusRequest,
} from '@/api/resources';
import type { ApiClient } from '@/api/transport';
import { queryKeys } from './keys';

const toPage = (response: OffsetPaginatedEnvelope<TransactionResource>) => ({
  items: TransactionModel.collection(response.data),
  meta: response.meta,
});

const toModel = (resource: TransactionResource) =>
  new TransactionModel(resource);

export function transactionQueries(client: ApiClient) {
  return {
    list: (params: ListTransactionsParams) =>
      queryOptions({
        queryKey: queryKeys.transactions.list(params),
        queryFn: ({ signal }) =>
          client.get<OffsetPaginatedEnvelope<TransactionResource>>(
            '/transactions',
            { query: { ...params }, signal },
          ),
        select: toPage,
        placeholderData: keepPreviousData,
        staleTime: 15_000,
      }),

    detail: (id: string) =>
      queryOptions({
        queryKey: queryKeys.transactions.detail(id),
        queryFn: ({ signal }) =>
          client.get<TransactionResource>(`/transactions/${id}`, { signal }),
        select: toModel,
      }),
  };
}

export function transactionMutations(client: ApiClient) {
  return {
    create: () =>
      mutationOptions({
        mutationFn: (request: CreateTransactionRequest) =>
          client.post<TransactionResource>('/transactions', request),
      }),

    updateStatus: (id: string) =>
      mutationOptions({
        mutationFn: (request: UpdateTransactionStatusRequest) =>
          client.patch<TransactionResource>(
            `/transactions/${id}/status`,
            request,
          ),
      }),
  };
}
