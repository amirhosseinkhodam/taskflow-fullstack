import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskService } from '../../src/task/task.service';
import { PrismaService } from '../../src/shared/prisma/prisma.service';

const mockPrisma = {
  project: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  task: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(TaskService);
  });

  describe('create', () => {
    it('inserts task at next position', async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrisma.task.aggregate.mockResolvedValueOnce({
        _max: { position: 2 },
      });
      mockPrisma.task.create.mockResolvedValueOnce({ id: 5 });
      mockPrisma.task.findUnique.mockResolvedValueOnce({
        id: 5,
        title: 'Test',
        description: 'desc',
        status: 'pending',
        projectId: 1,
        position: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        assigneeId: null,
        creator: { firstName: 'User', lastName: null, email: 'u@test.com' },
        assignee: null,
      });

      const result = await service.create('Test', 'desc', 1, 1);

      expect(result.id).toBe(5);
      expect(result.position).toBe(3);
    });

    it('first task in project gets position 0', async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrisma.task.aggregate.mockResolvedValueOnce({
        _max: { position: null },
      });
      mockPrisma.task.create.mockResolvedValueOnce({ id: 1 });
      mockPrisma.task.findUnique.mockResolvedValueOnce({
        id: 1,
        title: 'Test',
        description: '',
        status: 'pending',
        projectId: 1,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        assigneeId: null,
        creator: { firstName: 'User', lastName: null, email: 'u@test.com' },
        assignee: null,
      });

      const result = await service.create('Test', '', 1, 1);
      expect(result.position).toBe(0);
    });

    it('throws NotFoundException when project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce(null);

      await expect(service.create('Test', '', 999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('no filters — returns paginated response', async () => {
      mockPrisma.task.count.mockResolvedValueOnce(0);
      mockPrisma.task.findMany.mockResolvedValueOnce([]);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 1,
      });
    });

    it('filter by projectId', async () => {
      mockPrisma.task.count.mockResolvedValueOnce(1);
      mockPrisma.task.findMany.mockResolvedValueOnce([
        {
          id: 1,
          title: 'T',
          description: '',
          status: 'pending',
          projectId: 3,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1,
          assigneeId: null,
          creator: null,
          assignee: null,
        },
      ]);

      await service.findAll({ projectId: 3 });

      const whereCall = mockPrisma.task.count.mock.calls[0][0];
      expect(whereCall.where.projectId).toBe(3);
    });

    it('filter by status', async () => {
      mockPrisma.task.count.mockResolvedValueOnce(0);
      mockPrisma.task.findMany.mockResolvedValueOnce([]);

      await service.findAll({ status: 'pending' });

      const whereCall = mockPrisma.task.count.mock.calls[0][0];
      expect(whereCall.where.status).toBe('pending');
    });

    it('filter by searchTerm', async () => {
      mockPrisma.task.count.mockResolvedValueOnce(0);
      mockPrisma.task.findMany.mockResolvedValueOnce([]);

      await service.findAll({ searchTerm: 'foo' });

      const whereCall = mockPrisma.task.count.mock.calls[0][0];
      expect(whereCall.where.OR).toBeDefined();
    });

    it('pagination — page=2, limit=10', async () => {
      mockPrisma.task.count.mockResolvedValueOnce(25);
      mockPrisma.task.findMany.mockResolvedValueOnce([]);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
    });

    it('clamps page<1 to 1, limit>100 to 100', async () => {
      mockPrisma.task.count.mockResolvedValueOnce(0);
      mockPrisma.task.findMany.mockResolvedValueOnce([]);

      const result = await service.findAll({ page: -5, limit: 200 });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
    });
  });

  describe('findOne', () => {
    it('existing id returns task', async () => {
      mockPrisma.task.findUnique.mockResolvedValueOnce({
        id: 1,
        title: 'Test',
        description: '',
        status: 'pending',
        projectId: 1,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        assigneeId: null,
        creator: null,
        assignee: null,
      });

      const result = await service.findOne(1);
      expect(result).toBeDefined();
      expect(result!.id).toBe(1);
    });

    it('nonexistent id returns null', async () => {
      mockPrisma.task.findUnique.mockResolvedValueOnce(null);

      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates title only', async () => {
      mockPrisma.task.findUnique.mockResolvedValueOnce({
        id: 1,
        userId: 1,
        assigneeId: null,
      });
      mockPrisma.task.updateMany.mockResolvedValueOnce({ count: 1 });

      const result = await service.update(1, 1, 'admin', 'New Title');

      expect(result).toBe(true);
      const dataCall = mockPrisma.task.updateMany.mock.calls[0][0];
      expect(dataCall.data.title).toBe('New Title');
    });

    it('updates multiple fields', async () => {
      mockPrisma.task.findUnique.mockResolvedValueOnce({
        id: 1,
        userId: 1,
        assigneeId: null,
      });
      mockPrisma.task.updateMany.mockResolvedValueOnce({ count: 1 });

      const result = await service.update(
        1,
        1,
        'admin',
        'Title',
        'Desc',
        'done',
      );

      expect(result).toBe(true);
      const dataCall = mockPrisma.task.updateMany.mock.calls[0][0];
      expect(dataCall.data.title).toBe('Title');
      expect(dataCall.data.description).toBe('Desc');
      expect(dataCall.data.status).toBe('done');
    });

    it('no fields provided returns false', async () => {
      mockPrisma.task.findUnique.mockResolvedValueOnce({
        id: 1,
        userId: 1,
        assigneeId: null,
      });

      const result = await service.update(1, 1, 'admin');

      expect(result).toBe(false);
    });

    it('nonexistent task throws NotFoundException', async () => {
      mockPrisma.task.findUnique.mockResolvedValueOnce(null);

      await expect(service.update(999, 1, 'admin', 'Title')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reorder', () => {
    it('empty taskIds throws BadRequestException', async () => {
      await expect(service.reorder([])).rejects.toThrow(BadRequestException);
    });

    it('duplicate IDs throws BadRequestException', async () => {
      await expect(service.reorder([1, 1])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('success — calls $transaction with updates', async () => {
      mockPrisma.task.findMany.mockResolvedValueOnce([
        { id: 1, projectId: 1 },
        { id: 2, projectId: 1 },
      ]);
      mockPrisma.$transaction.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);

      await service.reorder([1, 2]);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('success — accepts task IDs from different projects', async () => {
      mockPrisma.task.findMany.mockResolvedValueOnce([
        { id: 1, projectId: 1 },
        { id: 2, projectId: 3 },
      ]);
      mockPrisma.$transaction.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);

      await expect(service.reorder([1, 2])).resolves.toBeUndefined();

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('error triggers rejection', async () => {
      mockPrisma.task.findMany.mockResolvedValueOnce([{ id: 1, projectId: 1 }]);
      mockPrisma.$transaction.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.reorder([1])).rejects.toThrow('DB error');
    });
  });

  describe('delete', () => {
    it('existing task returns true', async () => {
      mockPrisma.task.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrisma.task.delete.mockResolvedValueOnce({ id: 1 });

      const result = await service.delete(1);
      expect(result).toBe(true);
    });

    it('nonexistent task throws NotFoundException', async () => {
      mockPrisma.task.findUnique.mockResolvedValueOnce(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteByProject', () => {
    it('runs deleteMany with projectId', async () => {
      mockPrisma.task.deleteMany.mockResolvedValueOnce({ count: 3 });

      await service.deleteByProject(5);

      expect(mockPrisma.task.deleteMany).toHaveBeenCalledWith({
        where: { projectId: 5 },
      });
    });
  });
});
