import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { SearchFilterConfig, SearchFilterResult, FilterOption } from '../../shared/components/table-search-filter/table-search-filter.component';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  stockDisponible: number;
}

@Component({
  selector: 'app-catalogo-productos',
  templateUrl: './catalogo-productos.component.html',
  styleUrls: ['./catalogo-productos.component.scss']
})
export class CatalogoProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  mostrarFormulario = false;
  editando = false;
  formulario: Partial<Producto> = {};
  cargando = false;
  mensaje = '';
  archivoSeleccionado: File | null = null;
  previewImagen: string | null = null;

  // Configuración del componente de búsqueda y filtro
  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar productos por nombre o descripción...',
    showItemCount: true,
    filters: [
      {
        label: 'Estado de Stock',
        key: 'stock',
        options: [
          { label: 'Con stock', value: 'con-stock' },
          { label: 'Sin stock', value: 'sin-stock' },
          { label: 'Stock bajo (≤5)', value: 'stock-bajo' }
        ]
      },
      {
        label: 'Rango de Precio',
        key: 'precio',
        options: [
          { label: 'Menos de $50', value: 'menos-50' },
          { label: '$50 - $100', value: '50-100' },
          { label: '$100 - $200', value: '100-200' },
          { label: 'Más de $200', value: 'mas-200' }
        ]
      }
    ]
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.adminService.getProductosPublicos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.productosFiltrados = [...productos];
        this.updateFilterCounts();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.mensaje = 'Error al cargar productos';
        this.cargando = false;
      }
    });
  }

  // Método para manejar cambios en búsqueda y filtros
  onSearchFilterChange(result: SearchFilterResult): void {
    this.productosFiltrados = this.productos.filter(producto => {
      // Filtro de búsqueda por texto
      const searchMatch = !result.searchTerm ||
        producto.nombre.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(result.searchTerm.toLowerCase());

      // Filtro por estado de stock
      let stockMatch = true;
      if (result.filters['stock']) {
        switch (result.filters['stock']) {
          case 'con-stock':
            stockMatch = producto.stockDisponible > 0;
            break;
          case 'sin-stock':
            stockMatch = producto.stockDisponible === 0;
            break;
          case 'stock-bajo':
            stockMatch = producto.stockDisponible > 0 && producto.stockDisponible <= 5;
            break;
        }
      }

      // Filtro por rango de precio
      let precioMatch = true;
      if (result.filters['precio']) {
        switch (result.filters['precio']) {
          case 'menos-50':
            precioMatch = producto.precio < 50;
            break;
          case '50-100':
            precioMatch = producto.precio >= 50 && producto.precio <= 100;
            break;
          case '100-200':
            precioMatch = producto.precio > 100 && producto.precio <= 200;
            break;
          case 'mas-200':
            precioMatch = producto.precio > 200;
            break;
        }
      }

      return searchMatch && stockMatch && precioMatch;
    });
  }

  // Método para limpiar filtros
  onClearFilters(): void {
    this.productosFiltrados = [...this.productos];
  }

  // Actualizar contadores en los filtros
  private updateFilterCounts(): void {
    // Actualizar contadores de stock
    const stockFilter = this.searchFilterConfig.filters?.find(f => f.key === 'stock');
    if (stockFilter) {
      stockFilter.options.forEach(option => {
        switch (option.value) {
          case 'con-stock':
            option.count = this.productos.filter(p => p.stockDisponible > 0).length;
            break;
          case 'sin-stock':
            option.count = this.productos.filter(p => p.stockDisponible === 0).length;
            break;
          case 'stock-bajo':
            option.count = this.productos.filter(p => p.stockDisponible > 0 && p.stockDisponible <= 5).length;
            break;
        }
      });
    }

    // Actualizar contadores de precio
    const precioFilter = this.searchFilterConfig.filters?.find(f => f.key === 'precio');
    if (precioFilter) {
      precioFilter.options.forEach(option => {
        switch (option.value) {
          case 'menos-50':
            option.count = this.productos.filter(p => p.precio < 50).length;
            break;
          case '50-100':
            option.count = this.productos.filter(p => p.precio >= 50 && p.precio <= 100).length;
            break;
          case '100-200':
            option.count = this.productos.filter(p => p.precio > 100 && p.precio <= 200).length;
            break;
          case 'mas-200':
            option.count = this.productos.filter(p => p.precio > 200).length;
            break;
        }
      });
    }
  }

  nuevoProducto(): void {
    this.formulario = {
      nombre: '',
      descripcion: '',
      precio: 0,
      imagenUrl: ''
    };
    this.editando = false;
    this.mostrarFormulario = true;
    this.mensaje = '';
    this.archivoSeleccionado = null;
    this.previewImagen = null;
  }

  editar(producto: Producto): void {
    this.formulario = { ...producto };
    this.editando = true;
    this.mostrarFormulario = true;
    this.mensaje = '';
    this.archivoSeleccionado = null;
    // Usar la URL absoluta para el preview
    this.previewImagen = producto.imagenUrl ? this.getImagenUrl(producto.imagenUrl) : null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.mensaje = 'Por favor seleccione un archivo de imagen válido';
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.mensaje = 'El archivo debe ser menor a 5MB';
        return;
      }

      this.archivoSeleccionado = file;
      this.mensaje = '';

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImagen = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.archivoSeleccionado = null;
    this.previewImagen = null;
    this.formulario.imagenUrl = '';
  }

  guardarProducto(): void {
    if (!this.formulario.nombre || !this.formulario.descripcion || !this.formulario.precio) {
      this.mensaje = 'Por favor complete todos los campos requeridos (nombre, descripción y precio)';
      return;
    }

    this.cargando = true;

    // Si hay archivo seleccionado, primero subirlo
    if (this.archivoSeleccionado) {
      this.subirImagen().then((imagenUrl) => {
        this.guardarProductoConImagen(imagenUrl);
      }).catch((error) => {
        console.error('Error al subir imagen:', error);
        this.mensaje = 'Error al subir la imagen';
        this.cargando = false;
      });
    } else {
      // Guardar sin imagen o con imagen existente
      this.guardarProductoConImagen(this.formulario.imagenUrl || '');
    }
  }

  private subirImagen(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.archivoSeleccionado) {
        resolve('');
        return;
      }

      const formData = new FormData();
      formData.append('imagen', this.archivoSeleccionado);

      this.adminService.subirImagenProducto(formData).subscribe({
        next: (response: any) => {
          resolve(response.imagenUrl || '');
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private guardarProductoConImagen(imagenUrl: string): void {
    const productoData = {
      nombre: this.formulario.nombre,
      descripcion: this.formulario.descripcion,
      precio: this.formulario.precio,
      imagenUrl: imagenUrl
    };

    if (this.editando && this.formulario.id) {
      // Para editar, incluir el ID en el objeto
      const productoCompleto = {
        id: this.formulario.id,
        ...productoData
      };
      this.adminService.actualizarProducto(this.formulario.id, productoCompleto).subscribe({
        next: () => {
          this.mensaje = 'Producto actualizado exitosamente';
          this.cargarProductos();
          this.cancelar();
        },
        error: (error: any) => {
          console.error('Error al actualizar producto:', error);
          this.mensaje = 'Error al actualizar producto';
          this.cargando = false;
        }
      });
    } else {
      this.adminService.crearProducto(productoData).subscribe({
        next: () => {
          this.mensaje = 'Producto creado exitosamente';
          this.cargarProductos();
          this.cancelar();
        },
        error: (error: any) => {
          console.error('Error al crear producto:', error);
          this.mensaje = 'Error al crear producto';
          this.cargando = false;
        }
      });
    }
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      this.cargando = true;
      this.adminService.eliminarProducto(id).subscribe({
        next: () => {
          this.mensaje = 'Producto eliminado exitosamente';
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          this.mensaje = 'Error al eliminar producto';
          this.cargando = false;
        }
      });
    }
  }

  agregarStock(producto: Producto): void {
    const cantidad = prompt('¿Cuántas unidades desea agregar al stock?');
    if (cantidad && !isNaN(Number(cantidad))) {
      this.cargando = true;
      this.adminService.agregarStockProducto(producto.id, Number(cantidad)).subscribe({
        next: () => {
          this.mensaje = `Stock agregado exitosamente: ${cantidad} unidades`;
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al agregar stock:', error);
          this.mensaje = 'Error al agregar stock';
          this.cargando = false;
        }
      });
    }
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.formulario = {};
    this.editando = false;
    this.mensaje = '';
    this.cargando = false;
    this.archivoSeleccionado = null;
    this.previewImagen = null;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(precio);
  }

  getImagenUrl(imagenUrl: string | undefined): string {
    if (!imagenUrl) return '';
    if (imagenUrl.startsWith('http')) return imagenUrl;
    // Si la url es relativa, prepende la url del backend
    return `https://localhost:7009${imagenUrl}`;
  }
}
