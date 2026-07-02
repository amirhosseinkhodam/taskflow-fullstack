import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export const PASSWORD_FORM_DEFAULTS = {
  newPassword: '',
  confirmPassword: '',
};

export function createPasswordForm(fb: FormBuilder): FormGroup {
  return fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchPasswords },
  );
}

function matchPasswords(group: FormGroup): { passwordsMismatch: true } | null {
  const newPw = group.get('newPassword')?.value;
  const confirmPw = group.get('confirmPassword')?.value;
  return newPw === confirmPw ? null : { passwordsMismatch: true };
}
