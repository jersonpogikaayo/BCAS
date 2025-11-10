import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function jsonValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value) {
      try {
        JSON.parse(control.value);
        return null; // Valid JSON
      } catch (e) {
        return { invalidJson: true }; // Invalid JSON
      }
    }
    return null; // No value to validate
  };
}