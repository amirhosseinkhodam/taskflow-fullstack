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
    const spy = jest.spyOn(service, 'getHealth');
    expect(controller.getHealth()).toEqual({ status: 'ok' });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('getHello() delegates to AppService.getHello()', () => {
    const spy = jest.spyOn(service, 'getHello');
    expect(controller.getHello()).toBe('Hello World!');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
