import { inject, Injectable } from '@angular/core';
import { NotificationConfig } from '@core/interfaces/error-handler/error-handler.interface';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class Notification {
  private readonly messageService = inject(MessageService);

  private readonly DEFAULT_LIFE = 5000;
  private readonly STICKY_LIFE = 0;

  success(summary: string, detail: string, options?: Partial<NotificationConfig>): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: options?.life ?? this.DEFAULT_LIFE,
      sticky: options?.sticky ?? false,
      ...options
    });
  }

  error(summary: string, detail: string, options?: Partial<NotificationConfig>): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: options?.life ?? (options?.sticky ? this.STICKY_LIFE : this.DEFAULT_LIFE),
      sticky: options?.sticky ?? false,
      ...options
    });
  }

  warning(summary: string, detail: string, options?: Partial<NotificationConfig>): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: options?.life ?? this.DEFAULT_LIFE,
      sticky: options?.sticky ?? false,
      ...options
    });
  }

  info(summary: string, detail: string, options?: Partial<NotificationConfig>): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: options?.life ?? this.DEFAULT_LIFE,
      sticky: options?.sticky ?? false,
      ...options
    });
  }

  userCreated(entityName = 'Usuario'): void {
    this.success('Creado exitosamente', `${entityName} ha sido creado correctamente`);
  }

  userUpdated(entityName = 'Usuario'): void {
    this.success('Actualizado exitosamente', `${entityName} ha sido actualizado correctamente`);
  }

  userDeleted(entityName = 'Usuario'): void {
    this.success('Eliminado exitosamente', `${entityName} ha sido eliminado correctamente`);
  }

  operationCancelled(operation = 'Operación'): void {
    this.info('Operación cancelada', `${operation} ha sido cancelada`);
  }

  loadingError(entityName = 'datos'): void {
    this.error('Error de carga', `No se pudieron cargar los ${entityName}`);
  }

  saveError(entityName = 'información'): void {
    this.error('Error al guardar', `No se pudo guardar la ${entityName}`);
  }

  deleteError(entityName = 'elemento'): void {
    this.error('Error al eliminar', `No se pudo eliminar el ${entityName}`);
  }

  validationError(message = 'Revisa los datos ingresados'): void {
    this.warning('Error de validación', message);
  }

  permissionError(): void {
    this.error('Sin permisos', 'No tienes permisos para realizar esta acción');
  }

  networkError(): void {
    this.error('Error de conexión', 'Verifica tu conexión a internet e intenta nuevamente');
  }

  sessionExpired(): void {
    this.warning('Sesión expirada', 'Tu sesión ha expirado, por favor inicia sesión nuevamente', { sticky: true });
  }

  clear(): void {
    this.messageService.clear();
  }

  clearByKey(key: string): void {
    this.messageService.clear(key);
  }
}
