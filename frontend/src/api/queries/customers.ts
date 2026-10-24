import { queryOptions } from '@tanstack/react-query';
import { CustomerModel } from '@/api/models';
import type { CollectionEnvelope, CustomerResource } from '@/api/resources';
import type { ApiClient } from '@/api/transport';
import { queryKeys } from './keys';

const toModels = (response: CollectionEnvelope<CustomerResource>) =>
  CustomerModel.collection(response.data);

export function customerQueries(client: ApiClient) {
  return {
    search: (search: string) =>
      queryOptions({
        queryKey: queryKeys.customers.search(search),
        queryFn: ({ signal }) =>
          client.get<CollectionEnvelope<CustomerResource>>('/customers', {
            query: { search: search || undefined, limit: 20 },
            signal,
          }),
        select: toModels,
        staleTime: 30_000,
      }),
  };
}
