import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TextareaComponent } from '../../../../src/app/shared/components/textarea';

@Component({
  template: `<app-textarea
    [rows]="rows"
    [placeholder]="placeholder"
    [disabled]="disabled"
    (inputChange)="onInput($event)"
  ></app-textarea>`,
  standalone: true,
  imports: [TextareaComponent],
})
class TestHost {
  rows = 4;
  placeholder = '';
  disabled = false;
  lastInput = '';
  onInput(val: string) {
    this.lastInput = val;
  }
}

describe('TextareaComponent', () => {
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

  function getTextareaEl() {
    return hostFixture.debugElement.query(By.css('textarea'));
  }

  it('renders a textarea element', () => {
    hostFixture.detectChanges();
    const el = getTextareaEl();
    expect(el).toBeTruthy();
    expect(el.nativeElement.tagName).toBe('TEXTAREA');
  });

  it('sets rows attribute based on rows input', () => {
    host.rows = 8;
    hostFixture.detectChanges();

    const el = getTextareaEl();
    expect(Number(el.nativeElement.rows)).toBe(8);
  });

  it('disables textarea when disabled input is true', () => {
    host.disabled = true;
    hostFixture.detectChanges();

    expect(getTextareaEl().nativeElement.disabled).toBe(true);
  });

  it('emits inputChange with value on input event', () => {
    const el = getTextareaEl();
    el.nativeElement.value = 'test content';
    el.nativeElement.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();

    expect(host.lastInput).toBe('test content');
  });
});
