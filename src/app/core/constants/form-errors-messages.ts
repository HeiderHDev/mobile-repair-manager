import { InjectionToken } from '@angular/core';

export interface FormErrorsMessages {
  required: (error?: any) => string;
  email: (error?: any) => string;
  minlength: (error?: any) => string;
  maxlength: (error?: any) => string;
  min: (error?: any) => string;
  max: (error?: any) => string;
  pattern: (error?: any) => string;
  [key: string]: (error?: any) => string;
}

export const FORM_ERRORS_MESSAGES: FormErrorsMessages = {
  required: () => 'Este campo es requerido',
  email: () => 'Formato de email inválido',
  minlength: (error) => `Mínimo ${error?.requiredLength} caracteres`,
  maxlength: (error) => `Máximo ${error?.requiredLength} caracteres`,
  min: (error) => `El valor mínimo es ${error?.min}`,
  max: (error) => `El valor máximo es ${error?.max}`,
  pattern: () => 'Formato inválido'
};

export const FORM_ERRORS = new InjectionToken<FormErrorsMessages>('form.errors', {
  factory: () => FORM_ERRORS_MESSAGES
});