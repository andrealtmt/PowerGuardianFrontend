import { Component, OnInit } from '@angular/core';
import { ManualService } from '../../shared/services/manual.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-manuales',
  templateUrl: './manuales.component.html',
  styleUrls: ['./manuales.component.scss']
})
export class ManualesComponent implements OnInit {
  manuales: any[] = [];
  manualesFiltrados: any[] = [];
  backendUrl = 'https://localhost:7009';
  cargando = true;

  // Propiedades para el filtro personalizado
  searchTerm = '';
  selectedTipoDocumento = '';

  constructor(
    private manualService: ManualService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarManuales();
  }

  cargarManuales(): void {
    this.cargando = true;
    this.manualService.listar().subscribe({
      next: (res) => {
        this.manuales = res;
        this.manualesFiltrados = [...this.manuales];
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.toastService.error('Error al cargar manuales');
        console.error('Error:', error);
      }
    });
  }

  descargarManual(manual: any): void {
    window.open(`${this.backendUrl}${manual.urlArchivo}`, '_blank');
    this.toastService.success(`Descargando: ${manual.nombre}`);
  }

  // Métodos para filtro personalizado
  applyFilters(): void {
    this.manualesFiltrados = this.manuales.filter(manual => {
      // Filtro por búsqueda
      const searchMatch = !this.searchTerm ||
        manual.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        manual.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por tipo de documento
      const tipoMatch = !this.selectedTipoDocumento ||
        this.matchesTipo(manual, this.selectedTipoDocumento);

      return searchMatch && tipoMatch;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTipoDocumento = '';
    this.manualesFiltrados = [...this.manuales];
  }

  private matchesTipo(manual: any, tipo: string): boolean {
    const nombre = manual.nombre.toLowerCase();
    switch (tipo) {
      case 'usuario':
        return nombre.includes('usuario') || nombre.includes('user');
      case 'tecnica':
        return nombre.includes('técnica') || nombre.includes('tecnica') || nombre.includes('technical');
      case 'instalacion':
        return nombre.includes('instalación') || nombre.includes('instalacion') || nombre.includes('installation');
      default:
        return true;
    }
  }

  getFileIcon(manual: any): string {
    if (manual.nombre.toLowerCase().includes('técnic') || manual.nombre.toLowerCase().includes('tecnic')) {
      return 'fas fa-cogs text-info';
    } else if (manual.nombre.toLowerCase().includes('instalación') || manual.nombre.toLowerCase().includes('instalacion')) {
      return 'fas fa-tools text-warning';
    } else if (manual.nombre.toLowerCase().includes('usuario') || manual.nombre.toLowerCase().includes('user')) {
      return 'fas fa-user-graduate text-success';
    }
    return 'fas fa-file-pdf text-danger';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
