import { Component, OnInit } from '@angular/core';
import { ManualService } from '../../shared/services/manual.service';

@Component({
  selector: 'app-manuales',
  templateUrl: './manuales.component.html',
  styleUrls: ['./manuales.component.scss']
})
export class ManualesComponent implements OnInit {
  manuales: any[] = [];
  backendUrl = 'https://localhost:7009'; // todo: hacer un .env

  constructor(private manualService: ManualService) {}

  ngOnInit(): void {
    this.manualService.listar().subscribe({
      next: res => this.manuales = res,
      error: () => alert('Error al cargar manuales')
    });
  }
}
