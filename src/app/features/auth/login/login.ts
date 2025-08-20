// src/app/features/auth/login/login.ts
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Auth } from '@core/services/auth/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { LoginRequest } from '@core/interfaces/auth/login-request.interface';
import { InputCustom } from '@shared/components/input-custom/input-custom';
import { ToastModule } from 'primeng/toast';
import { Notification } from '@core/services/notification/notification';
import { HttpErrorResponse } from '@angular/common/http';

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
    if (this.loginForm.valid && !this.isLoading) {
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

  private checkAuthStatus(): void {
    this.authService.isUserAuthenticated()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isAuthenticated) => {
          if (isAuthenticated) {
            this.router.navigate([this.returnUrl]);
          }
        },
        error: (error) => {
          console.error('Error checking auth status:', error);
        }
      });
  }

  private getReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/clients';
  }

  private performLogin(): void {
    this.isLoading = true;
    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Bienvenido',
            'Has iniciado sesión correctamente'
          );
          
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.handleLoginError(error);
        }
      });
  }

  private handleLoginError(error: HttpErrorResponse): void {
    console.error('Login error:', error);
    
    switch (error.status) {
      case 401:
      case 400:
        this.notificationService.error(
          'Error de autenticación',
          'Usuario o contraseña incorrectos'
        );
        break;
      case 0:
        this.notificationService.networkError();
        break;
      case 429:
        this.notificationService.warning(
          'Demasiados intentos',
          'Has excedido el límite de intentos. Intenta nuevamente más tarde.'
        );
        break;
      case 500:
        this.notificationService.error(
          'Error del servidor',
          'Error interno del servidor. Intenta nuevamente.'
        );
        break;
      default:
        this.notificationService.error(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.'
        );
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}