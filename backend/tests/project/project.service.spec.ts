import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from '../../src/project/project.service';
import { TaskService } from '../../src/task/task.service';
import { PrismaService } from '../../src/shared/prisma/prisma.service';

const mockPrisma = {
  project: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as any;

const mockTaskService = {
  deleteByProject: jest.fn().mockResolvedValue(undefined),
} as any;

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TaskService, useValue: mockTaskService },
      ],
    }).compile();

    service = module.get(ProjectService);
  });

  describe('findAll', () => {
    it('returns all projects ordered by id', async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([
        { id: 1, name: 'P1', createdAt: new Date(), updatedAt: new Date() },
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('existing id returns project', async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: 1,
        name: 'P1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.findOne(1);
      expect(result).toBeDefined();
      expect(result!.id).toBe(1);
    });

    it('nonexistent id returns null', async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce(null);

      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns project', async () => {
      mockPrisma.project.create.mockResolvedValueOnce({
        id: 1,
        name: 'New',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create('New');
      expect(result.name).toBe('New');
    });
  });

  describe('update', () => {
    it('name provided — updates and returns project', async () => {
      mockPrisma.project.update.mockResolvedValueOnce({
        id: 1,
        name: 'Updated',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update(1, 'Updated');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Updated');
    });

    it('name undefined — returns null immediately', async () => {
      const result = await service.update(1, undefined);
      expect(result).toBeNull();
      expect(mockPrisma.project.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('calls taskService.deleteByProject then deletes project', async () => {
      mockPrisma.project.delete.mockResolvedValueOnce({ id: 1 });

      const result = await service.delete(1);

      expect(mockTaskService.deleteByProject).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('nonexistent project returns false', async () => {
      mockPrisma.project.delete.mockRejectedValueOnce(
        new Error('Record to delete does not exist'),
      );

      await expect(service.delete(999)).rejects.toThrow();
    });
  });
});
