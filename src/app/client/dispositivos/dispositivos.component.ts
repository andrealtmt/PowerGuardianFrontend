import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../../shared/services/device.service';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dispositivos',
  templateUrl: './dispositivos.component.html',
  styleUrls: ['./dispositivos.component.scss']
})
export class DispositivosComponent implements OnInit {
  dispositivos: any[] = [];
  loadingId: number | null = null;
  mostrarModal = false;
  dispositivoSeleccionado: number | null = null;
  cargando = true;

  constructor(
    private deviceService: DeviceService,
    private titleService: Title,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Dispositivos - PowerGuardian');
    this.cargarDispositivos();
  }

  cargarDispositivos(): void {
    this.cargando = true;
    this.deviceService.listarMisDispositivos().subscribe({
      next: (res) => {
        this.dispositivos = res;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.toastService.error('Error al cargar dispositivos');
        console.error('Error:', error);
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.cargarDispositivos(); // Recargar dispositivos después de agregar uno nuevo
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  verConsumo(dispositivo: any) {
    this.dispositivoSeleccionado = this.dispositivoSeleccionado === dispositivo.id ? null : dispositivo.id;

    if (this.dispositivoSeleccionado === dispositivo.id) {
      this.toastService.info(`Mostrando consumo de ${dispositivo.nombre}`);
    }
  }

  async toggleEstado(dispositivo: any): Promise<void> {
    const accion = dispositivo.estado === 'on' ? 'apagar' : 'encender';
    const confirmed = await this.alertService.confirm(
      `¿Estás seguro que deseas ${accion} el dispositivo "${dispositivo.nombre}"?`,
      `Confirmar ${accion.charAt(0).toUpperCase() + accion.slice(1)}`
    );

    if (confirmed) {
      const nuevoEstado = dispositivo.estado === 'on' ? 'off' : 'on';
      this.loadingId = dispositivo.id;

      const mqttEstado = nuevoEstado === 'on' ? 'ON' : 'OFF';

      this.deviceService.cambiarEstadoMQTT(mqttEstado).subscribe({
        next: () => {
          dispositivo.estado = nuevoEstado;
          this.loadingId = null;
          const mensaje = nuevoEstado === 'on' ? 'encendido' : 'apagado';
          this.toastService.success(`Dispositivo ${mensaje} correctamente`);
        },
        error: (error) => {
          this.loadingId = null;
          this.toastService.error('Error al cambiar estado del dispositivo');
          console.error('Error:', error);
        }
      });
    }
  }

  getEstadoBadge(estado: string): string {
    return estado === 'on' ? 'estado-activo' : 'estado-inactivo';
  }

  getEstadoTexto(estado: string): string {
    return estado === 'on' ? 'Encendido' : 'Apagado';
  }

  getEstadoIcon(estado: string): string {
    return estado === 'on' ? 'fas fa-power-off' : 'fas fa-power-off';
  }
}
