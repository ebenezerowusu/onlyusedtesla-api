import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../common/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly svc: HealthService) {}

  @Get()
  @Public()
  liveness() {
    return this.svc.liveness();
  }

  @Get('cosmos')
  @Public()
  cosmos() {
    return this.svc.cosmos();
  }

  @Get('storage')
  @Public()
  storage() {
    return this.svc.storage();
  }
}
