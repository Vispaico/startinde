import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { getPool } from '@startinde/database';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  async health() {
    let dbStatus: 'up' | 'down' = 'up';
    try {
      await getPool().query('select 1');
    } catch {
      dbStatus = 'down';
    }
    return {
      status: 'ok',
      service: 'startinde-api',
      db: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
