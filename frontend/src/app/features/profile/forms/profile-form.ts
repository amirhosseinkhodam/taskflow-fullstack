import { inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import type { AuthUserModel } from '@shared/types/auth';

@Injectable({ providedIn: 'root' })
export class ProfileFormService {
  readonly #fb = inject(FormBuilder);
  readonly #form = this.#fb.nonNullable.group({
    firstName: [''],
    lastName: [''],
    email: [''],
    nationalCode: [''],
    phone: [''],
    birthDate: [''],
  });

  #originalEmail = '';

  patchFromUser(user: AuthUserModel) {
    this.#originalEmail = user.email;
    this.#form.patchValue({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      nationalCode: user.nationalCode ?? '',
      phone: user.phone ?? '',
      birthDate: user.birthDate ?? '',
    });
  }

  resetForm() {
    this.#originalEmail = '';
    this.#form.reset({
      firstName: '',
      lastName: '',
      email: '',
      nationalCode: '',
      phone: '',
      birthDate: '',
    });
  }

  get originalEmail() {
    return this.#originalEmail;
  }

  get form() {
    return this.#form;
  }
}
