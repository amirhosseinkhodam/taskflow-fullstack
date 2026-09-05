import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from '../../src/admin/admin.service';
import { PrismaService } from '../../src/shared/prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  task: {
    updateMany: jest.fn(),
  },
  taskComment: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  describe('findAllUsers', () => {
    it('returns all users ordered by id', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([
        {
          id: 1,
          email: 'a@test.com',
          firstName: 'A',
          lastName: null,
          nationalCode: null,
          phone: null,
          birthDate: null,
          role: 'user',
        },
      ]);

      const result = await service.findAllUsers();
      expect(result).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          nationalCode: true,
          phone: true,
          birthDate: true,
          role: true,
        },
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('deleteUser', () => {
    it('success — returns { success: true }', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ role: 'user' });
      mockPrisma.$transaction.mockResolvedValueOnce([
        { count: 0 },
        { count: 0 },
        { id: 2 },
      ]);

      const result = await service.deleteUser(2, 1);
      expect(result).toEqual({ success: true });
    });

    it('self-delete throws BadRequestException', async () => {
      await expect(service.deleteUser(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('superAdmin target throws BadRequestException', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ role: 'superAdmin' });

      await expect(service.deleteUser(2, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nonexistent user throws NotFoundException', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.deleteUser(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserRole', () => {
    it('success — returns updated user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ role: 'user' });
      mockPrisma.user.update.mockResolvedValueOnce({
        id: 2,
        email: 'b@test.com',
        firstName: 'B',
        lastName: null,
        nationalCode: null,
        phone: null,
        birthDate: null,
        role: 'admin',
      });

      const result = await service.updateUserRole(2, 'admin', 1);
      expect(result.role).toBe('admin');
    });

    it('self-modification throws BadRequestException', async () => {
      await expect(service.updateUserRole(1, 'admin', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('invalid role value throws BadRequestException', async () => {
      await expect(
        service.updateUserRole(2, 'superAdmin', 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('superAdmin target throws BadRequestException', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ role: 'superAdmin' });

      await expect(service.updateUserRole(2, 'admin', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nonexistent user throws NotFoundException', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateUserRole(999, 'admin', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserPassword', () => {
    it('success — returns { success: true }', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ role: 'user' });
      mockPrisma.user.update.mockResolvedValueOnce({});

      const result = await service.updateUserPassword(2, 'NewPass123!', 1);
      expect(result).toEqual({ success: true });
    });

    it('self-change throws BadRequestException', async () => {
      await expect(
        service.updateUserPassword(1, 'NewPass123!', 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('short password throws BadRequestException', async () => {
      await expect(service.updateUserPassword(2, 'abc', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('empty password throws BadRequestException', async () => {
      await expect(service.updateUserPassword(2, '', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('superAdmin target throws BadRequestException', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ role: 'superAdmin' });

      await expect(
        service.updateUserPassword(2, 'NewPass123!', 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('nonexistent user throws NotFoundException', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateUserPassword(999, 'NewPass123!', 1),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
