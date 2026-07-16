import { JalaliDatePipe } from './jalali-date';

describe('JalaliDatePipe', () => {
  let pipe: JalaliDatePipe;

  beforeEach(() => {
    pipe = new JalaliDatePipe();
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('formats a valid date string', () => {
    const result = pipe.transform('2024-01-15T10:30:00Z');

    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });
});
