import { InjectionToken } from '@angular/core';

export interface ValidationError {
  requiredLength?: number;
  actualLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  [key: string]: unknown;
}

export interface FormErrorsMessages {
  required: (error?: ValidationError) => string;
  email: (error?: ValidationError) => string;
  minlength: (error?: ValidationError) => string;
  maxlength: (error?: ValidationError) => string;
  min: (error?: ValidationError) => string;
  max: (error?: ValidationError) => string;
  pattern: (error?: ValidationError) => string;
  [key: string]: (error?: ValidationError) => string;
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