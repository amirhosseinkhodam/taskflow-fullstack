import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { ProjectModel } from '@shared/types/project.model';
import { ProjectService } from './project.service';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getProjects(): Promise<ProjectModel[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  async findOneProject(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProjectModel | null> {
    return this.projectService.findOne(id);
  }

  @Post()
  async createProject(@Body() body: CreateProjectDto): Promise<ProjectModel> {
    return this.projectService.create(body.name);
  }

  @Put(':id')
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProjectDto,
  ): Promise<boolean> {
    return this.projectService.update(id, body.name);
  }

  @Delete(':id')
  async deleteProject(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.projectService.delete(id);
  }
}
