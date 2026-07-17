import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InputComponent } from '../../../../src/app/shared/components/input';

@Component({
  template: `<app-input
    [type]="type"
    [placeholder]="placeholder"
    [value]="value"
    [disabled]="disabled"
    (inputChange)="onInput($event)"
    (inputBlur)="onBlur()"
    (inputFocus)="onFocus()"
  ></app-input>`,
  standalone: true,
  imports: [InputComponent],
})
class TestHost {
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' = 'text';
  placeholder = '';
  value = '';
  disabled = false;
  lastInput = '';
  blurred = false;
  focused = false;
  onInput(val: string) {
    this.lastInput = val;
  }
  onBlur() {
    this.blurred = true;
  }
  onFocus() {
    this.focused = true;
  }
}

describe('InputComponent', () => {
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

  function getInputEl() {
    return hostFixture.debugElement.query(By.css('input'));
  }

  it('renders an input element', () => {
    hostFixture.detectChanges();
    const el = getInputEl();
    expect(el).toBeTruthy();
    expect(el.nativeElement.tagName).toBe('INPUT');
  });

  it('sets type attribute based on type input', () => {
    host.type = 'password';
    hostFixture.detectChanges();

    expect(getInputEl().nativeElement.type).toBe('password');
  });

  it('sets placeholder attribute', () => {
    host.placeholder = 'Enter email';
    hostFixture.detectChanges();

    expect(getInputEl().nativeElement.placeholder).toBe('Enter email');
  });

  it('disables input when disabled input is true', () => {
    host.disabled = true;
    hostFixture.detectChanges();

    expect(getInputEl().nativeElement.disabled).toBe(true);
  });

  it('emits inputChange with value on input event', () => {
    const el = getInputEl();
    el.nativeElement.value = 'hello';
    el.nativeElement.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();

    expect(host.lastInput).toBe('hello');
  });

  it('emits inputBlur on blur', () => {
    const el = getInputEl();
    el.nativeElement.dispatchEvent(new Event('blur'));
    hostFixture.detectChanges();

    expect(host.blurred).toBe(true);
  });

  it('emits inputFocus on focus', () => {
    const el = getInputEl();
    el.nativeElement.dispatchEvent(new Event('focus'));
    hostFixture.detectChanges();

    expect(host.focused).toBe(true);
  });
});
