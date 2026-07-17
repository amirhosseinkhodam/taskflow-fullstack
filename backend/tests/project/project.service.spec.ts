import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from '../../src/project/project.service';
import { TaskService } from '../../src/task/task.service';

const mockQuery = jest.fn();
const mockPool = { query: mockQuery } as any;

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
        { provide: 'DATABASE', useValue: mockPool },
        { provide: TaskService, useValue: mockTaskService },
      ],
    }).compile();

    service = module.get(ProjectService);
  });

  describe('findAll', () => {
    it('returns all projects ordered by id', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'P1', createdAt: '', updatedAt: '' }],
      });

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockQuery.mock.calls[0][0]).toContain('ORDER BY id');
    });
  });

  describe('findOne', () => {
    it('existing id returns project', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'P1', createdAt: '', updatedAt: '' }],
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

  describe('create', () => {
    it('inserts and returns project', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'New', createdAt: '', updatedAt: '' }],
      });

      const result = await service.create('New');
      expect(result.name).toBe('New');
    });
  });

  describe('update', () => {
    it('name provided — updates and returns project', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Updated', createdAt: '', updatedAt: '' }],
      });

      const result = await service.update(1, 'Updated');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Updated');
    });

    it('name undefined — returns null immediately', async () => {
      const result = await service.update(1, undefined);
      expect(result).toBeNull();
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('calls taskService.deleteByProject then deletes project', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.delete(1);

      expect(mockTaskService.deleteByProject).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('nonexistent project returns false', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const result = await service.delete(999);
      expect(result).toBe(false);
    });
  });
});
