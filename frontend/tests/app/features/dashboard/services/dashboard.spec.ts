import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DashboardService } from '../../../../../src/app/features/dashboard/services/dashboard';
import { HTTP_METHODS } from '../../../../../src/app/shared/const/http-methods';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  const API = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getHealth() — GET /api/health', () => {
    service.getHealth().subscribe();

    const req = httpMock.expectOne(`${API}/api/health`);
    expect(req.request.method).toBe(HTTP_METHODS.GET);
    req.flush({ status: 'ok' });
  });

  it('getTask(id) — GET /tasks/{id}', () => {
    service.getTask(42).subscribe();

    const req = httpMock.expectOne(`${API}/tasks/42`);
    expect(req.request.method).toBe(HTTP_METHODS.GET);
    req.flush({ id: 42, title: 'T' });
  });

  it('getProjects() — GET /projects', () => {
    service.getProjects().subscribe();

    const req = httpMock.expectOne(`${API}/projects`);
    expect(req.request.method).toBe(HTTP_METHODS.GET);
    req.flush([]);
  });

  it('getTasks() — no filters sends GET /tasks', () => {
    service.getTasks().subscribe();

    const req = httpMock.expectOne(`${API}/tasks`);
    expect(req.request.method).toBe(HTTP_METHODS.GET);
    req.flush({ data: [], total: 0, page: 1, limit: 5, totalPages: 1 });
  });

  it('getTasks() — with filters sends correct query params', () => {
    service
      .getTasks({ projectId: 5, status: 'pending', searchTerm: 'foo' })
      .subscribe();

    const req = httpMock.expectOne(
      `${API}/tasks?projectId=5&status=pending&search=foo`,
    );
    expect(req.request.method).toBe(HTTP_METHODS.GET);
    req.flush({ data: [], total: 0, page: 1, limit: 5, totalPages: 1 });
  });

  it('createProject(name) — POST /projects with { name }', () => {
    service.createProject('My Project').subscribe();

    const req = httpMock.expectOne(`${API}/projects`);
    expect(req.request.method).toBe(HTTP_METHODS.POST);
    expect(req.request.body).toEqual({ name: 'My Project' });
    req.flush({ id: 1, name: 'My Project' });
  });

  it('updateProject(id, value) — PUT /projects/{id}', () => {
    service.updateProject(1, { name: 'New Name' }).subscribe();

    const req = httpMock.expectOne(`${API}/projects/1`);
    expect(req.request.method).toBe(HTTP_METHODS.PUT);
    expect(req.request.body).toEqual({ name: 'New Name' });
    req.flush({ id: 1, name: 'New Name' });
  });

  it('deleteProject(id) — DELETE /projects/{id}', () => {
    service.deleteProject(1).subscribe();

    const req = httpMock.expectOne(`${API}/projects/1`);
    expect(req.request.method).toBe(HTTP_METHODS.DELETE);
    req.flush(true);
  });

  it('createTask(value) — POST /tasks', () => {
    const payload = { title: 'T', description: 'D', projectId: 1 };
    service.createTask(payload).subscribe();

    const req = httpMock.expectOne(`${API}/tasks`);
    expect(req.request.method).toBe(HTTP_METHODS.POST);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, ...payload });
  });

  it('updateTask(id, value) — PUT /tasks/{id}', () => {
    service.updateTask(1, { title: 'Updated' }).subscribe();

    const req = httpMock.expectOne(`${API}/tasks/1`);
    expect(req.request.method).toBe(HTTP_METHODS.PUT);
    expect(req.request.body).toEqual({ title: 'Updated' });
    req.flush({ id: 1, title: 'Updated' });
  });

  it('reorderTasks(taskIds) — PATCH /tasks/reorder', () => {
    service.reorderTasks([3, 1, 2]).subscribe();

    const req = httpMock.expectOne(`${API}/tasks/reorder`);
    expect(req.request.method).toBe(HTTP_METHODS.PATCH);
    expect(req.request.body).toEqual({ taskIds: [3, 1, 2] });
    req.flush(null);
  });

  it('deleteTask(id) — DELETE /tasks/{id}', () => {
    service.deleteTask(1).subscribe();

    const req = httpMock.expectOne(`${API}/tasks/1`);
    expect(req.request.method).toBe(HTTP_METHODS.DELETE);
    req.flush(null);
  });
});
