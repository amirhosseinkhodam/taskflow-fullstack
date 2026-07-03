import { Injectable, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { createTaskForm, TASK_FORM_DEFAULTS } from '../forms/task.form';

@Injectable({ providedIn: 'root' })
export class DashboardFormService {
  readonly #fb = inject(FormBuilder);
  readonly taskForm = createTaskForm(this.#fb);

  reset(): void {
    this.taskForm.reset(TASK_FORM_DEFAULTS);
  }
}
