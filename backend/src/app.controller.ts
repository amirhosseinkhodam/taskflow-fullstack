import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  readonly #appService: AppService;
  constructor(appService: AppService) {
    this.#appService = appService;
  }

  @Get('api/health')
  getHealth(): { status: string } {
    return this.#appService.getHealth();
  }

  @Get()
  getHello(): string {
    return this.#appService.getHello();
  }
}
