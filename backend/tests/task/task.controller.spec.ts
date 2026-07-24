import { TaskController } from '../../src/task/task.controller';
import { TaskService } from '../../src/task/task.service';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({
              data: [],
              total: 0,
              page: 1,
              limit: 5,
              totalPages: 1,
            }),
            findOne: jest.fn().mockResolvedValue({ id: 1 }),
            create: jest.fn().mockResolvedValue({ id: 1 }),
            update: jest.fn().mockResolvedValue(true),
            reorder: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(TaskController);
    taskService = module.get(TaskService);
  });

  it('findAll() — no query params', async () => {
    const spy = jest.spyOn(taskService, 'findAll');
    await controller.findAll();
    expect(spy).toHaveBeenCalledWith({});
  });

  it('findAll() — with all query params', async () => {
    const spy = jest.spyOn(taskService, 'findAll');
    await controller.findAll('1', 'pending', 'foo', '2', '10');
    expect(spy).toHaveBeenCalledWith({
      projectId: 1,
      status: 'pending',
      searchTerm: 'foo',
      page: 2,
      limit: 10,
    });
  });

  it('findOne() — delegates with parsed id', async () => {
    const spy = jest.spyOn(taskService, 'findOne');
    await controller.findOne(5);
    expect(spy).toHaveBeenCalledWith(5);
  });

  it('create() — delegates with body + user id', async () => {
    const spy = jest.spyOn(taskService, 'create');
    const dto = { title: 'Test', description: 'desc', projectId: 1 };
    const req = { user: { id: 1 } } as any;
    await controller.create(dto, req);
    expect(spy).toHaveBeenCalledWith('Test', 'desc', 1, 1, undefined);
  });

  it('update() — delegates with all fields', async () => {
    const spy = jest.spyOn(taskService, 'update');
    const dto = {
      title: 'New',
      description: 'Desc',
      status: 'done',
      projectId: 2,
    };
    const req = { user: { id: 1, role: 'admin' } } as any;
    await controller.update(5, dto, req);
    expect(spy).toHaveBeenCalledWith(
      5,
      1,
      'admin',
      'New',
      'Desc',
      'done',
      2,
      undefined,
    );
  });

  it('reorder() — delegates with taskIds', async () => {
    const spy = jest.spyOn(taskService, 'reorder');
    const dto = { taskIds: [3, 1, 2] };
    const req = { user: { id: 1, role: 'admin' } } as any;
    await controller.reorder(dto, req);
    expect(spy).toHaveBeenCalledWith([3, 1, 2], 1, 'admin');
  });

  it('delete() — delegates with id', async () => {
    const spy = jest.spyOn(taskService, 'delete');
    const req = { user: { id: 1, role: 'admin' } } as any;
    await controller.delete(5, req);
    expect(spy).toHaveBeenCalledWith(5, 1, 'admin');
  });
});
