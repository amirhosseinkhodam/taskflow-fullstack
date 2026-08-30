import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const requiredValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  return control.value ? null : { required: true };
};

export const emailValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (!control.value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(control.value) ? null : { email: true };
};

export const minLengthValidator = (minLength: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return control.value.length >= minLength
      ? null
      : { minlength: { requiredLength: minLength } };
  };
};

export const maxLengthValidator = (maxLength: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return control.value.length <= maxLength
      ? null
      : { maxlength: { requiredLength: maxLength } };
  };
};

export const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (!control.value) return null;
  const errors: ValidationErrors = {};

  if (control.value.length < 8) {
    errors['passwordTooShort8'] = true;
  }
  if (control.value.length > 128) {
    errors['passwordTooLong'] = true;
  }
  if (!/[A-Z]/.test(control.value)) {
    errors['passwordNeedsUppercase'] = true;
  }
  if (!/[a-z]/.test(control.value)) {
    errors['passwordNeedsLowercase'] = true;
  }
  if (!/[0-9]/.test(control.value)) {
    errors['passwordNeedsNumber'] = true;
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(control.value)) {
    errors['passwordNeedsSpecialChar'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export const passwordMatchValidator = (
  passwordField: string,
  confirmPasswordField: string,
): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField);
    const confirmPassword = control.get(confirmPasswordField);

    if (!password || !confirmPassword) return null;
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    }
    return null;
  };
};
