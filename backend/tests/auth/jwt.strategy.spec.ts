import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../../src/auth/jwt.strategy';
import { PrismaService } from '../../src/shared/prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
} as any;

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('validate() — user found returns user object', async () => {
    const payload = { sub: 1, email: 'test@test.com', role: 'user' as const };
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: 'test@test.com',
      firstName: null,
      lastName: null,
      nationalCode: null,
      phone: null,
      birthDate: null,
      role: 'user',
    });

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      id: 1,
      email: 'test@test.com',
      firstName: null,
      lastName: null,
      nationalCode: null,
      phone: null,
      birthDate: null,
      role: 'user',
    });
  });

  it('validate() — user not found throws UnauthorizedException', async () => {
    const payload = { sub: 999, email: 'test@test.com', role: 'user' as const };
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
