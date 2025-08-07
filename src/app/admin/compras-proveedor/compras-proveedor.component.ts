import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../admin.service';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';
import { SearchFilterConfig, SearchFilterResult } from '../../shared/components/table-search-filter/table-search-filter.component';

interface Proveedor {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
}

interface ProductoProveedor {
  id: number;
  productoId: number;
  productoNombre: string;
  precioProveedor?: number;
}

interface HistorialCompra {
  id: number;
  proveedorNombre: string;
  fecha: Date;
  productoNombre: string;
  cantidad: number;
  total?: number;
}

@Component({
  selector: 'app-compras-proveedor',
  templateUrl: './compras-proveedor.component.html',
  styleUrls: ['./compras-proveedor.component.scss']
})
export class ComprasProveedorComponent implements OnInit {
  proveedores: Proveedor[] = [];
  productos: Producto[] = [];
  productosDelProveedor: ProductoProveedor[] = [];
  historialCompras: HistorialCompra[] = [];
  historialFiltrado: HistorialCompra[] = [];
  detalles: { productoId: number; cantidad: number }[] = [];

  proveedorId: number | null = null;
  notas: string = '';
  cargando = false;
  mostrarHistorial = false;

  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar en historial por proveedor o producto...',
    showItemCount: true,
    filters: [
      {
        label: 'Proveedor',
        key: 'proveedor',
        options: [] // Se llenarán dinámicamente
      },
      {
        label: 'Mes',
        key: 'mes',
        options: [
          { label: 'Último mes', value: 'ultimo_mes' },
          { label: 'Últimos 3 meses', value: 'ultimos_3_meses' },
          { label: 'Últimos 6 meses', value: 'ultimos_6_meses' },
          { label: 'Este año', value: 'este_ano' }
        ]
      }
    ]
  };

  constructor(
    private http: HttpClient,
    private adminService: AdminService,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
    this.agregarDetalle();
  }

  cargarDatosIniciales() {
    this.cargando = true;
    Promise.all([
      this.getProveedores(),
      this.getProductos()
    ]).finally(() => {
      this.cargando = false;
    });
  }

  onProveedorChange() {
    console.log('Proveedor cambiado a:', this.proveedorId);

    if (this.proveedorId) {
      // Asegurar que sea número
      this.proveedorId = Number(this.proveedorId);
      this.cargarProductosDelProveedor();
    } else {
      this.productosDelProveedor = [];
    }
    // Resetear los detalles cuando cambia el proveedor
    this.detalles = [];
    this.agregarDetalle();
  }

  cargarProductosDelProveedor() {
    if (!this.proveedorId) return;

    console.log('Cargando productos para proveedor:', this.proveedorId);
    this.cargando = true;
    this.adminService.getProductosDeProveedor(this.proveedorId).subscribe({
      next: (res) => {
        console.log('Productos cargados:', res);
        this.productosDelProveedor = res;
        this.cargando = false;
        if (res.length === 0) {
          this.toastService.warning('Este proveedor no tiene productos asignados');
        }
      },
      error: (err) => {
        console.error('Error al cargar productos del proveedor', err);
        this.productosDelProveedor = [];
        this.cargando = false;
        this.toastService.error('Error al cargar productos del proveedor');
      }
    });
  }

  agregarDetalle() {
    const nuevoDetalle = { productoId: 0, cantidad: 1 };
    console.log('Agregando nuevo detalle:', nuevoDetalle);
    this.detalles.push(nuevoDetalle);
  }

  eliminarDetalle(index: number) {
    if (this.detalles.length > 1) {
      this.detalles.splice(index, 1);
    }
  }

  async registrarCompra() {
    if (!this.proveedorId) {
      this.toastService.validationError('Debe seleccionar un proveedor');
      return;
    }

    if (this.detalles.length === 0 || this.detalles.some(d => !d.productoId || d.cantidad <= 0)) {
      this.toastService.validationError('Debe agregar al menos un producto con cantidad válida');
      return;
    }

    const confirmed = await this.alertService.confirm(
      '¿Confirmar el registro de esta compra?',
      'Registrar Compra'
    );

    if (!confirmed) return;

    const payload = {
      proveedorId: this.proveedorId,
      detalles: this.detalles,
      notas: this.notas
    };

    this.cargando = true;
    this.adminService.registrarCompraProveedor(payload).subscribe({
      next: (res) => {
        this.toastService.success('Compra registrada correctamente');
        this.alertService.success('La compra ha sido registrada exitosamente');

        // Resetear el formulario
        this.proveedorId = null;
        this.notas = '';
        this.detalles = [];
        this.productosDelProveedor = [];
        this.agregarDetalle();
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.toastService.error('Error al registrar la compra');
        this.alertService.error('No se pudo registrar la compra. Intente nuevamente.');
        console.error('Error:', err);
      }
    });
  }

  getProveedores(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adminService.getProveedores().subscribe({
        next: (res) => {
          this.proveedores = res;
          this.actualizarFiltrosProveedor();
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar proveedores', err);
          this.toastService.error('Error al cargar proveedores');
          reject(err);
        }
      });
    });
  }

  getProductos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adminService.getProductos().subscribe({
        next: (res) => {
          this.productos = res;
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar productos', err);
          this.toastService.error('Error al cargar productos');
          reject(err);
        }
      });
    });
  }

  actualizarFiltrosProveedor() {
    const proveedorFilter = this.searchFilterConfig.filters?.find(f => f.key === 'proveedor');
    if (proveedorFilter) {
      proveedorFilter.options = this.proveedores.map(p => ({ label: p.nombre, value: p.id }));
    }
  }

  abrirHistorial() {
    this.cargando = true;
    this.adminService.getHistorialComprasProveedor().subscribe({
      next: data => {
        this.historialCompras = data;
        this.historialFiltrado = [...data];
        this.mostrarHistorial = true;
        this.cargando = false;
      },
      error: (err) => {
        this.historialCompras = [];
        this.historialFiltrado = [];
        this.mostrarHistorial = true;
        this.cargando = false;
        this.toastService.error('Error al cargar el historial');
        console.error('Error:', err);
      }
    });
  }

  cerrarHistorial() {
    this.mostrarHistorial = false;
    this.historialCompras = [];
    this.historialFiltrado = [];
  }

  onSearchFilterChange(result: SearchFilterResult): void {
    this.historialFiltrado = this.historialCompras.filter(compra => {
      // Filtro por búsqueda
      const searchMatch = !result.searchTerm ||
        compra.proveedorNombre.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        compra.productoNombre.toLowerCase().includes(result.searchTerm.toLowerCase());

      // Filtro por proveedor
      const proveedorMatch = !result.filters['proveedor'] ||
        compra.proveedorNombre === result.filters['proveedor'];

      // Filtro por mes
      let mesMatch = true;
      if (result.filters['mes']) {
        const fechaCompra = new Date(compra.fecha);
        const ahora = new Date();

        switch (result.filters['mes']) {
          case 'ultimo_mes':
            mesMatch = fechaCompra >= new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
            break;
          case 'ultimos_3_meses':
            mesMatch = fechaCompra >= new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1);
            break;
          case 'ultimos_6_meses':
            mesMatch = fechaCompra >= new Date(ahora.getFullYear(), ahora.getMonth() - 6, 1);
            break;
          case 'este_ano':
            mesMatch = fechaCompra.getFullYear() === ahora.getFullYear();
            break;
        }
      }

      return searchMatch && proveedorMatch && mesMatch;
    });
  }

  onClearFilters(): void {
    this.historialFiltrado = [...this.historialCompras];
  }

  calcularTotal(): number {
    return this.detalles.reduce((total, detalle) => {
      if (detalle.productoId && detalle.cantidad > 0) {
        const producto = this.productosDelProveedor.find(p => p.productoId === detalle.productoId);
        return total + (producto?.precioProveedor || 0) * detalle.cantidad;
      }
      return total;
    }, 0);
  }

  calcularSubtotal(detalle: any): number {
    console.log('Calculando subtotal para:', detalle);

    if (!detalle.productoId || detalle.cantidad <= 0) {
      console.log('Condiciones no cumplidas - productoId:', detalle.productoId, 'cantidad:', detalle.cantidad);
      return 0;
    }

    // Asegurar que productoId sea número para la comparación
    const productoIdNumero = Number(detalle.productoId);
    const producto = this.productosDelProveedor.find(p => p.productoId === productoIdNumero);

    console.log('Producto encontrado:', producto);
    console.log('Productos disponibles:', this.productosDelProveedor);

    if (!producto || !producto.precioProveedor) {
      console.log('Producto no encontrado o sin precio');
      return 0;
    }

    const subtotal = producto.precioProveedor * detalle.cantidad;
    console.log('Subtotal calculado:', subtotal);

    return subtotal;
  }

  onProductoChange(detalle: any) {
    // Forzar detección de cambios y recálculo
    console.log('Producto cambiado:', detalle.productoId, 'Cantidad:', detalle.cantidad);

    // Asegurar que el productoId sea un número
    if (detalle.productoId) {
      detalle.productoId = Number(detalle.productoId);
    }

    // Forzar la actualización del subtotal
    this.calcularSubtotal(detalle);
  }

  onCantidadChange(detalle: any) {
    // Forzar detección de cambios y recálculo
    console.log('Cantidad cambiada:', detalle.cantidad, 'Producto:', detalle.productoId);

    // Asegurar que la cantidad sea un número válido
    if (detalle.cantidad) {
      detalle.cantidad = Number(detalle.cantidad);
      if (detalle.cantidad < 1) {
        detalle.cantidad = 1;
      }
    } else {
      detalle.cantidad = 1;
    }

    // Forzar la actualización del subtotal
    this.calcularSubtotal(detalle);
  }

  puedeRegistrarCompra(): boolean {
    return !this.cargando &&
           !!this.proveedorId &&
           this.productosDelProveedor.length > 0 &&
           this.detalles.some(d => d.productoId && d.cantidad > 0);
  }
}
