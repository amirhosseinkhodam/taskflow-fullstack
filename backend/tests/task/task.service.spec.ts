import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TaskService } from '../../src/task/task.service';

const mockQuery = jest.fn();
const mockConnect = jest.fn();
const mockRelease = jest.fn();
const mockClient = {
  query: jest.fn(),
  release: mockRelease,
};
const mockPool = { query: mockQuery, connect: mockConnect } as any;

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConnect.mockResolvedValue(mockClient);
    mockClient.query.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskService, { provide: 'DATABASE', useValue: mockPool }],
    }).compile();

    service = module.get(TaskService);
  });

  describe('create', () => {
    it('inserts task at next position', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ max: 2 }] })
        .mockResolvedValueOnce({ rows: [{ id: 5 }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 5,
              title: 'Test',
              description: 'desc',
              status: 'pending',
              projectId: 1,
              position: 3,
              createdAt: '',
              updatedAt: '',
              userId: 1,
              creatorName: 'User',
            },
          ],
        });

      const result = await service.create('Test', 'desc', 1, 1);

      expect(result.id).toBe(5);
      expect(result.position).toBe(3);
    });

    it('first task in project gets position 0', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ max: null }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              title: 'Test',
              description: '',
              status: 'pending',
              projectId: 1,
              position: 0,
              createdAt: '',
              updatedAt: '',
              userId: 1,
              creatorName: 'User',
            },
          ],
        });

      const result = await service.create('Test', '', 1, 1);
      expect(result.position).toBe(0);
    });

    it('throws NotFoundException when project does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(service.create('Test', '', 999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('no filters — returns paginated response', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

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
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await service.findAll({ projectId: 3 });

      const countCall = mockQuery.mock.calls[0];
      expect(countCall[0]).toContain('"projectId" = $1');
      expect(countCall[1]).toContain(3);
    });

    it('filter by status', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await service.findAll({ status: 'pending' });

      const countCall = mockQuery.mock.calls[0];
      expect(countCall[0]).toContain('t.status = $1');
    });

    it('filter by searchTerm', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await service.findAll({ searchTerm: 'foo' });

      const countCall = mockQuery.mock.calls[0];
      expect(countCall[0]).toContain('ILIKE');
    });

    it('pagination — page=2, limit=10', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '25' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
    });

    it('clamps page<1 to 1, limit>100 to 100', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.findAll({ page: -5, limit: 200 });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
    });
  });

  describe('findOne', () => {
    it('existing id returns task', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, title: 'Test', status: 'pending' }],
      });

      const result = await service.findOne(1);
      expect(result).toBeDefined();
      expect(result!.id).toBe(1);
    });

    it('nonexistent id returns null', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates title only', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, userId: 1 }] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.update(1, 1, 'admin', 'New Title');

      expect(result).toBe(true);
      const updateCall = mockQuery.mock.calls[1][0];
      expect(updateCall).toContain('title = $1');
      expect(updateCall).not.toContain('description =');
    });

    it('updates multiple fields', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, userId: 1 }] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.update(
        1,
        1,
        'admin',
        'Title',
        'Desc',
        'done',
      );

      expect(result).toBe(true);
      const updateCall = mockQuery.mock.calls[1][0];
      expect(updateCall).toContain('title = $1');
      expect(updateCall).toContain('description = $2');
      expect(updateCall).toContain('status = $3');
      expect(updateCall).toContain('"updatedAt"');
    });

    it('no fields provided returns false', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, userId: 1 }] });

      const result = await service.update(1, 1, 'admin');

      expect(result).toBe(false);
    });

    it('nonexistent task throws NotFoundException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(service.update(999, 1, 'admin', 'Title')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('non-owner non-admin gets ForbiddenException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, userId: 2 }] });

      await expect(service.update(1, 1, 'user', 'Title')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('reorder', () => {
    it('empty taskIds throws BadRequestException', async () => {
      await expect(service.reorder([], 1, 'admin')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('duplicate IDs throws BadRequestException', async () => {
      await expect(service.reorder([1, 1], 1, 'admin')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('success — calls BEGIN, UPDATE for each id, COMMIT', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 1, projectId: 1, userId: 1 },
          { id: 2, projectId: 1, userId: 1 },
        ],
      });

      await service.reorder([1, 2], 1, 'admin');

      expect(mockConnect).toHaveBeenCalled();
      const clientQueries = mockClient.query.mock.calls.map(
        (c: unknown[]) => (c as unknown[][])[0],
      );
      expect(clientQueries).toContain('BEGIN');
      expect(clientQueries).toContain('COMMIT');
      expect(mockRelease).toHaveBeenCalled();
    });

    it('error triggers ROLLBACK and client.release()', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, projectId: 1, userId: 1 }],
      });
      mockClient.query.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.reorder([1], 1, 'admin')).rejects.toThrow(
        'DB error',
      );

      const clientQueries = mockClient.query.mock.calls.map(
        (c: unknown[]) => (c as unknown[][])[0],
      );
      expect(clientQueries).toContain('ROLLBACK');
      expect(mockRelease).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('existing task returns true', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, userId: 1 }] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.delete(1, 1, 'admin');
      expect(result).toBe(true);
    });

    it('nonexistent task throws NotFoundException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(service.delete(999, 1, 'admin')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('non-owner non-admin gets ForbiddenException', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, userId: 2 }] });

      await expect(service.delete(1, 1, 'user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('deleteByProject', () => {
    it('runs DELETE with projectId', async () => {
      mockQuery.mockResolvedValueOnce({});

      await service.deleteByProject(5);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM tasks'),
        [5],
      );
    });
  });
});
