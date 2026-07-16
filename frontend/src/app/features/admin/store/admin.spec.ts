import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { of } from 'rxjs';
import { AdminStore } from './admin';
import { AdminService } from '../services/admin';
import { PasswordFormService } from '../forms/password';

const mockAdminService = {
  getUsers: jest.fn().mockReturnValue(of([])),
  deleteUser: jest.fn().mockReturnValue(of(undefined)),
  updateUserRole: jest.fn(),
  changeUserPassword: jest.fn(),
};

const mockPasswordForm = {
  form: {
    invalid: false,
    getRawValue: jest.fn().mockReturnValue({ newPassword: 'pass123' }),
    reset: jest.fn(),
  },
  resetForm: jest.fn(),
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
        { provide: PasswordFormService, useValue: mockPasswordForm },
      ],
    });

    store = TestBed.inject(AdminStore);
  });

  it('should have correct initial state', () => {
    expect(store.users()).toEqual([]);
    expect(store.message()).toBe('');
    expect(store.isLoading()).toBe(false);
    expect(store.passwordChangeUserId()).toBeNull();
  });

  it('userCount should return 0 when users is empty', () => {
    expect(store.userCount()).toBe(0);
  });

  it('userCount should return correct count', () => {
    patchState(store, {
      users: [
        { id: 1, email: 'a@b.com', name: 'Alice', role: 'user' },
        { id: 2, email: 'c@d.com', name: 'Bob', role: 'admin' },
      ],
    });
    expect(store.userCount()).toBe(2);
  });

  it('startPasswordChange should set passwordChangeUserId and reset form', () => {
    store.startPasswordChange(1);
    expect(store.passwordChangeUserId()).toBe(1);
    expect(mockPasswordForm.resetForm).toHaveBeenCalled();
  });

  it('cancelPasswordChange should clear passwordChangeUserId and reset form', () => {
    store.startPasswordChange(1);
    store.cancelPasswordChange();
    expect(store.passwordChangeUserId()).toBeNull();
    expect(mockPasswordForm.resetForm).toHaveBeenCalledTimes(2);
  });

  it('onInit should call loadUsers', () => {
    expect(mockAdminService.getUsers).toHaveBeenCalled();
  });

  it('loadUsers should update users on success', () => {
    const users = [
      { id: 1, email: 'a@b.com', name: 'Alice', role: 'user' as const },
      { id: 2, email: 'c@d.com', name: 'Bob', role: 'admin' as const },
    ];
    mockAdminService.getUsers.mockReturnValue(of(users));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AdminStore,
        { provide: AdminService, useValue: mockAdminService },
        { provide: PasswordFormService, useValue: mockPasswordForm },
      ],
    });

    const freshStore = TestBed.inject(AdminStore);

    expect(freshStore.users()).toEqual(users);
    expect(freshStore.userCount()).toBe(2);
    expect(freshStore.isLoading()).toBe(false);
  });
});
