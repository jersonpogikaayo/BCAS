import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from '@angular/cdk/layout';
import { LayoutsModule } from '../layouts/layouts.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

//Component Pages
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EngineerDashboardComponent } from './engineer-dashboard/engineer-dashboard.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { CommonDatagridWidgetComponent } from './common-datagrid-widget/common-datagrid-widget.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminDashboardComponent,
    ManagerDashboardComponent,
    EngineerDashboardComponent,
    CommonDatagridWidgetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    LayoutModule, // Add this
    LayoutsModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }