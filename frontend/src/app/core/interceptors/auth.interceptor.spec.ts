import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { AuthStore } from '../../features/auth/store/auth';
import { authInterceptor } from './auth.interceptor';

class MockAuthStore {
  #token = signal<string | null>(null);

  token = () => this.#token();

  setToken(value: string | null) {
    this.#token.set(value);
  }
}

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockStore: MockAuthStore;

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockStore = new MockAuthStore();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: mockStore },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass request through without Authorization header when no token', () => {
    mockStore.setToken(null);

    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should add Authorization header when token exists', () => {
    const testToken = 'eyJhbGciOiJIUzI1NiJ9.test';
    mockStore.setToken(testToken);

    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${testToken}`,
    );
    req.flush({});
  });

  it('should preserve existing headers when adding Authorization', () => {
    const testToken = 'eyJhbGciOiJIUzI1NiJ9.test';
    mockStore.setToken(testToken);

    httpClient.get('/test', { headers: { 'X-Custom': 'value' } }).subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${testToken}`,
    );
    expect(req.request.headers.get('X-Custom')).toBe('value');
    req.flush({});
  });
});
