import {
  authMutations,
  authQueries,
  customerQueries,
  transactionMutations,
  transactionQueries,
} from '@/api/queries';
import { createApiClient } from '@/api/transport';
import { notifySessionExpired } from '@/auth/session';
import { tokenStore } from '@/auth/token-store';

export const apiClient = createApiClient({
  baseUrl: '/api/v1',
  getToken: tokenStore.get,
  onUnauthorized: notifySessionExpired,
});

export const queries = {
  auth: authQueries(apiClient),
  transactions: transactionQueries(apiClient),
  customers: customerQueries(apiClient),
};

export const mutations = {
  auth: authMutations(apiClient),
  transactions: transactionMutations(apiClient),
};

export { queryKeys } from './queries/keys';
export { ApiNetworkError, ApiRequestError } from './transport';
