import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './panel/panel.component';
import { SharedModule } from '../shared/shared.module';
import { MainLayoutComponent } from '../shared/layouts/main-layout/main-layout.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DispositivosComponent } from './dispositivos/dispositivos.component';
import { ManualesComponent } from './manuales/manuales.component';
import { AgregarDispositivoComponent } from './agregar-dispositivo/agregar-dispositivo.component';
import { HttpClientModule } from '@angular/common/http';
import { ConsumoDispositivoComponent } from './consumo-dispositivo/consumo-dispositivo.component';
import { NgChartsModule } from 'ng2-charts';
import { HistorialComprasComponent } from './historial-compras/historial-compras.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'panel', component: PanelComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'dispositivos', component: DispositivosComponent },
      { path: 'manuales', component: ManualesComponent },
      { path: 'historial-compras', component: HistorialComprasComponent }

    ]
  }
];

@NgModule({
  declarations: [
    PanelComponent,
    PerfilComponent,
    DispositivosComponent,
    ManualesComponent,
    AgregarDispositivoComponent,
    ConsumoDispositivoComponent,
    HistorialComprasComponent,

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule,
    FormsModule

  ],
  exports: [RouterModule]
})
export class ClientModule { }
