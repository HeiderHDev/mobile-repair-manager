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

  private readonly handledErrors = new Map<string, number>();
  private readonly ERROR_TIMEOUT = 5000;
  private readonly MAX_RETRIES = 1;

  handleError(error: Error | HttpErrorResponse): void {
    const errorId = this.generateErrorId(error);
    const currentTime = Date.now();
    
    if (this.shouldSkipError(errorId, currentTime)) {
      return;
    }

    this.recordError(errorId, currentTime);

    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }

    this.scheduleErrorCleanup(errorId);
  }

  private shouldSkipError(errorId: string, currentTime: number): boolean {
    const lastErrorTime = this.handledErrors.get(errorId);
    return lastErrorTime !== undefined && (currentTime - lastErrorTime) < this.ERROR_TIMEOUT;
  }

  private recordError(errorId: string, currentTime: number): void {
    this.handledErrors.set(errorId, currentTime);
  }

  private scheduleErrorCleanup(errorId: string): void {
    setTimeout(() => {
      this.handledErrors.delete(errorId);
    }, this.ERROR_TIMEOUT);
  }

  private handleHttpError(error: HttpErrorResponse): void {
    this.logError(error);

    if (this.shouldIgnoreAuthError(error)) {
      return;
    }

    const errorHandlers: Record<number, () => void> = {
      0: () => this.handleNetworkError(),
      400: () => this.handleBadRequest(error),
      401: () => this.handleUnauthorized(error),
      403: () => this.handleForbidden(),
      404: () => this.handleNotFound(error),
      409: () => this.handleConflict(error),
      422: () => this.handleUnprocessableEntity(error),
      429: () => this.handleTooManyRequests(),
      500: () => this.handleInternalServerError(),
      502: () => this.handleServiceUnavailable(error),
      503: () => this.handleServiceUnavailable(error),
      504: () => this.handleServiceUnavailable(error)
    };

    const handler = errorHandlers[error.status];
    if (handler) {
      handler();
    } else {
      this.handleUnknownError(error);
    }
  }

  private handleClientError(error: Error): void {
    this.logError(error);

    const clientErrorHandlers = [
      {
        condition: (err: Error) => err.name === 'ChunkLoadError' || err.message?.includes('Loading chunk'),
        handler: () => this.notificationService.warning(
          'Nueva versión disponible',
          'Se detectó una nueva versión de la aplicación. Recarga la página para continuar.',
          { sticky: true }
        )
      },
      {
        condition: (err: Error) => err.message?.includes('Script error'),
        handler: () => this.notificationService.error(
          'Error de carga',
          'Error al cargar recursos de la aplicación. Recarga la página.'
        )
      },
      {
        condition: (err: Error) => err.message?.includes('NetworkError') || err.message?.includes('fetch'),
        handler: () => this.notificationService.networkError()
      }
    ];

    const handler = clientErrorHandlers.find(h => h.condition(error));
    if (handler) {
      handler.handler();
      return;
    }

    if (this.shouldIgnoreClientError(error)) {
      return;
    }
    
    this.notificationService.error(
      'Error de aplicación',
      'Ha ocurrido un error inesperado en la aplicación'
    );
  }

  private shouldIgnoreAuthError(error: HttpErrorResponse): boolean {
    return (error.url?.includes('/api/auth/') ?? false) && error.status < 500;
  }

  private shouldIgnoreClientError(error: Error): boolean {
    return this.isProduction() && this.isDevelopmentError(error);
  }

  private handleNetworkError(): void {
    this.notificationService.networkError();
  }

  private handleBadRequest(error: HttpErrorResponse): void {
    const message = this.extractErrorMessage(error) || 'Los datos enviados no son válidos';
    this.notificationService.validationError(message);
  }

  private handleUnauthorized(error: HttpErrorResponse): void {
    if (!error.url?.includes('/api/auth/login')) {
      this.notificationService.sessionExpired();
      this.authService.forceLogout('session_expired');
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
    
    const errorObj = error.error as Record<string, unknown>;
    
    const errorPaths = [
      'message',
      'detail', 
      'error'
    ];

    for (const path of errorPaths) {
      const value = this.getNestedProperty(errorObj, path);
      if (typeof value === 'string') {
        return value;
      }
    }
    
    if (errorObj['errors'] && Array.isArray(errorObj['errors'])) {
      const stringErrors = errorObj['errors'].filter((err): err is string => typeof err === 'string');
      if (stringErrors.length > 0) {
        return stringErrors.join(', ');
      }
    }

    if (typeof errorObj === 'object' && errorObj !== null) {
      const firstStringValue = this.findFirstStringValue(errorObj);
      if (firstStringValue) {
        return firstStringValue;
      }
    }
    
    return null;
  }

  private getNestedProperty(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && current !== null) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  private findFirstStringValue(obj: Record<string, unknown>): string | null {
    for (const [, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value) && value.length > 0) {
        const stringValues = value.filter((item): item is string => typeof item === 'string');
        if (stringValues.length > 0) {
          return stringValues.join(', ');
        }
      }
    }
    return null;
  }

  private generateErrorId(error: Error | HttpErrorResponse): string {
    if (error instanceof HttpErrorResponse) {
      return `http_${error.status}_${error.url?.split('?')[0]}_${error.message}`.substring(0, 100);
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

  clearHandledErrors(): void {
    this.handledErrors.clear();
  }
}