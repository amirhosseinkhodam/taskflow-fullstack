import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';

const mockThrottlerGuard: CanActivate = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest
              .fn()
              .mockResolvedValue({ token: 'token', user: { id: 1 } }),
            login: jest
              .fn()
              .mockResolvedValue({ token: 'token', user: { id: 1 } }),
          },
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue(mockThrottlerGuard)
      .compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  it('register() delegates to AuthService.register()', async () => {
    const dto = {
      email: 'test@test.com',
      password: 'password123',
      name: 'Test',
    };
    await controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(
      dto.email,
      dto.password,
      dto.name,
    );
  });

  it('login() delegates to AuthService.login()', async () => {
    const dto = { email: 'test@test.com', password: 'password123' };
    await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
  });
});
