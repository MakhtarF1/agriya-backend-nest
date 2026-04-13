import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Santé')
@Controller('sante')
export class HealthController {
  @Get()
  check() {
    return {
      success: true,
      service: 'AGRIYA API NestJS',
      status: 'ok',
      time: new Date().toISOString(),
    };
  }
}
