import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';
import { SearchFilterConfig, SearchFilterResult } from '../../shared/components/table-search-filter/table-search-filter.component';

@Component({
  selector: 'app-clientes-admin',
  templateUrl: './clientes-admin.component.html',
  styleUrls: ['./clientes-admin.component.scss']
})
export class ClientesAdminComponent implements OnInit {
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  loading = true;
  clienteSeleccionado: any = null;
  modalVisible = false;
  mostrarFormularioEdicion = false;
  editando = false;
  formulario: any = {};
  guardando = false;

  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar clientes por nombre, email o teléfono...',
    showItemCount: true,
    filters: [
      {
        label: 'Estado',
        key: 'estado',
        options: [
          { label: 'Activos', value: 'activo' },
          { label: 'Inactivos', value: 'inactivo' }
        ]
      },
      {
        label: 'Dispositivos',
        key: 'dispositivos',
        options: [
          { label: 'Con dispositivos', value: 'con-dispositivos' },
          { label: 'Sin dispositivos', value: 'sin-dispositivos' }
        ]
      }
    ]
  };

  constructor(
    private adminService: AdminService,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.adminService.getClientes().subscribe({
      next: res => {
        this.clientes = res;
        this.clientesFiltrados = [...res];
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.toastService.error('Error al cargar la lista de clientes');
        this.loading = false;
      }
    });
  }

  async cambiarEstadoCliente(cliente: any, activar: boolean): Promise<void> {
    const accion = activar ? 'activar' : 'desactivar';
    const mensaje = `¿Estás seguro que deseas ${accion} a ${cliente.nombreCompleto}?`;

    const confirmed = await this.alertService.confirm(mensaje, `Confirmar ${accion}`);

    if (confirmed) {
      const request = activar
        ? this.adminService.activarCliente(cliente.id)
        : this.adminService.desactivarCliente(cliente.id);

      request.subscribe({
        next: () => {
          cliente.activo = activar;
          const mensajeExito = `Usuario ${activar ? 'activado' : 'desactivado'} correctamente`;
          this.toastService.success(mensajeExito);
        },
        error: err => {
          console.error(err);
          this.toastService.error(`Error al ${accion} usuario`);
        }
      });
    }
  }

  verDetalles(cliente: any): void {
    this.clienteSeleccionado = cliente;
    this.modalVisible = true;
  }

  editarCliente(cliente: any): void {
    this.formulario = {
      id: cliente.id,
      nombres: cliente.nombreCompleto.split(' ')[0] || '',
      apellidoPaterno: cliente.nombreCompleto.split(' ')[1] || '',
      apellidoMaterno: cliente.nombreCompleto.split(' ')[2] || '',
      email: cliente.email,
      phoneNumber: cliente.telefono || ''
    };
    this.editando = true;
    this.mostrarFormularioEdicion = true;
  }

  guardarCambios(): void {
    if (!this.formulario.nombres || !this.formulario.email) {
      this.toastService.warning('Por favor complete los campos requeridos');
      return;
    }

    this.guardando = true;
    this.adminService.actualizarCliente(this.formulario.id, this.formulario).subscribe({
      next: () => {
        this.toastService.success('Cliente actualizado exitosamente');
        this.cargarClientes();
        this.cancelarEdicion();
      },
      error: (error) => {
        console.error('Error al actualizar cliente:', error);
        this.toastService.error('Error al actualizar cliente');
        this.guardando = false;
      }
    });
  }

  cancelarEdicion(): void {
    this.mostrarFormularioEdicion = false;
    this.editando = false;
    this.formulario = {};
    this.guardando = false;
  }

  onSearchFilterChange(result: SearchFilterResult): void {
    this.clientesFiltrados = this.clientes.filter(cliente => {
      // Filtro por búsqueda
      const searchMatch = !result.searchTerm ||
        cliente.nombreCompleto.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        (cliente.telefono && cliente.telefono.toLowerCase().includes(result.searchTerm.toLowerCase()));

      // Filtro por estado
      const estadoMatch = !result.filters['estado'] ||
        (result.filters['estado'] === 'activo' && cliente.activo) ||
        (result.filters['estado'] === 'inactivo' && !cliente.activo);

      // Filtro por dispositivos
      const dispositivosMatch = !result.filters['dispositivos'] ||
        (result.filters['dispositivos'] === 'con-dispositivos' && cliente.dispositivos > 0) ||
        (result.filters['dispositivos'] === 'sin-dispositivos' && cliente.dispositivos === 0);

      return searchMatch && estadoMatch && dispositivosMatch;
    });
  }

  onClearFilters(): void {
    this.clientesFiltrados = [...this.clientes];
  }
}
