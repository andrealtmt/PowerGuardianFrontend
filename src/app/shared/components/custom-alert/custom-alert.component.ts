import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface AlertAction {
  text: string;
  class?: string;
  handler?: () => void;
}

export interface AlertConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  icon?: string;
  actions?: AlertAction[];
  autoClose?: boolean;
  duration?: number;
}

@Component({
  selector: 'app-custom-alert',
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.scss']
})
export class CustomAlertComponent {
  @Input() config: AlertConfig = { message: '' };
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() actionClicked = new EventEmitter<string>();

  private autoCloseTimeout?: any;

  ngOnChanges() {
    if (this.visible && this.config.autoClose) {
      this.startAutoClose();
    }
  }

  private startAutoClose() {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }

    const duration = this.config.duration || 3000;
    this.autoCloseTimeout = setTimeout(() => {
      this.close();
    }, duration);
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
  }

  onActionClick(action: AlertAction) {
    if (action.handler) {
      action.handler();
    }
    this.actionClicked.emit(action.text);
    this.close();
  }

  getIcon(): string {
    if (this.config.icon) return this.config.icon;

    switch (this.config.type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      case 'confirm': return 'fas fa-question-circle';
      default: return 'fas fa-info-circle';
    }
  }

  getDefaultActions(): AlertAction[] {
    if (this.config.actions) return this.config.actions;

    if (this.config.type === 'confirm') {
      return [
        { text: 'Cancelar', class: 'btn-secondary' },
        { text: 'Confirmar', class: 'btn-primary' }
      ];
    }

    return [{ text: 'Cerrar', class: 'btn-primary' }];
  }
}
