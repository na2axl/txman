import type { ListTransactionsParams } from '@/api/resources';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (params: ListTransactionsParams) =>
      ['transactions', 'list', params] as const,
    detail: (id: string) => ['transactions', 'detail', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    search: (search: string) => ['customers', 'search', search] as const,
  },
} as const;
