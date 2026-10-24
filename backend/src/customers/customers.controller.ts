import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProblem } from '../common/openapi/api-problem.decorator.js';
import { CustomerCollection } from './customer-response.schema.js';
import { ListCustomersQuery } from './customers.schemas.js';
import { CustomersService } from './customers.service.js';

/**
 * Customers controller.
 * @author Axel Nana <ax.lnana@outlook.cm>
 */
@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Gets the list of customers that meets the query's requirements.
   */
  @Get()
  @ApiOperation({
    summary: 'Search customers',
    description: 'Lookup by name, used by the transaction form and filter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching customers, ordered by name',
    standardSchema: CustomerCollection,
  })
  @ApiProblem(HttpStatus.UNAUTHORIZED, HttpStatus.UNPROCESSABLE_ENTITY)
  async list(
    @Query({ schema: ListCustomersQuery }) query: ListCustomersQuery,
  ): Promise<CustomerCollection> {
    return { data: await this.customersService.list(query) };
  }
}
