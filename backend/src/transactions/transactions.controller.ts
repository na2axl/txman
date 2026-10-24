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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProblem } from '../common/openapi/api-problem.decorator.js';
import { UUID } from '../common/schemas.js';
import type { AuthUser } from '../iam/auth/auth.types.js';
import { CurrentUser } from '../iam/decorators/current-user.decorator.js';
import { CreateTransactionInput } from './schemas/create-transaction.schema.js';
import { ListTransactionsQuery } from './schemas/list-transactions-query.schema.js';
import {
  TransactionPage,
  TransactionResponse,
} from './schemas/transaction-response.schema.js';
import { UpdateTransactionStatusInput } from './schemas/update-transaction-status.schema.js';
import { TransactionsService } from './transactions.service.js';

/**
 * Transaction controller.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'List transactions',
    description:
      'Paginated list with search (reference or customer name), status and customer filters, and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'A page of transactions',
    standardSchema: TransactionPage,
  })
  @ApiProblem(HttpStatus.UNAUTHORIZED, HttpStatus.UNPROCESSABLE_ENTITY)
  list(
    @Query({ schema: ListTransactionsQuery })
    query: ListTransactionsQuery,
  ): Promise<TransactionPage> {
    return this.transactionsService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction' })
  @ApiResponse({
    status: 200,
    description: 'The transaction',
    standardSchema: TransactionResponse,
  })
  @ApiProblem(
    HttpStatus.UNAUTHORIZED,
    HttpStatus.NOT_FOUND,
    HttpStatus.UNPROCESSABLE_ENTITY,
  )
  findOne(
    @Param('id', { schema: UUID }) id: UUID,
  ): Promise<TransactionResponse> {
    return this.transactionsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a transaction',
    description:
      'Always starts as PENDING. Provide either `customer_id` (existing customer) or `customer_name` (the customer is created in the same database transaction). `amount` is an integer in minor units.',
  })
  @ApiResponse({
    status: 201,
    description: 'The created transaction, with status PENDING',
    standardSchema: TransactionResponse,
  })
  @ApiProblem(
    HttpStatus.UNAUTHORIZED,
    HttpStatus.CONFLICT,
    HttpStatus.UNPROCESSABLE_ENTITY,
  )
  create(
    @Body({ schema: CreateTransactionInput }) body: CreateTransactionInput,
    @CurrentUser() user: AuthUser,
  ): Promise<TransactionResponse> {
    return this.transactionsService.create(body, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Change the status of a transaction',
    description:
      'Only PENDING → APPROVED and PENDING → REJECTED are allowed; any other transition returns 409.',
  })
  @ApiResponse({
    status: 200,
    description: 'The transaction with its new status',
    standardSchema: TransactionResponse,
  })
  @ApiProblem(
    HttpStatus.UNAUTHORIZED,
    HttpStatus.NOT_FOUND,
    HttpStatus.CONFLICT,
    HttpStatus.UNPROCESSABLE_ENTITY,
  )
  updateStatus(
    @Param('id', { schema: UUID }) id: UUID,
    @Body({ schema: UpdateTransactionStatusInput })
    body: UpdateTransactionStatusInput,
  ): Promise<TransactionResponse> {
    return this.transactionsService.updateStatus(id, body.status);
  }
}
