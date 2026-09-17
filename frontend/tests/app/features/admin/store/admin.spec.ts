import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { of, throwError } from 'rxjs';
import { AdminService } from '../../../../../src/app/features/admin/services/admin';
import { AdminStore } from '../../../../../src/app/features/admin/store/admin';
import { NotificationService } from '../../../../../src/app/shared/services/notification';

const mockAdminService = {
  getUsers: jest.fn().mockReturnValue(of([])),
  deleteUser: jest.fn().mockReturnValue(of(undefined)),
  updateUserRole: jest.fn(),
  changeUserPassword: jest.fn(),
};

const mockNotification = { show: jest.fn(), dismiss: jest.fn() };

const mockUserAlice = {
  id: 1,
  email: 'a@b.com',
  firstName: 'Alice',
  lastName: null,
  nationalCode: null,
  phone: null,
  birthDate: null,
  role: 'user' as const,
};

const mockUserBob = {
  id: 2,
  email: 'c@d.com',
  firstName: 'Bob',
  lastName: null,
  nationalCode: null,
  phone: null,
  birthDate: null,
  role: 'admin' as const,
};

describe('AdminStore', () => {
  let store: InstanceType<typeof AdminStore>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllMocks();
    mockAdminService.getUsers.mockReturnValue(of([]));
    mockAdminService.deleteUser.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        AdminStore,
        { provide: AdminService, useValue: mockAdminService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    });

    store = TestBed.inject(AdminStore);
  });

  function freshStore(): InstanceType<typeof AdminStore> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AdminStore,
        { provide: AdminService, useValue: mockAdminService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    });
    return TestBed.inject(AdminStore);
  }

  it('should have correct initial state', () => {
    expect(store.users()).toEqual([]);
    expect(store.isLoading()).toBe(false);
  });

  it('userCount should return 0 when users is empty', () => {
    expect(store.userCount()).toBe(0);
  });

  it('userCount should return correct count', () => {
    patchState(store, {
      users: [mockUserAlice, mockUserBob],
    });
    expect(store.userCount()).toBe(2);
  });

  it('onInit should call loadUsers', () => {
    expect(mockAdminService.getUsers).toHaveBeenCalled();
  });

  it('loadUsers should update users on success', () => {
    const users = [mockUserAlice, mockUserBob];
    mockAdminService.getUsers.mockReturnValue(of(users));

    const fresh = freshStore();

    expect(fresh.users()).toEqual(users);
    expect(fresh.userCount()).toBe(2);
    expect(fresh.isLoading()).toBe(false);
  });

  describe('result reporting goes through notifications only', () => {
    it('exposes no message state for the page to render', () => {
      expect('message' in store).toBe(false);
    });

    it('notifies on a successful role update', () => {
      const promoted = { ...mockUserAlice, role: 'admin' as const };
      mockAdminService.updateUserRole.mockReturnValue(of(promoted));
      patchState(store, { users: [mockUserAlice, mockUserBob] });

      store.updateUserRole({ id: 1, role: 'admin' });

      expect(mockNotification.show).toHaveBeenCalledWith(
        'success',
        'roleUpdated',
      );
      expect(store.users()[0].role).toBe('admin');
    });

    it('notifies on a failed role update', () => {
      mockAdminService.updateUserRole.mockReturnValue(
        throwError(() => new Error('boom')),
      );

      store.updateUserRole({ id: 1, role: 'admin' });

      expect(mockNotification.show).toHaveBeenCalledWith(
        'error',
        'couldNotUpdateRole',
      );
    });

    it('notifies on a successful user deletion', () => {
      mockAdminService.deleteUser.mockReturnValue(of(undefined));
      patchState(store, { users: [mockUserAlice, mockUserBob] });

      store.deleteUser(1);

      expect(mockNotification.show).toHaveBeenCalledWith(
        'success',
        'userDeleted',
      );
      expect(store.users()).toEqual([mockUserBob]);
    });

    it('notifies on a successful password change', () => {
      mockAdminService.changeUserPassword.mockReturnValue(of(undefined));

      store.changePassword({ userId: 1, newPassword: 'Str0ng!pass' });

      expect(mockNotification.show).toHaveBeenCalledWith(
        'success',
        'passwordChanged',
      );
    });

    it('surfaces the specific backend password error in the notification', () => {
      mockAdminService.changeUserPassword.mockReturnValue(
        throwError(() => ({
          error: { message: 'Password is too common' },
        })),
      );

      store.changePassword({ userId: 1, newPassword: 'password' });

      expect(mockNotification.show).toHaveBeenCalledWith(
        'error',
        'passwordTooCommon',
      );
    });

    it('falls back to a generic password error for unmapped messages', () => {
      mockAdminService.changeUserPassword.mockReturnValue(
        throwError(() => ({ error: { message: 'something unexpected' } })),
      );

      store.changePassword({ userId: 1, newPassword: 'x' });

      expect(mockNotification.show).toHaveBeenCalledWith(
        'error',
        'couldNotChangePassword',
      );
    });

    it('notifies when users cannot be loaded', () => {
      mockAdminService.getUsers.mockReturnValue(
        throwError(() => new Error('boom')),
      );

      const fresh = freshStore();

      expect(mockNotification.show).toHaveBeenCalledWith(
        'error',
        'couldNotLoadUsers',
      );
      expect(fresh.isLoading()).toBe(false);
    });
  });
});
