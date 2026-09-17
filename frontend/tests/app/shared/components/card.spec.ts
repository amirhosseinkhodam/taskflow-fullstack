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
    fixture.detectChanges();
  });

  it('renders a container div', () => {
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

  it('always includes rounded-card shadow-card base classes', () => {
    const divEl = fixture.debugElement.query(By.css('div'));
    const classes = divEl.nativeElement.className;
    expect(classes).toContain('rounded-card');
    expect(classes).toContain('shadow-card');
  });

  it('does not impose a height or scroll behaviour of its own', () => {
    const classes: string = fixture.debugElement.query(By.css('div'))
      .nativeElement.className;

    expect(classes).not.toContain('h-112');
    expect(classes).not.toContain('overflow-y-auto');
  });

  it('forwards cssClass onto the inner content div, not the host', () => {
    fixture.componentRef.setInput('cssClass', 'overflow-y-auto max-h-112');
    fixture.detectChanges();

    const divEl = fixture.debugElement.query(By.css('div')).nativeElement;
    expect(divEl.className).toContain('overflow-y-auto');
    expect(divEl.className).toContain('max-h-112');
    expect(fixture.nativeElement.className).not.toContain('overflow-y-auto');
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
