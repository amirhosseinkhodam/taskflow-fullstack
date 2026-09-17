import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';

function projectSelected(control: AbstractControl): ValidationErrors | null {
  return control.value > 0 ? null : { required: true };
}

@Injectable({ providedIn: 'root' })
export class TaskFormService {
  readonly #fb = inject(FormBuilder);
  readonly #form = this.#fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    projectId: [null as number | null, projectSelected],
    assigneeEmail: ['', Validators.email],
  });

  resetForm() {
    this.#form.reset({
      title: '',
      description: '',
      projectId: null,
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
