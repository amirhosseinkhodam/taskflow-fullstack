import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('login() — sends POST to /auth/login', () => {
    const payload = { email: 'test@test.com', password: 'pass123' };
    service.login(payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ token: 'jwt', user: { id: 1 } });
  });

  it('register() — sends POST to /auth/register', () => {
    const payload = {
      email: 'test@test.com',
      password: 'pass123',
      name: 'Test',
    };
    service.register(payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ token: 'jwt', user: { id: 1 } });
  });
});
