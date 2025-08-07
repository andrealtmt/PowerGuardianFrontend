import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';
import { SearchFilterConfig, SearchFilterResult } from '../../shared/components/table-search-filter/table-search-filter.component';

@Component({
  selector: 'app-inventario-admin',
  templateUrl: './inventario-admin.component.html',
  styleUrls: ['./inventario-admin.component.scss'],
})
export class InventarioAdminComponent implements OnInit {
  inventario: any[] = [];
  inventarioFiltrado: any[] = [];
  nuevo: any = { productoId: '', notas: '' };
  productos: any[] = [];
  cargando = false;
  modoEditar = false;
  editandoId: number | null = null;
  mostrarModalBulk = false;

  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar por producto, SKU o notas...',
    showItemCount: true,
    filters: [
      {
        label: 'Estado',
        key: 'estado',
        options: [
          { label: 'Disponible', value: 'disponible' },
          { label: 'Vendida', value: 'vendida' },
          { label: 'Dañada', value: 'dañada' }
        ]
      },
      {
        label: 'Asignación',
        key: 'asignacion',
        options: [
          { label: 'Asignados', value: 'asignado' },
          { label: 'Sin asignar', value: 'sin-asignar' }
        ]
      }
    ]
  };

  bulkForm = this.fb.group({
    productoId: [null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    notas: ['']
  });

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarInventario();
    this.getProductos();
  }

  abrirModalBulk() {
    this.bulkForm.reset({ cantidad: 1 });
    this.mostrarModalBulk = true;
  }

  cerrarModalBulk() {
    this.mostrarModalBulk = false;
  }

  agregarEnLote() {
    if (this.bulkForm.invalid) {
      this.toastService.warning('Por favor complete todos los campos requeridos');
      return;
    }

    this.adminService.agregarBulk(this.bulkForm.value).subscribe({
      next: () => {
        this.toastService.success('Unidades agregadas correctamente al inventario');
        this.cargarInventario();
        this.cerrarModalBulk();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al agregar unidades al inventario');
      }
    });
  }

  cargarInventario() {
    this.cargando = true;
    this.adminService.getInventario().subscribe({
      next: res => {
        this.inventario = res;
        this.inventarioFiltrado = [...res];
        this.cargando = false;
      },
      error: err => {
        console.error(err);
        this.toastService.error('Error al cargar el inventario');
        this.cargando = false;
      }
    });
  }

  getProductos() {
    this.adminService.getProductos().subscribe({
      next: res => this.productos = res,
      error: err => {
        console.error(err);
        this.toastService.error('Error al cargar la lista de productos');
      }
    });
  }

  agregarUnidad() {
    if (!this.nuevo.productoId) {
      this.toastService.warning('Debe seleccionar un producto');
      return;
    }

    this.adminService.agregarUnidadInventario(this.nuevo).subscribe({
      next: () => {
        this.toastService.success('Unidad agregada exitosamente');
        this.nuevo = { productoId: '', notas: '' };
        this.cargarInventario();
      },
      error: err => {
        console.error(err);
        this.toastService.error('Error al agregar unidad');
      }
    });
  }

  editar(i: any) {
    this.modoEditar = true;
    this.editandoId = i.id;
    this.nuevo = {
      productoId: this.productos.find(p => p.nombre === i.productoNombre)?.id || '',
      notas: i.notas || ''
    };
  }

  guardarCambios() {
    if (this.editandoId != null) {
      this.adminService.editarInventario(this.editandoId, this.nuevo).subscribe({
        next: () => {
          this.toastService.updated('Unidad');
          this.modoEditar = false;
          this.editandoId = null;
          this.nuevo = { productoId: '', notas: '' };
          this.cargarInventario();
        },
        error: err => {
          console.error(err);
          this.toastService.error('Error al actualizar la unidad');
        }
      });
    }
  }

  cancelarEdicion() {
    this.modoEditar = false;
    this.editandoId = null;
    this.nuevo = { productoId: '', notas: '' };
  }

  async eliminar(id: number) {
    const confirmed = await this.alertService.confirm(
      '¿Estás seguro que deseas eliminar esta unidad del inventario?',
      'Confirmar Eliminación'
    );

    if (confirmed) {
      this.adminService.eliminarInventario(id).subscribe({
        next: () => {
          this.toastService.deleted('Unidad');
          this.cargarInventario();
        },
        error: err => {
          console.error(err);
          this.toastService.error('Error al eliminar la unidad');
        }
      });
    }
  }

  onSearchFilterChange(result: SearchFilterResult): void {
    this.inventarioFiltrado = this.inventario.filter(item => {
      // Filtro por búsqueda
      const searchMatch = !result.searchTerm ||
        item.productoNombre.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(result.searchTerm.toLowerCase())) ||
        (item.notas && item.notas.toLowerCase().includes(result.searchTerm.toLowerCase()));

      // Filtro por estado
      const estadoMatch = !result.filters['estado'] || item.estado === result.filters['estado'];

      // Filtro por asignación
      const asignacionMatch = !result.filters['asignacion'] ||
        (result.filters['asignacion'] === 'asignado' && item.usuarioId) ||
        (result.filters['asignacion'] === 'sin-asignar' && !item.usuarioId);

      return searchMatch && estadoMatch && asignacionMatch;
    });
  }

  onClearFilters(): void {
    this.inventarioFiltrado = [...this.inventario];
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'disponible':
        return 'estado-disponible';
      case 'vendida':
        return 'estado-vendida';
      case 'dañada':
        return 'estado-danada';
      default:
        return 'estado-default';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'disponible':
        return 'Disponible';
      case 'vendida':
        return 'Vendida';
      case 'dañada':
        return 'Dañada';
      default:
        return estado;
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'disponible':
        return 'fas fa-check-circle';
      case 'vendida':
        return 'fas fa-shopping-cart';
      case 'dañada':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-question-circle';
    }
  }
}
