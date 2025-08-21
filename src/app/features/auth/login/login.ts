// src/app/features/auth/login/login.ts
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { Auth } from '@core/services/auth/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { LoginRequest } from '@core/interfaces/auth/login-request.interface';
import { InputCustom } from '@shared/components/input-custom/input-custom';
import { Notification } from '@core/services/notification/notification';
import { LoginFormHelper } from './helpers/login-form.helper';
import { LoginErrorHandler } from './helpers/login-error-handler';

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
    ToastModule,
    DividerModule
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

  private readonly formHelper = new LoginFormHelper(this.fb);
  private readonly errorHandler = new LoginErrorHandler(this.notificationService);

  private readonly destroy$ = new Subject<void>();
  loginForm!: FormGroup;
  isLoading = false;
  private returnUrl = '/clients';

  readonly demoCredentials = {
    username: 'superadmin',
    password: 'admin123'
  };

  constructor() {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.performLogin();
    } else {
      this.formHelper.markAllFieldsAsTouched(this.loginForm);
    }
  }

  fillDemoCredentials(): void {
    this.loginForm.patchValue(this.demoCredentials);
  }

  private initializeComponent(): void {
    this.loginForm = this.formHelper.createLoginForm();
    this.checkAuthStatus();
    this.getReturnUrl();
  }

  private checkAuthStatus(): void {
    this.authService.isUserAuthenticated()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isAuthenticated) => {
          if (isAuthenticated) {
            this.navigateToReturnUrl();
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
    this.setLoadingState(true);
    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.setLoadingState(false))
      )
      .subscribe({
        next: () => this.handleLoginSuccess(),
        error: (error) => this.errorHandler.handleLoginError(error)
      });
  }

  private handleLoginSuccess(): void {
    this.notificationService.success(
      'Bienvenido',
      'Has iniciado sesión correctamente'
    );
    this.navigateToReturnUrl();
  }

  private navigateToReturnUrl(): void {
    this.router.navigate([this.returnUrl]);
  }

  private setLoadingState(loading: boolean): void {
    this.isLoading = loading;
  }
}