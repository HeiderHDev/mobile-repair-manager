import { Component, inject, input, output, signal, computed, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputCustom } from '@shared/components/input-custom/input-custom';
import { InputNumberModule } from 'primeng/inputnumber';
import { Repair } from '@clients/interfaces/repair.interface';
import { RepairPhoneClient } from '@clients/services/repair-phone-client';
import { Notification } from '@core/services/notification/notification';
import { RepairStatus } from '@clients/enum/repair-status.enum';
import { RepairPriority } from '@clients/enum/repair-priority.enum';
import { CreateRepairRequest } from '@clients/interfaces/create-reapair-request.interface';
import { UpdateRepairRequest } from '@clients/interfaces/update-repair-request.interface';

@Component({
  selector: 'app-repair-form-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    InputCustom
  ],
  templateUrl: './repair-form-modal.html',
  styles: [`
    .form-field {
      min-height: 80px;
    }
    
    :host ::ng-deep .p-dropdown,
    :host ::ng-deep .p-inputnumber {
      width: 100%;
    }
    
    :host ::ng-deep .p-dropdown .p-dropdown-trigger,
    :host ::ng-deep .p-inputnumber .p-inputtext {
      width: 100%;
    }

    textarea:focus {
      outline: none;
    }
  `]
})
export class RepairFormModal implements OnChanges {
  readonly visible = input<boolean>(false);
  readonly repair = input<Repair | null>(null);
  readonly phoneId = input.required<string>();
  readonly customerId = input.required<string>();
  readonly visibleChange = output<boolean>();
  readonly repairSaved = output<Repair>();

  isLoading = signal(false);
  private readonly repairService = inject(RepairPhoneClient);
  private readonly notificationService = inject(Notification);
  private readonly fb = inject(FormBuilder);

  repairForm: FormGroup;
  priorityOptions = this.repairService.getPriorityOptions();
  statusOptions = this.repairService.getStatusOptions();
  readonly isEditMode = computed(() => !!this.repair());
  readonly dialogTitle = computed(() => 
    this.isEditMode() ? 'Actualizar Reparación' : 'Nueva Reparación'
  );
  readonly submitButtonLabel = computed(() => 
    this.isEditMode() ? 'Actualizar' : 'Crear Reparación'
  );
  readonly showCompletionFields = computed(() => {
    const status = this.repairForm?.get('status')?.value;
    return this.isEditMode() && (status === RepairStatus.COMPLETED || status === RepairStatus.DELIVERED);
  });

  constructor() {
    this.repairForm = this.createForm();
    this.setupFormSubscriptions();
  }

  ngOnChanges(): void {
    if (this.visible()) {
      this.resetForm();
      if (this.repair()) {
        this.populateForm(this.repair()!);
      }
    }
  }

  onSubmit(): void {
    if (this.repairForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      if (this.isEditMode()) {
        this.updateRepair();
      } else {
        this.createRepair();
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
      issue: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['', [Validators.required]],
      status: [RepairStatus.PENDING],
      estimatedCost: [0, [Validators.required, Validators.min(1)]],
      estimatedDuration: [1, [Validators.required, Validators.min(0.5)]],
      finalCost: [null],
      actualDuration: [null],
      technicianNotes: [''],
      clientNotes: ['']
    });
  }

  private setupFormSubscriptions(): void {
    this.repairForm.get('status')?.valueChanges.subscribe(status => {
      const finalCostControl = this.repairForm.get('finalCost');
      const actualDurationControl = this.repairForm.get('actualDuration');

      if (status === RepairStatus.COMPLETED || status === RepairStatus.DELIVERED) {
        finalCostControl?.setValidators([Validators.required, Validators.min(1)]);
        actualDurationControl?.setValidators([Validators.required, Validators.min(0.5)]);
      } else {
        finalCostControl?.clearValidators();
        actualDurationControl?.clearValidators();
      }
      
      finalCostControl?.updateValueAndValidity();
      actualDurationControl?.updateValueAndValidity();
    });
  }

  private resetForm(): void {
    this.repairForm.reset({
      priority: RepairPriority.MEDIUM,
      status: RepairStatus.PENDING,
      estimatedCost: 0,
      estimatedDuration: 1
    });
  }

  private populateForm(repair: Repair): void {
    this.repairForm.patchValue({
      issue: repair.issue,
      description: repair.description,
      priority: repair.priority,
      status: repair.status,
      estimatedCost: repair.estimatedCost,
      estimatedDuration: repair.estimatedDuration,
      finalCost: repair.finalCost,
      actualDuration: repair.actualDuration,
      technicianNotes: repair.technicianNotes,
      clientNotes: repair.clientNotes
    });
  }

  private createRepair(): void {
    const formValue = this.repairForm.value;
    const createRequest: CreateRepairRequest = {
      phoneId: this.phoneId(),
      customerId: this.customerId(),
      issue: formValue.issue,
      description: formValue.description,
      priority: formValue.priority,
      estimatedCost: formValue.estimatedCost,
      estimatedDuration: formValue.estimatedDuration,
      technicianNotes: formValue.technicianNotes,
      clientNotes: formValue.clientNotes
    };

    this.repairService.createRepair(createRequest).subscribe({
      next: (repair) => {
        this.isLoading.set(false);
        this.notificationService.success(
          'Reparación creada',
          'La reparación ha sido registrada exitosamente'
        );
        this.repairSaved.emit(repair);
        this.handleClose();
      },
      error: (error) => {
        this.notificationService.error(
          'Error al crear la reparación',
          'Ocurrió un error al crear la reparación'
        );
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  private updateRepair(): void {
    const formValue = this.repairForm.value;
    const updateRequest: UpdateRepairRequest = {
      id: this.repair()!.id,
      issue: formValue.issue,
      description: formValue.description,
      priority: formValue.priority,
      status: formValue.status,
      estimatedCost: formValue.estimatedCost,
      estimatedDuration: formValue.estimatedDuration,
      finalCost: formValue.finalCost,
      actualDuration: formValue.actualDuration,
      technicianNotes: formValue.technicianNotes,
      clientNotes: formValue.clientNotes
    };

    this.repairService.updateRepair(updateRequest).subscribe({
      next: (repair) => {
        this.isLoading.set(false);
        this.notificationService.success(
          'Reparación actualizada',
          'La reparación ha sido actualizada exitosamente'
        );
        this.repairSaved.emit(repair);
        this.handleClose();
      },
      error: (error) => {
        this.notificationService.error(
          'Error al actualizar la reparación',
          'Ocurrió un error al actualizar la reparación'
        );
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.repairForm.controls).forEach(key => {
      const control = this.repairForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}