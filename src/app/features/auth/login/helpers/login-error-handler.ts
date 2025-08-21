import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from '@core/services/notification/notification';

interface ErrorConfig {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
}

export class LoginErrorHandler {
  constructor(private notificationService: Notification) {}

  handleLoginError(error: HttpErrorResponse): void {
    console.error('Login error:', error);
    
    const errorConfig = this.getErrorConfig(error.status);
    
    switch (errorConfig.type) {
      case 'error':
        this.notificationService.error(errorConfig.title, errorConfig.message);
        break;
      case 'warning':
        this.notificationService.warning(errorConfig.title, errorConfig.message);
        break;
      case 'info':
        this.notificationService.info(errorConfig.title, errorConfig.message);
        break;
      case 'success':
        this.notificationService.success(errorConfig.title, errorConfig.message);
        break;
    }
  }

  private getErrorConfig(status: number): ErrorConfig {
    const errorConfigs: Record<number, ErrorConfig> = {
      401: {
        type: 'error',
        title: 'Error de autenticación',
        message: 'Usuario o contraseña incorrectos'
      },
      400: {
        type: 'error',
        title: 'Error de autenticación',
        message: 'Usuario o contraseña incorrectos'
      },
      0: {
        type: 'error',
        title: 'Sin conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
      },
      429: {
        type: 'warning',
        title: 'Demasiados intentos',
        message: 'Has excedido el límite de intentos. Intenta nuevamente más tarde.'
      },
      500: {
        type: 'error',
        title: 'Error del servidor',
        message: 'Error interno del servidor. Intenta nuevamente más tarde.'
      },
      503: {
        type: 'error',
        title: 'Servicio no disponible',
        message: 'El servicio no está disponible temporalmente. Intenta más tarde.'
      }
    };

    return errorConfigs[status] || {
      type: 'error',
      title: 'Error de conexión',
      message: 'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.'
    };
  }
}