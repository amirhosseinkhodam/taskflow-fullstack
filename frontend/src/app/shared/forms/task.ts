import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class TaskFormService {
  readonly #fb = inject(FormBuilder);
  readonly #form = this.#fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    projectId: [0, Validators.required],
    assigneeEmail: ['', Validators.email],
  });

  resetForm(projectId?: number) {
    this.#form.reset({
      title: '',
      description: '',
      projectId: projectId ?? 0,
      assigneeEmail: '',
    });
  }

  patchForEdit(
    title: string,
    projectId: number,
    description: string,
    assigneeEmail?: string,
  ) {
    this.#form.patchValue({
      title,
      projectId,
      description,
      assigneeEmail: assigneeEmail ?? '',
    });
  }

  get form() {
    return this.#form;
  }
}
