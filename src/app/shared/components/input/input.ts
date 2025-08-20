import {
  ChangeDetectorRef,
  Component,
  forwardRef,
  input,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
  computed,
  Injector,
} from '@angular/core';
import {
  FormControl,
  FormControlDirective,
  FormControlName,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgModel,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Subject, takeUntil } from 'rxjs';
import { FORM_ERRORS, FormErrorsMessages, ValidationError } from '@core/constants/form-errors-messages';


@Component({
  selector: 'app-input',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    FloatLabelModule,
  ],
  templateUrl: './input.html',
  styleUrl: './input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
})
export class Input implements OnInit, OnDestroy {
  // Input signals - Nueva sintaxis de Angular 17+
  readonly maxlength = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly min = input<number | null>(null);
  readonly label = input<string>('');
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly showPasswordFeedback = input<boolean>(false);
  readonly showPasswordToggle = input<boolean>(true);

  // Signals para estado interno - nombres únicos sin conflictos
  private readonly disabledState = signal(false);
  private readonly valueState = signal('');
  private readonly touchedState = signal(false);
  private readonly controlErrorsState = signal<ValidationError | null>(null);

  // Computed signals con nombres únicos
  readonly generatedId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`);
  
  readonly computedIsRequired = computed(() => {
    return this.control?.hasValidator(Validators.required) ?? false;
  });

  readonly computedShowError = computed(() => {
    const hasErrors = this.controlErrorsState() !== null;
    const shouldShow = this.touchedState() || (this.control?.dirty || this.control?.touched);
    return hasErrors && shouldShow;
  });

  readonly computedErrorMessage = computed(() => {
    const errors = this.controlErrorsState();
    if (!errors) return '';
    
    const [firstError] = Object.keys(errors);
    const errorKey = firstError as keyof FormErrorsMessages;
    const errorValue = errors[firstError as keyof ValidationError];
    
    return this.errorMessages[errorKey]?.(errorValue as ValidationError) ?? '';
  });

  readonly computedInputClasses = computed(() => {
    const baseClasses = 'w-full';
    const errorClasses = this.computedShowError() ? 'p-invalid' : '';
    
    return `${baseClasses} ${errorClasses}`.trim();
  });

  // Readonly accessors para el template
  readonly currentValue = this.valueState.asReadonly();
  readonly isDisabled = this.disabledState.asReadonly();

  // Dependencias inyectadas
  private readonly injector = inject(Injector);
  private readonly errorMessages = inject(FORM_ERRORS);
  private readonly cdr = inject(ChangeDetectorRef);

  // ControlValueAccessor properties
  public control!: FormControl;
  public onChange!: (value: string) => void;
  public onTouch!: () => void;
  
  private readonly _unsubscribe = new Subject<void>();

  constructor() {
    // Effect para detectar cambios en el control y actualizar errores
    effect(() => {
      if (this.control) {
        this.controlErrorsState.set(this.control.errors);
      }
    });
  }

  ngOnInit(): void {
    this.setComponentControl();
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.valueState.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }

  // Event handlers
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    this.valueState.set(newValue);
    this.onChange?.(newValue);
    this.updateControlState();
  }

  onPasswordInput(value: string | Event): void {
    let newValue: string;
    
    if (typeof value === 'string') {
      // Called from ngModelChange
      newValue = value;
    } else {
      // Called from regular input event
      const target = value.target as HTMLInputElement;
      newValue = target.value;
    }
    
    this.valueState.set(newValue);
    this.onChange?.(newValue);
    this.updateControlState();
  }

  onBlur(): void {
    this.touchedState.set(true);
    this.onTouch?.();
    this.updateControlState();
  }

  onFocus(): void {
    // Optional: Handle focus events if needed
  }

  private updateControlState(): void {
    if (this.control) {
      this.controlErrorsState.set(this.control.errors);
    }
  }

  private setComponentControl(): void {
    try {
      const ngControl = this.injector.get(NgControl, null);
      if (ngControl) {
        // Evitar referencia circular
        ngControl.valueAccessor = this;
        this.setControl(ngControl);
      }
    } catch (error) {
      console.error(error);
      console.warn('NgControl not found for input component');
    }
    this.cdr.detectChanges();
  }

  private setControl(ngControl: NgControl): void {
    if (ngControl instanceof NgModel) {
      this.setNgModel(ngControl);
    } else if (ngControl instanceof FormControlName) {
      this.setFormControlName(ngControl);
    } else if (ngControl instanceof FormControlDirective) {
      this.setFormControlDirective(ngControl);
    }
  }

  private setNgModel(ngControl: NgModel): void {
    const { control, update } = ngControl;
    this.control = control;
    
    // Suscribirse a cambios del control
    this.control.valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(value => {
        update.emit(value);
        this.updateControlState();
      });

    this.control.statusChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(() => {
        this.updateControlState();
      });

    this.addCustomValidators();
    this.updateControlState();
  }

  private setFormControlName(ngControl: FormControlName): void {
    const formGroupDirective = this.injector.get(FormGroupDirective, null);
    if (formGroupDirective) {
      this.control = formGroupDirective.getControl(ngControl);
      this.subscribeToControlChanges();
    }
  }

  private setFormControlDirective(ngControl: FormControlDirective): void {
    this.control = ngControl.form;
    this.subscribeToControlChanges();
  }

  private subscribeToControlChanges(): void {
    if (this.control) {
      this.control.statusChanges
        .pipe(takeUntil(this._unsubscribe))
        .subscribe(() => {
          this.updateControlState();
        });
      
      this.control.valueChanges
        .pipe(takeUntil(this._unsubscribe))
        .subscribe(() => {
          this.updateControlState();
        });
      
      this.updateControlState();
    }
  }

  private addCustomValidators(): void {
    const validators = this.getValidators();
    if (validators.length > 0) {
      this.control.addValidators(validators);
      this.control.updateValueAndValidity();
    }
  }

  private getValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    
    if (this.type() === 'email') {
      validators.push(Validators.email);
    }
    if (this.maxlength()) {
      validators.push(Validators.maxLength(this.maxlength()!));
    }
    if (this.max() !== null) {
      validators.push(Validators.max(this.max()!));
    }
    if (this.min() !== null) {
      validators.push(Validators.min(this.min()!));
    }
    
    return validators;
  }
}
