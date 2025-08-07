import { ProductoConCosto, RecetaProducto } from './receta-producto/receta-producto.component';
import { Venta } from './ventas/ventas.component';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'https://localhost:7009/api/admin';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardData() {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  getClientes() {
    return this.http.get<any[]>(`${this.apiUrl}/clientes`);
  }

  desactivarCliente(id: string) {
    return this.http.post(`${this.apiUrl}/clientes/${id}/desactivar`, {});
  }

  activarCliente(id: string) {
    return this.http.post(`${this.apiUrl}/clientes/${id}/activar`, {});
  }

  actualizarCliente(id: string, datos: any) {
    return this.http.put(`${this.apiUrl}/clientes/${id}`, datos);
  }

  getInventario() {
    return this.http.get<any[]>(`${this.apiUrl}/inventario`);
  }

  agregarUnidadInventario(data: { productoId: number; notas?: string }) {
    return this.http.post(`${this.apiUrl}/inventario`, data);
  }

  getProductos() {
    return this.http.get<any[]>(`https://localhost:7009/api/producto`);
  }

  editarInventario(id: number, data: { productoId: number; notas?: string }) {
    return this.http.put(`${this.apiUrl}/inventario/${id}`, data);
  }

  eliminarInventario(id: number) {
    return this.http.delete(`${this.apiUrl}/inventario/${id}`);
  }

  agregarBulk(data: any) {
    return this.http.post(`${this.apiUrl}/inventario/agregar-bulk`, data);
  }

  getResenas() {
    return this.http.get<any[]>(`${this.apiUrl}/resenas`);
  }

  eliminarResena(id: number) {
    return this.http.delete(`${this.apiUrl}/resenas/${id}`);
  }

  // proveedores
  getProveedores() {
    return this.http.get<any[]>(`${this.apiUrl}/proveedores`);
  }

  crearProveedor(data: Partial<any>) {
    return this.http.post(`${this.apiUrl}/proveedores`, data);
  }

  actualizarProveedor(id: number, data: Partial<any>) {
    return this.http.put(`${this.apiUrl}/proveedores/${id}`, data);
  }

  eliminarProveedor(id: number) {
    return this.http.delete(`${this.apiUrl}/proveedores/${id}`);
  }

  registrarCompraProveedor(payload: any) {
    return this.http.post(`${this.apiUrl}/compras-proveedor`, payload);
  }

  getHistorialComprasProveedor() {
    return this.http.get<any[]>(`${this.apiUrl}/compras-proveedor/historial`);
  }

  // materias primas
  getMateriasPrimas() {
    return this.http.get<any[]>(`${this.apiUrl}/materias-primas`);
  }

  crearMateriaPrima(mp: Partial<any>) {
    return this.http.post(`${this.apiUrl}/materias-primas`, mp);
  }

  editarMateriaPrima(id: number, data: Partial<any>) {
    return this.http.put(`${this.apiUrl}/materias-primas/${id}`, data);
  }

  eliminarMateriaPrima(id: number) {
    return this.http.delete(`${this.apiUrl}/materias-primas/${id}`);
  }

  // recetas de productos
  getRecetaPorProducto(productoId: number) {
    return this.http.get<RecetaProducto[]>(`${this.apiUrl}/recetas/${productoId}`);
  }

  agregarIngrediente(receta: {
    productoId: number;
    materiaPrimaId: number;
    cantidad: number;
  }) {
    return this.http.post(`${this.apiUrl}/recetas`, receta);
  }

  eliminarIngrediente(recetaId: number) {
    return this.http.delete(`${this.apiUrl}/recetas/${recetaId}`);
  }

  getProductosConCostos() {
    return this.http.get<ProductoConCosto[]>(`${this.apiUrl}/productos/costos`);
  }

  // ventas
  getHistorialVentas() {
    return this.http.get<Venta[]>(`${this.apiUrl}/ventas`);
  }

  // relación proveedor-producto
  getProductosDeProveedor(proveedorId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/proveedores/${proveedorId}/productos`);
  }

  asignarProductoAProveedor(proveedorId: number, data: { productoId: number; precioProveedor?: number }) {
    return this.http.post(`${this.apiUrl}/proveedores/${proveedorId}/productos`, data);
  }

  removerProductoDeProveedor(proveedorId: number, productoId: number) {
    return this.http.delete(`${this.apiUrl}/proveedores/${proveedorId}/productos/${productoId}`);
  }

  // catálogo de productos
  getProductosPublicos() {
    return this.http.get<any[]>(`https://localhost:7009/api/producto/publico`);
  }

  crearProducto(data: Partial<any>) {
    return this.http.post(`https://localhost:7009/api/producto`, data);
  }

  actualizarProducto(id: number, data: Partial<any>) {
    return this.http.put(`https://localhost:7009/api/producto/${id}`, data);
  }

  eliminarProducto(id: number) {
    return this.http.delete(`https://localhost:7009/api/producto/${id}`);
  }

  agregarStockProducto(id: number, cantidad: number) {
    return this.http.post(`https://localhost:7009/api/producto/${id}/agregar-stock`, cantidad);
  }

  subirImagenProducto(formData: FormData) {
    return this.http.post(`https://localhost:7009/api/producto/subir-imagen`, formData);
  }

}
