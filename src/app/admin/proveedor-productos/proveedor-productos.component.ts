import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';

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

@Component({
  selector: 'app-proveedor-productos',
  templateUrl: './proveedor-productos.component.html',
  styleUrls: ['./proveedor-productos.component.scss']
})
export class ProveedorProductosComponent implements OnInit {
  proveedores: Proveedor[] = [];
  productos: Producto[] = [];
  productosDelProveedor: ProductoProveedor[] = [];

  proveedorSeleccionado: number | null = null;
  productoAAsignar: number | null = null;
  precioProveedor: number | null = null;
  cargando: boolean = false;

  constructor(
    private adminService: AdminService,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarProveedores();
    this.cargarProductos();
  }

  cargarProveedores() {
    this.cargando = true;
    this.adminService.getProveedores().subscribe({
      next: (res) => {
        this.proveedores = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar proveedores', err);
        this.toastService.error('Error al cargar la lista de proveedores');
        this.cargando = false;
      }
    });
  }

  cargarProductos() {
    this.adminService.getProductos().subscribe({
      next: (res) => {
        this.productos = res;
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.toastService.error('Error al cargar la lista de productos');
      }
    });
  }

  onProveedorChange() {
    if (this.proveedorSeleccionado) {
      this.cargarProductosDelProveedor();
    } else {
      this.productosDelProveedor = [];
    }
  }

  cargarProductosDelProveedor() {
    if (!this.proveedorSeleccionado) return;

    this.adminService.getProductosDeProveedor(this.proveedorSeleccionado).subscribe({
      next: (res) => {
        this.productosDelProveedor = res;
      },
      error: (err) => {
        console.error('Error al cargar productos del proveedor', err);
        this.productosDelProveedor = [];
        this.toastService.error('Error al cargar productos del proveedor');
      }
    });
  }

  asignarProducto() {
    if (!this.proveedorSeleccionado || !this.productoAAsignar) {
      this.toastService.warning('Debe seleccionar proveedor y producto');
      return;
    }

    const data = {
      productoId: this.productoAAsignar,
      precioProveedor: this.precioProveedor || undefined
    };

    this.adminService.asignarProductoAProveedor(this.proveedorSeleccionado, data).subscribe({
      next: () => {
        this.toastService.success('Producto asignado correctamente al proveedor');
        this.cargarProductosDelProveedor();
        this.productoAAsignar = null;
        this.precioProveedor = null;
      },
      error: (err) => {
        this.toastService.error('Error al asignar producto: ' + (err.error?.message || err.message));
      }
    });
  }

  async removerProducto(productoId: number) {
    if (!this.proveedorSeleccionado) return;

    const productoNombre = this.productosDelProveedor.find(p => p.productoId === productoId)?.productoNombre || 'este producto';

    const confirmed = await this.alertService.confirm(
      `¿Estás seguro que deseas remover "${productoNombre}" de este proveedor?`,
      'Confirmar Eliminación'
    );

    if (confirmed) {
      this.adminService.removerProductoDeProveedor(this.proveedorSeleccionado, productoId).subscribe({
        next: () => {
          this.toastService.success('Producto removido del proveedor');
          this.cargarProductosDelProveedor();
        },
        error: (err) => {
          this.toastService.error('Error al remover producto del proveedor');
        }
      });
    }
  }

  getProductosDisponibles() {
    const productosAsignados = this.productosDelProveedor.map(pp => pp.productoId);
    return this.productos.filter(p => !productosAsignados.includes(p.id));
  }
}
