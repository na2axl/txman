import type { Uuid } from './base';

export interface CustomerResource {
  id: Uuid;
  name: string;
}

export interface ListCustomersParams {
  search?: string;
  limit?: number;
}
