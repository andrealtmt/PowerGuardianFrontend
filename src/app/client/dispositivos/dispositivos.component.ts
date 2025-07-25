import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../../shared/services/device.service';

@Component({
  selector: 'app-dispositivos',
  templateUrl: './dispositivos.component.html',
  styleUrls: ['./dispositivos.component.scss']
})
export class DispositivosComponent implements OnInit {
  dispositivos: any[] = [];
  loadingId: string | null = null;
  mensaje: string = '';

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.cargarDispositivos();
  }

  cargarDispositivos(): void {
    this.deviceService.listarMisDispositivos().subscribe({
      next: res => this.dispositivos = res,
      error: () => this.mensaje = 'Error al cargar tus dispositivos.'
    });
  }

  toggleEstado(dispositivo: any): void {
    this.loadingId = dispositivo.id;
    const nuevoEstado = dispositivo.estado === 'on' ? 'off' : 'on';
    this.deviceService.cambiarEstado(dispositivo.id, nuevoEstado).subscribe({
      next: res => {
        dispositivo.estado = nuevoEstado; 
        this.mensaje = `Dispositivo ${nuevoEstado === 'on' ? 'encendido' : 'apagado'} correctamente.`;
        this.loadingId = null;
      },
      error: () => {
        this.mensaje = 'No se pudo cambiar el estado.';
        this.loadingId = null;
      }
    });
  }
}
