import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from '../../src/admin/admin.service';

const mockQuery = jest.fn();
const mockPool = { query: mockQuery } as any;

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: 'DATABASE', useValue: mockPool }],
    }).compile();

    service = module.get(AdminService);
  });

  describe('findAllUsers', () => {
    it('returns all users ordered by id', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'a@test.com', name: 'A', role: 'user' }],
      });

      const result = await service.findAllUsers();
      expect(result).toHaveLength(1);
      expect(mockQuery.mock.calls[0][0]).toContain('ORDER BY id');
    });
  });

  describe('deleteUser', () => {
    it('success — returns { success: true }', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ role: 'user' }] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.deleteUser(2, 1);
      expect(result).toEqual({ success: true });
    });

    it('self-delete throws BadRequestException', async () => {
      await expect(service.deleteUser(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('superAdmin target throws BadRequestException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'superAdmin' }] });

      await expect(service.deleteUser(2, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nonexistent user throws NotFoundException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(service.deleteUser(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('delete returns rowCount=0 throws NotFoundException', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ role: 'user' }] })
        .mockResolvedValueOnce({ rowCount: 0 });

      await expect(service.deleteUser(2, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserRole', () => {
    it('success — returns updated user', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ role: 'user' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 2, email: 'b@test.com', name: 'B', role: 'admin' }],
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
      await expect(service.updateUserRole(2, 'superAdmin', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('superAdmin target throws BadRequestException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'superAdmin' }] });

      await expect(service.updateUserRole(2, 'admin', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nonexistent user throws NotFoundException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(service.updateUserRole(999, 'admin', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserPassword', () => {
    it('success — returns { success: true }', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ role: 'user' }] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.updateUserPassword(2, 'newpass123', 1);
      expect(result).toEqual({ success: true });
    });

    it('self-change throws BadRequestException', async () => {
      await expect(
        service.updateUserPassword(1, 'newpass123', 1),
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
      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'superAdmin' }] });

      await expect(
        service.updateUserPassword(2, 'newpass123', 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('nonexistent user throws NotFoundException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.updateUserPassword(999, 'newpass123', 1),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
