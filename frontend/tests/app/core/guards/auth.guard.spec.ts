import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { signal } from '@angular/core';
import { AuthStore } from '../../../../src/app/features/auth/store/auth';
import {
  authGuard,
  adminGuard,
} from '../../../../src/app/core/guards/auth.guard';

class MockAuthStore {
  #loggedIn = signal(false);
  #admin = signal(false);

  isLoggedIn = () => this.#loggedIn();
  isAdmin = () => this.#admin();

  setLoggedIn(value: boolean) {
    this.#loggedIn.set(value);
  }

  setAdmin(value: boolean) {
    this.#admin.set(value);
  }
}

describe('authGuard', () => {
  let mockStore: MockAuthStore;
  let mockRouter: { parseUrl: jest.Mock };
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    mockStore = new MockAuthStore();
    mockRouter = { parseUrl: jest.fn().mockReturnValue({} as UrlTree) };
  });

  it('should return true when logged in', () => {
    mockStore.setLoggedIn(true);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const result = authGuard(mockRoute, mockState);
      expect(result).toBe(true);
    });
  });

  it('should return /login UrlTree when not logged in', () => {
    mockStore.setLoggedIn(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const result = authGuard(mockRoute, mockState);
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/login');
      expect(result).toBe(mockRouter.parseUrl('/login'));
    });
  });
});

describe('adminGuard', () => {
  let mockStore: MockAuthStore;
  let mockRouter: { parseUrl: jest.Mock };
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    mockStore = new MockAuthStore();
    mockRouter = { parseUrl: jest.fn().mockReturnValue({} as UrlTree) };
  });

  it('should return true for admin user', () => {
    mockStore.setLoggedIn(true);
    mockStore.setAdmin(true);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const result = adminGuard(mockRoute, mockState);
      expect(result).toBe(true);
    });
  });

  it('should return / when non-admin user', () => {
    mockStore.setLoggedIn(true);
    mockStore.setAdmin(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const result = adminGuard(mockRoute, mockState);
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/');
      expect(result).toBe(mockRouter.parseUrl('/'));
    });
  });

  it('should return / when not logged in', () => {
    mockStore.setLoggedIn(false);
    mockStore.setAdmin(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const result = adminGuard(mockRoute, mockState);
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/');
      expect(result).toBe(mockRouter.parseUrl('/'));
    });
  });
});
