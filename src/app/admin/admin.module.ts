import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { MainLayoutComponent } from '../shared/layouts/main-layout/main-layout.component';
import { ManualesComponent } from './manuales/manuales.component';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'manuales', component: ManualesComponent }
    ]
  }
];

@NgModule({
  declarations: [DashboardComponent, ManualesComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule, ReactiveFormsModule],
  exports: [RouterModule]
})
export class AdminModule {}
