import { Body, Controller, Get, Post } from '@nestjs/common';
import type { ProjectModel } from 'src/shared/models/projects/project.model';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  getProjects(): ProjectModel[] {
    return this.projectService.findAll();
  }

  @Post()
  createProject(@Body() body: { name: string }): ProjectModel {
    return this.projectService.create(body.name);
  }
}
