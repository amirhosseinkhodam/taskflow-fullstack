import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from '../../src/project/project.controller';
import { ProjectService } from '../../src/project/project.service';

describe('ProjectController', () => {
  let controller: ProjectController;
  let projectService: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: 1, name: 'P' }),
            update: jest.fn().mockResolvedValue({ id: 1, name: 'P' }),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get(ProjectController);
    projectService = module.get(ProjectService);
  });

  it('getProjects() — delegates to findAll()', async () => {
    await controller.getProjects();
    expect(projectService.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOneProject() — delegates with id', async () => {
    await controller.findOneProject(5);
    expect(projectService.findOne).toHaveBeenCalledWith(5);
  });

  it('createProject() — delegates with body.name', async () => {
    await controller.createProject({ name: 'New' });
    expect(projectService.create).toHaveBeenCalledWith('New');
  });

  it('updateProject() — delegates with id + body.name', async () => {
    await controller.updateProject(3, { name: 'Updated' });
    expect(projectService.update).toHaveBeenCalledWith(3, 'Updated');
  });

  it('deleteProject() — delegates with id', async () => {
    await controller.deleteProject(3);
    expect(projectService.delete).toHaveBeenCalledWith(3);
  });
});
