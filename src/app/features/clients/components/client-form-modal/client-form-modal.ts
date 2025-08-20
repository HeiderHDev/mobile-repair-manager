import { Component, OnChanges, inject, input, output, signal } from '@angular/core';
import { Client } from '@clients/interfaces/cliente.interface';
import { ClientData } from '@clients/services/client-data';
import { Notification } from '@core/services/notification/notification';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { computed } from '@angular/core';
import { CreateClientRequest } from '@clients/interfaces/create-client-request.interface';
import { UpdateClientRequest } from '@clients/interfaces/update-client-request.interface';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputCustom } from '@shared/components/input-custom/input-custom';

@Component({
  selector: 'app-client-form-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Dialog,
    ButtonModule,
    InputCustom
  ],
  templateUrl: './client-form-modal.html',
  styles: [
    `
      .form-field {
      min-height: 80px;
    }
    
    :host ::ng-deep .p-dropdown {
      width: 100%;
    }
    
    :host ::ng-deep .p-dropdown .p-dropdown-trigger {
      width: auto;
    }

    textarea:focus {
      outline: none;
    }
    `
  ]
})
export class ClientFormModal implements OnChanges {
  readonly visible = input<boolean>(false);
  readonly client = input<Client | null>(null);

  readonly visibleChange = output<boolean>();
  readonly clientSaved = output<Client>();

  isLoading = signal(false);
  private readonly clientService = inject(ClientData);
  private readonly notificationService = inject(Notification);
  private readonly fb = inject(FormBuilder);

  clientForm: FormGroup;
  documentTypeOptions = this.clientService.getDocumentTypeOptions();

  readonly isEditMode = computed(() => !!this.client());
  readonly dialogTitle = computed(() => 
    this.isEditMode() ? 'Editar Cliente' : 'Nuevo Cliente'
  );
  readonly submitButtonLabel = computed(() => 
    this.isEditMode() ? 'Actualizar' : 'Crear Cliente'
  );

  constructor() {
    this.clientForm = this.createForm();
  }

  ngOnChanges(): void {
    if (this.visible()) {
      this.resetForm();
      if (this.client()) {
        this.populateForm(this.client()!);
      }
    }
  }

  onSubmit(): void {
    if (this.clientForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      if (this.isEditMode()) {
        this.updateClient();
      } else {
        this.createClient();
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
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      documentType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      address: [''],
      notes: [''],
      isActive: [true]
    });
  }

  private resetForm(): void {
    this.clientForm.reset({
      isActive: true
    });
  }

  private populateForm(client: Client): void {
    this.clientForm.patchValue({
      firstName: client.firstName,
      lastName: client.lastName,
      documentType: client.documentType,
      documentNumber: client.documentNumber,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      isActive: client.isActive
    });
  }

  private createClient(): void {
    const formValue = this.clientForm.value;
    const createRequest: CreateClientRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      documentType: formValue.documentType,
      documentNumber: formValue.documentNumber,
      email: formValue.email,
      phone: formValue.phone,
      address: formValue.address,
      notes: formValue.notes
    };

    this.clientService.createClient(createRequest).subscribe({
      next: (client) => {
        this.isLoading.set(false);
        this.notificationService.success(
          'Cliente creado',
          'El cliente ha sido creado exitosamente'
        );
        this.clientSaved.emit(client);
        this.handleClose();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private updateClient(): void {
    const formValue = this.clientForm.value;
    const updateRequest: UpdateClientRequest = {
      id: this.client()!.id,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      documentType: formValue.documentType,
      documentNumber: formValue.documentNumber,
      email: formValue.email,
      phone: formValue.phone,
      address: formValue.address,
      notes: formValue.notes,
      isActive: formValue.isActive
    };

    this.clientService.updateClient(updateRequest).subscribe({
      next: (client) => {
        this.isLoading.set(false);
        this.notificationService.success(
          'Cliente actualizado',
          'El cliente ha sido actualizado exitosamente'
        );
        this.clientSaved.emit(client);
        this.handleClose();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}
