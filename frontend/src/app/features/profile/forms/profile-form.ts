import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ProfileFormService {
  readonly #fb = inject(FormBuilder);
  readonly #form = this.#fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  patchFromUser(user: { email: string }) {
    this.#form.patchValue({ email: user.email });
  }

  resetForm() {
    this.#form.reset({ email: '' });
  }

  get form() {
    return this.#form;
  }
}
