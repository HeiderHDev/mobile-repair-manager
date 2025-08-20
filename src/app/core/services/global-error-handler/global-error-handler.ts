import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../notification/notification';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notificationService = inject(Notification);
  private readonly router = inject(Router);

  handleError(error: Error): void {
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    this.logError(error);


    switch (error.status) {
      case 0:
        this.notificationService.networkError();
        break;

      case 400:
        this.notificationService.validationError(
          this.extractErrorMessage(error) || 'Datos inválidos en la solicitud'
        );
        break;

      case 401:
        this.notificationService.sessionExpired();
        this.redirectToLogin();
        break;

      case 403:
        this.notificationService.permissionError();
        break;

      case 404:
        this.notificationService.error(
          'Recurso no encontrado',
          'El recurso solicitado no existe o fue movido'
        );
        break;

      case 409:
        this.notificationService.warning(
          'Conflicto de datos',
          this.extractErrorMessage(error) || 'Los datos ya existen o están siendo utilizados'
        );
        break;

      case 422:
        this.notificationService.validationError(
          this.extractErrorMessage(error) || 'Los datos no pudieron ser procesados'
        );
        break;

      case 429:
        this.notificationService.warning(
          'Demasiadas solicitudes',
          'Has excedido el límite de solicitudes. Intenta nuevamente en unos minutos'
        );
        break;

      case 500:
        this.notificationService.error(
          'Error del servidor',
          'Ha ocurrido un error interno. Nuestro equipo ha sido notificado'
        );
        break;

      case 502:
      case 503:
      case 504:
        this.notificationService.error(
          'Servicio no disponible',
          'El servicio está temporalmente no disponible. Intenta nuevamente más tarde'
        );
        break;

      default:
        this.notificationService.error(
          'Error inesperado',
          this.extractErrorMessage(error) || 'Ha ocurrido un error inesperado'
        );
        break;
    }
  }

  private handleClientError(error: Error): void {
    this.logError(error);

    if (error.name === 'ChunkLoadError') {
      this.notificationService.warning(
        'Error de carga',
        'Se detectó una nueva versión. Recarga la página para continuar',
        { sticky: true }
      );
      return;
    }

    if (error.message?.includes('Loading chunk')) {
      this.notificationService.info(
        'Cargando contenido',
        'Cargando nueva funcionalidad. Recarga si el problema persiste'
      );
      return;
    }

    this.notificationService.error(
      'Error de aplicación',
      'Ha ocurrido un error inesperado en la aplicación'
    );
  }

  private extractErrorMessage(error: HttpErrorResponse): string | null {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      
      if (error.error.message) {
        return error.error.message;
      }
      
      if (error.error.detail) {
        return error.error.detail;
      }
      
      if (error.error.errors && Array.isArray(error.error.errors)) {
        return error.error.errors.join(', ');
      }
      
      if (typeof error.error === 'object') {
        const keys = Object.keys(error.error);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const firstError = error.error[firstKey];
          if (Array.isArray(firstError)) {
            return firstError.join(', ');
          }
          return firstError;
        }
      }
    }
    
    return null;
  }

  private logError(error: Error): void {
    if (!this.isProduction()) {
      console.group('🚨 Global Error Handler');
      console.error('Error details:', error);
      console.error('Stack trace:', error.stack);
      console.groupEnd();
    }
    
  }

  private redirectToLogin(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    this.router.navigate(['/auth/login']);
  }

  private isProduction(): boolean {
    return false;
  }

  handleCustomError(
    message: string, 
    severity: 'error' | 'warning' | 'info' = 'error',
    sticky = false
  ): void {
    switch (severity) {
      case 'error':
        this.notificationService.error('Error', message, { sticky });
        break;
      case 'warning':
        this.notificationService.warning('Advertencia', message, { sticky });
        break;
      case 'info':
        this.notificationService.info('Información', message, { sticky });
        break;
    }
  }
}