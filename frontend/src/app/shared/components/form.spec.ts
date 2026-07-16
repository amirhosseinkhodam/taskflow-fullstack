import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormComponent } from './form';

@Component({
  template: `<form appForm [variant]="variant()"><input type="text" /></form>`,
  standalone: true,
  imports: [FormComponent],
})
class TestHost {
  variant = signal<'default' | 'inline' | 'vertical' | 'horizontal'>('default');
}

describe('FormComponent', () => {
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

  function getFormEl() {
    const directiveEl = hostFixture.debugElement.query(By.directive(FormComponent));
    return directiveEl.query(By.css('form'));
  }

  it('renders a form element', () => {
    hostFixture.detectChanges();
    const formEl = getFormEl();
    expect(formEl).toBeTruthy();
    expect(formEl.nativeElement.tagName).toBe('FORM');
  });

  it('applies default variant classes', () => {
    host.variant.set('default');
    hostFixture.detectChanges();

    const formEl = getFormEl();
    const classes = formEl.nativeElement.className;
    expect(classes).toContain('bg-white');
    expect(classes).toContain('rounded-2xl');
    expect(classes).toContain('p-6');
  });

  it('applies inline variant classes', () => {
    host.variant.set('inline');
    hostFixture.detectChanges();

    const formEl = getFormEl();
    const classes = formEl.nativeElement.className;
    expect(classes).toContain('flex');
    expect(classes).toContain('gap-4');
    expect(classes).toContain('items-end');
  });

  it('applies vertical variant classes', () => {
    host.variant.set('vertical');
    hostFixture.detectChanges();

    const formEl = getFormEl();
    const classes = formEl.nativeElement.className;
    expect(classes).toContain('space-y-4');
  });

  it('applies horizontal variant classes', () => {
    host.variant.set('horizontal');
    hostFixture.detectChanges();

    const formEl = getFormEl();
    const classes = formEl.nativeElement.className;
    expect(classes).toContain('flex');
    expect(classes).toContain('gap-4');
    expect(classes).toContain('items-center');
  });
});
