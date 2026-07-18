import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { of } from 'rxjs';
import { AdminService } from '../../../../../src/app/features/admin/services/admin';
import { AdminStore } from '../../../../../src/app/features/admin/store/admin';

const mockAdminService = {
  getUsers: jest.fn().mockReturnValue(of([])),
  deleteUser: jest.fn().mockReturnValue(of(undefined)),
  updateUserRole: jest.fn(),
  changeUserPassword: jest.fn(),
};

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
      ],
    });

    store = TestBed.inject(AdminStore);
  });

  it('should have correct initial state', () => {
    expect(store.users()).toEqual([]);
    expect(store.message()).toBe('');
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

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AdminStore,
        { provide: AdminService, useValue: mockAdminService },
      ],
    });

    const freshStore = TestBed.inject(AdminStore);

    expect(freshStore.users()).toEqual(users);
    expect(freshStore.userCount()).toBe(2);
    expect(freshStore.isLoading()).toBe(false);
  });
});
