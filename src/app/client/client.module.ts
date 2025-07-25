import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './panel/panel.component';
import { SharedModule } from '../shared/shared.module';
import { MainLayoutComponent } from '../shared/layouts/main-layout/main-layout.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DispositivosComponent } from './dispositivos/dispositivos.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'panel', component: PanelComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'dispositivos', component: DispositivosComponent },
    ]
  }
];

@NgModule({
  declarations: [
    PanelComponent,
    PerfilComponent,
    DispositivosComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class ClientModule { }
