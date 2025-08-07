import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cliente-detalles',
  templateUrl: './cliente-detalles.component.html',
  styleUrls: ['./cliente-detalles.component.scss']
})
export class ClienteDetallesComponent {
  @Input() cliente: any;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  cerrar() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
