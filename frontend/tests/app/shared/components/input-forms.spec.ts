import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputComponent } from '../../../../src/app/shared/components/input';
import { TextareaComponent } from '../../../../src/app/shared/components/textarea';

@Component({
  template: `<form [formGroup]="form">
    <app-input formControlName="title" placeholder="title" />
    <app-textarea formControlName="description" placeholder="description" />
  </form>`,
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, TextareaComponent],
})
class TestHost {
  form = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
  });
}

describe('control value accessors with reactive forms', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function inputEl(): HTMLInputElement {
    return fixture.debugElement.query(By.css('app-input input')).nativeElement;
  }

  function textareaEl(): HTMLTextAreaElement {
    return fixture.debugElement.query(By.css('app-textarea textarea'))
      .nativeElement;
  }

  it('shows a value patched into the form after initialization', () => {
    host.form.patchValue({ title: 'patched title' });
    fixture.detectChanges();

    expect(inputEl().value).toBe('patched title');
  });

  it('shows a patched textarea value after initialization', () => {
    host.form.patchValue({ description: 'patched description' });
    fixture.detectChanges();

    expect(textareaEl().value).toBe('patched description');
  });

  it('clears the rendered value when the form is reset', () => {
    host.form.patchValue({ title: 'temporary' });
    fixture.detectChanges();

    host.form.reset({ title: '', description: '' });
    fixture.detectChanges();

    expect(inputEl().value).toBe('');
  });

  it('propagates user typing back into the form', () => {
    const el = inputEl();
    el.value = 'typed';
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.form.getRawValue().title).toBe('typed');
  });
});
