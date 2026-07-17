import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CardComponent } from '../../../../src/app/shared/components/card';

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
  });

  it('renders a container div', () => {
    fixture.detectChanges();
    const divEl = fixture.debugElement.query(By.css('div'));
    expect(divEl).toBeTruthy();
  });

  it('applies default variant classes', () => {
    fixture.componentRef.setInput('variant', 'default');
    fixture.detectChanges();

    const divEl = fixture.debugElement.query(By.css('div'));
    const classes = divEl.nativeElement.className;
    expect(classes).toContain('bg-white');
    expect(classes).toContain('p-6');
  });

  it('applies bordered variant classes', () => {
    fixture.componentRef.setInput('variant', 'bordered');
    fixture.detectChanges();

    const divEl = fixture.debugElement.query(By.css('div'));
    const classes = divEl.nativeElement.className;
    expect(classes).toContain('border');
    expect(classes).toContain('border-slate-200');
    expect(classes).toContain('p-6');
  });

  it('always includes rounded-2xl shadow base classes', () => {
    const divEl = fixture.debugElement.query(By.css('div'));
    const classes = divEl.nativeElement.className;
    expect(classes).toContain('rounded-2xl');
    expect(classes).toContain('shadow');
  });

  it('projects content inside the div', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    const testFixture = TestBed.overrideComponent(CardComponent, {
      remove: { imports: [] },
      add: {
        template: `<div class="rounded-2xl shadow" [class]="computedClasses()"><span>Projected</span></div>`,
      },
    }).createComponent(CardComponent);

    testFixture.detectChanges();

    const contentEl = testFixture.debugElement.query(By.css('span'));
    expect(contentEl).toBeTruthy();
    expect(contentEl.nativeElement.textContent).toContain('Projected');
  });
});
