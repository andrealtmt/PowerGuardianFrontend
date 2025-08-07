import { Component, OnInit } from '@angular/core';
import { MateriaPrima } from '../materia-prima/materia-prima.component';
import { AdminService } from '../admin.service';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';
import { SearchFilterConfig } from '../../shared/components/table-search-filter/table-search-filter.component';

export interface RecetaProducto {
  id: number;
  productoId: number;
  productoNombre: string;
  materiaPrimaId: number;
  materiaPrimaNombre: string;
  unidadMedida: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal?: number;
}

export interface ProductoConCosto {
  productoId: number;
  nombre: string;
  precioVenta: number;
  costoEstimado: number;
  margenGanancia?: number;
}

@Component({
  selector: 'app-receta-producto',
  templateUrl: './receta-producto.component.html',
  styleUrls: ['./receta-producto.component.scss']
})
export class RecetaProductoComponent implements OnInit {
  productos: any[] = [];
  materias: MateriaPrima[] = [];
  receta: RecetaProducto[] = [];
  recetaFiltrada: RecetaProducto[] = [];
  productoIdSeleccionado: number = 0;
  productoSeleccionado: any = null;

  // Estados
  cargando = false;
  cargandoReceta = false;
  mostrarFormulario = false;

  // Filtros y búsqueda
  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar ingredientes...',
    showItemCount: true,
    filters: [
      {
        label: 'Unidad de Medida',
        key: 'unidadMedida',
        options: []
      },
      {
        label: 'Rango de Costo',
        key: 'costoRango',
        options: [
          { value: 'bajo', label: 'Bajo (< $10)' },
          { value: 'medio', label: 'Medio ($10 - $50)' },
          { value: 'alto', label: 'Alto (> $50)' }
        ]
      }
    ]
  };

  nuevo = {
    materiaPrimaId: 0,
    cantidad: 0
  };

  // Datos para estadísticas
  estadisticas = {
    costoTotal: 0,
    ingredientesCount: 0,
    costoPromedio: 0,
    margenEstimado: 0
  };

  constructor(
    private adminService: AdminService,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.cargando = true;

      const [productos, materias] = await Promise.all([
        this.adminService.getProductos().toPromise(),
        this.adminService.getMateriasPrimas().toPromise()
      ]);

      this.productos = productos || [];
      this.materias = materias || [];

      // Configurar opciones de filtro
      this.configurarFiltros();

    } catch (error) {
      console.error('Error cargando datos:', error);
      this.toastService.error('Error al cargar los datos iniciales');
    } finally {
      this.cargando = false;
    }
  }

  private configurarFiltros() {
    // Obtener unidades únicas
    const unidades = [...new Set(this.materias.map(m => m.unidadMedida))];
    const unidadFilter = this.searchFilterConfig.filters?.find(f => f.key === 'unidadMedida');
    if (unidadFilter) {
      unidadFilter.options = unidades.map(u => ({ value: u, label: u }));
    }
  }

  async cargarReceta() {
    if (!this.productoIdSeleccionado) {
      this.toastService.warning('Seleccione un producto primero');
      return;
    }

    try {
      this.cargandoReceta = true;
      this.receta = await this.adminService.getRecetaPorProducto(this.productoIdSeleccionado).toPromise() || [];

      // Calcular costo total para cada ingrediente
      this.receta = this.receta.map(item => ({
        ...item,
        costoTotal: item.cantidad * item.costoUnitario
      }));

      this.recetaFiltrada = [...this.receta];
      this.actualizarEstadisticas();

      // Encontrar producto seleccionado
      this.productoSeleccionado = this.productos.find(p => p.id === this.productoIdSeleccionado);

    } catch (error) {
      console.error('Error cargando receta:', error);
      this.toastService.error('Error al cargar la receta del producto');
    } finally {
      this.cargandoReceta = false;
    }
  }

  onProductoChange() {
    if (this.productoIdSeleccionado) {
      this.cargarReceta();
    } else {
      this.receta = [];
      this.recetaFiltrada = [];
      this.productoSeleccionado = null;
      this.actualizarEstadisticas();
    }
  }

  mostrarFormularioAgregar() {
    if (!this.productoIdSeleccionado) {
      this.toastService.warning('Seleccione un producto primero');
      return;
    }

    this.nuevo = { materiaPrimaId: 0, cantidad: 0 };
    this.mostrarFormulario = true;
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.nuevo = { materiaPrimaId: 0, cantidad: 0 };
  }

  async agregar() {
    if (!this.nuevo.materiaPrimaId || !this.nuevo.cantidad) {
      this.toastService.warning('Complete todos los campos obligatorios');
      return;
    }

    if (this.nuevo.cantidad <= 0) {
      this.toastService.warning('La cantidad debe ser mayor a 0');
      return;
    }

    // Verificar si ya existe este ingrediente
    const yaExiste = this.receta.some(r => r.materiaPrimaId === this.nuevo.materiaPrimaId);
    if (yaExiste) {
      this.toastService.warning('Este ingrediente ya está en la receta');
      return;
    }

    try {
      this.cargando = true;

      const data = {
        productoId: this.productoIdSeleccionado,
        materiaPrimaId: this.nuevo.materiaPrimaId,
        cantidad: this.nuevo.cantidad
      };

      await this.adminService.agregarIngrediente(data).toPromise();

      this.toastService.success('Ingrediente agregado correctamente');
      this.mostrarFormulario = false;
      this.nuevo = { materiaPrimaId: 0, cantidad: 0 };
      this.cargarReceta();

    } catch (error) {
      console.error('Error agregando ingrediente:', error);
      this.toastService.error('Error al agregar el ingrediente');
    } finally {
      this.cargando = false;
    }
  }

  async eliminar(id: number, nombreIngrediente: string) {
    const confirmado = await this.alertService.confirm(
      'Eliminar Ingrediente',
      `¿Está seguro de eliminar "${nombreIngrediente}" de la receta?`
    );

    if (!confirmado) return;

    try {
      this.cargando = true;
      await this.adminService.eliminarIngrediente(id).toPromise();

      this.toastService.success('Ingrediente eliminado correctamente');
      this.cargarReceta();

    } catch (error) {
      console.error('Error eliminando ingrediente:', error);
      this.toastService.error('Error al eliminar el ingrediente');
    } finally {
      this.cargando = false;
    }
  }

  // Búsqueda y filtros
  onSearchFilterChange(event: any) {
    let recetaFiltrada = [...this.receta];

    // Aplicar búsqueda por texto
    if (event.searchTerm) {
      const searchTerm = event.searchTerm.toLowerCase();
      recetaFiltrada = recetaFiltrada.filter(item =>
        item.materiaPrimaNombre.toLowerCase().includes(searchTerm) ||
        item.unidadMedida.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtros
    if (event.filters) {
      // Filtro por unidad de medida
      if (event.filters.unidadMedida) {
        recetaFiltrada = recetaFiltrada.filter(item =>
          item.unidadMedida === event.filters.unidadMedida
        );
      }

      // Filtro por rango de costo
      if (event.filters.costoRango) {
        recetaFiltrada = recetaFiltrada.filter(item => {
          const costoTotal = item.cantidad * item.costoUnitario;
          switch (event.filters.costoRango) {
            case 'bajo': return costoTotal < 10;
            case 'medio': return costoTotal >= 10 && costoTotal <= 50;
            case 'alto': return costoTotal > 50;
            default: return true;
          }
        });
      }
    }

    this.recetaFiltrada = recetaFiltrada;
  }

  onClearFilters() {
    this.recetaFiltrada = [...this.receta];
  }

  // Cálculos y estadísticas
  costoTotal(): number {
    return this.receta.reduce((acc, i) => acc + (i.cantidad * i.costoUnitario), 0);
  }

  private actualizarEstadisticas() {
    const costo = this.costoTotal();
    const count = this.receta.length;

    this.estadisticas = {
      costoTotal: costo,
      ingredientesCount: count,
      costoPromedio: count > 0 ? costo / count : 0,
      margenEstimado: this.productoSeleccionado ?
        ((this.productoSeleccionado.precioVenta - costo) / this.productoSeleccionado.precioVenta) * 100 : 0
    };
  }

  // Utilidades
  getNombreMateriaPrima(id: number): string {
    const materia = this.materias.find(m => m.id === id);
    return materia ? materia.nombre : '';
  }

  getUnidadMateriaPrima(id: number): string {
    const materia = this.materias.find(m => m.id === id);
    return materia ? materia.unidadMedida : '';
  }

  getMateriasDisponibles(): MateriaPrima[] {
    // Excluir materias que ya están en la receta
    const idsEnReceta = this.receta.map(r => r.materiaPrimaId);
    return this.materias.filter(m => !idsEnReceta.includes(m.id));
  }
}
