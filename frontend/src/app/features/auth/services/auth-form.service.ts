import { Injectable, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { createLoginForm } from '../forms/login.form';
import { createRegisterForm } from '../forms/register.form';

@Injectable({ providedIn: 'root' })
export class AuthFormService {
  readonly #fb = inject(FormBuilder);
  readonly loginForm = createLoginForm(this.#fb);
  readonly registerForm = createRegisterForm(this.#fb);
}
