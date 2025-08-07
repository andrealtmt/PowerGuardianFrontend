import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertConfig } from '../components/custom-alert/custom-alert.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<{ config: AlertConfig; visible: boolean } | null>(null);
  public alert$ = this.alertSubject.asObservable();

  private currentResolve?: (result: boolean) => void;

  showAlert(config: AlertConfig): void {
    this.alertSubject.next({ config, visible: true });
  }

  hideAlert(): void {
    this.alertSubject.next(null);
    if (this.currentResolve) {
      this.currentResolve(false);
      this.currentResolve = undefined;
    }
  }

  // Métodos de conveniencia
  success(message: string, title?: string): void {
    this.showAlert({
      type: 'success',
      title,
      message,
      autoClose: true,
      duration: 3000
    });
  }

  error(message: string, title?: string): void {
    this.showAlert({
      type: 'error',
      title: title || 'Error',
      message
    });
  }

  warning(message: string, title?: string): void {
    this.showAlert({
      type: 'warning',
      title: title || 'Advertencia',
      message
    });
  }

  info(message: string, title?: string): void {
    this.showAlert({
      type: 'info',
      title: title || 'Información',
      message
    });
  }

  // Confirmación que devuelve una promesa
  confirm(message: string, title?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.currentResolve = resolve;
      this.showAlert({
        type: 'confirm',
        title: title || 'Confirmar',
        message,
        actions: [
          {
            text: 'Cancelar',
            class: 'btn-secondary',
            handler: () => resolve(false)
          },
          {
            text: 'Confirmar',
            class: 'btn-danger',
            handler: () => resolve(true)
          }
        ]
      });
    });
  }
}
