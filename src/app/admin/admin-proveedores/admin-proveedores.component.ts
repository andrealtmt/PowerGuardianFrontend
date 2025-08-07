import { AdminService } from './../admin.service';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';
import { SearchFilterConfig, SearchFilterResult } from '../../shared/components/table-search-filter/table-search-filter.component';

interface Proveedor {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion?: string;
  pais?: string;
  activo: boolean;
}

@Component({
  selector: 'app-admin-proveedores',
  templateUrl: './admin-proveedores.component.html',
  styleUrls: ['./admin-proveedores.component.scss']
})
export class AdminProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  cargando = false;
  mostrarFormulario = false;
  editando = false;
  proveedorEditandoId: number | null = null;

  formulario: Partial<Proveedor> = {
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    pais: '',
    activo: true
  };

  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar proveedores por nombre, correo o teléfono...',
    showItemCount: true,
    filters: [
      {
        label: 'Estado',
        key: 'estado',
        options: [
          { label: 'Activo', value: 'activo' },
          { label: 'Inactivo', value: 'inactivo' }
        ]
      },
      {
        label: 'País',
        key: 'pais',
        options: [] // Se llenarán dinámicamente
      }
    ]
  };

  constructor(
    private adminService: AdminService,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.cargando = true;
    this.adminService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.proveedoresFiltrados = [...data];
        this.actualizarFiltrosPais();
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.toastService.error('Error al cargar proveedores');
        console.error('Error:', error);
      }
    });
  }

  actualizarFiltrosPais() {
    const paises = [...new Set(this.proveedores.map(p => p.pais).filter(p => p))];
    const paisFilter = this.searchFilterConfig.filters?.find(f => f.key === 'pais');
    if (paisFilter) {
      paisFilter.options = paises.map(pais => ({ label: pais!, value: pais! }));
    }
  }

  nuevoProveedor() {
    this.mostrarFormulario = true;
    this.editando = false;
    this.proveedorEditandoId = null;
    this.formulario = {
      nombre: '',
      correo: '',
      telefono: '',
      direccion: '',
      pais: '',
      activo: true
    };
  }

  editar(p: Proveedor) {
    this.mostrarFormulario = true;
    this.editando = true;
    this.proveedorEditandoId = p.id;
    this.formulario = { ...p };
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.editando = false;
    this.formulario = {
      nombre: '',
      correo: '',
      telefono: '',
      direccion: '',
      pais: '',
      activo: true
    };
  }

  async guardarProveedor() {
    if (!this.formulario.nombre || !this.formulario.correo || !this.formulario.telefono) {
      this.toastService.validationError('Todos los campos obligatorios deben ser completados');
      return;
    }

    this.cargando = true;

    try {
      if (this.editando && this.proveedorEditandoId != null) {
        await this.adminService.actualizarProveedor(this.proveedorEditandoId, this.formulario).toPromise();
        this.toastService.updated('Proveedor');
        this.alertService.success('Proveedor actualizado correctamente');
      } else {
        await this.adminService.crearProveedor(this.formulario).toPromise();
        this.toastService.saved('Proveedor');
        this.alertService.success('Proveedor creado correctamente');
      }

      this.cancelar();
      this.cargarProveedores();
    } catch (error) {
      this.cargando = false;
      this.toastService.error('Error al guardar el proveedor');
      this.alertService.error('No se pudo guardar el proveedor. Intente nuevamente.');
      console.error('Error:', error);
    }
  }

  async eliminar(id: number) {
    const confirmed = await this.alertService.confirm(
      '¿Estás seguro de que deseas eliminar este proveedor?',
      'Confirmar Eliminación'
    );

    if (confirmed) {
      this.cargando = true;
      try {
        await this.adminService.eliminarProveedor(id).toPromise();
        this.toastService.deleted('Proveedor');
        this.cargarProveedores();
      } catch (error) {
        this.cargando = false;
        this.toastService.error('Error al eliminar el proveedor');
        this.alertService.error('No se pudo eliminar el proveedor. Puede estar asociado a otros datos.');
        console.error('Error:', error);
      }
    }
  }

  onSearchFilterChange(result: SearchFilterResult): void {
    this.proveedoresFiltrados = this.proveedores.filter(proveedor => {
      // Filtro por búsqueda
      const searchMatch = !result.searchTerm ||
        proveedor.nombre.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        proveedor.correo.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        proveedor.telefono.includes(result.searchTerm);

      // Filtro por estado
      const estadoMatch = !result.filters['estado'] ||
        (result.filters['estado'] === 'activo' && proveedor.activo) ||
        (result.filters['estado'] === 'inactivo' && !proveedor.activo);

      // Filtro por país
      const paisMatch = !result.filters['pais'] ||
        proveedor.pais === result.filters['pais'];

      return searchMatch && estadoMatch && paisMatch;
    });
  }

  onClearFilters(): void {
    this.proveedoresFiltrados = [...this.proveedores];
  }
}
