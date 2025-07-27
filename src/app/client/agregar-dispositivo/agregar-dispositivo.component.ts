import { Component, ElementRef, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DeviceService } from 'src/app/shared/services/device.service';

@Component({
  selector: 'app-agregar-dispositivo',
  templateUrl: './agregar-dispositivo.component.html'
})
export class AgregarDispositivoComponent implements AfterViewInit {
  @Output() onSuccess = new EventEmitter<void>();
  @ViewChild('skuInput') skuInput!: ElementRef;
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private deviceService: DeviceService
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

  asociarDispositivo() {
    if (this.form.invalid) return;
    this.loading = true;

    const body = { sku: this.form.value.sku };

    this.http.post<any>('https://localhost:7009/api/dispositivos/asociar', body).subscribe({
      next: res => {
        alert('Dispositivo asociado correctamente');
          this.form.reset();
          this.deviceService.emitirRecarga();
          this.onSuccess.emit();
          this.loading = false;
      },
      error: err => {
        const msg = err.error?.message || 'Ocurrió un error al asociar el dispositivo';
        alert(msg);
        this.loading = false;
      }
    });
  }
}
