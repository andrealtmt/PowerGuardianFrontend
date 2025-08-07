import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';
import { SearchFilterConfig, SearchFilterResult } from '../../shared/components/table-search-filter/table-search-filter.component';

export interface MateriaPrima {
  id: number;
  nombre: string;
  unidadMedida: string;
  costoUnitario: number;
}

@Component({
  selector: 'app-materia-prima',
  templateUrl: './materia-prima.component.html',
  styleUrls: ['./materia-prima.component.scss']
})
export class MateriaPrimaComponent implements OnInit {
  materias: MateriaPrima[] = [];
  materiasFiltradas: MateriaPrima[] = [];
  nueva: Partial<MateriaPrima> = { nombre: '', unidadMedida: '', costoUnitario: 0 };
  editandoId: number | null = null;
  editando: Partial<MateriaPrima> = {};
  cargando = false;
  mostrarFormulario = false;

  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar materias primas por nombre o unidad...',
    showItemCount: true,
    filters: [
      {
        label: 'Costo',
        key: 'costo',
        options: [
          { label: 'Menos de $10', value: 'bajo' },
          { label: '$10 - $50', value: 'medio' },
          { label: 'Más de $50', value: 'alto' }
        ]
      },
      {
        label: 'Unidad',
        key: 'unidad',
        options: [] // Se llenarán dinámicamente
      }
    ]
  };

  constructor(
    private adminService: AdminService,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarMaterias();
  }

  cargarMaterias() {
    this.cargando = true;
    this.adminService.getMateriasPrimas().subscribe({
      next: (m) => {
        this.materias = m;
        this.materiasFiltradas = [...m];
        this.actualizarFiltrosUnidad();
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.toastService.error('Error al cargar materias primas');
        console.error('Error:', error);
      }
    });
  }

  actualizarFiltrosUnidad() {
    const unidades = [...new Set(this.materias.map(m => m.unidadMedida))];
    const unidadFilter = this.searchFilterConfig.filters?.find(f => f.key === 'unidad');
    if (unidadFilter) {
      unidadFilter.options = unidades.map(unidad => ({ label: unidad, value: unidad }));
    }
  }

  mostrarFormularioCrear() {
    this.mostrarFormulario = true;
    this.nueva = { nombre: '', unidadMedida: '', costoUnitario: 0 };
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.nueva = { nombre: '', unidadMedida: '', costoUnitario: 0 };
  }

  async crear() {
    if (!this.nueva.nombre || !this.nueva.unidadMedida || !this.nueva.costoUnitario) {
      this.toastService.validationError('Todos los campos son obligatorios');
      return;
    }

    if (this.nueva.costoUnitario <= 0) {
      this.toastService.validationError('El costo debe ser mayor a 0');
      return;
    }

    this.cargando = true;
    try {
      await this.adminService.crearMateriaPrima(this.nueva).toPromise();
      this.toastService.saved('Materia prima');
      this.alertService.success('Materia prima creada correctamente');
      this.cancelarFormulario();
      this.cargarMaterias();
    } catch (error) {
      this.cargando = false;
      this.toastService.error('Error al crear la materia prima');
      this.alertService.error('No se pudo crear la materia prima. Intente nuevamente.');
      console.error('Error:', error);
    }
  }

  async eliminar(id: number) {
    const confirmed = await this.alertService.confirm(
      '¿Estás seguro de que deseas eliminar esta materia prima?',
      'Confirmar Eliminación'
    );

    if (confirmed) {
      this.cargando = true;
      try {
        await this.adminService.eliminarMateriaPrima(id).toPromise();
        this.toastService.deleted('Materia prima');
        this.cargarMaterias();
      } catch (error) {
        this.cargando = false;
        this.toastService.error('Error al eliminar la materia prima');
        this.alertService.error('No se pudo eliminar. Puede estar asociada a recetas de productos.');
        console.error('Error:', error);
      }
    }
  }

  activarEdicion(mp: MateriaPrima) {
    this.editandoId = mp.id;
    this.editando = { ...mp };
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.editando = {};
  }

  async guardarEdicion() {
    if (!this.editandoId) return;

    if (!this.editando.nombre || !this.editando.unidadMedida || !this.editando.costoUnitario) {
      this.toastService.validationError('Todos los campos son obligatorios');
      return;
    }

    if (this.editando.costoUnitario! <= 0) {
      this.toastService.validationError('El costo debe ser mayor a 0');
      return;
    }

    this.cargando = true;
    try {
      await this.adminService.editarMateriaPrima(this.editandoId, this.editando).toPromise();
      this.toastService.updated('Materia prima');
      this.cancelarEdicion();
      this.cargarMaterias();
    } catch (error) {
      this.cargando = false;
      this.toastService.error('Error al actualizar la materia prima');
      this.alertService.error('No se pudo actualizar la materia prima. Intente nuevamente.');
      console.error('Error:', error);
    }
  }

  onSearchFilterChange(result: SearchFilterResult): void {
    this.materiasFiltradas = this.materias.filter(materia => {
      // Filtro por búsqueda
      const searchMatch = !result.searchTerm ||
        materia.nombre.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        materia.unidadMedida.toLowerCase().includes(result.searchTerm.toLowerCase());

      // Filtro por costo
      let costoMatch = true;
      if (result.filters['costo']) {
        switch (result.filters['costo']) {
          case 'bajo':
            costoMatch = materia.costoUnitario < 10;
            break;
          case 'medio':
            costoMatch = materia.costoUnitario >= 10 && materia.costoUnitario <= 50;
            break;
          case 'alto':
            costoMatch = materia.costoUnitario > 50;
            break;
        }
      }

      // Filtro por unidad
      const unidadMatch = !result.filters['unidad'] ||
        materia.unidadMedida === result.filters['unidad'];

      return searchMatch && costoMatch && unidadMatch;
    });
  }

  onClearFilters(): void {
    this.materiasFiltradas = [...this.materias];
  }
}
