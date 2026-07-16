import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LanguageService } from '../../../shared/services/language';
import { PaginationComponent } from './pagination';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;

  const mockLanguageService = {
    translate: (key: string) => key,
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [{ provide: LanguageService, useValue: mockLanguageService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
  });

  function setInput(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
  }

  it('should not render pagination when totalPages is 1', () => {
    setInput('currentPage', 1);
    setInput('totalPages', 1);
    fixture.detectChanges();

    const div = fixture.debugElement.query(By.css('div'));
    expect(div).toBeNull();
  });

  it('should render pagination when totalPages > 1', () => {
    setInput('currentPage', 1);
    setInput('totalPages', 3);
    fixture.detectChanges();

    const div = fixture.debugElement.query(By.css('div'));
    expect(div).toBeTruthy();
  });

  it('should disable Previous button on first page', () => {
    setInput('currentPage', 1);
    setInput('totalPages', 3);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const prevButton = buttons[0];
    expect(prevButton.nativeElement.disabled).toBe(true);
  });

  it('should disable Next button on last page', () => {
    setInput('currentPage', 3);
    setInput('totalPages', 3);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const nextButton = buttons[1];
    expect(nextButton.nativeElement.disabled).toBe(true);
  });

  it('should emit pageChange with currentPage - 1 on Previous click', () => {
    setInput('currentPage', 2);
    setInput('totalPages', 3);
    fixture.detectChanges();

    const emitSpy = jest.spyOn(fixture.componentInstance.pageChange, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons[0].nativeElement.click();

    expect(emitSpy).toHaveBeenCalledWith(1);
  });

  it('should emit pageChange with currentPage + 1 on Next click', () => {
    setInput('currentPage', 2);
    setInput('totalPages', 3);
    fixture.detectChanges();

    const emitSpy = jest.spyOn(fixture.componentInstance.pageChange, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons[1].nativeElement.click();

    expect(emitSpy).toHaveBeenCalledWith(3);
  });
});
