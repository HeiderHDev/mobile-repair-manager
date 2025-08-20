import { CommonModule } from '@angular/common';
import { Component, inject, input, OnChanges, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputCustom } from '@shared/components/input-custom/input-custom';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { Phone } from '@clients/interfaces/phone.interface';
import { PhoneClient } from '@clients/services/phone-client';
import { Notification } from '@core/services/notification/notification';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { computed } from '@angular/core';
import { CreatePhoneRequest } from '@clients/interfaces/create-phone-request.interface';
import { UpdatePhoneRequest } from '@clients/interfaces/update-phone-request.interface';

@Component({
  selector: 'app-phone-form-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    InputCustom,
    DatePickerModule,
    CheckboxModule
  ],
  templateUrl: './phone-form-modal.html',
  styles: `
    .form-field {
      min-height: 80px;
    }
    
    :host ::ng-deep .p-select,
    :host ::ng-deep .p-datepicker {
      width: 100%;
    }
    
    :host ::ng-deep .p-select .p-select-trigger,
    :host ::ng-deep .p-datepicker .p-inputtext {
      width: 100%;
    }

    textarea:focus {
      outline: none;
    }
  `
})
export class PhoneFormModal implements OnChanges {
  readonly visible = input<boolean>(false);
  readonly phone = input<Phone | null>(null);
  readonly clientId = input.required<string>();

  readonly visibleChange = output<boolean>();
  readonly phoneSaved = output<Phone>();

  isLoading = signal(false);
  private readonly phoneService = inject(PhoneClient);
  private readonly notificationService = inject(Notification);
  private readonly fb = inject(FormBuilder);

  phoneForm: FormGroup;
  conditionOptions = this.phoneService.getConditionOptions();
  today = new Date();

  readonly isEditMode = computed(() => !!this.phone());
  readonly dialogTitle = computed(() => 
    this.isEditMode() ? 'Editar Teléfono' : 'Nuevo Teléfono'
  );
  readonly submitButtonLabel = computed(() => 
    this.isEditMode() ? 'Actualizar' : 'Agregar Teléfono'
  );

  constructor() {
    this.phoneForm = this.createForm();
  }

  ngOnChanges(): void {
    if (this.visible()) {
      this.resetForm();
      if (this.phone()) {
        this.populateForm(this.phone()!);
      }
    }
  }

  onSubmit(): void {
    if (this.phoneForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      if (this.isEditMode()) {
        this.updatePhone();
      } else {
        this.createPhone();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  handleClose(): void {
    this.visibleChange.emit(false);
    this.resetForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      brand: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(1)]],
      imei: ['', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      color: [''],
      condition: ['', [Validators.required]],
      purchaseDate: [null],
      warrantyExpiry: [null],
      notes: [''],
      isActive: [true]
    });
  }

  private resetForm(): void {
    this.phoneForm.reset({
      isActive: true
    });
  }

  private populateForm(phone: Phone): void {
    this.phoneForm.patchValue({
      brand: phone.brand,
      model: phone.model,
      imei: phone.imei,
      color: phone.color,
      condition: phone.condition,
      purchaseDate: phone.purchaseDate ? new Date(phone.purchaseDate) : null,
      warrantyExpiry: phone.warrantyExpiry ? new Date(phone.warrantyExpiry) : null,
      notes: phone.notes,
      isActive: phone.isActive
    });
  }

  private createPhone(): void {
    const formValue = this.phoneForm.value;
    const createRequest: CreatePhoneRequest = {
      customerId: this.clientId(),
      brand: formValue.brand,
      model: formValue.model,
      imei: formValue.imei,
      color: formValue.color,
      condition: formValue.condition,
      purchaseDate: formValue.purchaseDate,
      warrantyExpiry: formValue.warrantyExpiry,
      notes: formValue.notes
    };

    this.phoneService.createPhone(createRequest).subscribe({
      next: (phone) => {
        this.isLoading.set(false);
        this.notificationService.success(
          'Teléfono agregado',
          'El teléfono ha sido agregado exitosamente'
        );
        this.phoneSaved.emit(phone);
        this.handleClose();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private updatePhone(): void {
    const formValue = this.phoneForm.value;
    const updateRequest: UpdatePhoneRequest = {
      id: this.phone()!.id,
      customerId: this.clientId(),
      brand: formValue.brand,
      model: formValue.model,
      imei: formValue.imei,
      color: formValue.color,
      condition: formValue.condition,
      purchaseDate: formValue.purchaseDate,
      warrantyExpiry: formValue.warrantyExpiry,
      notes: formValue.notes,
      isActive: formValue.isActive
    };

    this.phoneService.updatePhone(updateRequest).subscribe({
      next: (phone) => {
        this.isLoading.set(false);
        this.notificationService.success(
          'Teléfono actualizado',
          'El teléfono ha sido actualizado exitosamente'
        );
        this.phoneSaved.emit(phone);
        this.handleClose();
      },
      error: (error) => {
        this.notificationService.error(
          'Error al actualizar teléfono',
          'Hubo un error al actualizar el teléfono'
        );
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.phoneForm.controls).forEach(key => {
      const control = this.phoneForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}
