import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { SelectComponent } from '../../../shared/components/select';
import type { SelectOption } from '../../../shared/models/select';
import type { ProjectModel } from '@shared/types/project';

@Component({
  selector: 'app-project-filter',
  standalone: true,
  imports: [SelectComponent, TranslatePipe],
  template: `
    <app-select
      [options]="projectOptions()"
      [value]="selectedProjectId()"
      (selectChange)="projectChange.emit($event)"
      [placeholder]="'allProjects' | translate"
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

  projectOptions(): SelectOption[] {
    return this.projects().map((p) => ({ value: p.id, label: p.name }));
  }
}
