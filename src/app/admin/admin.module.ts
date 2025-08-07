import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { MainLayoutComponent } from '../shared/layouts/main-layout/main-layout.component';
import { ManualesComponent } from './manuales/manuales.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ClientesAdminComponent } from './clientes-admin/clientes-admin.component';
import { ClienteDetallesComponent } from './cliente-detalles/cliente-detalles.component';
import { InventarioAdminComponent } from './inventario-admin/inventario-admin.component';
import { FormsModule } from '@angular/forms';
import { AdminResenasComponent } from './admin-resenas/admin-resenas.component';
import { AdminProveedoresComponent } from './admin-proveedores/admin-proveedores.component';
import { ComprasProveedorComponent } from './compras-proveedor/compras-proveedor.component';
import { MateriaPrimaComponent } from './materia-prima/materia-prima.component';
import { RecetaProductoComponent } from './receta-producto/receta-producto.component';
import { VentasComponent } from './ventas/ventas.component';
import { ProveedorProductosComponent } from './proveedor-productos/proveedor-productos.component';
import { CatalogoProductosComponent } from './catalogo-productos/catalogo-productos.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'manuales', component: ManualesComponent },
      { path: 'clientes', component: ClientesAdminComponent },
      { path: 'inventario', component: InventarioAdminComponent },
      { path: 'resenas', component: AdminResenasComponent },
      { path: 'proveedores', component: AdminProveedoresComponent },
      { path: 'compras-proveedor', component: ComprasProveedorComponent },
      { path: 'proveedor-productos', component: ProveedorProductosComponent },
      { path: 'catalogo-productos', component: CatalogoProductosComponent },
      { path: 'materias-primas', component: MateriaPrimaComponent },
      { path: 'recetas-producto', component: RecetaProductoComponent },
      { path: 'ventas', component: VentasComponent }
    ]
  }
];

@NgModule({
  declarations: [DashboardComponent, ManualesComponent, ClientesAdminComponent, ClienteDetallesComponent, InventarioAdminComponent, AdminResenasComponent, AdminProveedoresComponent, ComprasProveedorComponent, ProveedorProductosComponent, CatalogoProductosComponent, MateriaPrimaComponent, RecetaProductoComponent, VentasComponent,],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule, ReactiveFormsModule, FormsModule],
  exports: [RouterModule]
})
export class AdminModule {}
