import { FormBuilder, FormGroup } from '@angular/forms';

export const TASK_FORM_DEFAULTS = {
  title: '',
  projectId: 0,
  description: '',
};

export function createTaskForm(fb: FormBuilder): FormGroup {
  return fb.group({
    title: [''],
    projectId: [0],
    description: [''],
  });
}
