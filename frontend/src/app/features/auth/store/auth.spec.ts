import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStore } from './auth';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { LoginFormService } from '../forms/login';
import { RegisterFormService } from '../forms/register';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
};

const mockRouter = {
  navigate: jest.fn().mockResolvedValue(true),
  parseUrl: jest.fn(),
};

const mockLoginFormService = {
  form: {
    invalid: false,
    getRawValue: jest
      .fn()
      .mockReturnValue({ email: 'a@b.com', password: 'pass' }),
    reset: jest.fn(),
  },
};

const mockRegisterFormService = {
  form: {
    invalid: false,
    getRawValue: jest
      .fn()
      .mockReturnValue({ email: 'a@b.com', password: 'pass', name: 'Test' }),
    reset: jest.fn(),
  },
};

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: LoginFormService, useValue: mockLoginFormService },
        { provide: RegisterFormService, useValue: mockRegisterFormService },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have correct initial state', () => {
    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('isLoggedIn should be false when no token', () => {
    expect(store.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn should be true when token is set', () => {
    patchState(store, { token: 'jwt-token' });
    expect(store.isLoggedIn()).toBe(true);
  });

  it('isAdmin should be true when user has admin role', () => {
    patchState(store, {
      user: { id: 1, email: 'a@b.com', name: 'Admin', role: 'admin' },
    });
    expect(store.isAdmin()).toBe(true);
  });

  it('isAdmin should be true when user has superAdmin role', () => {
    patchState(store, {
      user: { id: 1, email: 'a@b.com', name: 'Super', role: 'superAdmin' },
    });
    expect(store.isAdmin()).toBe(true);
  });

  it('isAdmin should be false when user has user role', () => {
    patchState(store, {
      user: { id: 1, email: 'a@b.com', name: 'User', role: 'user' },
    });
    expect(store.isAdmin()).toBe(false);
  });

  it('restoreSession should leave state unchanged when no token in localStorage', () => {
    store.restoreSession();
    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
  });

  it('logout should clear state and navigate to /login', () => {
    patchState(store, {
      token: 'jwt-token',
      user: { id: 1, email: 'a@b.com', name: 'Test', role: 'admin' },
      error: 'some error',
      isLoading: true,
    });

    store.logout();

    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('login should call authService.login', () => {
    const response = {
      token: 'new-token',
      user: { id: 1, email: 'a@b.com', name: 'Test', role: 'user' as const },
    };
    mockAuthService.login.mockReturnValue(of(response));

    store.login();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
    });
  });

  it('login should update state on success', () => {
    const response = {
      token: 'new-token',
      user: { id: 1, email: 'a@b.com', name: 'Test', role: 'user' as const },
    };
    mockAuthService.login.mockReturnValue(of(response));

    store.login();

    expect(store.token()).toBe('new-token');
    expect(store.user()).toEqual(response.user);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('login should set error on 401 failure', () => {
    mockAuthService.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 })),
    );

    store.login();

    expect(store.error()).toBe('Invalid credentials');
    expect(store.isLoading()).toBe(false);
    expect(store.token()).toBeNull();
  });

  it('login should set generic error on non-401 failure', () => {
    mockAuthService.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    store.login();

    expect(store.error()).toBe('Login failed');
    expect(store.isLoading()).toBe(false);
  });

  it('login should not call authService when form is invalid', () => {
    mockLoginFormService.form.invalid = true;

    store.login();

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(store.token()).toBeNull();

    mockLoginFormService.form.invalid = false;
  });

  it('register should update state on success', () => {
    const response = {
      token: 'reg-token',
      user: { id: 2, email: 'a@b.com', name: 'Test', role: 'user' as const },
    };
    mockAuthService.register.mockReturnValue(of(response));

    store.register();

    expect(store.token()).toBe('reg-token');
    expect(store.user()).toEqual(response.user);
    expect(store.isLoading()).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'reg-token');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('register should set error on 409 failure', () => {
    mockAuthService.register.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );

    store.register();

    expect(store.error()).toBe('Email already registered');
    expect(store.isLoading()).toBe(false);
  });

  it('register should set generic error on non-409 failure', () => {
    mockAuthService.register.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    store.register();

    expect(store.error()).toBe('Registration failed');
    expect(store.isLoading()).toBe(false);
  });

  it('restoreSession should restore token and user from localStorage', () => {
    const payload = { sub: 1, email: 'a@b.com', name: 'Test', role: 'admin' };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    (Storage.prototype.getItem as jest.Mock).mockReturnValue(token);

    store.restoreSession();

    expect(store.token()).toBe(token);
    expect(store.user()).toEqual({
      id: 1,
      email: 'a@b.com',
      name: 'Test',
      role: 'admin',
    });
  });
});
