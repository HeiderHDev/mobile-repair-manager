import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Auth } from '@core/services/auth/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LoginRequest } from '@core/interfaces/auth/login-request.interface';
import { InputCustom } from '@shared/components/input-custom/input-custom';
import { ToastModule } from 'primeng/toast';
import { Notification } from '@core/services/notification/notification';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    InputCustom,
    ToastModule
  ],
  templateUrl: './login.html',
  styles: []
})
export class Login implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(Notification);
  private readonly destroy$ = new Subject<void>();

  loginForm: FormGroup;
  isLoading = false;
  private returnUrl = '/clients';

  constructor() {
    this.loginForm = this.createLoginForm();
    this.checkAuthStatus();
    this.getReturnUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.performLogin();
    } else {
      this.markFormGroupTouched();
    }
  }

  private createLoginForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private async checkAuthStatus(): Promise<void> {
    try {
      const isAuthenticated = await this.authService.isUserAuthenticated();
      if (isAuthenticated) {
        this.router.navigate([this.returnUrl]);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }

  private getReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/clients';
  }

  private async performLogin(): Promise<void> {
    this.isLoading = true;

    const credentials: LoginRequest = this.loginForm.value;

    try {
      await this.authService.login(credentials);
      this.isLoading = false;
      
      this.notificationService.success(
        'Bienvenido',
        'Has iniciado sesión correctamente'
      );
      
      // Navegar a la URL de retorno o dashboard
      this.router.navigate([this.returnUrl]);
    } catch (error: any) {
      this.isLoading = false;
      
      // Manejar errores específicos
      if (error.status === 401 || error.status === 400) {
        this.notificationService.error(
          'Error de autenticación',
          'Usuario o contraseña incorrectos'
        );
      } else if (error.status === 0) {
        this.notificationService.networkError();
      } else {
        this.notificationService.error(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.'
        );
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
