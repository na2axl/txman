import { Controller, Get, Query } from '@nestjs/common';
import { ListCustomersQuery } from './customers.schemas.js';
import {
  type CustomerResponse,
  CustomersService,
} from './customers.service.js';

/**
 * Customers controller.
 * @author Axel Nana <ax.lnana@outlook.cm>
 */
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Gets the list of customers that meets the query's requirements.
   */
  @Get()
  async list(
    @Query({ schema: ListCustomersQuery }) query: ListCustomersQuery,
  ): Promise<{ data: CustomerResponse[] }> {
    return { data: await this.customersService.list(query) };
  }
}
