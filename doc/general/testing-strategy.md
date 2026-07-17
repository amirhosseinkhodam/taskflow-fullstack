# Testing Strategy

Reusable testing approach and patterns. Adapt to your framework and team.

---

## 1. Testing Pyramid

```
        /\
       /  \        E2E Tests (few)
      /    \       — Critical user flows
     /------\
    /        \     Integration Tests (some)
   /          \    — API endpoints, component integration
  /------------\
 /              \  Unit Tests (many)
/                \ — Pure functions, services, components
```

**Ratio**: ~70% unit, ~20% integration, ~10% E2E

---

## 2. Unit Testing

### What to Unit Test
- Pure functions (no side effects)
- Service methods with mocked dependencies
- Component outputs (event emissions)
- Form validation logic
- Utility functions

### What NOT to Unit Test
- Framework boilerplate (Angular module setup)
- Third-party library behavior
- Simple getters/setters
- Template rendering (leave to integration tests)

### Patterns

#### Service Test (with mocked dependencies)
```ts
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches users', () => {
    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }, { id: 2 }]);
  });
});
```

#### Component Test (with store/service mocks)
```ts
describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardStore, useValue: mockStore },
      ],
    });
    fixture = TestBed.createComponent(DashboardComponent);
  });

  it('displays projects', () => {
    mockStore.projects.set([{ id: 1, name: 'Test' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test');
  });
});
```

---

## 3. Integration Testing

### What to Integration Test
- API endpoints (controller → service → database)
- Component + store interactions
- Route navigation
- Form submissions end-to-end

### Patterns

#### API Endpoint Test
```ts
describe('TaskController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /tasks creates a task', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test', projectId: 1 })
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect(res => {
        expect(res.body.title).toBe('Test');
      });
  });
});
```

---

## 4. E2E Testing

### What to E2E Test
- Critical user flows (login → create task → logout)
- Payment flows
- Registration and onboarding
- Cross-feature interactions

### Tools
- **Angular**: Cypress, Playwright
- **API**: Supertest, REST Client

---

## 5. Mocking Guidelines

### When to Mock
- External HTTP calls
- Database connections
- File system operations
- Time-dependent code (`Date.now()`, timers)
- Browser APIs (localStorage, notifications)

### When NOT to Mock
- The code under test itself
- Simple utility functions
- Angular core services (use real TestBed)

### Mocking Best Practices
- Mock at the boundary (service layer), not internal implementation
- Keep mocks simple — only stub what the test needs
- Verify interactions, not implementation details
- Use `jest.fn()` for function mocks, not manual objects

---

## 6. Test Organization

### File Structure
```
tests/
  backend/
    auth/
      auth.controller.spec.ts
      auth.service.spec.ts
    task/
      task.controller.spec.ts
      task.service.spec.ts
  frontend/
    app/
      shared/
        components/
          button.spec.ts
        services/
          language.spec.ts
      features/
        auth/
          store/
            auth.spec.ts
```

### Naming Convention
```ts
describe('FeatureName', () => {
  describe('methodName()', () => {
    it('does something when condition', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### AAA Pattern
Every test follows **Arrange → Act → Assert**:
```ts
it('returns error for invalid email', () => {
  // Arrange
  const dto = { email: 'invalid', password: 'password123' };

  // Act
  const result = service.login(dto);

  // Assert
  expect(result).rejects.toThrow('Invalid email');
});
```

---

## 7. Coverage Goals

| Metric | Target | Why |
|---|---|---|
| Line coverage | ≥ 80% | Catches untested code paths |
| Branch coverage | ≥ 75% | Ensures conditionals are tested |
| Function coverage | ≥ 85% | Ensures all functions are called |
| Critical paths | 100% | Auth, payments, data integrity |

### What Coverage Doesn't Tell You
- Code is correct (just that it's executed)
- Edge cases are handled
- User experience is good
- Integration between components works

---

## 8. Continuous Integration

### CI Pipeline
1. **Lint** — Catch style issues early
2. **Type check** — Catch type errors
3. **Unit tests** — Fast feedback (< 2 min)
4. **Integration tests** — Medium feedback (< 5 min)
5. **Build** — Ensure compilation succeeds
6. **E2E tests** — Slow feedback (< 15 min)

### Quality Gates
- All tests must pass before merge
- Coverage must not decrease
- No new lint errors
- Build must succeed

---

## 9. Common Anti-Patterns

### Don't
- Test implementation details (private methods, internal state)
- Write tests that depend on execution order
- Use `setTimeout` in tests (use fake timers)
- Skip tests with `xdescribe`/`xit` without a tracking issue
- Test framework internals (Angular itself works)

### Do
- Test behavior, not implementation
- Use `beforeEach` for setup, not `beforeAll`
- Clean up after tests (subscriptions, timers, mocks)
- Write tests that document expected behavior
- Test both success and error paths
