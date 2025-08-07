import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';
import { SearchFilterConfig, SearchFilterResult } from '../../shared/components/table-search-filter/table-search-filter.component';

interface ResenaAdminDto {
  id: number;
  productoNombre: string;
  sku: string;
  cliente: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

@Component({
  selector: 'app-admin-resenas',
  templateUrl: './admin-resenas.component.html',
  styleUrls: ['./admin-resenas.component.scss'],
})
export class AdminResenasComponent implements OnInit {
  resenas: ResenaAdminDto[] = [];
  resenasFiltradas: ResenaAdminDto[] = [];
  cargando = true;

  // Configuración del buscador y filtros
  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar reseñas por cliente, producto o comentario...',
    showItemCount: true,
    filters: [
      {
        label: 'Calificación',
        key: 'calificacion',
        options: [
          { label: '5 estrellas', value: 5 },
          { label: '4 estrellas', value: 4 },
          { label: '3 estrellas', value: 3 },
          { label: '2 estrellas', value: 2 },
          { label: '1 estrella', value: 1 },
          { label: 'Todas', value: 'all' }
        ]
      },
      {
        label: 'Fecha',
        key: 'fecha',
        options: [
          { label: 'Última semana', value: 'semana' },
          { label: 'Último mes', value: 'mes' },
          { label: 'Últimos 3 meses', value: 'trimestre' },
          { label: 'Todas las fechas', value: 'all' }
        ]
      }
    ]
  };

  constructor(
    private adminService: AdminService,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarResenas();
  }

  cargarResenas() {
    this.cargando = true;
    this.adminService.getResenas().subscribe({
      next: (data) => {
        this.resenas = data;
        this.resenasFiltradas = [...this.resenas];
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.toastService.error('Error al cargar las reseñas');
        console.error('Error:', error);
      }
    });
  }

  async eliminar(resena: ResenaAdminDto): Promise<void> {
    const confirmed = await this.alertService.confirm(
      `¿Estás seguro que deseas eliminar la reseña de "${resena.cliente}" para "${resena.productoNombre}"?`,
      'Confirmar Eliminación'
    );

    if (confirmed) {
      this.adminService.eliminarResena(resena.id).subscribe({
        next: () => {
          this.resenas = this.resenas.filter(r => r.id !== resena.id);
          this.resenasFiltradas = this.resenasFiltradas.filter(r => r.id !== resena.id);
          this.toastService.success('Reseña eliminada correctamente');
        },
        error: (error) => {
          this.toastService.error('No se pudo eliminar la reseña');
          console.error('Error:', error);
        }
      });
    }
  }

  onSearchFilterChange(result: SearchFilterResult): void {
    this.resenasFiltradas = this.resenas.filter(resena => {
      // Filtro por búsqueda
      const searchMatch = !result.searchTerm ||
        resena.cliente.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        resena.productoNombre.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        resena.comentario.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        resena.sku.toLowerCase().includes(result.searchTerm.toLowerCase());

      // Filtro por calificación
      const calificacionMatch = !result.filters['calificacion'] ||
        result.filters['calificacion'] === 'all' ||
        resena.calificacion === result.filters['calificacion'];

      // Filtro por fecha
      const fechaMatch = this.filtrarPorFecha(resena, result.filters['fecha']);

      return searchMatch && calificacionMatch && fechaMatch;
    });
  }

  private filtrarPorFecha(resena: ResenaAdminDto, filtroFecha: string): boolean {
    if (!filtroFecha || filtroFecha === 'all') return true;

    const fechaResena = new Date(resena.fecha);
    const hoy = new Date();

    switch (filtroFecha) {
      case 'semana':
        const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        return fechaResena >= semanaAtras;
      case 'mes':
        const mesAtras = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
        return fechaResena >= mesAtras;
      case 'trimestre':
        const trimestreAtras = new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000);
        return fechaResena >= trimestreAtras;
      default:
        return true;
    }
  }

  onClearFilters(): void {
    this.resenasFiltradas = [...this.resenas];
  }

  getEstrellas(calificacion: number): string[] {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(i <= calificacion ? 'fas fa-star' : 'far fa-star');
    }
    return estrellas;
  }

  getCalificacionColor(calificacion: number): string {
    if (calificacion >= 4) return 'calificacion-alta';
    if (calificacion >= 3) return 'calificacion-media';
    return 'calificacion-baja';
  }
}
