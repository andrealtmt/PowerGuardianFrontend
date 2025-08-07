import { Component, ElementRef, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeviceService } from 'src/app/shared/services/device.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-agregar-dispositivo',
  templateUrl: './agregar-dispositivo.component.html',
  styleUrls: ['./agregar-dispositivo.component.scss']
})
export class AgregarDispositivoComponent implements AfterViewInit {
  @Output() onSuccess = new EventEmitter<void>();
  @ViewChild('skuInput') skuInput!: ElementRef;
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private deviceService: DeviceService,
    private toastService: ToastService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.skuInput.nativeElement.focus();
    }, 100);
  }

  async asociarDispositivo() {
    if (this.form.invalid) {
      this.toastService.warning('Por favor, ingresa un SKU válido');
      return;
    }

    this.loading = true;

    this.deviceService.asociarDispositivo(this.form.value.sku).subscribe({
      next: (res: any) => {
        this.toastService.success('Dispositivo asociado correctamente');
        this.form.reset();
        this.deviceService.emitirRecarga();
        this.onSuccess.emit();
        this.loading = false;
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Ocurrió un error al asociar el dispositivo';
        this.toastService.error(msg);
        this.loading = false;
      }
    });
  }
}
