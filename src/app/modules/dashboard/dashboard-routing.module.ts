import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { CommonDatagridWidgetComponent } from './common-datagrid-widget/common-datagrid-widget.component';
import { LayoutComponent } from '../layouts/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
       {
        path: 'datagrid',
        component: CommonDatagridWidgetComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }