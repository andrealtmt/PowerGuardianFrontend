import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    MainLayoutComponent,
    TopbarComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule, RouterModule
  ],
  exports: [
    MainLayoutComponent,
  ]
})
export class SharedModule { }
