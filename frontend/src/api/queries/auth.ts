import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type {
  CurrentUserResource,
  LoginRequest,
  TokenResource,
} from '@/api/resources';
import type { ApiClient } from '@/api/transport';
import { queryKeys } from './keys';

export function authQueries(client: ApiClient) {
  return {
    me: () =>
      queryOptions({
        queryKey: queryKeys.auth.me,
        queryFn: ({ signal }) =>
          client.get<CurrentUserResource>('/auth/me', { signal }),
        staleTime: 5 * 60_000,
      }),
  };
}

export function authMutations(client: ApiClient) {
  return {
    login: () =>
      mutationOptions({
        mutationFn: (request: LoginRequest) =>
          client.post<TokenResource>('/auth/login', request, { auth: false }),
      }),
  };
}
