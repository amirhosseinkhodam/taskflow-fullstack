import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '@shared/types/auth';
import { AdminService } from './admin.service';
import { AdminChangeRoleDto, AdminChangePasswordDto } from './admin.dto';

@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  readonly #adminService: AdminService;
  constructor(adminService: AdminService) {
    this.#adminService = adminService;
  }

  @Get('users')
  getUsers() {
    return this.#adminService.findAllUsers();
  }

  @Delete('users/:id')
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.#adminService.deleteUser(id, req.user.id);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminChangeRoleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.#adminService.updateUserRole(id, dto.role, req.user.id);
  }

  @Post('users/:id/change-password')
  changeUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminChangePasswordDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.#adminService.updateUserPassword(id, dto.password, req.user.id);
  }
}
