import { Component, computed, input, output } from '@angular/core';
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
      (selectChange)="onSelectChange($event)"
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

  readonly projectOptions = computed<SelectOption[]>(() =>
    this.projects().map((p) => ({ value: p.id, label: p.name })),
  );

  onSelectChange(value: number | string | null): void {
    this.projectChange.emit(Number(value ?? 0));
  }
}
