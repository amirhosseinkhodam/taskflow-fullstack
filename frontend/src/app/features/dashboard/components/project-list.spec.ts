import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from '../../../shared/services/language';
import { ProjectListComponent } from './project-list';
import type { ProjectModel } from '@shared/types/project';

describe('ProjectListComponent', () => {
  let fixture: ComponentFixture<ProjectListComponent>;

  const mockLanguageService = {
    translate: (key: string) => key,
  };

  const mockProjects: ProjectModel[] = [
    { id: 1, name: 'Alpha', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 2, name: 'Beta', createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProjectListComponent, NoopAnimationsModule],
      providers: [{ provide: LanguageService, useValue: mockLanguageService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
  });

  function setInput(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  it('should show "No projects" message when projects is empty', () => {
    setInput('projects', []);

    const emptyItem = fixture.nativeElement.querySelector('ul li');
    expect(emptyItem).toBeTruthy();
    expect(emptyItem.textContent).toContain('noProjectsYet');
  });

  it('should render project list when projects are provided', () => {
    setInput('projects', mockProjects);

    const items = fixture.nativeElement.querySelectorAll('ul li');
    expect(items.length).toBe(mockProjects.length);
    expect(items[0].textContent).toContain('Alpha');
    expect(items[1].textContent).toContain('Beta');
  });

  it('should emit create with project name on form submit', () => {
    setInput('projects', []);

    const emitSpy = jest.spyOn(fixture.componentInstance.create, 'emit');

    fixture.componentInstance.projectName.set('New Project');
    fixture.detectChanges();

    fixture.componentInstance.createProject();
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith('New Project');
    expect(fixture.componentInstance.projectName()).toBe('');
  });

  it('should not emit create when name is empty', () => {
    setInput('projects', []);

    const emitSpy = jest.spyOn(fixture.componentInstance.create, 'emit');
    const submitBtn = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    submitBtn.click();
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
