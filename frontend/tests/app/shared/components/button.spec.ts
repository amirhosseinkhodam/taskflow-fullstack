import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from '../../../../src/app/shared/components/button';

@Component({
  template: `<app-button
    [variant]="variant()"
    [disabled]="disabled()"
    [type]="type()"
    (buttonClick)="onClick()"
  >
    Click
  </app-button>`,
  standalone: true,
  imports: [ButtonComponent],
})
class TestHost {
  variant = signal<'primary' | 'secondary' | 'destructive' | 'ghost'>(
    'secondary',
  );
  disabled = signal(false);
  type = signal<'button' | 'submit' | 'reset'>('button');
  clicked = false;
  onClick() {
    this.clicked = true;
  }
}

describe('ButtonComponent', () => {
  let hostFixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHost);
    host = hostFixture.componentInstance;
  });

  function getButtonEl() {
    const directiveEl = hostFixture.debugElement.query(
      By.directive(ButtonComponent),
    );
    return directiveEl.query(By.css('button'));
  }

  it('renders a button element', () => {
    hostFixture.detectChanges();
    const buttonEl = getButtonEl();
    expect(buttonEl).toBeTruthy();
    expect(buttonEl.nativeElement.tagName).toBe('BUTTON');
  });

  it('sets disabled attribute when disabled input is true', () => {
    host.disabled.set(true);
    hostFixture.detectChanges();

    const buttonEl = getButtonEl();
    expect(buttonEl.nativeElement.disabled).toBe(true);
  });

  it('does not set disabled attribute when disabled input is false', () => {
    host.disabled.set(false);
    hostFixture.detectChanges();

    const buttonEl = getButtonEl();
    expect(buttonEl.nativeElement.disabled).toBe(false);
  });

  it('applies variant CSS classes based on variant input', () => {
    host.variant.set('primary');
    hostFixture.detectChanges();

    const buttonEl = getButtonEl();
    const classes = buttonEl.nativeElement.className;
    expect(classes).toContain('bg-slate-900');
    expect(classes).toContain('text-white');
  });

  it('applies destructive variant classes', () => {
    host.variant.set('destructive');
    hostFixture.detectChanges();

    const buttonEl = getButtonEl();
    const classes = buttonEl.nativeElement.className;
    expect(classes).toContain('bg-red-600');
  });

  it('emits buttonClick on click when not disabled', () => {
    host.disabled.set(false);
    hostFixture.detectChanges();

    const buttonEl = getButtonEl();
    buttonEl.nativeElement.click();
    hostFixture.detectChanges();

    expect(host.clicked).toBe(true);
  });

  it('does not emit buttonClick on click when disabled', () => {
    host.disabled.set(true);
    hostFixture.detectChanges();

    const buttonEl = getButtonEl();
    buttonEl.nativeElement.click();
    hostFixture.detectChanges();

    expect(host.clicked).toBe(false);
  });

  it('emits buttonClick on Enter keydown when not disabled', () => {
    host.disabled.set(false);
    hostFixture.detectChanges();

    const buttonEl = getButtonEl();
    buttonEl.triggerEventHandler(
      'keydown.enter',
      new KeyboardEvent('keydown', { key: 'Enter' }),
    );
    hostFixture.detectChanges();

    expect(host.clicked).toBe(true);
  });

  it('does not emit buttonClick on Enter keydown when disabled', () => {
    host.disabled.set(true);
    hostFixture.detectChanges();

    const buttonEl = getButtonEl();
    buttonEl.triggerEventHandler(
      'keydown.enter',
      new KeyboardEvent('keydown', { key: 'Enter' }),
    );
    hostFixture.detectChanges();

    expect(host.clicked).toBe(false);
  });
});

describe('ButtonComponent styling', () => {
  const classesOf = (
    setup: (fixture: ComponentFixture<ButtonComponent>) => void = () => {},
  ): string[] => {
    const fixture = TestBed.createComponent(ButtonComponent);
    setup(fixture);
    return fixture.componentInstance.computedClasses().split(/\s+/);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it.each([
    ['sm', 'px-3', 'py-1.5', 'text-xs'],
    ['md', 'px-4', 'py-2', 'text-sm'],
    ['lg', 'px-6', 'py-3', 'text-base'],
  ])(
    'applies only the %s size padding and text scale',
    (size, px, py, text) => {
      const classes = classesOf((f) => f.componentRef.setInput('size', size));

      expect(classes).toContain(px);
      expect(classes).toContain(py);
      expect(classes).toContain(text);
      expect(classes.filter((c) => c.startsWith('px-'))).toEqual([px]);
      expect(classes.filter((c) => c.startsWith('py-'))).toEqual([py]);
    },
  );

  it('keeps a visible focus ring for keyboard users by default', () => {
    const classes = classesOf();

    expect(classes).toContain('focus-visible:outline-2');
    expect(classes).toContain('focus-visible:outline-offset-2');
  });

  it('derives a hover shade that only applies on hover', () => {
    const classes = classesOf((f) =>
      f.componentRef.setInput('cssClass', 'bg-amber-100 dark:bg-amber-800'),
    );

    expect(classes).toContain('hover:bg-amber-200');
    expect(classes).toContain('dark:hover:bg-amber-900');
    expect(classes).not.toContain('!bg-amber-200');
  });

  it('does not override an explicitly supplied hover shade', () => {
    const classes = classesOf((f) =>
      f.componentRef.setInput('cssClass', 'bg-amber-100 hover:bg-amber-500'),
    );

    expect(classes).toContain('hover:bg-amber-500');
    expect(classes).not.toContain('hover:bg-amber-200');
  });
});
