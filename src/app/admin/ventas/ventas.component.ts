import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { SearchFilterConfig } from '../../shared/components/table-search-filter/table-search-filter.component';

export interface Venta {
  sku: string;
  producto: string;
  precio: number;
  fechaCompra: Date;
  username: string;
  id?: number;
  cantidad?: number;
  total?: number;
}

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];

  // Estados
  cargando = false;

  // Filtros y búsqueda
  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar ventas por producto, SKU o usuario...',
    showItemCount: true,
    filters: [
      {
        label: 'Rango de Fechas',
        key: 'fechaRango',
        options: [
          { value: 'hoy', label: 'Hoy' },
          { value: 'semana', label: 'Esta semana' },
          { value: 'mes', label: 'Este mes' },
          { value: 'trimestre', label: 'Este trimestre' }
        ]
      },
      {
        label: 'Rango de Precios',
        key: 'precioRango',
        options: [
          { value: 'bajo', label: 'Bajo (< $50)' },
          { value: 'medio', label: 'Medio ($50 - $200)' },
          { value: 'alto', label: 'Alto (> $200)' }
        ]
      }
    ]
  };

  // Estadísticas
  estadisticas = {
    totalVentas: 0,
    ventasHoy: 0,
    promedioVenta: 0,
    ingresoTotal: 0,
    ventasSemana: 0,
    ventasMes: 0
  };

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  async cargarVentas() {
    try {
      this.cargando = true;
      this.ventas = await this.adminService.getHistorialVentas().toPromise() || [];
      this.ventasFiltradas = [...this.ventas];
      this.calcularEstadisticas();

    } catch (error) {
      console.error('Error cargando ventas:', error);
      this.toastService.error('Error al cargar el historial de ventas');
    } finally {
      this.cargando = false;
    }
  }

  // Búsqueda y filtros
  onSearchFilterChange(event: any) {
    let ventasFiltradas = [...this.ventas];

    // Aplicar búsqueda por texto
    if (event.searchTerm) {
      const searchTerm = event.searchTerm.toLowerCase();
      ventasFiltradas = ventasFiltradas.filter(venta =>
        venta.producto.toLowerCase().includes(searchTerm) ||
        venta.sku.toLowerCase().includes(searchTerm) ||
        venta.username.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtros
    if (event.filters) {
      // Filtro por fecha
      if (event.filters.fechaRango) {
        const hoy = new Date();
        ventasFiltradas = ventasFiltradas.filter(venta => {
          const fechaVenta = new Date(venta.fechaCompra);

          switch (event.filters.fechaRango) {
            case 'hoy':
              return this.esMismaFecha(fechaVenta, hoy);
            case 'semana':
              return this.esEstaSemanana(fechaVenta, hoy);
            case 'mes':
              return this.esEsteMes(fechaVenta, hoy);
            case 'trimestre':
              return this.esEsteTrimestre(fechaVenta, hoy);
            default:
              return true;
          }
        });
      }

      // Filtro por precio
      if (event.filters.precioRango) {
        ventasFiltradas = ventasFiltradas.filter(venta => {
          switch (event.filters.precioRango) {
            case 'bajo': return venta.precio < 50;
            case 'medio': return venta.precio >= 50 && venta.precio <= 200;
            case 'alto': return venta.precio > 200;
            default: return true;
          }
        });
      }
    }

    this.ventasFiltradas = ventasFiltradas;
  }

  onClearFilters() {
    this.ventasFiltradas = [...this.ventas];
  }

  // Utilidades de fecha
  private esMismaFecha(fecha1: Date, fecha2: Date): boolean {
    return fecha1.toDateString() === fecha2.toDateString();
  }

  private esEstaSemanana(fecha: Date, hoy: Date): boolean {
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    return fecha >= inicioSemana;
  }

  private esEsteMes(fecha: Date, hoy: Date): boolean {
    return fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  }

  private esEsteTrimestre(fecha: Date, hoy: Date): boolean {
    const trimestreActual = Math.floor(hoy.getMonth() / 3);
    const trimestreFecha = Math.floor(fecha.getMonth() / 3);

    return trimestreFecha === trimestreActual &&
           fecha.getFullYear() === hoy.getFullYear();
  }

  // Cálculos y estadísticas
  private calcularEstadisticas() {
    const hoy = new Date();

    this.estadisticas = {
      totalVentas: this.ventas.length,
      ingresoTotal: this.ventas.reduce((sum, v) => sum + v.precio, 0),
      promedioVenta: this.ventas.length > 0 ?
        this.ventas.reduce((sum, v) => sum + v.precio, 0) / this.ventas.length : 0,
      ventasHoy: this.ventas.filter(v => this.esMismaFecha(new Date(v.fechaCompra), hoy)).length,
      ventasSemana: this.ventas.filter(v => this.esEstaSemanana(new Date(v.fechaCompra), hoy)).length,
      ventasMes: this.ventas.filter(v => this.esEsteMes(new Date(v.fechaCompra), hoy)).length
    };
  }

  // Utilidades para exportar datos
  exportarVentas() {
    // Aquí se podría implementar exportación a Excel/CSV
    this.toastService.info('Función de exportación en desarrollo');
  }

  // Formateo de datos
  getVentasPorMes() {
    const ventasPorMes = new Map<string, number>();

    this.ventas.forEach(venta => {
      const fecha = new Date(venta.fechaCompra);
      const clave = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;

      const actual = ventasPorMes.get(clave) || 0;
      ventasPorMes.set(clave, actual + venta.precio);
    });

    return Array.from(ventasPorMes.entries()).map(([mes, total]) => ({
      mes,
      total
    }));
  }

  getProductosMasVendidos() {
    const productos = new Map<string, { cantidad: number; total: number }>();

    this.ventas.forEach(venta => {
      const actual = productos.get(venta.producto) || { cantidad: 0, total: 0 };
      productos.set(venta.producto, {
        cantidad: actual.cantidad + 1,
        total: actual.total + venta.precio
      });
    });

    return Array.from(productos.entries())
      .map(([producto, datos]) => ({ producto, ...datos }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }
}
