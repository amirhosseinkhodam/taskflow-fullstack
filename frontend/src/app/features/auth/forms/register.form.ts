import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export function createRegisterForm(fb: FormBuilder): FormGroup {
  return fb.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
}
