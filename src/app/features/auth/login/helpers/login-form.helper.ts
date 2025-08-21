import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class LoginFormHelper {
  constructor(private fb: FormBuilder) {}

  createLoginForm(): FormGroup {
    return this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(100)
      ]]
    });
  }

  markAllFieldsAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string | null {
    const field = form.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${minLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} no puede exceder ${maxLength} caracteres`;
      }
    }
    
    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      username: 'Usuario',
      password: 'Contraseña'
    };
    
    return displayNames[fieldName] || fieldName;
  }
}