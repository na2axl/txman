import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { and, asc, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { toMinorUnits } from '../common/money/money.js';
import { escapeLike } from '../common/utils.js';
import {
  customers,
  type TransactionStatus,
  transactions,
} from '../db/index.js';
import type { Database } from '../db/types.js';
import type { CreateTransactionInput } from './schemas/create-transaction.schema.js';
import type { ListTransactionsQuery } from './schemas/list-transactions-query.schema.js';
import { assertTransition } from './transaction-status.js';
import {
  type TransactionResponse,
  type TransactionRow,
  toTransactionResponse,
} from './transactions.mapper.js';

export interface TransactionPage {
  data: TransactionResponse[];
  meta: { total: number; page: number; page_size: number };
}

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

const SORT_COLUMNS = {
  created_at: transactions.created_at,
  updated_at: transactions.updated_at,
  amount: transactions.amount,
  reference: transactions.reference,
  status: transactions.status,
} as const;

const SELECTION = {
  id: transactions.id,
  reference: transactions.reference,
  customer_id: customers.id,
  customer_name: customers.name,
  amount: transactions.amount,
  currency: transactions.currency,
  status: transactions.status,
  created_at: transactions.created_at,
  updated_at: transactions.updated_at,
} as const;

/** Postgres error code, wrapped by Drizzle in `error.cause`. */
function pgErrorCode(error: unknown): string | undefined {
  const cause = (error as { cause?: { code?: string } })?.cause;
  return cause?.code ?? (error as { code?: string })?.code;
}

/**
 * Transaction service.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@Injectable()
export class TransactionsService {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  /**
   * Gets a list of transactions filtered by the given query.
   * @param query The query to filter transactions.
   */
  async list(query: ListTransactionsQuery): Promise<TransactionPage> {
    const where = this.buildFilter(query);
    const direction = query.order === 'asc' ? asc : desc;

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select(SELECTION)
        .from(transactions)
        .innerJoin(customers, eq(transactions.customer_id, customers.id))
        .where(where)
        .orderBy(direction(SORT_COLUMNS[query.sort_by]), desc(transactions.id))
        .limit(query.page_size)
        .offset((query.page - 1) * query.page_size),
      this.db
        .select({ total: count() })
        .from(transactions)
        .innerJoin(customers, eq(transactions.customer_id, customers.id))
        .where(where),
    ]);

    return {
      data: rows.map(toTransactionResponse),
      meta: { total, page: query.page, page_size: query.page_size },
    };
  }

  /**
   * Gets a transaction by its ID.
   * @param id The ID of the transaction to get.
   */
  async findOne(id: string): Promise<TransactionResponse> {
    const row = await this.selectById(id);
    if (!row) throw new NotFoundException(`Transaction ${id} not found`);
    return toTransactionResponse(row);
  }

  /**
   * Creates a transaction. When `customer_name` is given, the customer is
   * created first, in the same database transaction.
   * @param input The input to create a transaction.
   * @param creatorId The ID of the user creating the transaction.
   */
  async create(
    input: CreateTransactionInput,
    creatorId: string,
  ): Promise<TransactionResponse> {
    try {
      const id = await this.db.transaction(async (tx) => {
        const customerId =
          input.customer_id ??
          (
            await tx
              .insert(customers)
              .values({ name: input.customer_name as string })
              .returning({ id: customers.id })
          )[0].id;

        const [created] = await tx
          .insert(transactions)
          .values({
            customer_id: customerId,
            creator_id: creatorId,
            reference: input.reference,
            amount: toMinorUnits(input.money),
            currency: input.currency,
          })
          .returning({ id: transactions.id });
        return created.id;
      });
      return await this.findOne(id);
    } catch (error) {
      const code = pgErrorCode(error);
      if (code === UNIQUE_VIOLATION) {
        throw new ConflictException(
          `Reference ${input.reference} is already used`,
        );
      }
      if (code === FOREIGN_KEY_VIOLATION) {
        throw new UnprocessableEntityException({
          message: 'Request validation failed',
          errors: [{ field: 'customer_id', message: 'Customer not found' }],
        });
      }
      throw error;
    }
  }

  /**
   * Updates the status of a transaction.
   * @param id The ID of the transaction to update.
   * @param status The new status of the transaction.
   */
  async updateStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<TransactionResponse> {
    const current = await this.selectById(id);
    if (!current) throw new NotFoundException(`Transaction ${id} not found`);

    assertTransition(current.status, status);

    const updated = await this.db
      .update(transactions)
      .set({ status })
      .where(
        and(eq(transactions.id, id), eq(transactions.status, current.status)),
      )
      .returning({ id: transactions.id });

    if (updated.length === 0) {
      throw new ConflictException(
        'The transaction status was changed by another request',
      );
    }

    return this.findOne(id);
  }

  private buildFilter(query: ListTransactionsQuery): SQL | undefined {
    const filters: (SQL | undefined)[] = [
      query.status ? eq(transactions.status, query.status) : undefined,
      query.customer_id
        ? eq(transactions.customer_id, query.customer_id)
        : undefined,
    ];
    if (query.search) {
      const pattern = `%${escapeLike(query.search)}%`;
      filters.push(
        or(
          ilike(transactions.reference, pattern),
          ilike(customers.name, pattern),
        ),
      );
    }
    return and(...filters);
  }

  private async selectById(id: string): Promise<TransactionRow | undefined> {
    const [row] = await this.db
      .select(SELECTION)
      .from(transactions)
      .innerJoin(customers, eq(transactions.customer_id, customers.id))
      .where(eq(transactions.id, id))
      .limit(1);
    return row;
  }
}
