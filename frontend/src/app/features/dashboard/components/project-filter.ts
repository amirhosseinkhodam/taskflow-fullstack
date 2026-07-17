import { Component, inject, input, output } from '@angular/core';
import { LanguageService } from '../../../shared/services/language';
import { SelectComponent, type SelectOption } from '../../../shared/components';
import type { ProjectModel } from '@shared/types/project';

@Component({
  selector: 'app-project-filter',
  standalone: true,
  imports: [SelectComponent],
  template: `
    <app-select
      [options]="projectOptions()"
      [value]="selectedProjectId()"
      (selectChange)="projectChange.emit($event)"
      [placeholder]="t('allProjects')"
      [clearable]="true"
      [searchable]="true"
      variant="default"
    />
  `,
})
export class ProjectFilterComponent {
  readonly projects = input.required<ProjectModel[]>();
  readonly selectedProjectId = input(0);
  readonly projectChange = output<number>();

  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  projectOptions(): SelectOption[] {
    return this.projects().map((p) => ({ value: p.id, label: p.name }));
  }
}
