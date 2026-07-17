import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { PasswordInputComponent } from '../../../../../src/app/features/auth/components/password-input';

@Component({
  template: `<form [formGroup]="form">
    <app-password-input
      controlName="password"
      placeholderValue="Enter password"
      autocompleteValue="current-password"
    />
  </form>`,
  standalone: true,
  imports: [ReactiveFormsModule, PasswordInputComponent],
})
class TestHost {
  form = new FormGroup({ password: new FormControl('') });
}

describe('PasswordInputComponent', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('renders input with type="password" by default', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.type).toBe('password');
  });

  it('toggle button shows password (type becomes "text")', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('text');
  });

  it('toggle back hides password (type becomes "password")', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    button.click();
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('password');
  });
});
