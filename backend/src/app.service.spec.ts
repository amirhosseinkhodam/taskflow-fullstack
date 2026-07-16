import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('getHealth() returns { status: "ok" }', () => {
    expect(service.getHealth()).toEqual({ status: 'ok' });
  });

  it('getHello() returns "Hello World!"', () => {
    expect(service.getHello()).toBe('Hello World!');
  });
});
