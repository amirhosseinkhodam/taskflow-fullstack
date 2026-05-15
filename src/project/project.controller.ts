import { Body, Controller, Get, Post } from '@nestjs/common';
import type { ProjectModel } from 'src/project/project.model';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  getProjects(): ProjectModel[] {
    return this.projectService.findAll();
  }

  @Post()
  createProject(@Body() body: CreateProjectDto): ProjectModel {
    return this.projectService.create(body.name);
  }
}
