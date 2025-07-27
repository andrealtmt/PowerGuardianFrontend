import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../../shared/services/device.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dispositivos',
  templateUrl: './dispositivos.component.html',
  styleUrls: ['./dispositivos.component.scss']
})
export class DispositivosComponent implements OnInit {
  dispositivos: any[] = [];
  loadingId: number | null = null;
  mensaje: string = '';
  mostrarModal = false;
  dispositivoSeleccionado: number | null = null;

  constructor(private deviceService: DeviceService, private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Dispositivos - PowerGuardian');
    this.cargarDispositivos();
  }

  cargarDispositivos(): void {
    this.deviceService.listarMisDispositivos().subscribe({
      next: (res) => this.dispositivos = res,
      error: () => this.mensaje = 'Error al cargar dispositivos'
    });
  }

  cerrarModal() {
  this.mostrarModal = false;
  }

  verConsumo(id: number) {
    this.dispositivoSeleccionado = this.dispositivoSeleccionado === id ? null : id;
  }

  toggleEstado(dispositivo: any): void {
    const nuevoEstado = dispositivo.estado === 'on' ? 'off' : 'on';
    this.loadingId = dispositivo.id;

    this.deviceService.cambiarEstado(dispositivo.id, nuevoEstado).subscribe({
      next: () => {
        dispositivo.estado = nuevoEstado;
        this.loadingId = null;
      },
      error: () => {
        this.mensaje = 'Error al cambiar estado del dispositivo';
        this.loadingId = null;
      }
    });
  }
}
