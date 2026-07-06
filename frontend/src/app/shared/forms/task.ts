import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class TaskFormService {
  readonly #fb = inject(FormBuilder);
  readonly #form = this.#fb.nonNullable.group({
    title: ['', Validators.required],
    projectId: [0, Validators.required],
    description: [''],
  });

  patchProjectId(projectId: number) {
    this.#form.patchValue({ projectId });
  }

  patchForEdit(title: string, projectId: number, description: string) {
    this.#form.patchValue({ title, projectId, description });
  }

  resetForm(projectId: number) {
    this.#form.reset({ title: '', projectId, description: '' });
  }

  get form() {
    return this.#form;
  }
}
