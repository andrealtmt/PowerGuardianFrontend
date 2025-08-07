import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManualService } from '../../shared/services/manual.service';
import { AlertService } from '../../shared/services/alert.service';
import { ToastService } from '../../shared/services/toast.service';
import { SearchFilterConfig, SearchFilterResult } from '../../shared/components/table-search-filter/table-search-filter.component';

@Component({
  selector: 'app-manuales',
  templateUrl: './manuales.component.html',
  styleUrls: ['./manuales.component.scss']
})
export class ManualesComponent implements OnInit {
  manualForm: FormGroup;
  archivo: File | null = null;
  manuales: any[] = [];
  manualesFiltrados: any[] = [];
  backendUrl = 'https://localhost:7009';

  // Estados de la aplicación
  cargando = true;
  subiendoArchivo = false;
  mostrarFormulario = false;

  // Configuración del buscador
  searchFilterConfig: SearchFilterConfig = {
    searchPlaceholder: 'Buscar manuales por nombre o descripción...',
    showItemCount: true,
    filters: [
      {
        label: 'Tipo de Archivo',
        key: 'tipo',
        options: [
          { label: 'PDF', value: 'pdf' },
          { label: 'Todos', value: 'all' }
        ]
      },
    ]
  };

  constructor(
    private fb: FormBuilder,
    private manualService: ManualService,
    private alertService: AlertService,
    private toastService: ToastService
  ) {
    this.manualForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

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
        this.toastService.error('Error al cargar los manuales');
        console.error('Error:', error);
      }
    });
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.manualForm.reset();
    this.archivo = null;
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.manualForm.reset();
    this.archivo = null;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (file.type !== 'application/pdf') {
        this.toastService.error('Solo se permiten archivos PDF');
        event.target.value = '';
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.toastService.error('El archivo no puede exceder 10MB');
        event.target.value = '';
        return;
      }

      this.archivo = file;
      this.toastService.info(`Archivo seleccionado: ${file.name}`);
    }
  }

  async subirManual(): Promise<void> {
    if (!this.archivo || this.manualForm.invalid) {
      this.toastService.warning('Completa todos los campos y selecciona un archivo');
      return;
    }

    this.subiendoArchivo = true;

    const formData = new FormData();
    formData.append('nombre', this.manualForm.value.nombre);
    formData.append('descripcion', this.manualForm.value.descripcion);
    formData.append('archivo', this.archivo);

    this.manualService.subir(formData).subscribe({
      next: (res) => {
        this.manuales.push(res);
        this.manualesFiltrados = [...this.manuales];
        this.manualForm.reset();
        this.archivo = null;
        this.subiendoArchivo = false;
        this.mostrarFormulario = false;
        this.toastService.success('Manual subido correctamente');
      },
      error: (error) => {
        this.subiendoArchivo = false;
        this.toastService.error('Error al subir el manual');
        console.error('Error:', error);
      }
    });
  }

  async eliminarManual(manual: any): Promise<void> {
    const confirmed = await this.alertService.confirm(
      `¿Estás seguro que deseas eliminar el manual "${manual.nombre}"?`,
      'Confirmar Eliminación'
    );

    if (confirmed) {
      this.manualService.eliminar(manual.id).subscribe({
        next: () => {
          this.manuales = this.manuales.filter(m => m.id !== manual.id);
          this.manualesFiltrados = this.manualesFiltrados.filter(m => m.id !== manual.id);
          this.toastService.success('Manual eliminado correctamente');
        },
        error: (error) => {
          this.toastService.error('No se pudo eliminar el manual');
          console.error('Error:', error);
        }
      });
    }
  }

  onSearchFilterChange(result: SearchFilterResult): void {
    this.manualesFiltrados = this.manuales.filter(manual => {
      // Filtro por búsqueda
      const searchMatch = !result.searchTerm ||
        manual.nombre.toLowerCase().includes(result.searchTerm.toLowerCase()) ||
        manual.descripcion.toLowerCase().includes(result.searchTerm.toLowerCase());

      // Filtro por tipo
      const tipoMatch = !result.filters['tipo'] ||
        result.filters['tipo'] === 'all' ||
        (result.filters['tipo'] === 'pdf' && manual.urlArchivo.endsWith('.pdf'));

      return searchMatch && tipoMatch;
    });
  }

  onClearFilters(): void {
    this.manualesFiltrados = [...this.manuales];
  }

  descargarManual(manual: any): void {
    window.open(`${this.backendUrl}${manual.urlArchivo}`, '_blank');
    this.toastService.info(`Descargando manual: ${manual.nombre}`);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(manual: any): string {
    if (manual.urlArchivo.endsWith('.pdf')) {
      return 'fas fa-file-pdf';
    }
    return 'fas fa-file';
  }

}
