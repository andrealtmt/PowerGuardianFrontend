import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManualService } from '../../shared/services/manual.service';

@Component({
  selector: 'app-manuales',
  templateUrl: './manuales.component.html',
  styleUrls: ['./manuales.component.scss']
})
export class ManualesComponent implements OnInit {
  manualForm: FormGroup;
  archivo: File | null = null;
  manuales: any[] = [];
  backendUrl = 'https://localhost:7009';

  constructor(private fb: FormBuilder, private manualService: ManualService) {
    this.manualForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.manualService.listar().subscribe(res => this.manuales = res);
  }

  onFileChange(event: any): void {
    this.archivo = event.target.files[0];
  }

  subirManual(): void {
    if (!this.archivo) return;

    const formData = new FormData();
    formData.append('nombre', this.manualForm.value.nombre);
    formData.append('descripcion', this.manualForm.value.descripcion);
    formData.append('archivo', this.archivo);

    this.manualService.subir(formData).subscribe({
      next: (res) => {
        this.manuales.push(res);
        this.manualForm.reset();
        this.archivo = null;
      },
      error: () => alert('Error al subir el manual')
    });
  }

  eliminarManual(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este manual?')) return;

    this.manualService.eliminar(id).subscribe({
      next: () => {
        this.manuales = this.manuales.filter(m => m.id !== id);
      },
      error: () => alert('No se pudo eliminar el manual')
    });
  }

}
