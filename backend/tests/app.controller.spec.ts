import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHealth: jest.fn().mockReturnValue({ status: 'ok' }),
            getHello: jest.fn().mockReturnValue('Hello World!'),
          },
        },
      ],
    }).compile();

    controller = module.get(AppController);
    service = module.get(AppService);
  });

  it('getHealth() delegates to AppService.getHealth()', () => {
    expect(controller.getHealth()).toEqual({ status: 'ok' });
    expect(service['getHealth']).toHaveBeenCalledTimes(1);
  });

  it('getHello() delegates to AppService.getHello()', () => {
    expect(controller.getHello()).toBe('Hello World!');
    expect(service['getHello']).toHaveBeenCalledTimes(1);
  });
});
