import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

export interface ToastConfig {
  id?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  duration?: number;
  persistent?: boolean;
  actionText?: string;
  actionHandler?: () => void;
}

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() config: ToastConfig = { message: '' };
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() actionClicked = new EventEmitter<void>();

  private autoCloseTimeout?: any;
  isAnimatingOut = false;

  ngOnInit(): void {
    if (this.visible && !this.config.persistent) {
      this.startAutoClose();
    }
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
  }

  private startAutoClose(): void {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }

    const duration = this.config.duration || this.getDefaultDuration();
    this.autoCloseTimeout = setTimeout(() => {
      this.close();
    }, duration);
  }

  getDefaultDuration(): number {
    switch (this.config.type) {
      case 'error': return 6000;
      case 'warning': return 5000;
      case 'success': return 4000;
      case 'info': return 4000;
      default: return 4000;
    }
  }

  close(): void {
    this.isAnimatingOut = true;
    setTimeout(() => {
      this.visible = false;
      this.visibleChange.emit(false);
      this.isAnimatingOut = false;
    }, 300); // Duración de la animación
  }

  onActionClick(): void {
    if (this.config.actionHandler) {
      this.config.actionHandler();
    }
    this.actionClicked.emit();
  }

  getIcon(): string {
    switch (this.config.type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-info-circle';
    }
  }

  pauseAutoClose(): void {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
  }

  resumeAutoClose(): void {
    if (!this.config.persistent && this.visible) {
      this.startAutoClose();
    }
  }
}
