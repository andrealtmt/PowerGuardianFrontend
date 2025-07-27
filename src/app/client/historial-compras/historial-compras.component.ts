import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HistorialComprasService } from 'src/app/shared/services/historial-compra.service';

@Component({
  selector: 'app-historial-compras',
  templateUrl: './historial-compras.component.html',
  styleUrls: ['./historial-compras.component.scss']
})
export class HistorialComprasComponent implements OnInit {
  compras: any[] = [];
  resenaUnidadId: number | null = null;
  hoverCalificacion: number = 0;

  form = {
    calificacion: 5,
    comentario: ''
  };

  constructor(private historialService: HistorialComprasService, private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Historial de Compras - PowerGuardian');
    this.historialService.obtenerHistorial().subscribe({
      next: res => this.compras = res,
      error: err => console.error('Error al obtener historial:', err)
    });
  }

  mostrarResenaForm(id: number) {
    this.resenaUnidadId = id;
    this.form = { calificacion: 5, comentario: '' };
  }

  enviarResena() {
    const body = {
      productoUnidadId: this.resenaUnidadId,
      calificacion: this.form.calificacion,
      comentario: this.form.comentario
    };

    this.historialService.enviarResena(body).subscribe({
      next: () => {
        alert('¡Reseña enviada!');
        this.resenaUnidadId = null;
        this.ngOnInit(); // recargar compras
      },
      error: err => alert(err.error.message || 'Error al enviar reseña')
    });
  }
}
