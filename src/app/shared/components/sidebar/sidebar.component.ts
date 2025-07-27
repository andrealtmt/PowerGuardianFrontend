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
          { icon: 'fas fa-users', label: 'Usuarios', route: '/admin/usuarios' },
          { icon: 'fas fa-truck', label: 'Proveedores', route: '/admin/proveedores' },
          { icon: 'fas fa-clipboard-list', label: 'Insumos', route: '/admin/insumos' },
          { icon: 'fas fa-shopping-cart', label: 'Compras', route: '/admin/compras' },
          { icon: 'fas fa-boxes', label: 'Inventario', route: '/admin/inventario' },
          { icon: 'fas fa-chart-line', label: 'Ventas', route: '/admin/ventas' },
          { icon: 'fas fa-history', label: 'Historial', route: '/admin/historial' },
          { icon: 'fas fa-file-alt', label: 'Manuales', route: '/admin/manuales' },

        ]
      : [
          { icon: 'fas fa-dashboard', label: 'Panel', route: '/client/panel' },
          { icon: 'fas fa-plug', label: 'Dispositivos', route: '/client/dispositivos' },
          { icon: 'fas fa-file-alt', label: 'Manuales', route: '/client/manuales' },
          { icon: 'fas fa-history', label: 'Historial de Compras', route: '/client/historial-compras' },
          { icon: 'fas fa-user', label: 'Perfil', route: '/client/perfil' }
        ];
  }
}
