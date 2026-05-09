import { Body, Controller, Get, Post } from '@nestjs/common';

interface ProjectModel {
  id: number;
  name: string;
}

@Controller('project')
export class ProjectController {
  private projects: ProjectModel[] = [];

  @Get()
  getProjects() {
    return this.projects;
  }

  @Post()
  createProject(@Body() body: { name: string }): ProjectModel {
    const newProject = { id: Date.now(), name: body.name };
    this.projects.push(newProject);
    return newProject;
  }
}
