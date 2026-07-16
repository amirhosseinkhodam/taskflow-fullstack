import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from '../../../shared/services/language';
import { StatusFilterComponent } from './status-filter';

describe('StatusFilterComponent', () => {
  let fixture: ComponentFixture<StatusFilterComponent>;

  const mockLanguageService = {
    translate: (key: string) => key,
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [StatusFilterComponent, NoopAnimationsModule],
      providers: [{ provide: LanguageService, useValue: mockLanguageService }],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusFilterComponent);
  });

  function setInput(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  it('should render 3 chip options', () => {
    setInput('activeStatus', 'all');

    const chips = fixture.nativeElement.querySelectorAll('mat-chip-option');
    expect(chips.length).toBe(3);
  });

  it('should set active status to match activeStatus input', () => {
    setInput('activeStatus', 'pending');

    const chipListbox = fixture.nativeElement.querySelector('mat-chip-listbox');
    expect(chipListbox.getAttribute('ng-reflect-value')).toBe('pending');
  });
});
