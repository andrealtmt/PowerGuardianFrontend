import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastConfig } from '../components/toast/toast.component';

interface ToastInstance {
  id: string;
  config: ToastConfig;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastInstance[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toastCounter = 0;

  private addToast(config: ToastConfig): string {
    const id = `toast-${++this.toastCounter}`;
    const toastInstance: ToastInstance = {
      id,
      config: { ...config, id },
      visible: true
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toastInstance]);

    return id;
  }

  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }

  // Métodos de conveniencia
  success(message: string, title?: string, options?: Partial<ToastConfig>): string {
    return this.addToast({
      type: 'success',
      title,
      message,
      duration: 4000,
      ...options
    });
  }

  error(message: string, title?: string, options?: Partial<ToastConfig>): string {
    return this.addToast({
      type: 'error',
      title: title || 'Error',
      message,
      duration: 6000,
      ...options
    });
  }

  warning(message: string, title?: string, options?: Partial<ToastConfig>): string {
    return this.addToast({
      type: 'warning',
      title: title || 'Advertencia',
      message,
      duration: 5000,
      ...options
    });
  }

  info(message: string, title?: string, options?: Partial<ToastConfig>): string {
    return this.addToast({
      type: 'info',
      title: title || 'Información',
      message,
      duration: 4000,
      ...options
    });
  }

  // Toast persistente que requiere acción del usuario
  persistent(message: string, title?: string, actionText?: string, actionHandler?: () => void): string {
    return this.addToast({
      type: 'info',
      title,
      message,
      persistent: true,
      actionText,
      actionHandler
    });
  }

  // Toast con acción personalizada
  withAction(
    message: string,
    actionText: string,
    actionHandler: () => void,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    title?: string
  ): string {
    return this.addToast({
      type,
      title,
      message,
      actionText,
      actionHandler,
      duration: 8000 // Más tiempo para leer y actuar
    });
  }

  // Métodos específicos para casos comunes
  saved(entityName: string = 'Datos'): string {
    return this.success(`${entityName} guardados correctamente`);
  }

  deleted(entityName: string = 'Elemento'): string {
    return this.success(`${entityName} eliminado correctamente`);
  }

  updated(entityName: string = 'Datos'): string {
    return this.success(`${entityName} actualizados correctamente`);
  }

  networkError(): string {
    return this.error('Error de conexión. Verifica tu conexión a internet.', 'Error de Red');
  }

  unauthorized(): string {
    return this.error('No tienes permisos para realizar esta acción.', 'Acceso Denegado');
  }

  validationError(field: string): string {
    return this.warning(`Por favor verifica el campo: ${field}`, 'Datos Incompletos');
  }
}
