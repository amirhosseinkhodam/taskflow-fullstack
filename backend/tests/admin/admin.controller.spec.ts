import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            findAllUsers: jest.fn().mockResolvedValue([]),
            deleteUser: jest.fn().mockResolvedValue({ success: true }),
            updateUserRole: jest
              .fn()
              .mockResolvedValue({ id: 1, role: 'admin' }),
            updateUserPassword: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get(AdminController);
    adminService = module.get(AdminService);
  });

  it('getUsers() — delegates to findAllUsers()', async () => {
    await controller.getUsers();
    expect(adminService.findAllUsers).toHaveBeenCalledTimes(1);
  });

  it('deleteUser() — delegates with id + req.user.id', async () => {
    const req = { user: { id: 1 } } as any;
    await controller.deleteUser(2, req);
    expect(adminService.deleteUser).toHaveBeenCalledWith(2, 1);
  });

  it('updateUserRole() — delegates with id, role, req.user.id', async () => {
    const dto = { role: 'admin' as const };
    const req = { user: { id: 1 } } as any;
    await controller.updateUserRole(2, dto, req);
    expect(adminService.updateUserRole).toHaveBeenCalledWith(2, 'admin', 1);
  });

  it('changeUserPassword() — delegates with id, password, req.user.id', async () => {
    const dto = { password: 'newpass123' };
    const req = { user: { id: 1 } } as any;
    await controller.changeUserPassword(2, dto, req);
    expect(adminService.updateUserPassword).toHaveBeenCalledWith(
      2,
      'newpass123',
      1,
    );
  });
});
