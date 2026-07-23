import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../../src/auth/auth.service';

const mockQuery = jest.fn();
const mockPool = { query: mockQuery } as any;

const mockJwtService = {
  sign: jest.fn().mockReturnValue('fake-jwt-token'),
} as any;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'DATABASE', useValue: mockPool },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('success — returns token and user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@test.com',
            firstName: null,
            lastName: null,
            nationalCode: null,
            phone: null,
            birthDate: null,
            role: 'user',
          },
        ],
      });

      const result = await service.register('test@test.com', 'password123');

      expect(result.token).toBe('fake-jwt-token');
      expect(result.user).toEqual({
        id: 1,
        email: 'test@test.com',
        firstName: null,
        lastName: null,
        nationalCode: null,
        phone: null,
        birthDate: null,
        role: 'user',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@test.com',
        firstName: null,
        lastName: null,
        nationalCode: null,
        phone: null,
        birthDate: null,
        role: 'user',
      });
    });

    it('conflict — throws ConflictException for existing email', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await expect(
        service.register('existing@test.com', 'password123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('success — returns token and user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@test.com',
            firstName: null,
            lastName: null,
            nationalCode: null,
            phone: null,
            birthDate: null,
            role: 'user',
            password: hashedPassword,
          },
        ],
      });

      const result = await service.login('test@test.com', 'password123');

      expect(result.token).toBe('fake-jwt-token');
      expect(result.user).toEqual({
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

    it('failure — wrong password throws UnauthorizedException', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@test.com',
            firstName: null,
            lastName: null,
            nationalCode: null,
            phone: null,
            birthDate: null,
            role: 'user',
            password: hashedPassword,
          },
        ],
      });

      await expect(
        service.login('test@test.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('failure — nonexistent email throws UnauthorizedException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.login('nonexistent@test.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
