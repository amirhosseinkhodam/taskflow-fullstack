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
import { AdminService } from './admin.service';

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
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.#adminService.deleteUser(id, req.user.id);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: 'user' | 'admin',
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.#adminService.updateUserRole(id, role, req.user.id);
  }

  @Post('users/:id/change-password')
  changeUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('password') password: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.#adminService.updateUserPassword(id, password, req.user.id);
  }
}
