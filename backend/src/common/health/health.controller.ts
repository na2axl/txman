import { Controller, Get } from '@nestjs/common';
import { Public } from '../../iam/decorators/public.decorator.js';

/**
 * Very basic liveness probe.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok' };
  }
}
