import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UUID } from '../common/schemas.js';
import type { AuthUser } from '../iam/auth/auth.types.js';
import { CurrentUser } from '../iam/decorators/current-user.decorator.js';
import { CreateTransactionInput } from './schemas/create-transaction.schema.js';
import { ListTransactionsQuery } from './schemas/list-transactions-query.schema.js';
import { UpdateTransactionStatusInput } from './schemas/update-transaction-status.schema.js';
import type { TransactionResponse } from './transactions.mapper.js';
import {
  type TransactionPage,
  TransactionsService,
} from './transactions.service.js';

/**
 * Transaction controller.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(
    @Query({ schema: ListTransactionsQuery })
    query: ListTransactionsQuery,
  ): Promise<TransactionPage> {
    return this.transactionsService.list(query);
  }

  @Get(':id')
  findOne(
    @Param('id', { schema: UUID }) id: UUID,
  ): Promise<TransactionResponse> {
    return this.transactionsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body({ schema: CreateTransactionInput }) body: CreateTransactionInput,
    @CurrentUser() user: AuthUser,
  ): Promise<TransactionResponse> {
    return this.transactionsService.create(body, user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', { schema: UUID }) id: UUID,
    @Body({ schema: UpdateTransactionStatusInput })
    body: UpdateTransactionStatusInput,
  ): Promise<TransactionResponse> {
    return this.transactionsService.updateStatus(id, body.status);
  }
}
