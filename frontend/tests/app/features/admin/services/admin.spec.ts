import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AdminService } from '../../../../../src/app/features/admin/services/admin';
import { HTTP_METHODS } from '../../../../../src/app/shared/const/http-methods';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const API = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('getUsers() — GET /admin/users', () => {
    service.getUsers().subscribe();

    const req = httpMock.expectOne(`${API}/admin/users`);
    expect(req.request.method).toBe(HTTP_METHODS.GET);
    req.flush([]);
  });

  it('deleteUser(id) — DELETE /admin/users/{id}', () => {
    service.deleteUser(1).subscribe();

    const req = httpMock.expectOne(`${API}/admin/users/1`);
    expect(req.request.method).toBe(HTTP_METHODS.DELETE);
    req.flush(null);
  });

  it('updateUserRole(id, role) — PATCH /admin/users/{id}/role with { role }', () => {
    service.updateUserRole(1, 'admin').subscribe();

    const req = httpMock.expectOne(`${API}/admin/users/1/role`);
    expect(req.request.method).toBe(HTTP_METHODS.PATCH);
    expect(req.request.body).toEqual({ role: 'admin' });
    req.flush({ id: 1, role: 'admin' });
  });

  it('changeUserPassword(id, password) — POST /admin/users/{id}/change-password', () => {
    service.changeUserPassword(1, 'newpass').subscribe();

    const req = httpMock.expectOne(`${API}/admin/users/1/change-password`);
    expect(req.request.method).toBe(HTTP_METHODS.POST);
    expect(req.request.body).toEqual({ password: 'newpass' });
    req.flush(null);
  });
});
