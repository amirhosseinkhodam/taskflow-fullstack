import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { InputComponent } from '../../../../src/app/shared/components/input';
import { TextareaComponent } from '../../../../src/app/shared/components/textarea';
import { DatePickerComponent } from '../../../../src/app/shared/components/date-picker';
import { LanguageService } from '../../../../src/app/shared/services/language';

describe('form control visual consistency', () => {
  const SHARED_GEOMETRY = [
    'w-full',
    'rounded-control',
    'px-3',
    'py-2',
    'border',
    'transition-colors',
    'border-slate-300',
    'dark:border-slate-600',
    'bg-white',
    'dark:bg-slate-700',
    'hover:border-slate-400',
  ];

  const mockLanguageService = {
    translate: jest.fn().mockImplementation((key: string) => key),
    currentLanguage: signal<'en' | 'fa'>('en'),
    languages: [],
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: LanguageService, useValue: mockLanguageService }],
    });
  });

  const classesOf = (
    type: typeof InputComponent | typeof TextareaComponent,
  ): string[] =>
    TestBed.createComponent(type)
      .componentInstance.computedClasses()
      .split(' ');

  const datePickerClasses = (): string[] =>
    TestBed.createComponent(DatePickerComponent)
      .componentInstance.computedClasses()
      .split(' ');

  it.each(SHARED_GEOMETRY)('app-input declares %s', (token) => {
    expect(classesOf(InputComponent)).toContain(token);
  });

  it.each(SHARED_GEOMETRY)('app-textarea declares %s', (token) => {
    expect(classesOf(TextareaComponent)).toContain(token);
  });

  it.each(SHARED_GEOMETRY)('app-date-picker declares %s', (token) => {
    expect(datePickerClasses()).toContain(token);
  });

  it('gives the date picker room for its calendar button', () => {
    expect(datePickerClasses()).toContain('pe-10');
  });

  it('keeps the date picker read-only affordance', () => {
    expect(datePickerClasses()).toContain('cursor-pointer');
  });

  it('does not leak Material form-field classes into the date picker', () => {
    const classes = datePickerClasses().join(' ');

    expect(classes).not.toContain('mat-');
    expect(classes).not.toContain('mdc-');
  });

  it('renders the date picker as a plain input, not a mat-form-field', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-form-field')).toBeNull();
    expect(fixture.nativeElement.querySelector('input')).not.toBeNull();
  });

  it('falls back to the disabled variant when the date picker is disabled', () => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const classes = fixture.componentInstance.computedClasses();

    expect(classes).toContain('cursor-not-allowed');
    expect(classes).toContain('opacity-50');
  });
});
