import { Component, computed, inject, input, OnChanges, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUserRequest } from '@features/users/interfaces/create-user-request.interface';
import { UpdateUserRequest } from '@features/users/interfaces/update-user-request.interface';
import { User } from '@features/users/interfaces/user.interface';
import { UserData } from '@features/users/services/user-data';
import { InputCustom } from '@shared/components/input/input';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
@Component({
  selector: 'app-user-form-modal',
  imports: [InputCustom, Dialog, ButtonModule, ReactiveFormsModule],
  templateUrl: './user-form-modal.html',
  styles: `
    .form-field {
      min-height: 80px;
    }
    
    :host ::ng-deep .p-select {
      width: 100%;
    }
    
    :host ::ng-deep .p-select .p-select-trigger {
      width: auto;
    }
  `
})
export class UserFormModal implements OnChanges {
 readonly visible = input<boolean>(false);
 readonly user = input<User | null>(null);
 readonly visibleChange = output<boolean>();
 readonly userSaved = output<User>();

 isLoading = signal(false);
 private readonly userService = inject(UserData);
 private readonly messageService = inject(MessageService);
 private readonly fb = inject(FormBuilder);

 userForm: FormGroup;
 roleOptions = this.userService.getRoleOptions();

 readonly isEditMode = computed(() => !!this.user());
 readonly dialogTitle = computed(() => 
   this.isEditMode() ? 'Editar Usuario' : 'Crear Usuario'
 );
 readonly submitButtonLabel = computed(() => 
   this.isEditMode() ? 'Actualizar' : 'Crear'
 );

 constructor() {
   this.userForm = this.createForm();
 }

 ngOnChanges(): void {
   if (this.visible()) {
     this.resetForm();
     if (this.user()) {
       this.populateForm(this.user()!);
     }
   }
 }

 onSubmit(): void {
   if (this.userForm.valid && !this.isLoading()) {
     this.isLoading.set(true);

     if (this.isEditMode()) {
       this.updateUser();
     } else {
       this.createUser();
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
     username: ['', [Validators.required, Validators.minLength(3)]],
     email: ['', [Validators.required, Validators.email]],
     fullName: ['', [Validators.required, Validators.minLength(2)]],
     password: ['', [Validators.required, Validators.minLength(6)]],
     role: ['', [Validators.required]],
     isActive: [true]
   });
 }

 private resetForm(): void {
   this.userForm.reset();
   this.updatePasswordValidators();
 }

 private populateForm(user: User): void {
   this.userForm.patchValue({
     username: user.username,
     email: user.email,
     fullName: user.fullName,
     role: user.role,
     isActive: user.isActive
   });
   this.updatePasswordValidators();
 }

 private updatePasswordValidators(): void {
   const passwordControl = this.userForm.get('password');
   if (this.isEditMode()) {
     passwordControl?.clearValidators();
   } else {
     passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
   }
   passwordControl?.updateValueAndValidity();
 }

 private createUser(): void {
   const formValue = this.userForm.value;
   const createRequest: CreateUserRequest = {
     username: formValue.username,
     email: formValue.email,
     fullName: formValue.fullName,
     password: formValue.password,
     role: formValue.role
   };

   this.userService.createUser(createRequest).subscribe({
     next: (user) => {
       this.isLoading.set(false);
       this.messageService.add({
         severity: 'success',
         summary: 'Usuario creado',
         detail: 'El usuario ha sido creado exitosamente'
       });
       this.userSaved.emit(user);
       this.handleClose();
     },
     error: (error) => {
      console.error(error);
       this.isLoading.set(false);
       this.messageService.add({
         severity: 'error',
         summary: 'Error',
         detail: 'No se pudo crear el usuario'
       });
     }
   });
 }

 private updateUser(): void {
   const formValue = this.userForm.value;
   const updateRequest: UpdateUserRequest = {
     id: this.user()!.id,
     username: formValue.username,
     email: formValue.email,
     fullName: formValue.fullName,
     role: formValue.role,
     isActive: formValue.isActive
   };

   this.userService.updateUser(updateRequest).subscribe({
     next: (user) => {
       this.isLoading.set(false);
       this.messageService.add({
         severity: 'success',
         summary: 'Usuario actualizado',
         detail: 'El usuario ha sido actualizado exitosamente'
       });
       this.userSaved.emit(user);
       this.handleClose();
     },
     error: (error) => {
      console.error(error);
       this.isLoading.set(false);
       this.messageService.add({
         severity: 'error',
         summary: 'Error',
         detail: 'No se pudo actualizar el usuario'
       });
     }
   });
 }

 private markFormGroupTouched(): void {
   Object.keys(this.userForm.controls).forEach(key => {
     const control = this.userForm.get(key);
     control?.markAsTouched();
     control?.markAsDirty();
   });
 }
}
