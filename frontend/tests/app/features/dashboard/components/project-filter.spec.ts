import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from '../../../../../src/app/shared/services/language';
import { ProjectFilterComponent } from '../../../../../src/app/features/dashboard/components/project-filter';
import type { ProjectModel } from '@shared/types/project';

describe('ProjectFilterComponent', () => {
  let fixture: ComponentFixture<ProjectFilterComponent>;

  const mockLanguageService = {
    translate: (key: string) => key,
  };

  const mockProjects: ProjectModel[] = [
    {
      id: 1,
      name: 'Project A',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
    {
      id: 2,
      name: 'Project B',
      createdAt: '2025-01-02',
      updatedAt: '2025-01-02',
    },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProjectFilterComponent, NoopAnimationsModule],
      providers: [{ provide: LanguageService, useValue: mockLanguageService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectFilterComponent);
  });

  function setInput(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  it('should instantiate without errors', () => {
    setInput('projects', mockProjects);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have correct inputs and outputs defined', () => {
    setInput('projects', mockProjects);

    const component = fixture.componentInstance;
    expect(component.projects).toBeDefined();
    expect(component.selectedProjectId).toBeDefined();
    expect(component.projectChange).toBeDefined();
  });
});
