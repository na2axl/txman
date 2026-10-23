import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { asc, ilike } from 'drizzle-orm';
import { customers } from '../db/index.js';
import type { Database } from '../db/types.js';
import type { ListCustomersQuery } from './customers.schemas.js';

export interface CustomerResponse {
  id: string;
  name: string;
}

/**
 * Service for managing customers.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@Injectable()
export class CustomersService {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  /**
   * Gets a list of customers from the database. With the optinal ability to
   * search by name.
   */
  async list({
    search,
    limit,
  }: ListCustomersQuery): Promise<CustomerResponse[]> {
    const pattern = search?.replace(/[\\%_]/g, '\\$&');
    return this.db
      .select({ id: customers.id, name: customers.name })
      .from(customers)
      .where(pattern ? ilike(customers.name, `%${pattern}%`) : undefined)
      .orderBy(asc(customers.name))
      .limit(limit);
  }
}
