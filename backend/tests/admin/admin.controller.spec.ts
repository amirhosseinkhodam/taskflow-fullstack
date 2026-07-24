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
    const spy = jest.spyOn(adminService, 'findAllUsers');
    await controller.getUsers();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('deleteUser() — delegates with id + req.user.id', async () => {
    const spy = jest.spyOn(adminService, 'deleteUser');
    const req = { user: { id: 1 } } as any;
    await controller.deleteUser(2, req);
    expect(spy).toHaveBeenCalledWith(2, 1);
  });

  it('updateUserRole() — delegates with id, role, req.user.id', async () => {
    const spy = jest.spyOn(adminService, 'updateUserRole');
    const dto = { role: 'admin' as const };
    const req = { user: { id: 1 } } as any;
    await controller.updateUserRole(2, dto, req);
    expect(spy).toHaveBeenCalledWith(2, 'admin', 1);
  });

  it('changeUserPassword() — delegates with id, password, req.user.id', async () => {
    const spy = jest.spyOn(adminService, 'updateUserPassword');
    const dto = { password: 'newpass123' };
    const req = { user: { id: 1 } } as any;
    await controller.changeUserPassword(2, dto, req);
    expect(spy).toHaveBeenCalledWith(2, 'newpass123', 1);
  });
});
