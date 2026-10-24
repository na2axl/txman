import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { Public } from '../../iam/decorators/public.decorator.js';

const HealthResponse = z.object({ status: z.literal('ok') });
type HealthResponse = z.infer<typeof HealthResponse>;

/**
 * Very basic liveness probe.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Checks if the server is live and running.',
  })
  @ApiResponse({
    status: 200,
    description: 'The service is up',
    standardSchema: HealthResponse,
  })
  check(): HealthResponse {
    return { status: 'ok' };
  }
}
