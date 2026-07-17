import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from '../../../../../src/app/shared/services/language';
import { SearchInputComponent } from '../../../../../src/app/features/dashboard/components/search-input';

describe('SearchInputComponent', () => {
  let fixture: ComponentFixture<SearchInputComponent>;

  const mockLanguageService = {
    translate: (key: string) => key,
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, NoopAnimationsModule],
      providers: [{ provide: LanguageService, useValue: mockLanguageService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
  });

  function setInput(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  it('should render search input', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]');
    expect(input).toBeTruthy();
  });

  it('should have empty default search term', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]');
    expect(input.value).toBe('');
  });

  it('should reflect searchTerm input value', () => {
    setInput('searchTerm', 'hello');

    expect(fixture.componentInstance.searchTerm()).toBe('hello');
  });
});
