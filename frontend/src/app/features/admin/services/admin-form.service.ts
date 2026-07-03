import { Injectable, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  createPasswordForm,
  PASSWORD_FORM_DEFAULTS,
} from '../forms/password.form';

@Injectable({ providedIn: 'root' })
export class AdminFormService {
  readonly #fb = inject(FormBuilder);
  readonly passwordForm = createPasswordForm(this.#fb);

  reset(): void {
    this.passwordForm.reset(PASSWORD_FORM_DEFAULTS);
  }
}
