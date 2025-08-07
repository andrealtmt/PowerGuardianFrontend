import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() rol!: string;
  @Input() collapsed = false;
  menu: any[] = [];

  ngOnInit() {
    this.menu = this.rol === 'Admin'
      ? [
          { icon: 'fas fa-dashboard', label: 'Dashboard', route: '/admin/dashboard' },
          { icon: 'fas fa-shopping-bag', label: 'Catálogo de Productos', route: '/admin/catalogo-productos' },
          { icon: 'fas fa-boxes', label: 'Inventario', route: '/admin/inventario' },
          { icon: 'fas fa-users', label: 'Clientes', route: '/admin/clientes' },
          { icon: 'fas fa-star', label: 'Reseñas', route: '/admin/resenas' },
          { icon: 'fas fa-truck', label: 'Catálogo de proveedores', route: '/admin/proveedores' },
          { icon: 'fas fa-box', label: 'Productos del proveedor', route: '/admin/proveedor-productos' },
          { icon: 'fas fa-shopping-cart', label: 'Compras a proveedor', route: '/admin/compras-proveedor' },
          { icon: 'fas fa-box', label: 'Catálogo de materias primas', route: '/admin/materias-primas' },
          { icon: 'fas fa-receipt', label: 'Recetas de Producto', route: '/admin/recetas-producto' },
          { icon: 'fas fa-chart-line', label: 'Ventas', route: '/admin/ventas' },
          { icon: 'fas fa-file-alt', label: 'Manuales', route: '/admin/manuales' },

        ]
      : [
          { icon: 'fas fa-plug', label: 'Dispositivos', route: '/client/dispositivos' },
          { icon: 'fas fa-file-alt', label: 'Manuales', route: '/client/manuales' },
          { icon: 'fas fa-history', label: 'Historial de Compras', route: '/client/historial-compras' },
          { icon: 'fas fa-user', label: 'Perfil', route: '/client/perfil' }
        ];
  }
}
