import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  getHello(): string {
    return 'Hello World!';
  }
}
