import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class RegisterFormService {
  readonly #fb = inject(FormBuilder);
  readonly #form = this.#fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  resetForm() {
    this.#form.reset();
  }

  get form() {
    return this.#form;
  }
}
