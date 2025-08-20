import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../notification/notification';
import { Auth } from '../auth/auth';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notificationService = inject(Notification);
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);

  private readonly handledErrors = new Set<string>();

  handleError(error: Error | HttpErrorResponse): void {
    const errorId = this.generateErrorId(error);
    
    if (this.handledErrors.has(errorId)) {
      return;
    }
    
    this.handledErrors.add(errorId);
    
    setTimeout(() => this.handledErrors.delete(errorId), 5000);

    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    this.logError(error);

    if (error.url?.includes('/api/auth/') && error.status < 500) {
      return;
    }

    switch (error.status) {
      case 0:
        this.handleNetworkError();
        break;

      case 400:
        this.handleBadRequest(error);
        break;

      case 401:
        this.handleUnauthorized(error);
        break;

      case 403:
        this.handleForbidden();
        break;

      case 404:
        this.handleNotFound(error);
        break;

      case 409:
        this.handleConflict(error);
        break;

      case 422:
        this.handleUnprocessableEntity(error);
        break;

      case 429:
        this.handleTooManyRequests();
        break;

      case 500:
        this.handleInternalServerError();
        break;

      case 502:
      case 503:
      case 504:
        this.handleServiceUnavailable(error);
        break;

      default:
        this.handleUnknownError(error);
        break;
    }
  }

  private handleClientError(error: Error): void {
    this.logError(error);

    if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk')) {
      this.notificationService.warning(
        'Nueva versión disponible',
        'Se detectó una nueva versión de la aplicación. Recarga la página para continuar.',
        { sticky: true }
      );
      return;
    }

    if (error.message?.includes('Script error')) {
      this.notificationService.error(
        'Error de carga',
        'Error al cargar recursos de la aplicación. Recarga la página.'
      );
      return;
    }

    if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
      this.notificationService.networkError();
      return;
    }

    if (this.isProduction() && this.isDevelopmentError(error)) {
      return;
    }
    
    this.notificationService.error(
      'Error de aplicación',
      'Ha ocurrido un error inesperado en la aplicación'
    );
  }

  private handleNetworkError(): void {
    this.notificationService.error(
      'Sin conexión',
      'No se puede conectar con el servidor. Verifica tu conexión a internet.',
      { sticky: true }
    );
  }

  private handleBadRequest(error: HttpErrorResponse): void {
    const message = this.extractErrorMessage(error) || 'Los datos enviados no son válidos';
    this.notificationService.validationError(message);
  }

  private handleUnauthorized(error: HttpErrorResponse): void {
    if (!error.url?.includes('/api/auth/login')) {
      this.notificationService.sessionExpired();
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/auth/login']);
      });
    }
  }

  private handleForbidden(): void {
    this.notificationService.permissionError();
  }

  private handleNotFound(error: HttpErrorResponse): void {
    if (error.url?.includes('/api/')) {
      this.notificationService.error(
        'Recurso no encontrado',
        'El recurso solicitado no existe o ha sido movido'
      );
    } else {
      this.notificationService.error(
        'Página no encontrada',
        'La página que buscas no existe'
      );
      this.router.navigate(['/clients']);
    }
  }

  private handleConflict(error: HttpErrorResponse): void {
    const message = this.extractErrorMessage(error) || 'Los datos ya existen o están siendo utilizados por otro proceso';
    this.notificationService.warning(
      'Conflicto de datos',
      message
    );
  }

  private handleUnprocessableEntity(error: HttpErrorResponse): void {
    const message = this.extractErrorMessage(error) || 'Los datos no pudieron ser procesados';
    this.notificationService.validationError(message);
  }

  private handleTooManyRequests(): void {
    this.notificationService.warning(
      'Demasiadas solicitudes',
      'Has excedido el límite de solicitudes. Espera un momento antes de intentar nuevamente.',
      { sticky: true }
    );
  }

  private handleInternalServerError(): void {
    this.notificationService.error(
      'Error del servidor',
      'Ha ocurrido un error interno del servidor. Nuestro equipo ha sido notificado.',
      { sticky: true }
    );
  }

  private handleServiceUnavailable(error: HttpErrorResponse): void {
    this.notificationService.error(
      'Servicio no disponible',
      `El servicio está temporalmente no disponible (${error.status}). Intenta nuevamente más tarde.`,
      { sticky: true }
    );
  }

  private handleUnknownError(error: HttpErrorResponse): void {
    const message = this.extractErrorMessage(error) || 'Ha ocurrido un error inesperado';
    this.notificationService.error(
      `Error ${error.status}`,
      message
    );
  }

  private extractErrorMessage(error: HttpErrorResponse): string | null {
    if (!error.error) return null;

    if (typeof error.error === 'string') {
      return error.error;
    }
    
    if (error.error?.message) {
      return error.error.message;
    }
    

    if (error.error?.detail) {
      return error.error.detail;
    }

    if (error.error?.error) {
      return typeof error.error.error === 'string' ? error.error.error : error.error.error.message;
    }
    
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.join(', ');
    }

    if (typeof error.error === 'object' && error.error !== null) {
      const keys = Object.keys(error.error);
      for (const key of keys) {
        const value = error.error[key];
        if (typeof value === 'string') {
          return value;
        }
        if (Array.isArray(value) && value.length > 0) {
          return value.join(', ');
        }
      }
    }
    
    return null;
  }

  private generateErrorId(error: Error | HttpErrorResponse): string {
    if (error instanceof HttpErrorResponse) {
      return `http_${error.status}_${error.url}_${error.message}`.substring(0, 100);
    }
    return `client_${error.name}_${error.message}`.substring(0, 100);
  }

  private logError(error: Error | HttpErrorResponse): void {
    if (!this.isProduction()) {
      console.group('🚨 Global Error Handler');
      
      if (error instanceof HttpErrorResponse) {
        console.error('HTTP Error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });
      } else {
        console.error('Client Error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      console.groupEnd();
    }
    
    if (this.isProduction()) {
      this.sendErrorToLoggingService(error);
    }
  }

  private isDevelopmentError(error: Error): boolean {
    const devErrors = [
      'ExpressionChangedAfterItHasBeenChecked',
      'NG0100',
      'NG0500',
      'Cannot access before initialization'
    ];
    
    return devErrors.some(devError => error.message?.includes(devError));
  }

  private isProduction(): boolean {
    return environment.production;
  }

  private sendErrorToLoggingService(error: Error | HttpErrorResponse): void {
    try {
      console.warn('Error logging service not implemented. Error details:', error);
    } catch (loggingError) {
      console.error('Error sending to logging service:', loggingError);
    }
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

  clearHandledErrors(): void {
    this.handledErrors.clear();
  }
}