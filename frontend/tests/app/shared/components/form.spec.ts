import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormComponent } from '../../../../src/app/shared/components/form';

@Component({
  template: `<app-form
    [formGroup]="fg"
    [variant]="variant()"
    [cssClass]="cssClass()"
    ><input type="text"
  /></app-form>`,
  standalone: true,
  imports: [FormComponent, ReactiveFormsModule],
})
class TestHost {
  variant = signal<'default' | 'inline' | 'vertical' | 'horizontal'>('default');
  cssClass = signal<string>('');
  fg = new FormBuilder().nonNullable.group({ test: [''] });
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
    const directiveEl = hostFixture.debugElement.query(
      By.directive(FormComponent),
    );
    return directiveEl.query(By.css('form'));
  }

  it('renders a form element', () => {
    hostFixture.detectChanges();
    const formEl = getFormEl();
    expect(formEl).toBeTruthy();
    expect(formEl.nativeElement.tagName).toBe('FORM');
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

  it('applies horizontal variant classes', () => {
    host.variant.set('horizontal');
    hostFixture.detectChanges();

    const formEl = getFormEl();
    const classes = formEl.nativeElement.className;
    expect(classes).toContain('flex');
    expect(classes).toContain('gap-4');
    expect(classes).toContain('items-center');
  });

  it('applies custom cssClass', () => {
    host.cssClass.set('custom-class');
    hostFixture.detectChanges();

    const formEl = getFormEl();
    expect(formEl.nativeElement.className).toContain('custom-class');
  });
});
